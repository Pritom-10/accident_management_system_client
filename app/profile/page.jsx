'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { UserRound, Save, Loader2, Lock, KeyRound, HeartHandshake } from 'lucide-react';
import { API_BASE, apiFetch } from '../../lib/api';
import { bdLocations } from '../../lib/bdLocations';
import { useAuth } from '../../components/AuthProvider';
import ImageUpload from '../../components/ImageUpload';

const field =
  'w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2.5 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-60';
const label = 'mb-1 block text-sm font-medium text-slate-700';
const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const divisions = Object.keys(bdLocations);
const byName = (a, b) => a.localeCompare(b);

const roleLabel = {
  user: 'Member',
  donor: 'Donor',
  volunteer: 'Volunteer',
  admin: 'Admin',
  hospital: 'Hospital',
  bloodbank: 'Blood bank',
  ngo: 'NGO',
  journalist: 'Journalist',
};

export default function ProfilePage() {
  const { user, loading, refresh } = useAuth();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });
  const [pwSaving, setPwSaving] = useState(false);


  useEffect(() => {
    if (!user) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm({
      name: user.name || '',
      photoUrl: user.photoUrl || '',
      bloodGroup: user.bloodGroup || '',
      division: user.address?.division || '',
      district: user.address?.district || '',
      area: user.address?.area || '',
      details: user.address?.details || '',
      ecName: user.emergencyContact?.name || '',
      ecPhone: user.emergencyContact?.phone || '',
    });
  }, [user]);

  if (loading) {
    return <main className="mx-auto max-w-lg px-6 py-20 text-center text-sm text-slate-600">Loading...</main>;
  }

  if (!user) {
    return (
      <main className="mx-auto max-w-lg px-6 py-20 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/70 text-slate-600">
          <Lock size={26} />
        </span>
        <h1 className="mt-4 text-2xl font-semibold text-slate-900">Please log in</h1>
        <p className="mt-2 text-sm text-slate-600">You need to log in to see your profile.</p>
        <Link href="/login" className="mt-6 inline-block rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700">
          Login
        </Link>
      </main>
    );
  }

  if (!form) return null;

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const districts = form.division ? Object.keys(bdLocations[form.division] || {}).sort(byName) : [];
  const upazilas =
    form.division && form.district ? [...(bdLocations[form.division]?.[form.district] || [])].sort(byName) : [];

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await apiFetch(`${API_BASE}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          photoUrl: form.photoUrl,
          bloodGroup: form.bloodGroup,
          address: { division: form.division, district: form.district, area: form.area, details: form.details },
          emergencyContact: { name: form.ecName, phone: form.ecPhone },
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not save the profile');

      toast.success('Profile saved');
      await refresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handlePassword(e) {
    e.preventDefault();
    setPwSaving(true);
    try {
      const res = await apiFetch(`${API_BASE}/profile/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pw),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not change the password');

      toast.success('Password changed');
      setPw({ currentPassword: '', newPassword: '' });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPwSaving(false);
    }
  }

  const volunteerStatus = user.volunteer?.status;

  return (
    <main className="mx-auto max-w-3xl px-6 py-14">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/25">
        <UserRound size={24} />
      </span>
      <h1 className="mt-4 text-3xl font-semibold text-slate-900">My profile</h1>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {user.roles.map((r) => (
          <span key={r} className="rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-slate-700">
            {roleLabel[r] || r}
          </span>
        ))}
        {volunteerStatus === 'pending' && (
          <span className="flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
            <HeartHandshake size={12} /> Volunteer application pending
          </span>
        )}
        {volunteerStatus === 'rejected' && (
          <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-medium text-rose-700">
            Volunteer application not approved
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="mt-8 space-y-5 rounded-2xl border border-white/50 bg-white/50 p-6 backdrop-blur-xl">
        <ImageUpload
          label="Profile photo (optional)"
          value={form.photoUrl}
          onChange={(url) => setForm({ ...form, photoUrl: url })}
        />

        <div>
          <label className={label}>Full name</label>
          <input required value={form.name} onChange={set('name')} className={field} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label}>Email</label>
            <input disabled value={user.email || 'Not added'} className={field} />
          </div>
          <div>
            <label className={label}>Mobile number</label>
            <input disabled value={user.phone || 'Not added'} className={field} />
          </div>
        </div>

        <div>
          <label className={label}>Blood group</label>
          <select value={form.bloodGroup} onChange={set('bloodGroup')} className={field}>
            <option value="">Not sure / prefer not to say</option>
            {bloodGroups.map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>
          <p className="mt-1 text-xs text-slate-500">This will be used to match blood requests in a coming step.</p>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-slate-900">Address</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <select
              value={form.division}
              onChange={(e) => setForm({ ...form, division: e.target.value, district: '', area: '' })}
              className={field}
            >
              <option value="">Division</option>
              {divisions.map((d) => <option key={d}>{d}</option>)}
            </select>
            <select
              value={form.district}
              disabled={!form.division}
              onChange={(e) => setForm({ ...form, district: e.target.value, area: '' })}
              className={field}
            >
              <option value="">District</option>
              {districts.map((d) => <option key={d}>{d}</option>)}
            </select>
            <select value={form.area} disabled={!form.district} onChange={set('area')} className={field}>
              <option value="">Upazila</option>
              {upazilas.map((u) => <option key={u}>{u}</option>)}
            </select>
          </div>
          <input
            value={form.details}
            onChange={set('details')}
            placeholder="House, road, village (optional)"
            className={`${field} mt-3`}
          />
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-slate-900">Emergency contact</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <input value={form.ecName} onChange={set('ecName')} placeholder="Name" className={field} />
            <input value={form.ecPhone} onChange={set('ecPhone')} placeholder="01XXXXXXXXX" className={field} />
          </div>
        </div>

        <button
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Saving...' : 'Save profile'}
        </button>
      </form>

      <form onSubmit={handlePassword} className="mt-8 space-y-4 rounded-2xl border border-white/50 bg-white/50 p-6 backdrop-blur-xl">
        <p className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <KeyRound size={18} /> Change password
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label}>Current password</label>
            <input
              required
              type="password"
              value={pw.currentPassword}
              onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })}
              className={field}
            />
          </div>
          <div>
            <label className={label}>New password</label>
            <input
              required
              type="password"
              minLength={8}
              value={pw.newPassword}
              onChange={(e) => setPw({ ...pw, newPassword: e.target.value })}
              className={field}
            />
          </div>
        </div>
        <button
          disabled={pwSaving}
          className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {pwSaving ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={16} />}
          {pwSaving ? 'Changing...' : 'Change password'}
        </button>
      </form>
    </main>
  );
}