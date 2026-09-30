import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { User, Mail, Phone, HeartPulse, CreditCard, Shield, Save, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function ProfileView() {
  const { user, profile, updateProfile, openAuthModal } = useApp();

  const [formData, setFormData] = useState({
    name: profile?.name || '',
    email: profile?.email || user?.email || '',
    phone: profile?.phone || '',
    emergency_contact: profile?.emergency_contact || '',
    blood_group: profile?.blood_group || 'O+ Positive',
    preferred_card: profile?.preferred_card || 'Ayushman Bharat (PM-JAY)',
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        email: profile.email || user?.email || '',
        phone: profile.phone || '',
        emergency_contact: profile.emergency_contact || '',
        blood_group: profile.blood_group || 'O+ Positive',
        preferred_card: profile.preferred_card || 'Ayushman Bharat (PM-JAY)',
      });
    }
  }, [profile, user]);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      await updateProfile(formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save changes to profile.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-red-950 p-8 text-white relative">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-red-600/30 ring-2 ring-red-400 text-3xl font-extrabold text-white">
              {formData.name ? formData.name.charAt(0).toUpperCase() : 'P'}
            </div>
            <div className="text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-red-500/20 px-3 py-1 text-xs font-semibold text-red-300 ring-1 ring-red-500/30 mb-2">
                <Shield className="h-3.5 w-3.5" />
                Verified Patient Emergency Profile
              </div>
              <h1 className="text-2xl font-bold">{formData.name || 'Patient Profile'}</h1>
              <p className="text-xs text-slate-300 mt-1">
                {formData.email || 'guest@emergencycare.app'} • Synced with Supabase Cloud
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-10">
          {!user && (
            <div className="mb-6 flex items-center justify-between rounded-2xl bg-amber-50 border border-amber-200 p-4 text-xs text-amber-900">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                <span>You are currently in Guest Mode. Sign in with Supabase to permanently link your medical history.</span>
              </div>
              <button
                onClick={() => openAuthModal('signin')}
                className="font-bold underline text-amber-800 hover:text-amber-950 shrink-0 ml-2"
              >
                Sign In Now
              </button>
            </div>
          )}

          {success && (
            <div className="mb-6 flex items-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-medium text-emerald-800 animate-fade-in">
              <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Profile details successfully updated and saved to Supabase!</span>
            </div>
          )}

          {error && (
            <div className="mb-6 flex items-center gap-2 rounded-2xl bg-red-50 border border-red-200 p-4 text-xs text-red-800">
              <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-red-500" />
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-red-500" />
                  Email Address
                </label>
                <input
                  type="email"
                  disabled={!!user}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 disabled:opacity-75 focus:outline-none"
                />
                {user && <span className="text-[10px] text-slate-400 mt-1 block">Linked to Supabase Auth</span>}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-red-500" />
                  Primary Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-red-500" />
                  Emergency Contact (Next of Kin)
                </label>
                <input
                  type="tel"
                  required
                  value={formData.emergency_contact}
                  onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                  placeholder="+91 98765 00000"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
                  <HeartPulse className="h-3.5 w-3.5 text-red-500" />
                  Blood Group
                </label>
                <select
                  value={formData.blood_group}
                  onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                >
                  <option>O+ Positive</option>
                  <option>O- Negative</option>
                  <option>A+ Positive</option>
                  <option>A- Negative</option>
                  <option>B+ Positive</option>
                  <option>B- Negative</option>
                  <option>AB+ Positive</option>
                  <option>AB- Negative</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
                  <CreditCard className="h-3.5 w-3.5 text-red-500" />
                  Preferred Health Card / Insurance Scheme
                </label>
                <select
                  value={formData.preferred_card}
                  onChange={(e) => setFormData({ ...formData, preferred_card: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                >
                  <option>Ayushman Bharat (PM-JAY)</option>
                  <option>CGHS (Central Govt Health Scheme)</option>
                  <option>Star Health Allied Insurance</option>
                  <option>HDFC ERGO Health Suraksha</option>
                  <option>ECHS (Armed Forces)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-red-500/25 hover:brightness-105 transition-all disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Profile Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
