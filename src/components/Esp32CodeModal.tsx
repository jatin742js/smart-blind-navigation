import { useState, useEffect } from 'react';
import {
  Code,
  Copy,
  Check,
  Cpu,
  X,
  ExternalLink,
  Layers,
  Terminal,
} from 'lucide-react';
import { fetchArduinoCode } from '../services/api.ts';

interface Esp32CodeModalProps {
  onClose: () => void;
}

export default function Esp32CodeModal({ onClose }: Esp32CodeModalProps) {
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArduinoCode()
      .then((data) => setCode(data.code))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in zoom-in-95">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-6 flex items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-2.5 bg-blue-600 rounded-xl flex-shrink-0">
              <Cpu className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">ESP32 Smart Stick Firmware</h3>
              <p className="text-xs text-slate-400">
                Ready-to-flash Arduino C++ firmware for ESP32 with GPS, Ultrasonic, and Emergency Button.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition min-w-[36px] min-h-[36px] flex items-center justify-center flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pinout Quick Ref */}
        <div className="bg-slate-100 p-4 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-2 bg-white rounded-xl border border-slate-200">
            <span className="font-bold text-rose-600 block">Emergency Button:</span>
            <span className="font-mono text-slate-600">GPIO 4 (Pullup)</span>
          </div>
          <div className="p-2 bg-white rounded-xl border border-slate-200">
            <span className="font-bold text-blue-600 block">GPS UART:</span>
            <span className="font-mono text-slate-600">RX: GPIO 16 / TX: 17</span>
          </div>
          <div className="p-2 bg-white rounded-xl border border-slate-200">
            <span className="font-bold text-indigo-600 block">Front Ultrasonic:</span>
            <span className="font-mono text-slate-600">Trig: 18 / Echo: 19</span>
          </div>
          <div className="p-2 bg-white rounded-xl border border-slate-200">
            <span className="font-bold text-emerald-600 block">Piezo Buzzer:</span>
            <span className="font-mono text-slate-600">GPIO 2 (PWM)</span>
          </div>
        </div>

        {/* Code Box */}
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-slate-500" />
              <span>SmartBlindStick_ESP32.ino</span>
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Code Copied!' : 'Copy Arduino C++'}</span>
            </button>
          </div>

          <div className="relative bg-slate-950 rounded-2xl p-4 overflow-x-auto max-h-[420px] text-xs font-mono text-emerald-400 border border-slate-800">
            {loading ? (
              <p className="text-slate-400">Loading firmware source...</p>
            ) : (
              <pre className="whitespace-pre leading-relaxed">{code}</pre>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-4 sm:px-6 py-3.5 sm:py-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 text-xs text-slate-500">
          <span>Required Arduino Libraries: <strong>TinyGPSPlus</strong> & <strong>ArduinoJson</strong></span>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold transition min-h-[42px] flex items-center justify-center"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
