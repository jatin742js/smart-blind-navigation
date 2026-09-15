import { useState, useEffect } from 'react';
import {
  AlertTriangle,
  MapPin,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  Radio,
  Send,
  Volume2,
  VolumeX,
  Battery,
} from 'lucide-react';
import { EmergencyEvent } from '../types.ts';
import { cancelEmergency, resolveEmergency } from '../services/api.ts';
import { playEmergencyChime, startRepeatingEmergencySiren, stopEmergencySiren } from '../utils/audioAlert.ts';

interface EmergencyAlertModalProps {
  emergency: EmergencyEvent;
  onEmergencyUpdated: () => void;
  soundAlertsEnabled?: boolean;
}

export default function EmergencyAlertModal({
  emergency,
  onEmergencyUpdated,
  soundAlertsEnabled = true,
}: EmergencyAlertModalProps) {
  const [secondsRemaining, setSecondsRemaining] = useState(emergency.countdownSecondsRemaining || 30);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Accidental button press - User confirmed safe');

  // Siren alert
  useEffect(() => {
    if (soundAlertsEnabled && !isMuted) {
      startRepeatingEmergencySiren();
    }
    return () => {
      stopEmergencySiren();
    };
  }, [soundAlertsEnabled, isMuted]);

  // Countdown timer
  useEffect(() => {
    if (secondsRemaining <= 0) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsRemaining]);

  const handleToggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      playEmergencyChime();
    } else {
      setIsMuted(true);
      stopEmergencySiren();
    }
  };

  const handleConfirmCancel = async () => {
    setIsCancelling(true);
    stopEmergencySiren();
    try {
      await cancelEmergency(cancelReason);
      onEmergencyUpdated();
    } catch (err) {
      console.error(err);
    } finally {
      setIsCancelling(false);
      setCancelModalOpen(false);
    }
  };

  const handleResolve = async () => {
    setIsResolving(true);
    stopEmergencySiren();
    try {
      await resolveEmergency();
      onEmergencyUpdated();
    } catch (err) {
      console.error(err);
    } finally {
      setIsResolving(false);
    }
  };

  const googleMapsUrl = `https://www.google.com/maps?q=${emergency.latitude.toFixed(6)},${emergency.longitude.toFixed(6)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border-2 sm:border-4 border-rose-600 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200 max-h-[95vh] flex flex-col">
        {/* Urgent Header */}
        <div className="bg-rose-600 text-white p-4 sm:p-6 flex-shrink-0">
          <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 sm:p-3 bg-white/20 rounded-2xl animate-bounce flex-shrink-0">
                <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-full inline-block">
                  HARDWARE PUSH BUTTON PRESSED
                </span>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black mt-1">🚨 EMERGENCY ALERT</h2>
              </div>
            </div>

            {/* Mute Siren Button */}
            <button
              onClick={handleToggleMute}
              className="self-start xs:self-auto p-2 sm:p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition text-xs flex items-center gap-1.5 min-h-[36px]"
              title={isMuted ? 'Unmute Siren' : 'Mute Siren'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-rose-200" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-white animate-pulse" />}
              <span>{isMuted ? 'Muted' : 'Siren On'}</span>
            </button>
          </div>

          <p className="mt-2.5 sm:mt-3 text-rose-100 font-medium text-xs sm:text-sm md:text-base leading-relaxed">
            <strong className="text-white font-bold">{emergency.patientName}</strong> has triggered the physical emergency button on Smart Stick ({emergency.deviceId}). Immediate caregiver response required.
          </p>
        </div>

        {/* Cancellation Countdown Bar (if within timer window) */}
        {secondsRemaining > 0 && (
          <div className="bg-rose-50 border-b border-rose-200 px-4 sm:px-5 py-2.5 sm:py-3 flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2 text-xs sm:text-sm flex-shrink-0">
            <div className="flex items-center gap-2 text-rose-900 font-medium">
              <Clock className="w-4 h-4 text-rose-600 animate-spin flex-shrink-0" />
              <span>
                Cancellation grace window:{' '}
                <strong className="font-bold text-rose-700 font-mono text-sm sm:text-base">{secondsRemaining}s</strong> remaining
              </span>
            </div>
            <button
              onClick={() => setCancelModalOpen(true)}
              className="self-end xs:self-auto px-3 py-1.5 bg-white hover:bg-rose-100 text-rose-700 font-bold border border-rose-300 rounded-lg shadow-xs transition text-xs min-h-[36px]"
            >
              Cancel False Alarm
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
          {/* Location & Navigation Card */}
          <div className="bg-slate-50 rounded-2xl p-3.5 sm:p-4 border border-slate-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5 sm:gap-3">
                <div className="p-2 bg-rose-100 text-rose-600 rounded-xl mt-0.5 flex-shrink-0">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Current GPS Location</h4>
                  <p className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">{emergency.address}</p>
                  <p className="text-[11px] sm:text-xs font-mono text-slate-600 mt-0.5">
                    Coordinates: {emergency.latitude.toFixed(6)}°, {emergency.longitude.toFixed(6)}° (±{emergency.accuracy.toFixed(1)}m)
                  </p>
                </div>
              </div>

              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md text-xs font-bold transition flex-shrink-0 active:scale-95 min-h-[44px]"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open Google Maps</span>
              </a>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-200/80 flex flex-wrap gap-4 text-xs text-slate-600">
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Alert Triggered: <strong>{new Date(emergency.timestamp).toLocaleTimeString()}</strong></span>
              </div>
              <div className="flex items-center gap-1">
                <Battery className="w-3.5 h-3.5 text-slate-400" />
                <span>Stick Battery: <strong className="text-slate-800">{emergency.battery}%</strong></span>
              </div>
            </div>
          </div>

          {/* Standard Emergency Notification Message Block */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-3.5 sm:p-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-900 mb-2">
              <Send className="w-4 h-4 text-amber-600" />
              <span>Broadcast Notification Dispatched</span>
            </div>
            <pre className="font-mono text-[11px] sm:text-xs text-slate-800 bg-white p-3 rounded-xl border border-amber-200 whitespace-pre-wrap leading-relaxed select-all overflow-x-auto">
{`🚨 EMERGENCY ALERT

