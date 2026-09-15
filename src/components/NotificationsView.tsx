import { useState } from 'react';
import {
  Bell,
  Send,
  CheckCircle2,
  Clock,
  MapPin,
  ExternalLink,
  MessageSquare,
  Mail,
  Smartphone,
} from 'lucide-react';
import { NotificationRecord } from '../types.ts';

interface NotificationsViewProps {
  notifications: NotificationRecord[];
}

export default function NotificationsView({ notifications }: NotificationsViewProps) {
  const [selectedNotif, setSelectedNotif] = useState<NotificationRecord | null>(null);

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'SMS':
        return <MessageSquare className="w-4 h-4 text-emerald-600" />;
      case 'EMAIL':
        return <Mail className="w-4 h-4 text-blue-600" />;
      case 'PUSH':
        return <Smartphone className="w-4 h-4 text-violet-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900">Emergency Outbound Notifications</h3>
          <p className="text-xs text-slate-500">
            Audit log of SMS, Email, and Push alerts dispatched to registered emergency contacts.
          </p>
        </div>
        <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full self-start sm:self-auto">
          {notifications.length} dispatched
        </span>
      </div>

      <div className="space-y-3">
        {notifications.map((n) => (
          <div
            key={n.id}
            className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200 shadow-sm hover:border-slate-300 transition"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 rounded-xl bg-slate-100 flex-shrink-0">{getChannelIcon(n.type)}</div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      {n.type} ALERT
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs font-bold text-slate-800 truncate">To: {n.contactName}</span>
                  </div>
                  <span className="text-xs text-slate-500 font-mono truncate block">{n.recipient}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs self-start sm:self-auto flex-shrink-0">
                <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{n.status.toUpperCase()}</span>
                </span>
                <span className="text-slate-400 font-mono text-[11px] sm:text-xs">
                  {new Date(n.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>

            {/* Render formatted alert text block */}
            <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80 font-mono text-xs text-slate-700 whitespace-pre-wrap leading-relaxed break-words">
              {n.messageText}
            </div>

            <div className="mt-3 flex flex-col xs:flex-row xs:items-center justify-between gap-2 text-xs text-slate-500">
              <span className="font-mono text-[11px] truncate">Event Ref: {n.emergencyEventId}</span>
              {n.googleMapsUrl && (
                <a
                  href={n.googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold self-start xs:self-auto"
                >
                  <span>Google Maps Coordinates</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
