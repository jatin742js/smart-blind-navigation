import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

import authRouter from './backend/routes/auth.ts';
import contactsRouter from './backend/routes/contacts.ts';
import deviceRouter from './backend/routes/device.ts';
import emergencyRouter from './backend/routes/emergency.ts';
import locationRouter from './backend/routes/location.ts';
import notificationsRouter from './backend/routes/notifications.ts';
import simulationRouter from './backend/routes/simulation.ts';
import settingsRouter from './backend/routes/settings.ts';
import hardwareCodeRouter from './backend/routes/hardwareCode.ts';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'smart-blind-stick-portal', timestamp: new Date().toISOString() });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/users', authRouter);
  app.use('/api/contacts', contactsRouter);
  app.use('/api/device', deviceRouter);
  app.use('/api/emergency', emergencyRouter);
  app.use('/api/location', locationRouter);
  app.use('/api/notifications', notificationsRouter);
  app.use('/api/simulation', simulationRouter);
  app.use('/api/settings', settingsRouter);
  app.use('/api/hardware', hardwareCodeRouter);

  // Vite middleware for development / Static files for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Smart Stick Caregiver Emergency Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