${emergency.patientName} may need immediate assistance.

Current Location:
${googleMapsUrl}

Time:
${new Date(emergency.timestamp).toLocaleString()}

Please contact the user immediately.`}
            </pre>
          </div>

          {/* Contacts Notified Grid */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
              Contacts Notified ({emergency.notifiedContacts?.length || 0})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
              {emergency.notifiedContacts?.map((c, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <p className="font-bold text-slate-800">{c.name}</p>
                    <p className="text-slate-500 text-[11px]">{c.phone || c.email}</p>
                  </div>
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Delivered</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-100 p-3.5 sm:p-5 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={() => setCancelModalOpen(true)}
            className="w-full sm:w-auto px-4 py-2.5 border border-slate-300 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold transition min-h-[44px] flex items-center justify-center"
          >
            Cancel Alert (False Alarm)
          </button>

          <div className="flex flex-col xs:flex-row items-center gap-2 w-full sm:w-auto">
            <a
              href={`tel:+15552345678`}
              className="w-full xs:w-auto flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition min-h-[44px]"
            >
              <Phone className="w-4 h-4" />
              <span>Call Blind User</span>
            </a>
            <button
              type="button"
              onClick={handleResolve}
              disabled={isResolving}
              className="w-full xs:w-auto flex-1 flex items-center justify-center gap-1.5 px-5 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition min-h-[44px]"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{isResolving ? 'Resolving...' : 'Mark as Responded'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog for Cancellation */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-amber-600 mb-3">
              <XCircle className="w-6 h-6" />
              <h3 className="text-lg font-bold text-slate-900">Cancel Emergency Alert?</h3>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              Are you sure you want to cancel this emergency alert? This will stop further notification cycles and log the cancellation in emergency history.
            </p>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for cancellation:</label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="Accidental button press - User confirmed safe">Accidental button press - User confirmed safe</option>
                <option value="Testing & demonstration mode">Testing & demonstration mode</option>
                <option value="User found and safe with caregiver">User found and safe with caregiver</option>
                <option value="Other verified safe condition">Other verified safe condition</option>
              </select>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Keep Alert Active
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={isCancelling}
                className="px-4 py-2 text-sm bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold shadow-xs"
              >
                {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
