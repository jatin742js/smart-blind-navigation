import {
  DeviceStatus,
  SensorData,
  LocationRecord,
  EmergencyEvent,
  EmergencyContact,
  NotificationRecord,
  UserProfile,
  SystemSettings,
} from '../types.ts';

const API_BASE = '/api';

export async function fetchDeviceStatus(): Promise<{
  device: DeviceStatus;
  sensors: SensorData;
  latestLocation: LocationRecord | null;
  activeEmergency: EmergencyEvent | null;
  systemSettings: SystemSettings;
}> {
  const res = await fetch(`${API_BASE}/device/status`);
  if (!res.ok) throw new Error('Failed to fetch device status');
  return res.json();
}

export async function fetchUserProfile(): Promise<UserProfile> {
  const res = await fetch(`${API_BASE}/users/profile`);
  if (!res.ok) throw new Error('Failed to fetch user profile');
  return res.json();
}

export async function updateUserProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
  const res = await fetch(`${API_BASE}/users/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  });
  if (!res.ok) throw new Error('Failed to update profile');
  return res.json();
}

export async function fetchContacts(): Promise<EmergencyContact[]> {
  const res = await fetch(`${API_BASE}/contacts`);
  if (!res.ok) throw new Error('Failed to fetch contacts');
  return res.json();
}

export async function addContact(contact: Partial<EmergencyContact>): Promise<EmergencyContact> {
  const res = await fetch(`${API_BASE}/contacts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(contact),
  });
  if (!res.ok) throw new Error('Failed to add contact');
  return res.json();
}

export async function updateContact(id: string, contact: Partial<EmergencyContact>): Promise<EmergencyContact> {
  const res = await fetch(`${API_BASE}/contacts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(contact),
  });
  if (!res.ok) throw new Error('Failed to update contact');
  return res.json();
}

export async function deleteContact(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/contacts/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete contact');
}

export async function fetchEmergencyHistory(): Promise<{
  activeEmergency: EmergencyEvent | null;
  history: EmergencyEvent[];
}> {
  const res = await fetch(`${API_BASE}/emergency/history`);
  if (!res.ok) throw new Error('Failed to fetch emergency history');
  return res.json();
}

export async function cancelEmergency(reason?: string): Promise<{ success: boolean; event: EmergencyEvent }> {
  const res = await fetch(`${API_BASE}/device/emergency/cancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason }),
  });
  if (!res.ok) throw new Error('Failed to cancel emergency');
  return res.json();
}

export async function resolveEmergency(): Promise<{ success: boolean; event: EmergencyEvent }> {
  const res = await fetch(`${API_BASE}/device/emergency/resolve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  if (!res.ok) throw new Error('Failed to resolve emergency');
  return res.json();
}

export async function fetchLocationHistory(date?: string): Promise<{
  count: number;
  liveTrackingEnabled: boolean;
  locations: LocationRecord[];
}> {
  const url = date ? `${API_BASE}/location/history?date=${encodeURIComponent(date)}` : `${API_BASE}/location/history`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch location history');
  return res.json();
}

export async function toggleLiveTracking(enabled?: boolean): Promise<{ liveTrackingEnabled: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/location/toggle-live`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ enabled }),
  });
  if (!res.ok) throw new Error('Failed to toggle live tracking');
  return res.json();
}

export async function fetchNotifications(): Promise<{
  total: number;
  notifications: NotificationRecord[];
}> {
  const res = await fetch(`${API_BASE}/notifications/history`);
  if (!res.ok) throw new Error('Failed to fetch notifications');
  return res.json();
}

export async function triggerSimulation(action: 'emergency' | 'gps_step' | 'obstacle' | 'low_battery' | 'disconnect'): Promise<any> {
  const res = await fetch(`${API_BASE}/simulation/trigger`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action }),
  });
  if (!res.ok) throw new Error('Simulation action failed');
  return res.json();
}

export async function updateSystemSettings(settings: Partial<SystemSettings>): Promise<SystemSettings> {
  const res = await fetch(`${API_BASE}/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
  if (!res.ok) throw new Error('Failed to update settings');
  return res.json();
}

export async function fetchArduinoCode(): Promise<{ title: string; code: string; language: string }> {
  const res = await fetch(`${API_BASE}/hardware/arduino-code`);
  if (!res.ok) throw new Error('Failed to load ESP32 source');
  return res.json();
}
