import { useState } from 'react';
import {
  AlertTriangle,
  Navigation,
  Radio,
  BatteryCharging,
  WifiOff,
  Sparkles,
  Check,
} from 'lucide-react';
import { triggerSimulation } from '../services/api.ts';

interface SimulationControlsProps {
  onSimulationRun: () => void;
}

export default function SimulationControls({ onSimulationRun }: SimulationControlsProps) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleAction = async (action: 'emergency' | 'gps_step' | 'obstacle' | 'low_battery' | 'disconnect') => {
    setLoadingAction(action);
    setFeedback(null);
    try {
      const res = await triggerSimulation(action);
      setFeedback(res.message);
      onSimulationRun();
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback(err.message || 'Simulation trigger failed');
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-slate-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>ESP32 Hardware Simulation Suite</span>
              <span className="bg-amber-400/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-400/30 uppercase">
                Demo Lab
              </span>
            </h3>
            <p className="text-xs text-slate-300">
              Trigger hardware events to test caregiver alert dispatch without the physical stick.
            </p>
          </div>
        </div>

        {feedback && (
          <div className="inline-flex items-center gap-2 text-xs font-semibold bg-emerald-500/20 text-emerald-300 px-3 py-1.5 rounded-xl border border-emerald-500/30 animate-in fade-in">
            <Check className="w-4 h-4" />
            <span>{feedback}</span>
          </div>
        )}
      </div>

      {/* Button Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-2.5">
        {/* 1. Simulate Emergency */}
        <button
          type="button"
          onClick={() => handleAction('emergency')}
          disabled={loadingAction !== null}
          id="btn-simulate-emergency"
          className="flex flex-col items-center justify-center p-3 sm:p-3.5 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white rounded-2xl font-bold shadow-lg shadow-rose-950/40 border border-rose-400/30 transition disabled:opacity-50 min-h-[72px] sm:min-h-[80px]"
        >
          <AlertTriangle className="w-5 h-5 mb-1.5 text-white animate-bounce" />
          <span className="text-xs font-black text-center">Simulate Emergency</span>
          <span className="text-[10px] text-rose-200 font-normal text-center">Push Button Press</span>
        </button>

        {/* 2. Simulate GPS Update */}
        <button
          type="button"
          onClick={() => handleAction('gps_step')}
          disabled={loadingAction !== null}
          id="btn-simulate-gps"
          className="flex flex-col items-center justify-center p-3 sm:p-3.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-white rounded-2xl font-semibold border border-slate-700 transition disabled:opacity-50 min-h-[72px] sm:min-h-[80px]"
        >
          <Navigation className="w-5 h-5 mb-1.5 text-blue-400" />
          <span className="text-xs font-bold text-center">Simulate GPS Step</span>
          <span className="text-[10px] text-slate-400 font-normal text-center">Next Coordinates</span>
        </button>

        {/* 3. Simulate Obstacle */}
        <button
          type="button"
          onClick={() => handleAction('obstacle')}
          disabled={loadingAction !== null}
          id="btn-simulate-obstacle"
          className="flex flex-col items-center justify-center p-3 sm:p-3.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-white rounded-2xl font-semibold border border-slate-700 transition disabled:opacity-50 min-h-[72px] sm:min-h-[80px]"
        >
          <Radio className="w-5 h-5 mb-1.5 text-amber-400" />
          <span className="text-xs font-bold text-center">Simulate Obstacle</span>
          <span className="text-[10px] text-slate-400 font-normal text-center">Toggle Ultrasonic Alert</span>
        </button>

        {/* 4. Simulate Low Battery */}
        <button
          type="button"
          onClick={() => handleAction('low_battery')}
          disabled={loadingAction !== null}
          id="btn-simulate-battery"
          className="flex flex-col items-center justify-center p-3 sm:p-3.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-white rounded-2xl font-semibold border border-slate-700 transition disabled:opacity-50 min-h-[72px] sm:min-h-[80px]"
        >
          <BatteryCharging className="w-5 h-5 mb-1.5 text-emerald-400" />
          <span className="text-xs font-bold text-center">Simulate Battery</span>
          <span className="text-[10px] text-slate-400 font-normal text-center">Toggle 14% / 88%</span>
        </button>

        {/* 5. Simulate Disconnect */}
        <button
          type="button"
          onClick={() => handleAction('disconnect')}
          disabled={loadingAction !== null}
          id="btn-simulate-disconnect"
          className="flex flex-col items-center justify-center p-3 sm:p-3.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-white rounded-2xl font-semibold border border-slate-700 transition disabled:opacity-50 col-span-2 sm:col-span-1 min-h-[72px] sm:min-h-[80px]"
        >
          <WifiOff className="w-5 h-5 mb-1.5 text-violet-400" />
          <span className="text-xs font-bold text-center">Simulate WiFi Drop</span>
          <span className="text-[10px] text-slate-400 font-normal text-center">Online / Offline</span>
        </button>
      </div>
    </div>
  );
}
