'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Bell, CheckCircle2, Circle, Droplet, HeartHandshake, KeyRound, Lock, Save, UserRound } from 'lucide-react';
import { API_BASE, apiFetch } from '../../lib/api';
import { bdLocations } from '../../lib/bdLocations';
import { imageSrc } from '../../lib/imageUrl';
import { useAuth } from '../../components/AuthProvider';
import ImageUpload from '../../components/ImageUpload';
import { GroupPicker } from '../../components/blood/ui';
import { PasswordField, SectionCard, SubmitButton, fieldClass, glass, labelClass } from '../../components/ui/kit';

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

  const checklist = useMemo(() => {
    if (!user) return [];
    return [
      ['Profile photo', Boolean(user.photoUrl)],
      ['Blood group', Boolean(user.bloodGroup)],
      ['Home district', Boolean(user.address?.district)],
      ['Emergency contact', Boolean(user.emergencyContact?.phone)],
      ['Email', Boolean(user.email)],
      ['Mobile number', Boolean(user.phone)],
    ];
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
        <Link href="/login" className="mt-6 inline-block rounded-full bg-indigo-600 px-6 py-3 text-sm font-medium text-white hover:bg-indigo-700">
          Login
        </Link>
      </main>
    );
  }

  if (!form) return null;

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const districts = form.division ? Object.keys(bdLocations[form.division] || {}).sort(byName) : [];
  const upazilas = form.division && form.district ? [...(bdLocations[form.division]?.[form.district] || [])].sort(byName) : [];
  const done = checklist.filter(([, ok]) => ok).length;
  const pct = Math.round((done / checklist.length) * 100);
  const initials = user.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  const volunteerStatus = user.volunteer?.status;

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

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 md:py-12">
      <motion.section
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-[2rem] border border-white/60 p-7 shadow-xl shadow-slate-900/5 md:p-10"
        style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.16), rgba(244,114,182,0.14))' }}
      >
        <motion.span
          className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full bg-indigo-400/40 blur-3xl"
          animate={{ x: [0, -30, 0], y: [0, 24, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="relative flex flex-wrap items-center gap-6">
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 240, damping: 18, delay: 0.1 }}
            className="rounded-full p-1"
            style={{ background: 'linear-gradient(135deg, #F43F5E, #4F46E5)' }}
          >
            {user.photoUrl ? (
              <img src={imageSrc(user.photoUrl)} alt="" className="h-24 w-24 rounded-full border-4 border-white object-cover" />
            ) : (
              <span className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-white text-2xl font-semibold text-indigo-600">
                {initials}
              </span>
            )}
          </motion.div>

          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-semibold text-slate-900">{user.name}</h1>
            <p className="mt-1 text-sm text-slate-600">{[user.email, user.phone].filter(Boolean).join(' · ')}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {user.roles.map((r) => (
                <span key={r} className="rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-slate-700">{roleLabel[r] || r}</span>
              ))}
              {volunteerStatus === 'pending' && (
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">Volunteer application pending</span>
              )}
              {volunteerStatus === 'rejected' && (
                <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-medium text-rose-700">Volunteer application not approved</span>
              )}
            </div>
          </div>
        </div>

        <div className="relative mt-8">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-700">Profile {pct}% complete</span>
            <span className="text-slate-500">{done} of {checklist.length}</span>
          </div>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/70">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-rose-500 to-indigo-500"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {checklist.map(([label, ok]) => (
              <span key={label} className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs ${ok ? 'bg-emerald-100 text-emerald-700' : 'bg-white/70 text-slate-500'}`}>
                {ok ? <CheckCircle2 size={13} /> : <Circle size={13} />} {label}
              </span>
            ))}
          </div>
        </div>
      </motion.section>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {[
          [Droplet, user.donor?.isDonor ? 'Donor profile' : 'Become a donor', '/blood/donor', 'bg-rose-100 text-rose-600'],
          [HeartHandshake, 'Campaigns and donations', '/donate/mine', 'bg-emerald-100 text-emerald-600'],
          [Bell, 'Alert settings', '/notifications', 'bg-violet-100 text-violet-600'],
        ].map(([Icon, text, href, tone], i) => (
          <motion.div key={href} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.07 }}>
            <Link href={href} className={`${glass} flex items-center gap-3 p-4 transition-all hover:-translate-y-1 hover:shadow-xl`}>
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}><Icon size={18} /></span>
              <span className="text-sm font-medium text-slate-900">{text}</span>
            </Link>
          </motion.div>
        ))}
      </div>

      <form onSubmit={handleSave} className="mt-6 space-y-5">
        <SectionCard step="1" title="About you">
          <ImageUpload label="Profile photo (optional)" value={form.photoUrl} onChange={(url) => setForm({ ...form, photoUrl: url })} />
          <div>
            <label htmlFor="p-name" className={labelClass}>Full name</label>
            <input id="p-name" required value={form.name} onChange={set('name')} className={fieldClass} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Email</label>
              <input disabled value={user.email || 'Not added'} className={fieldClass} />
            </div>
            <div>
              <label className={labelClass}>Mobile number</label>
              <input disabled value={user.phone || 'Not added'} className={fieldClass} />
            </div>
          </div>
        </SectionCard>

        <SectionCard step="2" title="Blood group" hint="Used to match blood requests. You can leave it empty.">
          <GroupPicker value={form.bloodGroup} onChange={(g) => setForm({ ...form, bloodGroup: g })} id="profile-blood" />
          {form.bloodGroup && (
            <button type="button" onClick={() => setForm({ ...form, bloodGroup: '' })} className="text-xs font-medium text-slate-500 hover:text-slate-900">
              Clear blood group
            </button>
          )}
        </SectionCard>

        <SectionCard step="3" title="Where you live">
          <div className="grid gap-3 sm:grid-cols-3">
            <select value={form.division} onChange={(e) => setForm({ ...form, division: e.target.value, district: '', area: '' })} className={fieldClass}>
              <option value="">Division</option>
              {divisions.map((d) => <option key={d}>{d}</option>)}
            </select>
            <select value={form.district} disabled={!form.division} onChange={(e) => setForm({ ...form, district: e.target.value, area: '' })} className={fieldClass}>
              <option value="">District</option>
              {districts.map((d) => <option key={d}>{d}</option>)}
            </select>
            <select value={form.area} disabled={!form.district} onChange={set('area')} className={fieldClass}>
              <option value="">Upazila</option>
              {upazilas.map((u) => <option key={u}>{u}</option>)}
            </select>
          </div>
          <input value={form.details} onChange={set('details')} placeholder="House, road, village (optional)" className={fieldClass} />
        </SectionCard>

        <SectionCard step="4" title="Emergency contact" hint="Someone we can tell if you need help.">
          <div className="grid gap-3 sm:grid-cols-2">
            <input value={form.ecName} onChange={set('ecName')} placeholder="Name" className={fieldClass} />
            <input value={form.ecPhone} onChange={set('ecPhone')} placeholder="01XXXXXXXXX" className={fieldClass} />
          </div>
        </SectionCard>

        <SubmitButton loading={saving} icon={<Save size={16} />}>
          {saving ? 'Saving...' : 'Save profile'}
        </SubmitButton>
      </form>

      <form onSubmit={handlePassword} className="mt-8">
        <SectionCard title="Change password">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="cur-pw" className={labelClass}>Current password</label>
              <PasswordField id="cur-pw" autoComplete="current-password" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} />
            </div>
            <div>
              <label htmlFor="new-pw" className={labelClass}>New password</label>
              <PasswordField id="new-pw" autoComplete="new-password" minLength={8} value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} />
            </div>
          </div>
          <SubmitButton loading={pwSaving} tone="slate" icon={<KeyRound size={16} />} className="sm:w-fit sm:px-8">
            {pwSaving ? 'Changing...' : 'Change password'}
          </SubmitButton>
        </SectionCard>
      </form>
    </main>
  );
}