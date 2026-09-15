import React, { useState } from 'react';
import {
  Sliders,
  Bell,
  Clock,
  Navigation,
  Volume2,
  Eye,
  Save,
  CheckCircle2,
  X,
} from 'lucide-react';
import { SystemSettings } from '../types.ts';
import { updateSystemSettings } from '../services/api.ts';

interface SettingsModalProps {
  settings: SystemSettings;
  onClose: () => void;
  onSettingsUpdated: (updated: SystemSettings) => void;
}

export default function SettingsModal({
  settings,
  onClose,
  onSettingsUpdated,
}: SettingsModalProps) {
  const [formData, setFormData] = useState<SystemSettings>(settings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateSystemSettings(formData);
      onSettingsUpdated(updated);
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        onClose();
      }, 1200);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full p-4 sm:p-6 shadow-2xl border border-slate-200 my-auto animate-in zoom-in-95 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl flex-shrink-0">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">System & Safety Settings</h3>
              <p className="text-xs text-slate-500">Configure emergency dispatch and telemetry parameters.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg min-w-[36px] min-h-[36px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {saved && (
          <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-xl border border-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Settings saved successfully!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Emergency Cancellation Window */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <label className="font-bold text-slate-800 block mb-1">
              Emergency Cancellation Grace Period (Seconds)
            </label>
            <p className="text-slate-500 mb-2">
              Time the user/caregiver has to cancel a false alarm before outbound emergency dispatch escalates.
            </p>
            <select
              value={formData.emergencyCancellationSeconds}
              onChange={(e) =>
                setFormData({ ...formData, emergencyCancellationSeconds: Number(e.target.value) })
              }
              className="w-full p-2.5 text-sm border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value={15}>15 seconds</option>
              <option value={30}>30 seconds (Default)</option>
              <option value={45}>45 seconds</option>
              <option value={60}>60 seconds</option>
            </select>
          </div>

          {/* GPS Telemetry Broadcast Interval */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <label className="font-bold text-slate-800 block mb-1">
              Live GPS Telemetry Tracking Interval
            </label>
            <p className="text-slate-500 mb-2">
              Frequency of GPS waypoint transmissions from ESP32 when live tracking is active.
            </p>
            <select
              value={formData.trackingIntervalSeconds}
              onChange={(e) =>
                setFormData({ ...formData, trackingIntervalSeconds: Number(e.target.value) })
              }
              className="w-full p-2.5 text-sm border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value={3}>Every 3 seconds (High precision / High power)</option>
              <option value={5}>Every 5 seconds (Balanced)</option>
              <option value={10}>Every 10 seconds (Battery Saver)</option>
            </select>
          </div>

          {/* Sound Alerts & Toggles */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800 block">Caregiver Audible Siren Alert</span>
                <span className="text-slate-500 text-[11px]">Play chime alert sound when emergency button is pressed</span>
              </div>
              <input
                type="checkbox"
                checked={formData.soundAlerts}
                onChange={(e) => setFormData({ ...formData, soundAlerts: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <div>
                <span className="font-bold text-slate-800 block">Live Location Sharing Active</span>
                <span className="text-slate-500 text-[11px]">Allow authorized caregivers to view real-time movement</span>
              </div>
              <input
                type="checkbox"
                checked={formData.liveTracking}
                onChange={(e) => setFormData({ ...formData, liveTracking: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs transition"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
