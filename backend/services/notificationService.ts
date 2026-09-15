import { EmergencyContact, EmergencyEvent, NotificationRecord } from '../../src/types.ts';
import { addNotification } from '../store.ts';

export async function dispatchEmergencyNotifications(
  event: EmergencyEvent,
  contacts: EmergencyContact[]
): Promise<NotificationRecord[]> {
  const googleMapsUrl = `https://www.google.com/maps?q=${event.latitude.toFixed(6)},${event.longitude.toFixed(6)}`;
  const dateFormatted = new Date(event.timestamp).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'medium',
  });

  const alertMessage = 
`🚨 EMERGENCY ALERT

${event.patientName} may need immediate assistance.

Current Location:
${googleMapsUrl} (${event.address || 'GPS Coordinates'})

Time:
${dateFormatted}

Please contact the user immediately.`;

  const dispatchedRecords: NotificationRecord[] = [];

  for (const contact of contacts.filter((c) => c.active)) {
    // Determine channel types based on contact preference
    const channels: ('SMS' | 'EMAIL' | 'PUSH')[] = [];
    if (contact.notificationPreference === 'all') {
      channels.push('SMS', 'EMAIL', 'PUSH');
    } else if (contact.notificationPreference === 'sms') {
      channels.push('SMS');
    } else if (contact.notificationPreference === 'email') {
      channels.push('EMAIL');
    } else if (contact.notificationPreference === 'call') {
      channels.push('SMS', 'PUSH'); // Automated voice / SMS alert fallback
    } else {
      channels.push('PUSH');
    }

    for (const channel of channels) {
      const recipient = channel === 'EMAIL' ? contact.email : contact.phone;
      const notification: NotificationRecord = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        emergencyEventId: event.id,
        patientName: event.patientName,
        contactName: contact.name,
        recipient,
        type: channel,
        status: 'delivered', // simulated delivery confirmed
        messageText: alertMessage,
        timestamp: new Date().toISOString(),
        latitude: event.latitude,
        longitude: event.longitude,
        googleMapsUrl,
      };

      addNotification(notification);
      dispatchedRecords.push(notification);
    }
  }

  return dispatchedRecords;
}
