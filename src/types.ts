export type EmergencyStatus = 'active' | 'resolved' | 'cancelled' | 'failed';
export type NotificationStatus = 'sending' | 'sent' | 'delivered' | 'failed';
export type PriorityLevel = 'P1 - High' | 'P2 - Medium' | 'P3 - Low';
export type NotificationPref = 'sms' | 'call' | 'email' | 'push' | 'all';

export interface UserProfile {
  id: string;
  name: string;
  role: 'caregiver' | 'patient';
  email: string;
  phone: string;
  avatarUrl?: string;
  address?: string;
  bloodGroup?: string;
  medicalNotes?: string;
  blindUserPatient: {
    name: string;
    age: number;
    bloodGroup: string;
    medicalNotes: string;
    allergies: string;
    deviceId: string;
  };
}

export interface EmergencyContact {
  id: string;
  userId: string;
  name: string;
  relationship: string;
  phone: string;
  email: string;
  notificationPreference: NotificationPref;
  priority: PriorityLevel;
  active: boolean;
  createdAt: string;
}

export interface LocationRecord {
  id: string;
  deviceId: string;
  latitude: number;
  longitude: number;
  accuracy: number; // in meters
  speed?: number; // in km/h
  heading?: number;
  timestamp: string;
  address?: string;
  gpsStatus: 'available' | 'weak' | 'unavailable';
}

export interface SensorData {
  deviceId: string;
  frontDistanceCm: number;
  leftDistanceCm: number;
  rightDistanceCm: number;
  frontObstacle: boolean;
  leftObstacle: boolean;
  rightObstacle: boolean;
  buzzerActive: boolean;
  voiceModuleReady: boolean;
  timestamp: string;
}

export interface DeviceStatus {
  deviceId: string;
  deviceName: string;
  connected: boolean;
  batteryPercentage: number;
  batteryVoltage?: number;
  charging: boolean;
  gpsStatus: 'available' | 'weak' | 'unavailable';
  gpsSatellites: number;
  wifiStatus: 'connected' | 'connecting' | 'disconnected';
  wifiSignalRssi: number; // e.g. -60 dBm
  emergencyButtonStatus: 'ready' | 'triggered' | 'maintenance';
  ultrasonicSensorStatus: 'healthy' | 'degraded' | 'offline';
  voiceBuzzerStatus: 'operational' | 'silent' | 'offline';
  lastHeartbeat: string;
  liveTrackingEnabled: boolean;
}

export interface EmergencyEvent {
  id: string;
  deviceId: string;
  patientName: string;
  event: string;
  status: EmergencyStatus;
  latitude: number;
  longitude: number;
  accuracy: number;
  address: string;
  battery: number;
  timestamp: string;
  cancelledAt?: string;
  resolvedAt?: string;
  cancelReason?: string;
  countdownSecondsRemaining: number;
  notifiedContacts: {
    contactId: string;
    name: string;
    phone: string;
    email: string;
    channel: string;
    status: NotificationStatus;
    timestamp: string;
  }[];
}

export interface NotificationRecord {
  id: string;
  emergencyEventId: string;
  patientName: string;
  contactName: string;
  recipient: string; // phone or email
  type: 'SMS' | 'EMAIL' | 'PUSH';
  status: NotificationStatus;
  messageText: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  googleMapsUrl: string;
}

export interface SystemSettings {
  emergencyCancellationSeconds: number; // e.g. 30s
  trackingIntervalSeconds: number; // e.g. 5s
  liveTracking: boolean;
  soundAlerts: boolean;
  highContrastMode: boolean;
  voiceAnnouncements: boolean;
}
