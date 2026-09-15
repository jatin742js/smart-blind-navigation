import { useState } from 'react';
import {
  HeartHandshake,
  AlertTriangle,
  Radio,
  MapPin,
  Clock,
  User,
  Bell,
  Cpu,
  Sliders,
  LogOut,
  Menu,
  X,
  Battery,
  Shield,
  FileCode,
  Users,
} from 'lucide-react';
import { DeviceStatus, EmergencyEvent, UserProfile } from '../types.ts';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  activeEmergency: EmergencyEvent | null;
  onOpenEmergencyModal: () => void;
  device: DeviceStatus;
  user: UserProfile;
  onOpenSettings: () => void;
  onOpenEsp32Code: () => void;
  onLogout: () => void;
}

export default function Navbar({
  currentTab,
  onSelectTab,
  activeEmergency,
  onOpenEmergencyModal,
  device,
  user,
  onOpenSettings,
  onOpenEsp32Code,
  onLogout,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Shield },
    { id: 'contacts', label: 'Emergency Contacts', icon: Users },
    { id: 'location', label: 'Live Location & Trail', icon: MapPin },
    { id: 'emergency-history', label: 'Emergency History', icon: AlertTriangle },
    { id: 'location-history', label: 'Location History', icon: Clock },
    { id: 'hardware', label: 'Hardware & Radar', icon: Cpu },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'profile', label: 'Patient & Profile', icon: User },
  ];

  const handleTabClick = (id: string) => {
    onSelectTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/20 flex-shrink-0">
              <HeartHandshake className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-black text-slate-900 text-sm sm:text-base md:text-lg tracking-tight truncate">
                  Smart Blind Stick
                </span>
                <span className="hidden sm:inline-block bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider flex-shrink-0">
                  Caregiver
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block truncate">
                Monitoring: <strong className="text-slate-800">{user.blindUserPatient.name}</strong> ({device.deviceId})
              </p>
            </div>
          </div>

          {/* Center Status Indicators */}
          <div className="hidden md:flex items-center gap-3">
            {/* Active Emergency Alert Button */}
            {activeEmergency && (
              <button
                type="button"
                onClick={onOpenEmergencyModal}
                className="flex items-center gap-2 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow-lg shadow-rose-600/30 animate-pulse transition active:scale-95 min-h-[36px]"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>ACTIVE EMERGENCY ALERT</span>
              </button>
            )}

            {/* Hardware Status Pill */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700">
              <span className={`w-2 h-2 rounded-full ${device.connected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              <span>{device.connected ? 'ESP32 Online' : 'Offline'}</span>
              <span className="text-slate-300">|</span>
              <div className="flex items-center gap-1 font-mono">
                <Battery className={`w-3.5 h-3.5 ${device.batteryPercentage <= 20 ? 'text-rose-600' : 'text-slate-600'}`} />
                <span>{device.batteryPercentage}%</span>
              </div>
            </div>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Mobile Emergency Pulse Icon */}
            {activeEmergency && (
              <button
                type="button"
                onClick={onOpenEmergencyModal}
                title="Active Emergency Alert!"
                className="md:hidden flex items-center gap-1 p-2 bg-rose-600 text-white rounded-xl text-xs font-bold animate-bounce min-h-[40px]"
              >
                <AlertTriangle className="w-4 h-4" />
                <span className="text-[10px] uppercase font-black">ALERT</span>
              </button>
            )}

            {/* ESP32 Arduino Code Modal Trigger */}
            <button
              type="button"
              onClick={onOpenEsp32Code}
              title="ESP32 Firmware Code & Pinout"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition border border-slate-200 min-h-[36px]"
            >
              <FileCode className="w-4 h-4 text-blue-600" />
              <span className="hidden lg:inline">ESP32 Firmware</span>
            </button>

            {/* Settings Trigger */}
            <button
              type="button"
              onClick={onOpenSettings}
              title="Settings"
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition min-w-[38px] min-h-[38px] flex items-center justify-center"
            >
              <Sliders className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Logout */}
            <button
              type="button"
              onClick={onLogout}
              title="Sign Out"
              className="hidden sm:flex p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition min-w-[38px] min-h-[38px] items-center justify-center"
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Mobile Menu Hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Desktop Tab Navigation Bar */}
        <nav className="hidden md:flex space-x-1 py-2 border-t border-slate-100 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap min-h-[38px] ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2 shadow-xl animate-in slide-in-from-top-2 max-h-[85vh] overflow-y-auto">
          {/* Mobile Status Header */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${device.connected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              <span className="font-semibold">{device.connected ? 'ESP32 Connected' : 'Stick Offline'}</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono font-bold">
              <Battery className={`w-4 h-4 ${device.batteryPercentage <= 20 ? 'text-rose-600' : 'text-slate-600'}`} />
              <span>{device.batteryPercentage}%</span>
            </div>
          </div>

          {activeEmergency && (
            <button
              onClick={() => {
                onOpenEmergencyModal();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 p-3.5 bg-rose-600 text-white rounded-xl text-xs font-bold mb-2 animate-pulse min-h-[44px]"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>ACTIVE EMERGENCY - OPEN HUB</span>
            </button>
          )}

          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition min-h-[44px] ${
                    isActive ? 'bg-blue-600 text-white font-bold' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick links at bottom of mobile drawer */}
          <div className="pt-3 mt-3 border-t border-slate-100 space-y-1">
            <button
              onClick={() => {
                onOpenEsp32Code();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100 min-h-[44px]"
            >
              <FileCode className="w-5 h-5 text-blue-600" />
              <span>ESP32 Firmware & Pinout</span>
            </button>
            <button
              onClick={() => {
                onOpenSettings();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100 min-h-[44px]"
            >
              <Sliders className="w-5 h-5 text-slate-500" />
              <span>System Settings</span>
            </button>
            <button
              onClick={() => {
                onLogout();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 min-h-[44px]"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
