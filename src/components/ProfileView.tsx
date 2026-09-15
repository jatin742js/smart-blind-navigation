import React, { useState } from 'react';
import {
  User,
  HeartPulse,
  Phone,
  Mail,
  MapPin,
  Shield,
  Save,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { UserProfile } from '../types.ts';
import { updateUserProfile } from '../services/api.ts';

interface ProfileViewProps {
  user: UserProfile;
  onProfileUpdated: (updated: UserProfile) => void;
}

export default function ProfileView({ user, onProfileUpdated }: ProfileViewProps) {
  const [formData, setFormData] = useState<UserProfile>(user);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);
    try {
      const res = await updateUserProfile(formData);
      onProfileUpdated(res);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-lg sm:text-xl font-bold shadow-md flex-shrink-0">
            {formData.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">{formData.name}</h2>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                Primary Authorized Caregiver
              </span>
              <span className="text-xs text-slate-500 font-medium">Monitoring Stick: {formData.blindUserPatient.deviceId}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {success && (
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
              <CheckCircle2 className="w-4 h-4" /> Profile Updated
            </span>
          )}
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4 sm:space-y-6">
        {/* Section 1: Caregiver Contact Info */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            <span>Caregiver Contact Details</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Caregiver Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full text-sm px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full text-sm px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full text-sm px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Residential Address</label>
              <input
                type="text"
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full text-sm px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Blind User (Patient) Medical & Emergency Profile */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-rose-600" />
            <span>Blind User Patient Profile & Emergency Medical Information</span>
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Critical healthcare and identifying details displayed to emergency dispatchers and caregivers during an incident.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Patient Full Name</label>
              <input
                type="text"
                value={formData.blindUserPatient.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    blindUserPatient: { ...formData.blindUserPatient, name: e.target.value },
                  })
                }
                className="w-full text-sm px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Age</label>
              <input
                type="number"
                value={formData.blindUserPatient.age}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    blindUserPatient: { ...formData.blindUserPatient, age: Number(e.target.value) },
                  })
                }
                className="w-full text-sm px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Group</label>
              <select
                value={formData.blindUserPatient.bloodGroup}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    blindUserPatient: { ...formData.blindUserPatient, bloodGroup: e.target.value },
                  })
                }
                className="w-full text-sm px-3.5 py-2.5 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="O+">O Positive (O+)</option>
                <option value="O-">O Negative (O-)</option>
                <option value="A+">A Positive (A+)</option>
                <option value="A-">A Negative (A-)</option>
                <option value="B+">B Positive (B+)</option>
                <option value="B-">B Negative (B-)</option>
                <option value="AB+">AB Positive (AB+)</option>
                <option value="AB-">AB Negative (AB-)</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Known Allergies (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g., Penicillin, Latex, Aspirin"
                value={formData.blindUserPatient.allergies}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    blindUserPatient: { ...formData.blindUserPatient, allergies: e.target.value },
                  })
                }
                className="w-full text-sm px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Emergency Medical Notes & Conditions
              </label>
              <textarea
                rows={3}
                placeholder="Severe visual impairment (Glaucoma, Retinal degeneration). Carries nitroglycerin..."
                value={formData.blindUserPatient.medicalNotes}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    blindUserPatient: { ...formData.blindUserPatient, medicalNotes: e.target.value },
                  })
                }
                className="w-full text-sm px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-md transition active:scale-95 text-sm min-h-[44px]"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Profile...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
