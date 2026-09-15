import { Router, Request, Response } from 'express';
import { systemSettings, updateSettings } from '../store.ts';

const router = Router();

// GET /api/settings
router.get('/', (_req: Request, res: Response) => {
  return res.json(systemSettings);
});

// PUT /api/settings
router.put('/', (req: Request, res: Response) => {
  const updated = updateSettings(req.body);
  return res.json(updated);
});

export default router;
