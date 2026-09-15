import { useState } from 'react';
import {
  AlertOctagon,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  ExternalLink,
  ChevronRight,
  Battery,
  Send,
  X,
} from 'lucide-react';
import { EmergencyEvent } from '../types.ts';

interface EmergencyHistoryViewProps {
  history: EmergencyEvent[];
}

export default function EmergencyHistoryView({ history }: EmergencyHistoryViewProps) {
  const [selectedEvent, setSelectedEvent] = useState<EmergencyEvent | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
            Active Alert
          </span>
        );
      case 'resolved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Resolved
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
            <XCircle className="w-3.5 h-3.5 text-slate-500" />
            Cancelled (False Alarm)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            Failed
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900">Emergency Incident History</h3>
          <p className="text-xs text-slate-500">
            Permanent audit trail of all hardware push button alerts, GPS coordinates, and notification logs.
          </p>
        </div>
        <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full self-start sm:self-auto">
          Total: {history.length} events
        </span>
      </div>

      {history.length === 0 ? (
        <div className="bg-white rounded-2xl p-6 sm:p-8 text-center border border-slate-200">
          <p className="text-slate-500 text-sm">No emergency incidents recorded yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          {/* Mobile Cards for < sm */}
          <div className="sm:hidden divide-y divide-slate-100">
            {history.map((event) => (
              <div
                key={event.id}
                onClick={() => setSelectedEvent(event)}
                className="p-3.5 hover:bg-slate-50 cursor-pointer transition space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-900">
                    {new Date(event.timestamp).toLocaleDateString()} • {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {getStatusBadge(event.status)}
                </div>
                <div className="text-xs text-slate-700 flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{event.address}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                  <span>{event.notifiedContacts?.length || 0} Contacts Alerted</span>
                  <span className="text-blue-600 font-bold flex items-center gap-0.5">
                    Inspect <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table for >= sm */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 uppercase tracking-wider text-[11px] font-bold text-slate-500">
                <tr>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">User / Device</th>
                  <th className="py-3.5 px-4">Location / Address</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Contacts Notified</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((event) => (
                  <tr
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className="hover:bg-slate-50/80 cursor-pointer transition"
                  >
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900">
                        {new Date(event.timestamp).toLocaleDateString()}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-medium text-slate-900">{event.patientName}</div>
                      <div className="text-[10px] font-mono text-slate-500">{event.deviceId}</div>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate">
                      <div className="flex items-center gap-1.5 text-slate-800 font-medium truncate">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                        <span className="truncate">{event.address}</span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-500">
                        {event.latitude.toFixed(4)}°, {event.longitude.toFixed(4)}°
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">{getStatusBadge(event.status)}</td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-semibold text-slate-800">
                        {event.notifiedContacts?.length || 0} Contacts
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEvent(event);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition"
                      >
                        <span>Inspect</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full p-4 sm:p-6 shadow-2xl border border-slate-200 my-auto animate-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 sm:p-2.5 bg-rose-100 text-rose-600 rounded-xl flex-shrink-0">
                  <AlertOctagon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">Incident Details</h3>
                  <p className="text-xs text-slate-500 truncate max-w-[200px] sm:max-w-xs">ID: {selectedEvent.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg min-w-[36px] min-h-[36px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-slate-500">Status:</span>
                  <div className="mt-1">{getStatusBadge(selectedEvent.status)}</div>
                </div>
                <div className="text-right">
                  <span className="text-slate-500">Triggered At:</span>
                  <div className="font-bold text-slate-800 mt-1">
                    {new Date(selectedEvent.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>

              {selectedEvent.cancelledAt && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
                  <strong>Cancelled At:</strong> {new Date(selectedEvent.cancelledAt).toLocaleString()}
                  {selectedEvent.cancelReason && (
                    <div className="mt-1 text-slate-600">
                      <em>Reason:</em> {selectedEvent.cancelReason}
                    </div>
                  )}
                </div>
              )}

              {selectedEvent.resolvedAt && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900">
                  <strong>Caregiver Responded & Resolved:</strong>{' '}
                  {new Date(selectedEvent.resolvedAt).toLocaleString()}
                </div>
              )}

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-semibold block mb-1">GPS Location at Alert:</span>
                <p className="font-bold text-slate-900">{selectedEvent.address}</p>
                <p className="font-mono text-slate-600 mt-0.5">
                  {selectedEvent.latitude.toFixed(6)}° N, {selectedEvent.longitude.toFixed(6)}° W (Accuracy: ±{selectedEvent.accuracy.toFixed(1)}m)
                </p>
                <a
                  href={`https://www.google.com/maps?q=${selectedEvent.latitude.toFixed(6)},${selectedEvent.longitude.toFixed(6)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2.5 inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>View in Google Maps</span>
                </a>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-2">Notified Contacts:</h4>
                <div className="space-y-1.5">
                  {selectedEvent.notifiedContacts?.map((c, i) => (
                    <div
                      key={i}
                      className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-slate-800">{c.name}</span>
                        <span className="text-slate-500 text-[11px] block">{c.phone || c.email}</span>
                      </div>
                      <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">
                        Delivered
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
