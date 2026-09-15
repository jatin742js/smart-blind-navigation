import {
  EmergencyContact,
  EmergencyEvent,
  LocationRecord,
  NotificationRecord,
  SensorData,
  DeviceStatus,
  UserProfile,
  SystemSettings,
} from '../src/types.ts';

// Initial Caregiver and Blind User Patient Profile
export let currentUser: UserProfile = {
  id: 'usr_caregiver_01',
  name: 'Sarah Pendelton',
  role: 'caregiver',
  email: 'sarah.caregiver@smartstick.org',
  phone: '+1 (555) 234-5678',
  address: '742 Evergreen Terrace, Springfield, OR',
  bloodGroup: 'A+',
  medicalNotes: 'Authorized primary emergency caregiver for Arthur Pendelton.',
  blindUserPatient: {
    name: 'Arthur Pendelton',
    age: 68,
    bloodGroup: 'O+',
    medicalNotes: 'Severe visual impairment (Glaucoma, Retinal degeneration). Mild hypertension, carries prescribed medication.',
    allergies: 'Penicillin, Shellfish',
    deviceId: 'STICK_001',
  },
};

// Emergency Contacts
export let emergencyContacts: EmergencyContact[] = [
  {
    id: 'ct_01',
    userId: 'usr_caregiver_01',
    name: 'Sarah Pendelton',
    relationship: 'Daughter / Primary Caregiver',
    phone: '+1 (555) 234-5678',
    email: 'sarah.caregiver@smartstick.org',
    notificationPreference: 'all',
    priority: 'P1 - High',
    active: true,
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
  {
    id: 'ct_02',
    userId: 'usr_caregiver_01',
    name: 'Dr. Robert Miller',
    relationship: 'Primary Physician',
    phone: '+1 (555) 892-1204',
    email: 'dr.miller@springfieldclinic.med',
    notificationPreference: 'call',
    priority: 'P2 - Medium',
    active: true,
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
  },
  {
    id: 'ct_03',
    userId: 'usr_caregiver_01',
    name: 'David Pendelton',
    relationship: 'Son / Secondary Contact',
    phone: '+1 (555) 761-9032',
    email: 'david.pendelton@workmail.net',
    notificationPreference: 'sms',
    priority: 'P2 - Medium',
    active: true,
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
  },
  {
    id: 'ct_04',
    userId: 'usr_caregiver_01',
    name: 'Springfield EMS Emergency Dispatch',
    relationship: 'Emergency First Responders',
    phone: '+1 (555) 911-0022',
    email: 'dispatch@springfield-ems.gov',
    notificationPreference: 'all',
    priority: 'P1 - High',
    active: true,
    createdAt: new Date(Date.now() - 86400000 * 40).toISOString(),
  },
];

// Current Hardware Device Status
export let deviceStatus: DeviceStatus = {
  deviceId: 'STICK_001',
  deviceName: 'Smart Blind Navigation Stick v2.4 (ESP32-WROOM-32D)',
  connected: true,
  batteryPercentage: 82,
  batteryVoltage: 3.98,
  charging: false,
  gpsStatus: 'available',
  gpsSatellites: 9,
  wifiStatus: 'connected',
  wifiSignalRssi: -58,
  emergencyButtonStatus: 'ready',
  ultrasonicSensorStatus: 'healthy',
  voiceBuzzerStatus: 'operational',
  lastHeartbeat: new Date().toISOString(),
  liveTrackingEnabled: true,
};

// Current Ultrasonic Sensor Data
export let currentSensorData: SensorData = {
  deviceId: 'STICK_001',
  frontDistanceCm: 85,
  leftDistanceCm: 120,
  rightDistanceCm: 35,
  frontObstacle: false,
  leftObstacle: false,
  rightObstacle: true,
  buzzerActive: true,
  voiceModuleReady: true,
  timestamp: new Date().toISOString(),
};

// Location History (starting with realistic coordinates)
export let locationHistory: LocationRecord[] = [
  {
    id: 'loc_01',
    deviceId: 'STICK_001',
    latitude: 37.7749,
    longitude: -122.4194,
    accuracy: 4.2,
    speed: 3.1,
    heading: 85,
    timestamp: new Date(Date.now() - 60000 * 12).toISOString(),
    address: 'Near 428 Market Street, San Francisco, CA',
    gpsStatus: 'available',
  },
  {
    id: 'loc_02',
    deviceId: 'STICK_001',
    latitude: 37.7753,
    longitude: -122.4185,
    accuracy: 3.8,
    speed: 3.4,
    heading: 90,
    timestamp: new Date(Date.now() - 60000 * 8).toISOString(),
    address: 'Near 470 Market Street, San Francisco, CA',
    gpsStatus: 'available',
  },
  {
    id: 'loc_03',
    deviceId: 'STICK_001',
    latitude: 37.7759,
    longitude: -122.4174,
    accuracy: 3.5,
    speed: 2.8,
    heading: 92,
    timestamp: new Date(Date.now() - 60000 * 4).toISOString(),
    address: 'Near 520 Market Street, San Francisco, CA',
    gpsStatus: 'available',
  },
  {
    id: 'loc_04',
    deviceId: 'STICK_001',
    latitude: 37.7764,
    longitude: -122.4163,
    accuracy: 2.9,
    speed: 0.0,
    heading: 90,
    timestamp: new Date().toISOString(),
    address: 'Pedestrian Walkway, 580 Market Street, San Francisco, CA',
    gpsStatus: 'available',
  },
];

// Emergency Events History
export let emergencyEvents: EmergencyEvent[] = [
  {
    id: 'emg_hist_01',
    deviceId: 'STICK_001',
    patientName: 'Arthur Pendelton',
    event: 'EMERGENCY_BUTTON',
    status: 'resolved',
    latitude: 37.7749,
    longitude: -122.4194,
    accuracy: 4.5,
    address: 'Corner of 4th & Market St, San Francisco, CA',
    battery: 89,
    timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
    resolvedAt: new Date(Date.now() - 86400000 * 3 + 1200000).toISOString(),
    countdownSecondsRemaining: 0,
    notifiedContacts: [
      {
        contactId: 'ct_01',
        name: 'Sarah Pendelton',
        phone: '+1 (555) 234-5678',
        email: 'sarah.caregiver@smartstick.org',
        channel: 'SMS & Push',
        status: 'delivered',
        timestamp: new Date(Date.now() - 86400000 * 3 + 5000).toISOString(),
      },
      {
        contactId: 'ct_04',
        name: 'Springfield EMS Emergency Dispatch',
        phone: '+1 (555) 911-0022',
        email: 'dispatch@springfield-ems.gov',
        channel: 'EMS Hotline',
        status: 'delivered',
        timestamp: new Date(Date.now() - 86400000 * 3 + 6000).toISOString(),
      },
    ],
  },
];

// Active Emergency Event (null when calm)
export let activeEmergency: EmergencyEvent | null = null;

// Notification Dispatch Log
export let notificationLog: NotificationRecord[] = [
  {
    id: 'notif_01',
    emergencyEventId: 'emg_hist_01',
    patientName: 'Arthur Pendelton',
    contactName: 'Sarah Pendelton',
    recipient: '+1 (555) 234-5678',
    type: 'SMS',
    status: 'delivered',
    messageText:
      '🚨 EMERGENCY ALERT\n\nArthur Pendelton may need immediate assistance.\n\nCurrent Location:\nhttps://www.google.com/maps?q=37.7749,-122.4194\n\nTime:\n3 days ago\n\nPlease contact the user immediately.',
    timestamp: new Date(Date.now() - 86400000 * 3 + 5000).toISOString(),
    latitude: 37.7749,
    longitude: -122.4194,
    googleMapsUrl: 'https://www.google.com/maps?q=37.7749,-122.4194',
  },
];

// System Settings
export let systemSettings: SystemSettings = {
  emergencyCancellationSeconds: 30,
  trackingIntervalSeconds: 5,
  liveTracking: true,
  soundAlerts: true,
  highContrastMode: false,
  voiceAnnouncements: true,
};

// Store manipulation helpers
export function setActiveEmergency(event: EmergencyEvent | null) {
  activeEmergency = event;
}

export function updateDeviceStatus(partial: Partial<DeviceStatus>) {
  deviceStatus = { ...deviceStatus, ...partial, lastHeartbeat: new Date().toISOString() };
}

export function updateSensorData(data: Partial<SensorData>) {
  currentSensorData = {
    ...currentSensorData,
    ...data,
    timestamp: new Date().toISOString(),
  };
}

export function addLocationRecord(record: Omit<LocationRecord, 'id'>) {
  const newRecord: LocationRecord = {
    ...record,
    id: `loc_${Date.now()}`,
  };
  locationHistory.push(newRecord);
  // keep last 200 records in memory
  if (locationHistory.length > 200) {
    locationHistory.shift();
  }
  return newRecord;
}

export function addEmergencyEvent(event: EmergencyEvent) {
  emergencyEvents.unshift(event);
  activeEmergency = event;
  return event;
}

export function addNotification(record: NotificationRecord) {
  notificationLog.unshift(record);
  return record;
}

export function updateSettings(newSettings: Partial<SystemSettings>) {
  systemSettings = { ...systemSettings, ...newSettings };
  return systemSettings;
}
