import { Router, Request, Response } from 'express';
import { currentUser } from '../store.ts';

const router = Router();

// POST /api/auth/login
router.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  // Allow standard login or caregiver credentials
  const token = `jwt_caregiver_${Buffer.from(email).toString('base64')}_${Date.now()}`;
  return res.json({
    token,
    user: currentUser,
    message: 'Caregiver authenticated successfully.',
  });
});

// POST /api/auth/register
router.post('/register', (req: Request, res: Response) => {
  const { name, email, phone, patientName } = req.body;
  if (!email || !name) {
    return res.status(400).json({ error: 'Name and email are required.' });
  }

  currentUser.name = name;
  currentUser.email = email;
  if (phone) currentUser.phone = phone;
  if (patientName) currentUser.blindUserPatient.name = patientName;

  const token = `jwt_caregiver_${Buffer.from(email).toString('base64')}_${Date.now()}`;
  return res.status(201).json({
    token,
    user: currentUser,
    message: 'Caregiver account registered successfully.',
  });
});

// POST /api/auth/logout
router.post('/logout', (_req: Request, res: Response) => {
  return res.json({ success: true, message: 'Logged out successfully.' });
});

// POST /api/auth/forgot-password
router.post('/forgot-password', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }
  return res.json({
    success: true,
    message: `Password reset link has been dispatched to ${email}.`,
  });
});

// GET /api/users/profile
router.get('/profile', (_req: Request, res: Response) => {
  return res.json(currentUser);
});

// PUT /api/users/profile
router.put('/profile', (req: Request, res: Response) => {
  const { name, phone, address, bloodGroup, medicalNotes, blindUserPatient } = req.body;
  if (name) currentUser.name = name;
  if (phone) currentUser.phone = phone;
  if (address) currentUser.address = address;
  if (bloodGroup) currentUser.bloodGroup = bloodGroup;
  if (medicalNotes) currentUser.medicalNotes = medicalNotes;
  if (blindUserPatient) {
    currentUser.blindUserPatient = {
      ...currentUser.blindUserPatient,
      ...blindUserPatient,
    };
  }
  return res.json(currentUser);
});

export default router;
