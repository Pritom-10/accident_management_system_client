'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { CheckCircle2, Circle, Droplet, HeartPulse, Loader2, Save, XCircle } from 'lucide-react';
import RoleGate from '../../../components/RoleGate';
import { useAuth } from '../../../components/AuthProvider';
import { GroupPicker } from '../../../components/blood/ui';
import { API_BASE, apiFetch } from '../../../lib/api';
import { bdLocations } from '../../../lib/bdLocations';
import { checkEligibility, dateText } from '../../../lib/blood';

const field =
  'w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2.5 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-60';
const label = 'mb-1 block text-sm font-medium text-slate-700';
const cardClass = 'rounded-2xl border border-white/50 bg-white/50 p-6 shadow-md shadow-slate-900/5 backdrop-blur-xl';
const divisions = Object.keys(bdLocations);
const byName = (a, b) => a.localeCompare(b);
const isoDate = (v) => (v ? new Date(v).toISOString().slice(0, 10) : '');

const R = 44;
const C = 2 * Math.PI * R;

function EligibilityCard({ result }) {
  const passed = result.checks.filter((c) => c.state === 'ok').length;
  const color = result.eligible ? '#059669' : passed > 0 ? '#F59E0B' : '#94A3B8';

  return (
    <div className={cardClass}>
      <p className="text-sm font-semibold text-slate-900">Can you donate?</p>

      <div className="mt-4 flex items-center gap-5">
        <div className="relative h-28 w-28 shrink-0">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
            <circle cx="50" cy="50" r={R} fill="none" stroke="#E2E8F0" strokeWidth="9" />
            <motion.circle
              cx="50"
              cy="50"
              r={R}
              fill="none"
              stroke={color}
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={C}
              initial={{ strokeDashoffset: C }}
              animate={{ strokeDashoffset: C * (1 - passed / result.checks.length), stroke: color }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="mono text-xl text-slate-900">{passed}/{result.checks.length}</span>
            <span className="text-[10px] text-slate-500">checks</span>
          </div>
        </div>

        <div>
          <motion.p
            key={result.eligible ? 'yes' : 'no'}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-lg font-semibold ${result.eligible ? 'text-emerald-600' : 'text-slate-700'}`}
          >
            {result.eligible ? 'You can donate' : 'Not yet'}
          </motion.p>
          {result.nextEligibleDate && (
            <p className="mt-0.5 text-xs text-slate-600">Next time: {dateText(result.nextEligibleDate)}</p>
          )}
        </div>
      </div>

      <ul className="mt-4 space-y-2">
        {result.checks.map((c) => (
          <motion.li
            key={c.key}
            layout
            className="flex items-start gap-2 text-sm text-slate-700"
          >
            {c.state === 'ok' ? (
              <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" />
            ) : c.state === 'fail' ? (
              <XCircle size={16} className="mt-0.5 shrink-0 text-rose-500" />
            ) : (
              <Circle size={16} className="mt-0.5 shrink-0 text-slate-300" />
            )}
            {c.text}
          </motion.li>
        ))}
      </ul>

      <p className="mt-4 text-xs text-slate-500">
        This is a general guide. The hospital or blood bank makes the final decision after checking you.
      </p>
    </div>
  );
}

function DonorForm() {
  const { user, refresh } = useAuth();
  const d = user.donor || {};
  const alreadyDonor = Boolean(d.isDonor);

  const [group, setGroup] = useState(user.bloodGroup || '');
  const [f, setF] = useState({
    dateOfBirth: isoDate(d.dateOfBirth),
    weightKg: d.weightKg ? String(d.weightKg) : '',
    lastDonationDate: isoDate(d.lastDonationDate),
    division: user.address?.division || '',
    district: user.address?.district || '',
    area: user.address?.area || '',
    contactPhone: d.contactPhone || user.phone || '',
    emailAlerts: d.emailAlerts !== false,
    showContact: d.showContact === true,
  });
  const [saving, setSaving] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const districts = f.division ? Object.keys(bdLocations[f.division] || {}).sort(byName) : [];
  const upazilas = f.division && f.district ? [...(bdLocations[f.division]?.[f.district] || [])].sort(byName) : [];

  const result = useMemo(
    () => checkEligibility({ dateOfBirth: f.dateOfBirth, weightKg: f.weightKg, lastDonationDate: f.lastDonationDate }),
    [f.dateOfBirth, f.weightKg, f.lastDonationDate]
  );

  async function save(e) {
    e.preventDefault();
    if (!group) {
      toast.error('Choose your blood group');
      return;
    }

    setSaving(true);
    try {
      const res = await apiFetch(`${API_BASE}/blood/donor`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bloodGroup: group,
          dateOfBirth: f.dateOfBirth,
          weightKg: f.weightKg,
          lastDonationDate: f.lastDonationDate || undefined,
          address: { division: f.division, district: f.district, area: f.area },
          contactPhone: f.contactPhone,
          emailAlerts: f.emailAlerts,
          showContact: f.showContact,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not save');

      toast.success(alreadyDonor ? 'Donor profile saved' : 'You are now a donor. Thank you!');
      await refresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleAvailability() {
    const next = d.availability === 'available' ? 'unavailable' : 'available';
    setSwitching(true);
    try {
      const res = await apiFetch(`${API_BASE}/blood/donor/availability`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availability: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not change');

      toast.success(next === 'available' ? 'You are available' : 'You are not available now');
      await refresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSwitching(false);
    }
  }

  async function stopBeingDonor() {
    if (!window.confirm('Stop being a donor? You will not be listed or emailed any more.')) return;
    setLeaving(true);
    try {
      const res = await apiFetch(`${API_BASE}/blood/donor`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Could not update');
      toast.success('You are no longer a donor');
      await refresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLeaving(false);
    }
  }

  const available = d.availability === 'available';

  return (
    <main className="mx-auto max-w-5xl px-6 py-14">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-lg shadow-rose-600/25">
          <HeartPulse size={24} />
        </span>
        <h1 className="mt-4 text-3xl font-semibold text-slate-900">
          {alreadyDonor ? 'Your donor profile' : 'Become a blood donor'}
        </h1>
        <p className="mt-2 max-w-xl text-sm text-slate-600">
          When someone near you needs your blood group, you will be told. You decide every time whether to help.
        </p>
      </motion.div>

      {alreadyDonor && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className={`${cardClass} mt-6 flex flex-wrap items-center justify-between gap-4`}
        >
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {available ? 'You are available to donate' : 'You are not available now'}
            </p>
            <p className="mt-0.5 text-xs text-slate-600">
              {d.donationCount || 0} {d.donationCount === 1 ? 'donation' : 'donations'} confirmed
              {d.lastDonationDate ? ` · last on ${dateText(d.lastDonationDate)}` : ''}
            </p>
          </div>

          <button
            role="switch"
            aria-checked={available}
            onClick={toggleAvailability}
            disabled={switching}
            className={`relative h-9 w-16 shrink-0 rounded-full p-1 transition-colors disabled:opacity-60 ${available ? 'bg-emerald-500' : 'bg-slate-300'}`}
          >
            <motion.span
              layout
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className={`flex h-7 w-7 items-center justify-center rounded-full bg-white shadow ${available ? 'ml-auto' : ''}`}
            >
              {switching ? <Loader2 size={14} className="animate-spin text-slate-500" /> : <Droplet size={14} className={available ? 'text-emerald-600' : 'text-slate-400'} fill="currentColor" />}
            </motion.span>
          </button>
        </motion.div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <motion.form
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
          onSubmit={save}
          className={`${cardClass} space-y-5`}
        >
          <div>
            <p className="mb-2 text-sm font-medium text-slate-900">Your blood group</p>
            <GroupPicker value={group} onChange={setGroup} id="donor-form" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={label}>Date of birth</label>
              <input required type="date" value={f.dateOfBirth} onChange={set('dateOfBirth')} className={field} />
            </div>
            <div>
              <label className={label}>Weight (kg)</label>
              <input required type="number" min="30" max="250" step="0.5" value={f.weightKg} onChange={set('weightKg')} className={field} />
            </div>
          </div>

          <div>
            <label className={label}>Last time you gave blood (optional)</label>
            <input type="date" value={f.lastDonationDate} onChange={set('lastDonationDate')} className={field} />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-slate-900">Where do you live?</p>
            <div className="grid gap-3 sm:grid-cols-3">
              <select
                required
                value={f.division}
                onChange={(e) => setF({ ...f, division: e.target.value, district: '', area: '' })}
                className={field}
              >
                <option value="">Division</option>
                {divisions.map((x) => <option key={x}>{x}</option>)}
              </select>
              <select
                required
                value={f.district}
                disabled={!f.division}
                onChange={(e) => setF({ ...f, district: e.target.value, area: '' })}
                className={field}
              >
                <option value="">District</option>
                {districts.map((x) => <option key={x}>{x}</option>)}
              </select>
              <select value={f.area} disabled={!f.district} onChange={set('area')} className={field}>
                <option value="">Upazila (optional)</option>
                {upazilas.map((x) => <option key={x}>{x}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className={label}>Mobile number people can call</label>
            <input required type="tel" value={f.contactPhone} onChange={set('contactPhone')} placeholder="01XXXXXXXXX" className={field} />
          </div>

          <label className="flex items-start gap-3 rounded-xl bg-white/70 p-4 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={f.showContact}
              onChange={(e) => setF({ ...f, showContact: e.target.checked })}
              className="mt-0.5 h-4 w-4 shrink-0 accent-rose-600"
            />
            <span>
              <span className="font-medium text-slate-900">I agree to be contacted</span>
              <span className="mt-0.5 block text-xs text-slate-600">
                Logged-in people who need blood can see my name, area, blood group and this number.
              </span>
            </span>
          </label>

          <label className={`flex items-start gap-3 rounded-xl bg-white/70 p-4 text-sm text-slate-700 ${user.email ? '' : 'opacity-60'}`}>
            <input
              type="checkbox"
              disabled={!user.email}
              checked={f.emailAlerts && Boolean(user.email)}
              onChange={(e) => setF({ ...f, emailAlerts: e.target.checked })}
              className="mt-0.5 h-4 w-4 shrink-0 accent-rose-600"
            />
            <span>
              <span className="font-medium text-slate-900">Email me when my blood group is needed nearby</span>
              <span className="mt-0.5 block text-xs text-slate-600">
                {user.email ? `Sent to ${user.email}.` : 'Your account has no email address.'}
              </span>
            </span>
          </label>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-3.5 text-sm font-medium text-white shadow-lg shadow-rose-600/25 hover:bg-rose-700 disabled:opacity-60"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Saving...' : alreadyDonor ? 'Save changes' : 'Register as a donor'}
          </motion.button>
        </motion.form>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
          className="space-y-4 lg:sticky lg:top-24 lg:h-fit"
        >
          <EligibilityCard result={result} />

          {alreadyDonor && (
            <button
              onClick={stopBeingDonor}
              disabled={leaving}
              className="w-full rounded-full border border-slate-300/70 bg-white/80 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-white disabled:opacity-60"
            >
              Stop being a donor
            </button>
          )}
          <Link href="/blood" className="block text-center text-sm text-slate-600 hover:text-slate-900">
            See who needs blood
          </Link>
        </motion.div>
      </div>
    </main>
  );
}

export default function DonorPage() {
  return (
    <RoleGate roles={['user']} deniedText="Please log in to become a donor.">
      <DonorForm />
    </RoleGate>
  );
}