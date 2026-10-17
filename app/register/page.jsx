'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { UserPlus, Loader2, HeartHandshake } from 'lucide-react';
import { API_BASE } from '../../lib/api';
import { bdLocations } from '../../lib/bdLocations';
import { useAuth } from '../../components/AuthProvider';

const field = 'w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2.5 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-60';
const label = 'mb-1 block text-sm font-medium text-slate-700';
const skillOptions = [
  ['first_aid', 'First aid'],
  ['driving', 'Driving'],
  ['other', 'Other'],
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

  const divisions = Object.keys(bdLocations);
  const districts = division ? Object.keys(bdLocations[division]).sort((a, b) => a.localeCompare(b)) : [];
  const upazilas = division && district ? [...bdLocations[division][district]].sort((a, b) => a.localeCompare(b)) : [];

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
        body: JSON.stringify({
          ...form,
          wantsToVolunteer,
          skills,
          serviceArea: { division, district, area },
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not create the account');

      login(data.token, data.user);
      toast.success(
        wantsToVolunteer
          ? 'Account created. Your volunteer application is waiting for approval.'
          : 'Account created. Welcome!'
      );
      router.push('/');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-xl px-6 py-14">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/25">
        <UserPlus size={24} />
      </span>
      <h1 className="mt-4 text-3xl font-semibold text-slate-900">Create an account</h1>
      <p className="mt-2 text-sm text-slate-600">
        You do not need an account to report an emergency. An account is for donating, requesting blood and volunteering.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-2xl border border-white/50 bg-white/50 p-6 backdrop-blur-xl">
        <div>
          <label className={label}>Full name</label>
          <input required value={form.name} onChange={update('name')} className={field} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label}>Email</label>
            <input type="email" value={form.email} onChange={update('email')} placeholder="name@email.com" className={field} />
          </div>
          <div>
            <label className={label}>Mobile number</label>
            <input type="tel" value={form.phone} onChange={update('phone')} placeholder="01XXXXXXXXX" className={field} />
          </div>
        </div>
        <p className="-mt-2 text-xs text-slate-500">Give at least one of the two. You can log in with either.</p>

        <div>
          <label className={label}>Password</label>
          <input required type="password" minLength={8} value={form.password} onChange={update('password')} className={field} />
          <p className="mt-1 text-xs text-slate-500">At least 8 characters.</p>
        </div>

        <label className="flex items-start gap-3 rounded-xl bg-white/70 p-4 text-sm text-slate-700">
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

        {wantsToVolunteer && (
          <div className="space-y-4 rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
            <div>
              <p className={label}>Skills</p>
              <div className="flex flex-wrap gap-2">
                {skillOptions.map(([value, text]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggleSkill(value)}
                    className={`rounded-full px-4 py-1.5 text-sm ${
                      skills.includes(value)
                        ? 'bg-indigo-600 text-white'
                        : 'border border-slate-300/70 bg-white text-slate-700'
                    }`}
                  >
                    {text}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className={label}>Division</label>
                <select
                  value={division}
                  onChange={(e) => { setDivision(e.target.value); setDistrict(''); setArea(''); }}
                  className={field}
                >
                  <option value="">Select</option>
                  {divisions.map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className={label}>District</label>
                <select
                  value={district}
                  disabled={!division}
                  onChange={(e) => { setDistrict(e.target.value); setArea(''); }}
                  className={field}
                >
                  <option value="">Select</option>
                  {districts.map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className={label}>Upazila</label>
                <select value={area} disabled={!district} onChange={(e) => setArea(e.target.value)} className={field}>
                  <option value="">Select</option>
                  {upazilas.map((u) => <option key={u}>{u}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        <button
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
          {loading ? 'Creating...' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-indigo-600 hover:underline">
          Login
        </Link>
      </p>
    </main>
  );
}