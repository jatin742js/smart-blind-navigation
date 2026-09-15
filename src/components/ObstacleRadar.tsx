import { ShieldAlert, ShieldCheck, Volume2, VolumeX, Radio } from 'lucide-react';
import { SensorData } from '../types.ts';

interface ObstacleRadarProps {
  sensors: SensorData;
}

export default function ObstacleRadar({ sensors }: ObstacleRadarProps) {
  const getStatus = (distanceCm: number) => {
    if (distanceCm < 45) {
      return { label: 'Obstacle Alert', color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200', tag: 'bg-rose-100 text-rose-700', alert: true };
    }
    if (distanceCm < 75) {
      return { label: 'Caution', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', tag: 'bg-amber-100 text-amber-800', alert: false };
    }
    return { label: 'Safe', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', tag: 'bg-emerald-100 text-emerald-700', alert: false };
  };

  const frontStatus = getStatus(sensors.frontDistanceCm);
  const leftStatus = getStatus(sensors.leftDistanceCm);
  const rightStatus = getStatus(sensors.rightDistanceCm);

  const hasAnyObstacle = sensors.frontObstacle || sensors.leftObstacle || sensors.rightObstacle;

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-4">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl flex-shrink-0 ${hasAnyObstacle ? 'bg-rose-100 text-rose-600' : 'bg-blue-50 text-blue-600'}`}>
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">Obstacle Detection (Ultrasonic)</h3>
            <p className="text-xs text-slate-500">HC-SR04 3-Zone Rangefinders & Haptic Buzzer</p>
          </div>
        </div>

        {/* Buzzer Badge */}
        <div className="self-start sm:self-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border" style={{
          backgroundColor: sensors.buzzerActive ? '#fff1f2' : '#f8fafc',
          borderColor: sensors.buzzerActive ? '#fecdd3' : '#e2e8f0',
          color: sensors.buzzerActive ? '#be123c' : '#64748b',
        }}>
          {sensors.buzzerActive ? (
            <>
              <Volume2 className="w-3.5 h-3.5 text-rose-600 animate-pulse flex-shrink-0" />
              <span>Haptic Buzzer: Active</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span>Buzzer: Idle</span>
            </>
          )}
        </div>
      </div>

      {/* Visual Radar Arc Graphic */}
      <div className="relative py-4 flex flex-col items-center justify-center">
        {/* Semi-circular Radar Visualization */}
        <div className="relative w-full max-w-[260px] h-32 overflow-hidden flex items-end justify-center">
          {/* Radar Background Rings */}
          <div className="absolute w-60 h-60 rounded-full border border-dashed border-slate-300 bottom-0 pointer-events-none"></div>
          <div className="absolute w-44 h-44 rounded-full border border-slate-200 bottom-0 pointer-events-none"></div>
          <div className="absolute w-28 h-28 rounded-full border border-slate-200 bottom-0 pointer-events-none"></div>

          {/* Stick Origin Icon */}
          <div className="z-10 bg-slate-900 text-white p-2.5 rounded-full shadow-md flex items-center justify-center mb-0">
            <span className="text-[10px] font-bold uppercase tracking-wider">STICK</span>
          </div>

          {/* Left Ray */}
          <div
            className={`absolute bottom-0 left-6 sm:left-8 w-18 sm:w-20 h-24 origin-bottom-right transform -rotate-45 rounded-t-full transition-all duration-300 opacity-30 ${
              sensors.leftObstacle ? 'bg-rose-500' : 'bg-emerald-400'
            }`}
          />

          {/* Front Ray */}
          <div
            className={`absolute bottom-0 w-22 sm:w-24 h-28 origin-bottom rounded-t-full transition-all duration-300 opacity-30 ${
              sensors.frontObstacle ? 'bg-rose-500' : 'bg-emerald-400'
            }`}
          />

          {/* Right Ray */}
          <div
            className={`absolute bottom-0 right-6 sm:right-8 w-18 sm:w-20 h-24 origin-bottom-left transform rotate-45 rounded-t-full transition-all duration-300 opacity-30 ${
              sensors.rightObstacle ? 'bg-rose-500' : 'bg-emerald-400'
            }`}
          />
        </div>

        <p className="text-xs text-slate-400 mt-2 font-medium">Forward Walking Path Orientation</p>
      </div>

      {/* 3 Zone Readings Cards */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5 mt-4">
        {/* Left Sensor */}
        <div className={`p-2 sm:p-3 rounded-xl border flex flex-col items-center text-center ${leftStatus.bg}`}>
          <span className="text-[10px] sm:text-xs font-semibold text-slate-600 mb-1 truncate max-w-full">Left Angle</span>
          <span className="text-base sm:text-xl font-bold font-mono text-slate-900">{sensors.leftDistanceCm} <span className="text-[10px] sm:text-xs font-normal">cm</span></span>
          <span className={`mt-1.5 sm:mt-2 px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-semibold whitespace-nowrap ${leftStatus.tag}`}>
            {leftStatus.alert ? '⚠️ ' : '✅ '}{leftStatus.label}
          </span>
        </div>

        {/* Front Sensor */}
        <div className={`p-2 sm:p-3 rounded-xl border flex flex-col items-center text-center ${frontStatus.bg}`}>
          <span className="text-[10px] sm:text-xs font-semibold text-slate-600 mb-1 truncate max-w-full">Front Center</span>
          <span className="text-base sm:text-xl font-bold font-mono text-slate-900">{sensors.frontDistanceCm} <span className="text-[10px] sm:text-xs font-normal">cm</span></span>
          <span className={`mt-1.5 sm:mt-2 px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-semibold whitespace-nowrap ${frontStatus.tag}`}>
            {frontStatus.alert ? '⚠️ ' : '✅ '}{frontStatus.label}
          </span>
        </div>

        {/* Right Sensor */}
        <div className={`p-2 sm:p-3 rounded-xl border flex flex-col items-center text-center ${rightStatus.bg}`}>
          <span className="text-[10px] sm:text-xs font-semibold text-slate-600 mb-1 truncate max-w-full">Right Angle</span>
          <span className="text-base sm:text-xl font-bold font-mono text-slate-900">{sensors.rightDistanceCm} <span className="text-[10px] sm:text-xs font-normal">cm</span></span>
          <span className={`mt-1.5 sm:mt-2 px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-semibold whitespace-nowrap ${rightStatus.tag}`}>
            {rightStatus.alert ? '⚠️ ' : '✅ '}{rightStatus.label}
          </span>
        </div>
      </div>
    </div>
  );
}
