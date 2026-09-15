import { Router, Request, Response } from 'express';
import { locationHistory, deviceStatus } from '../store.ts';

const router = Router();

// GET /api/location/history
router.get('/history', (req: Request, res: Response) => {
  const { date, limit } = req.query;

  let records = [...locationHistory];

  if (date) {
    const targetDate = String(date);
    records = records.filter((r) => r.timestamp.startsWith(targetDate));
  }

  // Sort descending by timestamp
  records.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  if (limit) {
    records = records.slice(0, Number(limit));
  }

  return res.json({
    count: records.length,
    liveTrackingEnabled: deviceStatus.liveTrackingEnabled,
    locations: records,
  });
});

// GET /api/location/current
router.get('/current', (_req: Request, res: Response) => {
  const latest = locationHistory[locationHistory.length - 1] || null;
  return res.json({
    location: latest,
    liveTrackingEnabled: deviceStatus.liveTrackingEnabled,
    gpsStatus: deviceStatus.gpsStatus,
    satellites: deviceStatus.gpsSatellites,
  });
});

// POST /api/location/toggle-live
router.post('/toggle-live', (req: Request, res: Response) => {
  const { enabled } = req.body;
  if (enabled !== undefined) {
    deviceStatus.liveTrackingEnabled = Boolean(enabled);
  } else {
    deviceStatus.liveTrackingEnabled = !deviceStatus.liveTrackingEnabled;
  }

  return res.json({
    liveTrackingEnabled: deviceStatus.liveTrackingEnabled,
    message: deviceStatus.liveTrackingEnabled
      ? 'Live location tracking is now active. Stick is broadcasting periodic GPS updates.'
      : 'Live location tracking has been paused.',
  });
});

export default router;
