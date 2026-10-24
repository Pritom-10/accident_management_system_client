'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { HeartHandshake, ShieldCheck, Siren, UserPlus, Zap } from 'lucide-react';
import { API_BASE } from '../../lib/api';
import { bdLocations } from '../../lib/bdLocations';
import { useAuth } from '../../components/AuthProvider';
import AuthShell from '../../components/ui/AuthShell';
import { PasswordField, SubmitButton, fieldClass, labelClass } from '../../components/ui/kit';

const skillOptions = [
  ['first_aid', 'First aid'],
  ['driving', 'Driving'],
  ['other', 'Other'],
];
const divisions = Object.keys(bdLocations);
const byName = (a, b) => a.localeCompare(b);

function strength(p) {
  let score = 0;
  if (p.length >= 8) score += 1;
  if (p.length >= 12) score += 1;
  if (/[a-z]/.test(p) && /[A-Z]/.test(p)) score += 1;
  if (/\d/.test(p)) score += 1;
  if (/[^A-Za-z0-9]/.test(p)) score += 1;
  return score;
}

const strengthMeta = [
  ['Too short', 'bg-slate-300', 'text-slate-500'],
  ['Weak', 'bg-rose-500', 'text-rose-600'],
  ['Fair', 'bg-amber-500', 'text-amber-600'],
  ['Good', 'bg-lime-500', 'text-lime-600'],
  ['Strong', 'bg-emerald-500', 'text-emerald-600'],
  ['Very strong', 'bg-emerald-600', 'text-emerald-700'],
];

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [wantsToVolunteer, setWantsToVolunteer] = useState(false);
  const [skills, setSkills] = useState([]);
  const [division, setDivision] = useState('');
  const [district, setDistrict] = useState('');
  const [area, setArea] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const districts = division ? Object.keys(bdLocations[division]).sort(byName) : [];
  const upazilas = division && district ? [...bdLocations[division][district]].sort(byName) : [];
  const score = strength(form.password);
  const meta = strengthMeta[form.password ? score : 0];

  function toggleSkill(value) {
    setSkills(skills.includes(value) ? skills.filter((s) => s !== value) : [...skills, value]);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.email.trim() && !form.phone.trim()) {
      toast.error('Enter an email or a mobile number');
      return;
    }
    if (wantsToVolunteer && (!division || !district)) {
      toast.error('Choose your service area (division and district)');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, wantsToVolunteer, skills, serviceArea: { division, district, area } }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not create the account');

      login(data.token, data.user);
      toast.success(
        wantsToVolunteer ? 'Account created. Your volunteer application is waiting for approval.' : 'Account created. Welcome!'
      );
      router.push('/');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      icon={<UserPlus size={24} />}
      iconTone="bg-emerald-600 shadow-emerald-600/30"
      title="Create your account"
      subtitle="You never need an account to report an emergency or send an SOS."
      headline="Join the people who show up."
      points={[
        { icon: <Zap size={18} />, text: 'Free, and it takes under a minute' },
        { icon: <HeartHandshake size={18} />, text: 'Donate blood, give to campaigns, or volunteer' },
        { icon: <ShieldCheck size={18} />, text: 'Your phone number is never shown to the public' },
        { icon: <Siren size={18} />, text: 'Get alerts when someone near you needs help' },
      ]}
      footer={
        <>
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-indigo-600 hover:underline">
            Login
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="name" className={labelClass}>Full name</label>
          <input id="name" required autoComplete="name" value={form.name} onChange={update('name')} className={fieldClass} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="email" className={labelClass}>Email</label>
            <input id="email" type="email" autoComplete="email" value={form.email} onChange={update('email')} placeholder="name@email.com" className={fieldClass} />
          </div>
          <div>
            <label htmlFor="phone" className={labelClass}>Mobile number</label>
            <input id="phone" type="tel" autoComplete="tel" value={form.phone} onChange={update('phone')} placeholder="01XXXXXXXXX" className={fieldClass} />
          </div>
        </div>
        <p className="-mt-3 text-xs text-slate-500">Give at least one. You can log in with either. Password reset codes go to email.</p>

        <div>
          <label htmlFor="new-password" className={labelClass}>Password</label>
          <PasswordField id="new-password" autoComplete="new-password" minLength={8} value={form.password} onChange={update('password')} />
          <div className="mt-2.5 flex items-center gap-3">
            <div className="flex flex-1 gap-1.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <motion.span
                  key={i}
                  animate={{ opacity: form.password && i <= score ? 1 : 0.35 }}
                  className={`h-1.5 flex-1 rounded-full ${form.password && i <= score ? meta[1] : 'bg-slate-300'}`}
                />
              ))}
            </div>
            <span className={`text-xs font-medium ${meta[2]}`}>{form.password ? meta[0] : 'At least 8 characters'}</span>
          </div>
        </div>

        <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-white/70 p-4 text-sm text-slate-700 transition-colors hover:bg-white">
          <input
            type="checkbox"
            checked={wantsToVolunteer}
            onChange={(e) => setWantsToVolunteer(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-indigo-600"
          />
          <span>
            <span className="flex items-center gap-1.5 font-medium text-slate-900">
              <HeartHandshake size={16} className="text-indigo-600" /> I also want to be a volunteer
            </span>
            <span className="mt-0.5 block text-xs text-slate-600">An administrator will review your application.</span>
          </span>
        </label>

        <AnimatePresence initial={false}>
          {wantsToVolunteer && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="space-y-4 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4">
                <div>
                  <p className={labelClass}>Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {skillOptions.map(([value, text]) => (
                      <motion.button
                        key={value}
                        type="button"
                        whileTap={{ scale: 0.93 }}
                        onClick={() => toggleSkill(value)}
                        className={`rounded-full px-4 py-1.5 text-sm ${
                          skills.includes(value) ? 'bg-indigo-600 text-white' : 'border border-slate-300/70 bg-white text-slate-700'
                        }`}
                      >
                        {text}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <select value={division} onChange={(e) => { setDivision(e.target.value); setDistrict(''); setArea(''); }} className={fieldClass}>
                    <option value="">Division</option>
                    {divisions.map((d) => <option key={d}>{d}</option>)}
                  </select>
                  <select value={district} disabled={!division} onChange={(e) => { setDistrict(e.target.value); setArea(''); }} className={fieldClass}>
                    <option value="">District</option>
                    {districts.map((d) => <option key={d}>{d}</option>)}
                  </select>
                  <select value={area} disabled={!district} onChange={(e) => setArea(e.target.value)} className={fieldClass}>
                    <option value="">Upazila</option>
                    {upazilas.map((u) => <option key={u}>{u}</option>)}
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <SubmitButton loading={loading} tone="emerald" icon={<UserPlus size={16} />}>
          {loading ? 'Creating...' : 'Create account'}
        </SubmitButton>
      </form>
    </AuthShell>
  );
}