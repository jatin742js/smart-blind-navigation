import { useState, useEffect, useCallback } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Phone,
  ExternalLink,
  MapPin,
  HeartPulse,
  Clock,
  Radio,
  Navigation,
  RefreshCw,
  Bell,
  Sliders,
  Shield,
  User,
  Users,
} from 'lucide-react';
import {
  DeviceStatus,
  SensorData,
  LocationRecord,
  EmergencyEvent,
  EmergencyContact,
  NotificationRecord,
  UserProfile,
  SystemSettings,
} from './types.ts';
import {
  fetchDeviceStatus,
  fetchUserProfile,
  fetchContacts,
  fetchEmergencyHistory,
  fetchLocationHistory,
  fetchNotifications,
  toggleLiveTracking,
} from './services/api.ts';

import Navbar from './components/Navbar.tsx';
import LoginPage from './components/LoginPage.tsx';
import MapComponent from './components/MapComponent.tsx';
import HardwareStatusCard from './components/HardwareStatusCard.tsx';
import ObstacleRadar from './components/ObstacleRadar.tsx';
import EmergencyContactsCard from './components/EmergencyContactsCard.tsx';
import EmergencyAlertModal from './components/EmergencyAlertModal.tsx';
import EmergencyHistoryView from './components/EmergencyHistoryView.tsx';
import LocationHistoryView from './components/LocationHistoryView.tsx';
import NotificationsView from './components/NotificationsView.tsx';
import ProfileView from './components/ProfileView.tsx';
import SimulationControls from './components/SimulationControls.tsx';
import Esp32CodeModal from './components/Esp32CodeModal.tsx';
import SettingsModal from './components/SettingsModal.tsx';

