import { Router, Request, Response } from 'express';
import {
  deviceStatus,
  currentSensorData,
  locationHistory,
  emergencyContacts,
  activeEmergency,
  systemSettings,
  currentUser,
  setActiveEmergency,
  updateDeviceStatus,
  updateSensorData,
  addLocationRecord,
  addEmergencyEvent,
} from '../store.ts';
import { EmergencyEvent } from '../../src/types.ts';
import { dispatchEmergencyNotifications } from '../services/notificationService.ts';

const router = Router();

// GET /api/device/status
router.get('/status', (_req: Request, res: Response) => {
  return res.json({
    device: deviceStatus,
    sensors: currentSensorData,
    latestLocation: locationHistory[locationHistory.length - 1] || null,
    activeEmergency,
    systemSettings,
  });
});

// POST /api/device/register
router.post('/register', (req: Request, res: Response) => {
  const { deviceId, deviceName } = req.body;
  if (!deviceId) {
    return res.status(400).json({ error: 'deviceId is required.' });
  }

  deviceStatus.deviceId = deviceId;
  if (deviceName) deviceStatus.deviceName = deviceName;
  deviceStatus.connected = true;
  deviceStatus.lastHeartbeat = new Date().toISOString();

  return res.json({
    success: true,
    message: `Device ${deviceId} successfully registered and connected.`,
    device: deviceStatus,
  });
});

// POST /api/device/location (ESP32 GPS telemetry)
router.post('/location', (req: Request, res: Response) => {
  const { deviceId, latitude, longitude, accuracy, speed, battery, timestamp } = req.body;

  if (latitude === undefined || longitude === undefined) {
    return res.status(400).json({ error: 'Latitude and Longitude are required.' });
  }

  // Update battery if provided in telemetry
  if (battery !== undefined) {
    deviceStatus.batteryPercentage = Number(battery);
  }

  deviceStatus.lastHeartbeat = new Date().toISOString();
  deviceStatus.connected = true;
  deviceStatus.gpsStatus = 'available';

  const newLoc = addLocationRecord({
    deviceId: deviceId || deviceStatus.deviceId,
    latitude: Number(latitude),
    longitude: Number(longitude),
    accuracy: accuracy ? Number(accuracy) : 4.0,
    speed: speed !== undefined ? Number(speed) : 2.5,
    timestamp: timestamp || new Date().toISOString(),
    address: `Position: ${Number(latitude).toFixed(4)}°N, ${Number(longitude).toFixed(4)}°W`,
    gpsStatus: 'available',
  });

  return res.status(201).json({
    success: true,
    location: newLoc,
    timestamp: new Date().toISOString(),
  });
});

// POST /api/device/sensor-data (ESP32 Ultrasonic & Buzzer)
router.post('/sensor-data', (req: Request, res: Response) => {
  const { frontDistanceCm, leftDistanceCm, rightDistanceCm, buzzerActive } = req.body;

  const fDist = Number(frontDistanceCm ?? currentSensorData.frontDistanceCm);
  const lDist = Number(leftDistanceCm ?? currentSensorData.leftDistanceCm);
  const rDist = Number(rightDistanceCm ?? currentSensorData.rightDistanceCm);

  const frontObstacle = fDist < 50;
  const leftObstacle = lDist < 50;
  const rightObstacle = rDist < 50;

  updateSensorData({
    frontDistanceCm: fDist,
    leftDistanceCm: lDist,
    rightDistanceCm: rDist,
    frontObstacle,
    leftObstacle,
    rightObstacle,
    buzzerActive: buzzerActive !== undefined ? Boolean(buzzerActive) : (frontObstacle || leftObstacle || rightObstacle),
  });

  deviceStatus.lastHeartbeat = new Date().toISOString();
  deviceStatus.connected = true;

  return res.json({
    success: true,
    sensors: currentSensorData,
  });
});

// POST /api/device/emergency (ESP32 Hardware Physical Push Button!)
router.post('/emergency', async (req: Request, res: Response) => {
  const { deviceId, event, latitude, longitude, accuracy, battery, timestamp } = req.body;

  const resolvedDeviceId = deviceId || deviceStatus.deviceId;
  const latestKnownLoc = locationHistory[locationHistory.length - 1];

  const effectiveLat = latitude !== undefined ? Number(latitude) : (latestKnownLoc?.latitude ?? 37.7749);
  const effectiveLng = longitude !== undefined ? Number(longitude) : (latestKnownLoc?.longitude ?? -122.4194);
  const effectiveAcc = accuracy !== undefined ? Number(accuracy) : (latestKnownLoc?.accuracy ?? 5.0);
  const effectiveBattery = battery !== undefined ? Number(battery) : deviceStatus.batteryPercentage;

  deviceStatus.emergencyButtonStatus = 'triggered';
  deviceStatus.lastHeartbeat = new Date().toISOString();
  deviceStatus.connected = true;

  const emergencyId = `emg_${Date.now()}`;
  const addressString = latestKnownLoc?.address || `Coordinates: ${effectiveLat.toFixed(5)}, ${effectiveLng.toFixed(5)}`;

  const newEmergency: EmergencyEvent = {
    id: emergencyId,
    deviceId: resolvedDeviceId,
    patientName: currentUser.blindUserPatient.name,
    event: event || 'EMERGENCY_BUTTON',
    status: 'active',
    latitude: effectiveLat,
    longitude: effectiveLng,
    accuracy: effectiveAcc,
    address: addressString,
    battery: effectiveBattery,
    timestamp: timestamp || new Date().toISOString(),
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

  addEmergencyEvent(newEmergency);

  // Dispatch real notification objects (SMS/Email/Push simulation)
  await dispatchEmergencyNotifications(newEmergency, emergencyContacts);

  // Update contact status to delivered
  newEmergency.notifiedContacts = newEmergency.notifiedContacts.map((c) => ({
    ...c,
    status: 'delivered',
  }));

  return res.status(201).json({
    success: true,
    message: 'Emergency event registered. Dispatched alerts to all active emergency contacts.',
    emergency: newEmergency,
  });
});

// POST /api/device/emergency/cancel (User or Caregiver cancellation during countdown)
router.post('/emergency/cancel', (req: Request, res: Response) => {
  const { reason } = req.body;
  if (!activeEmergency) {
    return res.status(400).json({ error: 'No active emergency to cancel.' });
  }

  activeEmergency.status = 'cancelled';
  activeEmergency.cancelledAt = new Date().toISOString();
  activeEmergency.cancelReason = reason || 'Cancelled by user or caregiver (False alarm confirmed safe)';

  deviceStatus.emergencyButtonStatus = 'ready';
  const cancelledEvent = activeEmergency;
  setActiveEmergency(null);

  return res.json({
    success: true,
    message: 'Emergency alert was cancelled. Cancellation recorded in history.',
    event: cancelledEvent,
  });
});

// POST /api/device/emergency/resolve (Caregiver marks emergency as responded & resolved)
router.post('/emergency/resolve', (req: Request, res: Response) => {
  if (!activeEmergency) {
    return res.status(400).json({ error: 'No active emergency to resolve.' });
  }

  activeEmergency.status = 'resolved';
  activeEmergency.resolvedAt = new Date().toISOString();
  deviceStatus.emergencyButtonStatus = 'ready';

  const resolvedEvent = activeEmergency;
  setActiveEmergency(null);

  return res.json({
    success: true,
    message: 'Emergency resolved successfully.',
    event: resolvedEvent,
  });
});

export default router;
