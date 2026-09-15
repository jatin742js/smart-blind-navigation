import { Router, Request, Response } from 'express';
import { emergencyContacts, currentUser } from '../store.ts';
import { EmergencyContact } from '../../src/types.ts';

const router = Router();

// GET /api/contacts
router.get('/', (_req: Request, res: Response) => {
  return res.json(emergencyContacts);
});

// POST /api/contacts
router.post('/', (req: Request, res: Response) => {
  const { name, relationship, phone, email, notificationPreference, priority } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ error: 'Contact name and phone number are required.' });
  }

  const newContact: EmergencyContact = {
    id: `ct_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId: currentUser.id,
    name,
    relationship: relationship || 'Emergency Contact',
    phone,
    email: email || '',
    notificationPreference: notificationPreference || 'all',
    priority: priority || 'P2 - Medium',
    active: true,
    createdAt: new Date().toISOString(),
  };

  emergencyContacts.push(newContact);
  return res.status(201).json(newContact);
});

// PUT /api/contacts/:id
router.put('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = emergencyContacts.findIndex((c) => c.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Contact not found.' });
  }

  const updated: EmergencyContact = {
    ...emergencyContacts[index],
    ...req.body,
    id, // protect id
  };
  emergencyContacts[index] = updated;
  return res.json(updated);
});

// DELETE /api/contacts/:id
router.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = emergencyContacts.findIndex((c) => c.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Contact not found.' });
  }

  const removed = emergencyContacts.splice(index, 1)[0];
  return res.json({ success: true, removedContact: removed });
});

export default router;