export default function App() {
  // Authentication State
  const [authToken, setAuthToken] = useState<string | null>(() => {
    return localStorage.getItem('caregiver_token') || 'demo_token_present';
  });
  const [user, setUser] = useState<UserProfile | null>(null);

  // Core Data States
  const [device, setDevice] = useState<DeviceStatus | null>(null);
  const [sensors, setSensors] = useState<SensorData | null>(null);
  const [currentLocation, setCurrentLocation] = useState<LocationRecord | null>(null);
  const [activeEmergency, setActiveEmergency] = useState<EmergencyEvent | null>(null);
  const [emergencyHistory, setEmergencyHistory] = useState<EmergencyEvent[]>([]);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [locations, setLocations] = useState<LocationRecord[]>([]);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    emergencyCancellationSeconds: 30,
    trackingIntervalSeconds: 5,
    liveTracking: true,
    soundAlerts: true,
    highContrastMode: false,
    voiceAnnouncements: true,
  });

  // UI Navigation & Modals
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [emergencyModalOpen, setEmergencyModalOpen] = useState<boolean>(false);
  const [esp32CodeModalOpen, setEsp32CodeModalOpen] = useState<boolean>(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>('Just now');

  // Load all data
  const loadData = useCallback(async () => {
    try {
      const [devData, userData, contactsData, emgData, locData, notifData] = await Promise.all([
        fetchDeviceStatus(),
        fetchUserProfile(),
        fetchContacts(),
        fetchEmergencyHistory(),
        fetchLocationHistory(),
        fetchNotifications(),
      ]);

      setDevice(devData.device);
      setSensors(devData.sensors);
      setCurrentLocation(devData.latestLocation);
      setUser(userData);
      setContacts(contactsData);
      setEmergencyHistory(emgData.history);
      setLocations(locData.locations);
      setNotifications(notifData.notifications);
      if (devData.systemSettings) {
        setSystemSettings(devData.systemSettings);
      }

      // If active emergency is newly detected, pop up the modal automatically
      if (devData.activeEmergency) {
        setActiveEmergency(devData.activeEmergency);
        setEmergencyModalOpen(true);
      } else {
        setActiveEmergency(null);
      }

      setLastUpdatedTime(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Failed to load portal data:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    if (authToken) {
      loadData();
    }
  }, [authToken, loadData]);

  // Periodic polling for hardware telemetry & emergency trigger
  useEffect(() => {
    if (!authToken) return;
    const interval = setInterval(() => {
      loadData();
    }, 4000);
    return () => clearInterval(interval);
  }, [authToken, loadData]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  const handleToggleLive = async () => {
    try {
      const res = await toggleLiveTracking();
      if (device) {
        setDevice({ ...device, liveTrackingEnabled: res.liveTrackingEnabled });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('caregiver_token');
    setAuthToken(null);
    setUser(null);
  };

  const handleLoginSuccess = (token: string, profile: UserProfile) => {
    localStorage.setItem('caregiver_token', token);
    setAuthToken(token);
    setUser(profile);
    loadData();
  };

  // If not logged in, render simple accessible Login page
  if (!authToken || !user) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900">
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        activeEmergency={activeEmergency}
        onOpenEmergencyModal={() => setEmergencyModalOpen(true)}
        device={
          device || {
            deviceId: 'STICK_001',
            deviceName: 'Smart Blind Navigation Stick',
            connected: true,
            batteryPercentage: 82,
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
          }
        }
        user={user}
        onOpenSettings={() => setSettingsModalOpen(true)}
        onOpenEsp32Code={() => setEsp32CodeModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Active Emergency Alert Ribbon (Always visible when active) */}
        {activeEmergency && (
          <div className="bg-rose-600 text-white rounded-2xl p-3.5 sm:p-4 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 animate-bounce">
            <div className="flex items-start sm:items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl flex-shrink-0 mt-0.5 sm:mt-0">
                <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black tracking-wide">
                  🚨 HARDWARE EMERGENCY BUTTON PRESSED BY {activeEmergency.patientName.toUpperCase()}
                </h3>
                <p className="text-xs text-rose-100 mt-0.5">
                  Location: {activeEmergency.address} • Battery: {activeEmergency.battery}% • Outbound Alerts Sent
                </p>
              </div>
            </div>

            <div className="flex flex-col xs:flex-row items-center gap-2 w-full sm:w-auto flex-shrink-0">
              <a
                href={`https://www.google.com/maps?q=${activeEmergency.latitude.toFixed(6)},${activeEmergency.longitude.toFixed(6)}`}
                target="_blank"
                rel="noreferrer"
                className="w-full xs:w-auto flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 bg-white text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-bold transition shadow-sm min-h-[38px]"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Google Maps</span>
              </a>
              <button
                type="button"
                onClick={() => setEmergencyModalOpen(true)}
                className="w-full xs:w-auto flex-1 sm:flex-initial px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition shadow-sm min-h-[38px]"
              >
                View Emergency Hub
              </button>
            </div>
          </div>
        )}

        {/* Global Toolbar: Simulation Suite & Live Status */}
        <div className="flex flex-col gap-3 sm:gap-4">
          <SimulationControls onSimulationRun={loadData} />

          {/* Sub-header with live tracking toggle and refresh */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-1 text-xs text-slate-500">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="font-semibold text-slate-700">Patient:</span>
              <span className="bg-white px-2 py-1 rounded-md border border-slate-200 font-bold text-slate-800">
                {user.blindUserPatient.name} ({user.blindUserPatient.age} yrs, {user.blindUserPatient.bloodGroup})
              </span>
              <span className="text-slate-300 hidden sm:inline">•</span>
              <span className="whitespace-nowrap">Stick ID: <strong className="font-mono text-slate-700">{user.blindUserPatient.deviceId}</strong></span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap self-start sm:self-auto">
              <button
                onClick={handleToggleLive}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold border transition text-xs min-h-[36px] ${
                  device?.liveTrackingEnabled
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-white text-slate-600 border-slate-200'
                }`}
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Live Tracking: {device?.liveTrackingEnabled ? 'ON' : 'PAUSED'}</span>
              </button>

              <button
                onClick={handleManualRefresh}
                className="flex items-center gap-1 text-slate-600 hover:text-slate-900 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs min-h-[36px]"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Sync</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Views */}
        {currentTab === 'dashboard' && (
          <div className="space-y-4 sm:space-y-6">
            {/* Top Grid: Emergency Card + Patient Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Emergency Status Master Card (Span 2) */}
              <div className="lg:col-span-2 bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`p-2 sm:p-2.5 rounded-2xl flex-shrink-0 ${
                          activeEmergency ? 'bg-rose-100 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                        }`}
                      >
                        <Shield className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <div>
                        <h2 className="text-base sm:text-lg font-bold text-slate-900">Emergency System Status</h2>
                        <p className="text-xs text-slate-500">
                          Real-time monitor of physical smart stick emergency button & auto-dispatch.
                        </p>
                      </div>
                    </div>

                    <span
                      className={`self-start sm:self-auto px-3 py-1 rounded-full text-xs font-bold ${
                        activeEmergency
                          ? 'bg-rose-100 text-rose-800 border border-rose-200 animate-pulse'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {activeEmergency ? '🚨 ACTIVE ALERT' : '🟢 ALL SECURE'}
                    </span>
                  </div>

                  {activeEmergency ? (
                    <div className="p-3.5 sm:p-4 bg-rose-50 rounded-2xl border border-rose-200 mb-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                        <div>
                          <p className="text-sm font-bold text-rose-900">
                            Emergency triggered by {activeEmergency.patientName}
                          </p>
                          <p className="text-xs text-rose-700 mt-0.5">{activeEmergency.address}</p>
                        </div>
                        <button
                          onClick={() => setEmergencyModalOpen(true)}
                          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm self-stretch sm:self-auto min-h-[36px]"
                        >
                          Open Alert Modal
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3.5 sm:p-4 bg-slate-50 rounded-2xl border border-slate-200 mb-4">
                      <p className="text-xs text-slate-600 leading-relaxed">
                        No active distress alerts. The smart stick hardware button is armed (GPIO 4) and monitored. When pressed by {user.blindUserPatient.name}, all registered contacts receive immediate notification with live GPS coordinates and Google Maps routing.
                      </p>
                    </div>
                  )}
                </div>

                {/* Quick Stats Banner */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-3 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-[11px] sm:text-xs text-slate-400 block truncate">Stick Battery</span>
                    <strong className="text-sm sm:text-base text-slate-800 font-mono font-bold">
                      {device?.batteryPercentage ?? 82}%
                    </strong>
                  </div>
                  <div>
                    <span className="text-[11px] sm:text-xs text-slate-400 block truncate">GPS Accuracy</span>
                    <strong className="text-sm sm:text-base text-slate-800 font-mono font-bold">
                      ±{currentLocation?.accuracy.toFixed(1) ?? 3.5}m
                    </strong>
                  </div>
                  <div>
                    <span className="text-[11px] sm:text-xs text-slate-400 block truncate">Emergency Contacts</span>
                    <strong className="text-sm sm:text-base text-slate-800 font-bold truncate">
                      {contacts.length} Active
                    </strong>
                  </div>
                </div>
              </div>

              {/* Patient / Caregiver Card */}
              <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-base sm:text-lg shadow-sm flex-shrink-0">
                      {user.blindUserPatient.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{user.blindUserPatient.name}</h3>
                      <p className="text-xs text-blue-600 font-semibold">Visually Impaired Patient</p>
                    </div>
                  </div>

                  <div className="space-y-2.5 text-xs text-slate-600">
                    <div className="flex justify-between py-1 border-b border-slate-100 gap-2">
                      <span className="text-slate-400 flex-shrink-0">Age / Blood Group:</span>
                      <strong className="text-slate-800 text-right">
                        {user.blindUserPatient.age} yrs • Type {user.blindUserPatient.bloodGroup}
                      </strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100 gap-2">
                      <span className="text-slate-400 flex-shrink-0">Assigned Caregiver:</span>
                      <strong className="text-slate-800 text-right">{user.name}</strong>
                    </div>
                    <div className="py-1">
                      <span className="text-slate-400 block mb-1">Medical Condition:</span>
                      <p className="text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 leading-relaxed text-xs">
                        {user.blindUserPatient.medicalNotes}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    onClick={() => setCurrentTab('profile')}
                    className="w-full text-center text-xs font-bold text-blue-600 hover:text-blue-800 py-1.5"
                  >
                    View & Edit Full Medical Profile →
                  </button>
                </div>
              </div>
            </div>

            {/* Middle Section: Interactive Map + Obstacle Radar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Map (Span 2) */}
              <div className="lg:col-span-2 bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-rose-500 flex-shrink-0" />
                      <span>Live Navigation Map & GPS Location</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Pinpoint coordinates received from ESP32 u-blox NEO GPS module.
                    </p>
                  </div>
                  <button
                    onClick={() => setCurrentTab('location-history')}
                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold self-start sm:self-auto"
                  >
                    View History →
                  </button>
                </div>

                <div className="h-72 sm:h-96 w-full">
                  <MapComponent
                    currentLocation={currentLocation}
                    historyLocations={locations}
                    isEmergency={Boolean(activeEmergency)}
                    isLiveTracking={device?.liveTrackingEnabled ?? true}
                  />
                </div>
              </div>

              {/* Obstacle Radar */}
              <div className="h-full">
                {sensors ? (
                  <ObstacleRadar sensors={sensors} />
                ) : (
                  <div className="bg-white rounded-2xl p-6 border border-slate-200 text-center text-xs text-slate-400">
                    Awaiting sensor telemetry...
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Grid: Hardware Diagnostics & Emergency Contacts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Hardware Status (Span 2) */}
              <div className="lg:col-span-2">
                {device && <HardwareStatusCard device={device} />}
              </div>

              {/* Quick Emergency Contacts List */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-600" />
                      <span>Emergency Contacts</span>
                    </h3>
                    <button
                      onClick={() => setCurrentTab('contacts')}
                      className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      Manage →
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mb-3">
                    Contacts alerted in order of priority when emergency button is pressed.
                  </p>

                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {contacts.slice(0, 4).map((c) => (
                      <div
                        key={c.id}
                        className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between"
                      >
                        <div>
                          <p className="font-bold text-slate-800">{c.name}</p>
                          <p className="text-slate-500 text-[11px]">{c.relationship}</p>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                          {c.priority.split(' ')[0]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setCurrentTab('contacts')}
                  className="w-full mt-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl text-xs transition"
                >
                  Add / Edit Emergency Contacts
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Emergency Contacts Manager */}
        {currentTab === 'contacts' && (
          <EmergencyContactsCard contacts={contacts} onRefresh={loadData} />
        )}

        {/* Tab 3: Live Location & Map */}
        {currentTab === 'location' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Live GPS Location Tracker</h3>
                  <p className="text-xs text-slate-500">
                    Real-time position of {user.blindUserPatient.name}'s smart stick with satellite lock.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleToggleLive}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs ${
                      device?.liveTrackingEnabled
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    {device?.liveTrackingEnabled ? 'Live Sharing Active (Click to Pause)' : 'Live Sharing Paused (Click to Enable)'}
                  </button>
                </div>
              </div>

              <div className="h-[520px] w-full">
                <MapComponent
                  currentLocation={currentLocation}
                  historyLocations={locations}
                  isEmergency={Boolean(activeEmergency)}
                  isLiveTracking={device?.liveTrackingEnabled ?? true}
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Emergency History */}
        {currentTab === 'emergency-history' && (
          <EmergencyHistoryView history={emergencyHistory} />
        )}

        {/* Tab 5: Location History */}
        {currentTab === 'location-history' && (
          <LocationHistoryView
            locations={locations}
            isLiveTracking={device?.liveTrackingEnabled ?? true}
            onFilterDate={(date) => {
              fetchLocationHistory(date).then((res) => setLocations(res.locations));
            }}
          />
        )}

        {/* Tab 6: Hardware Diagnostics & Sensor Radar */}
        {currentTab === 'hardware' && (
          <div className="space-y-6">
            {device && <HardwareStatusCard device={device} />}
            {sensors && <ObstacleRadar sensors={sensors} />}
          </div>
        )}

        {/* Tab 7: Notifications History */}
        {currentTab === 'notifications' && (
          <NotificationsView notifications={notifications} />
        )}

        {/* Tab 8: Caregiver & Patient Profile */}
        {currentTab === 'profile' && (
          <ProfileView user={user} onProfileUpdated={(updated) => setUser(updated)} />
        )}
      </main>

      {/* Emergency Alert Modal (Shown on active emergency) */}
      {emergencyModalOpen && activeEmergency && (
        <EmergencyAlertModal
          emergency={activeEmergency}
          onEmergencyUpdated={() => {
            loadData();
            setEmergencyModalOpen(false);
          }}
          soundAlertsEnabled={systemSettings.soundAlerts}
        />
      )}

      {/* ESP32 Arduino Firmware Code Modal */}
      {esp32CodeModalOpen && (
        <Esp32CodeModal onClose={() => setEsp32CodeModalOpen(false)} />
      )}

      {/* Settings Modal */}
      {settingsModalOpen && (
        <SettingsModal
          settings={systemSettings}
          onClose={() => setSettingsModalOpen(false)}
          onSettingsUpdated={(newSettings) => setSystemSettings(newSettings)}
        />
      )}
    </div>
  );
}
