import React, { useState } from 'react';
import {
  UserPlus,
  Phone,
  Mail,
  Edit2,
  Trash2,
  Shield,
  Bell,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';
import { EmergencyContact, NotificationPref, PriorityLevel } from '../types.ts';
import { addContact, updateContact, deleteContact } from '../services/api.ts';

interface EmergencyContactsCardProps {
  contacts: EmergencyContact[];
  onRefresh: () => void;
}

export default function EmergencyContactsCard({ contacts, onRefresh }: EmergencyContactsCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [pref, setPref] = useState<NotificationPref>('all');
  const [priority, setPriority] = useState<PriorityLevel>('P1 - High');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const openAddModal = () => {
    setEditingContact(null);
    setName('');
    setRelationship('Family Caregiver');
    setPhone('');
    setEmail('');
    setPref('all');
    setPriority('P1 - High');
    setError('');
    setModalOpen(true);
  };

  const openEditModal = (c: EmergencyContact) => {
    setEditingContact(c);
    setName(c.name);
    setRelationship(c.relationship);
    setPhone(c.phone);
    setEmail(c.email);
    setPref(c.notificationPreference);
    setPriority(c.priority);
    setError('');
    setModalOpen(true);
  };

  const handleDelete = async (id: string, contactName: string) => {
    if (!window.confirm(`Remove emergency contact "${contactName}"?`)) return;
    try {
      await deleteContact(id);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to delete contact');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setError('Contact Name and Phone number are required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      if (editingContact) {
        await updateContact(editingContact.id, {
          name,
          relationship,
          phone,
          email,
          notificationPreference: pref,
          priority,
        });
      } else {
        await addContact({
          name,
          relationship,
          phone,
          email,
          notificationPreference: pref,
          priority,
        });
      }
      setModalOpen(false);
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Emergency Contacts Directory</h3>
          <p className="text-xs text-slate-500">
            Contacts alerted immediately when ESP32 emergency button is triggered.
          </p>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          id="btn-add-emergency-contact"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs text-xs font-bold transition active:scale-95 self-stretch sm:self-auto min-h-[42px]"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Emergency Contact</span>
        </button>
      </div>

      {/* Contacts List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {contacts.map((contact) => (
          <div
            key={contact.id}
            className="p-3.5 sm:p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-slate-900 text-sm">{contact.name}</h4>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        contact.priority === 'P1 - High'
                          ? 'bg-rose-100 text-rose-700 border border-rose-200'
                          : contact.priority === 'P2 - Medium'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {contact.priority}
                    </span>
                  </div>
                  <p className="text-xs text-blue-600 font-medium mt-0.5">{contact.relationship}</p>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => openEditModal(contact)}
                    title="Edit Contact"
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition min-w-[32px] min-h-[32px] flex items-center justify-center"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(contact.id, contact.name)}
                    title="Delete Contact"
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition min-w-[32px] min-h-[32px] flex items-center justify-center"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <a href={`tel:${contact.phone}`} className="font-mono hover:text-blue-600 font-medium truncate">
                    {contact.phone}
                  </a>
                </div>
                {contact.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{contact.email}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <Bell className="w-3 h-3 text-slate-400" />
                Alert via: <strong className="uppercase text-slate-700">{contact.notificationPreference}</strong>
              </span>
              <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                <CheckCircle2 className="w-3 h-3" /> Active
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-4 sm:p-6 shadow-2xl border border-slate-200 my-auto animate-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                {editingContact ? 'Edit Emergency Contact' : 'Add New Emergency Contact'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg min-w-[36px] min-h-[36px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 text-rose-700 text-xs flex items-center gap-2 border border-rose-200">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Sarah Pendelton"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-sm px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Relationship</label>
                  <input
                    type="text"
                    placeholder="e.g., Daughter / Doctor / Friend"
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                    className="w-full text-sm px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                    className="w-full text-sm px-3 py-2.5 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="P1 - High">P1 - High (First Dial)</option>
                    <option value="P2 - Medium">P2 - Medium</option>
                    <option value="P3 - Low">P3 - Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-sm px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="contact@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-sm px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notification Preference</label>
                <select
                  value={pref}
                  onChange={(e) => setPref(e.target.value as NotificationPref)}
                  className="w-full text-sm px-3 py-2.5 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="all">All Channels (SMS, Push & Email)</option>
                  <option value="sms">SMS Only</option>
                  <option value="call">Automated Voice / Phone Call</option>
                  <option value="email">Email Only</option>
                  <option value="push">Caregiver App Push Notification</option>
                </select>
              </div>

              <div className="pt-2 flex flex-col-reverse sm:flex-row justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-100 rounded-xl font-medium min-h-[42px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs transition min-h-[42px]"
                >
                  {loading ? 'Saving...' : editingContact ? 'Save Changes' : 'Add Contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
