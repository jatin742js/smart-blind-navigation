import { Router, Request, Response } from 'express';
import { notificationLog, emergencyContacts, currentUser } from '../store.ts';
import { NotificationRecord } from '../../src/types.ts';

const router = Router();

// GET /api/notifications/history
router.get('/history', (_req: Request, res: Response) => {
  return res.json({
    total: notificationLog.length,
    notifications: notificationLog,
  });
});

// POST /api/notifications/send (manual or test notification)
router.post('/send', (req: Request, res: Response) => {
  const { recipient, message, channel } = req.body;

  const testNotif: NotificationRecord = {
    id: `notif_manual_${Date.now()}`,
    emergencyEventId: 'test_dispatch',
    patientName: currentUser.blindUserPatient.name,
    contactName: recipient || 'Emergency Contact',
    recipient: recipient || 'caregiver@smartstick.org',
    type: channel || 'SMS',
    status: 'delivered',
    messageText: message || 'Test alert from Smart Blind Navigation Stick system.',
    timestamp: new Date().toISOString(),
    latitude: 37.7749,
    longitude: -122.4194,
    googleMapsUrl: 'https://www.google.com/maps?q=37.7749,-122.4194',
  };

  notificationLog.unshift(testNotif);

  return res.status(201).json({
    success: true,
    notification: testNotif,
  });
});

export default router;
