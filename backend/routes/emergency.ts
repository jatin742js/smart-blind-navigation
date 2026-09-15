import { Router, Request, Response } from 'express';
import { emergencyEvents, activeEmergency } from '../store.ts';

const router = Router();

// GET /api/emergency/history
router.get('/history', (_req: Request, res: Response) => {
  return res.json({
    activeEmergency,
    history: emergencyEvents,
  });
});

// GET /api/emergency/active
router.get('/active', (_req: Request, res: Response) => {
  return res.json({
    activeEmergency,
  });
});

export default router;
