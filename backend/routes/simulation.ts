import { Router, Request, Response } from 'express';
import {
  deviceStatus,
  currentSensorData,
  locationHistory,
  emergencyContacts,
  currentUser,
  systemSettings,
  updateDeviceStatus,
  updateSensorData,
  addLocationRecord,
  addEmergencyEvent,
} from '../store.ts';
import { EmergencyEvent } from '../../src/types.ts';
import { dispatchEmergencyNotifications } from '../services/notificationService.ts';

const router = Router();

// POST /api/simulation/trigger
router.post('/trigger', async (req: Request, res: Response) => {
  const { action } = req.body;

  switch (action) {
    case 'emergency': {
      // Simulate physical button press on stick
      const latestLoc = locationHistory[locationHistory.length - 1] || {
        latitude: 37.7764,
        longitude: -122.4163,
        accuracy: 3.2,
        address: '580 Market Street, San Francisco, CA',
      };

      // Add slight jitter to simulate live event location
      const simLat = latestLoc.latitude + (Math.random() - 0.5) * 0.0005;
      const simLng = latestLoc.longitude + (Math.random() - 0.5) * 0.0005;

      const simEmergency: EmergencyEvent = {
        id: `emg_sim_${Date.now()}`,
        deviceId: deviceStatus.deviceId,
        patientName: currentUser.blindUserPatient.name,
        event: 'EMERGENCY_BUTTON_SIMULATED',
        status: 'active',
        latitude: simLat,
        longitude: simLng,
        accuracy: 2.8,
        address: `Near Market St & Montgomery St (Simulated Test GPS: ${simLat.toFixed(5)}, ${simLng.toFixed(5)})`,
        battery: deviceStatus.batteryPercentage,
        timestamp: new Date().toISOString(),
        countdownSecondsRemaining: systemSettings.emergencyCancellationSeconds,
        notifiedContacts: emergencyContacts.map((c) => ({
          contactId: c.id,
          name: c.name,
          phone: c.phone,
          email: c.email,
          channel: c.notificationPreference,
          status: 'sending',
          timestamp: new Date().toISOString(),
        })),
      };

      addEmergencyEvent(simEmergency);
      updateDeviceStatus({ emergencyButtonStatus: 'triggered', connected: true });

      // Dispatch notifications
      await dispatchEmergencyNotifications(simEmergency, emergencyContacts);

      return res.json({
        success: true,
        action: 'emergency',
        message: 'Simulated ESP32 physical emergency button press. Full emergency workflow triggered.',
        event: simEmergency,
      });
    }

    case 'gps_step': {
      // Simulate blind user taking steps forward along a route
      const last = locationHistory[locationHistory.length - 1] || {
        latitude: 37.7764,
        longitude: -122.4163,
        accuracy: 3.0,
      };

      const deltaLat = 0.0003 + (Math.random() - 0.5) * 0.0001;
      const deltaLng = 0.0003 + (Math.random() - 0.5) * 0.0001;
      const newLat = last.latitude + deltaLat;
      const newLng = last.longitude + deltaLng;

      const newRec = addLocationRecord({
        deviceId: deviceStatus.deviceId,
        latitude: newLat,
        longitude: newLng,
        accuracy: +(2.5 + Math.random() * 1.5).toFixed(1),
        speed: +(2.8 + Math.random() * 0.8).toFixed(1),
        heading: 75,
        timestamp: new Date().toISOString(),
        address: `Active Navigation Walkway, Coords (${newLat.toFixed(5)}, ${newLng.toFixed(5)})`,
        gpsStatus: 'available',
      });

      updateDeviceStatus({ connected: true, gpsStatus: 'available' });

      return res.json({
        success: true,
        action: 'gps_step',
        message: 'Simulated GPS movement waypoint received from stick hardware.',
        location: newRec,
      });
    }

    case 'obstacle': {
      // Toggle or set obstacle pattern
      const isObstacleClose = currentSensorData.frontDistanceCm > 45;
      const frontDist = isObstacleClose ? 28 : 110;
      const leftDist = isObstacleClose ? 40 : 95;
      const rightDist = isObstacleClose ? 22 : 130;

      updateSensorData({
        frontDistanceCm: frontDist,
        leftDistanceCm: leftDist,
        rightDistanceCm: rightDist,
        frontObstacle: frontDist < 50,
        leftObstacle: leftDist < 50,
        rightObstacle: rightDist < 50,
        buzzerActive: isObstacleClose,
      });

      updateDeviceStatus({ connected: true });

      return res.json({
        success: true,
        action: 'obstacle',
        message: isObstacleClose
          ? '⚠️ Obstacle simulated: Front (28 cm) & Right (22 cm). Haptic buzzer activated!'
          : '✅ Obstacle cleared: All paths open.',
        sensors: currentSensorData,
      });
    }

    case 'low_battery': {
      const targetBattery = deviceStatus.batteryPercentage <= 20 ? 88 : 14;
      updateDeviceStatus({
        batteryPercentage: targetBattery,
        batteryVoltage: targetBattery <= 20 ? 3.45 : 4.12,
        connected: true,
      });

      return res.json({
        success: true,
        action: 'low_battery',
        message: `Simulated battery changed to ${targetBattery}%.`,
        batteryPercentage: targetBattery,
      });
    }

    case 'disconnect': {
      const willBeConnected = !deviceStatus.connected;
      updateDeviceStatus({
        connected: willBeConnected,
        wifiStatus: willBeConnected ? 'connected' : 'disconnected',
      });

      return res.json({
        success: true,
        action: 'disconnect',
        message: willBeConnected
          ? 'ESP32 Smart Stick reconnected to WiFi AP.'
          : 'ESP32 Smart Stick disconnected / out of range.',
        connected: willBeConnected,
      });
    }

    default:
      return res.status(400).json({ error: `Unknown simulation action: ${action}` });
  }
});

export default router;
