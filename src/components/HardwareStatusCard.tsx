import {
  Cpu,
  Battery,
  BatteryCharging,
  BatteryWarning,
  Wifi,
  WifiOff,
  Navigation,
  AlertOctagon,
  CheckCircle2,
  Clock,
  Radio,
  Volume2,
} from 'lucide-react';
import { DeviceStatus } from '../types.ts';

interface HardwareStatusCardProps {
  device: DeviceStatus;
}

export default function HardwareStatusCard({ device }: HardwareStatusCardProps) {
  // Format last heartbeat relative time
  const formatHeartbeat = (iso: string) => {
    try {
      const diffMs = Date.now() - new Date(iso).getTime();
      const diffSec = Math.floor(diffMs / 1000);
      if (diffSec < 5) return 'Just now (Active)';
      if (diffSec < 60) return `${diffSec}s ago`;
      const diffMin = Math.floor(diffSec / 60);
      return `${diffMin}m ago`;
    } catch {
      return 'Recent';
    }
  };

  const isLowBattery = device.batteryPercentage <= 20;

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 flex-shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">ESP32 Hardware Diagnostics</h3>
            <p className="text-xs text-slate-500">{device.deviceName} (ID: {device.deviceId})</p>
          </div>
        </div>

        {/* Overall Status Badge */}
        <span
          className={`self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
            device.connected ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
          }`}
        >
          <span className={`h-2 w-2 rounded-full ${device.connected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
          {device.connected ? 'Device Connected' : 'Disconnected'}
        </span>
      </div>

      {/* Grid of hardware subsystems */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {/* Battery Subsystem */}
        <div className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/70 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Battery Level</span>
            {device.charging ? (
              <BatteryCharging className="w-4 h-4 text-emerald-600" />
            ) : isLowBattery ? (
              <BatteryWarning className="w-4 h-4 text-rose-600 animate-bounce" />
            ) : (
              <Battery className="w-4 h-4 text-slate-600" />
            )}
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-bold font-mono ${isLowBattery ? 'text-rose-600' : 'text-slate-900'}`}>
              {device.batteryPercentage}%
            </span>
            {device.batteryVoltage && (
              <span className="text-xs text-slate-500 font-mono">({device.batteryVoltage.toFixed(2)}V)</span>
            )}
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isLowBattery ? 'bg-rose-500' : device.batteryPercentage < 50 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${device.batteryPercentage}%` }}
            />
          </div>
        </div>

        {/* GPS Status */}
        <div className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/70 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>GPS Module</span>
            <Navigation className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-slate-900">
              {device.gpsStatus === 'available' ? '🟢 Available' : '🔴 Unavailable'}
            </span>
          </div>
          <span className="text-xs text-slate-500 mt-1">
            Satellites: <strong className="text-slate-800">{device.gpsSatellites} locked</strong>
          </span>
        </div>

        {/* Wi-Fi / Cellular Connection */}
        <div className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/70 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Network / Wi-Fi</span>
            {device.wifiStatus === 'connected' ? (
              <Wifi className="w-4 h-4 text-emerald-600" />
            ) : (
              <WifiOff className="w-4 h-4 text-rose-500" />
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-slate-900">
              {device.wifiStatus === 'connected' ? '🟢 Connected' : '🔴 Offline'}
            </span>
          </div>
          <span className="text-xs text-slate-500 mt-1">
            Signal RSSI: <strong className="text-slate-800">{device.wifiSignalRssi} dBm</strong>
          </span>
        </div>

        {/* Emergency Push Button */}
        <div className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/70 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Emergency Button</span>
            <AlertOctagon className="w-4 h-4 text-rose-600" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`text-sm font-bold ${
              device.emergencyButtonStatus === 'triggered' ? 'text-rose-600 animate-pulse' : 'text-slate-900'
            }`}>
              {device.emergencyButtonStatus === 'triggered' ? '🚨 TRIGGERED' : '🟢 Ready'}
            </span>
          </div>
          <span className="text-xs text-slate-500 mt-1">GPIO 4 (Debounced)</span>
        </div>

        {/* Ultrasonic Sensors Array */}
        <div className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/70 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Ultrasonic Sensors</span>
            <Radio className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-slate-900">
              {device.ultrasonicSensorStatus === 'healthy' ? '🟢 Active & Healthy' : '⚠️ Degraded'}
            </span>
          </div>
          <span className="text-xs text-slate-500 mt-1">3x HC-SR04 Transducers</span>
        </div>

        {/* Voice & Buzzer Module */}
        <div className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/70 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Buzzer / Voice</span>
            <Volume2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-slate-900">
              🟢 Ready
            </span>
          </div>
          <span className="text-xs text-slate-500 mt-1">PWM Piezo & Haptic</span>
        </div>

        {/* Last Heartbeat */}
        <div className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/70 flex flex-col justify-between col-span-1 xs:col-span-2 sm:col-span-2 md:col-span-3 lg:col-span-2">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Last Communication</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-semibold text-slate-800">
              {formatHeartbeat(device.lastHeartbeat)}
            </span>
          </div>
          <span className="text-xs text-slate-400 mt-1">
            Timestamp: {new Date(device.lastHeartbeat).toLocaleTimeString()}
          </span>
        </div>
      </div>
    </div>
  );
}
