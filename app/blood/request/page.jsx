'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Droplet, Loader2, Minus, Plus, Send, Siren } from 'lucide-react';
import RoleGate from '../../../components/RoleGate';
import { useAuth } from '../../../components/AuthProvider';
import { GroupPicker } from '../../../components/blood/ui';
import { API_BASE, apiFetch } from '../../../lib/api';
import { bdLocations } from '../../../lib/bdLocations';
import { toLocalInput } from '../../../lib/blood';

const field =
  'w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2.5 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-60';
const label = 'mb-1 block text-sm font-medium text-slate-700';
const divisions = Object.keys(bdLocations);
const byName = (a, b) => a.localeCompare(b);

const quickTimes = [
  ['In 3 hours', () => new Date(Date.now() + 3 * 3600000)],
  ['In 6 hours', () => new Date(Date.now() + 6 * 3600000)],
  [
    'Tonight',
    () => {
      const d = new Date();
      d.setHours(21, 0, 0, 0);
      if (d < new Date()) d.setDate(d.getDate() + 1);
      return d;
    },
  ],
  [
    'Tomorrow morning',
    () => {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      d.setHours(9, 0, 0, 0);
      return d;
    },
  ],
];

function RequestForm() {
  const router = useRouter();
  const { user } = useAuth();

  const [group, setGroup] = useState('');
  const [units, setUnits] = useState(1);
  const [f, setF] = useState(() => ({
    patientName: '',
    hospitalName: '',
    hospitalAddress: '',
    division: user.address?.division || '',
    district: user.address?.district || '',
    area: user.address?.area || '',
    neededBy: '',
    contactPhone: user.donor?.contactPhone || user.phone || '',
    note: '',
  }));
  const [hospitals, setHospitals] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setF((prev) => ({ ...prev, neededBy: prev.neededBy || toLocalInput(new Date(Date.now() + 3 * 3600000)) }));
    fetch(`${API_BASE}/hospitals`)
      .then((res) => (res.ok ? res.json() : []))
      .then((list) => setHospitals(list.filter((h) => h.type === 'hospital').map((h) => h.name)))
      .catch(() => setHospitals([]));
  }, []);

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const districts = f.division ? Object.keys(bdLocations[f.division] || {}).sort(byName) : [];
  const upazilas = f.division && f.district ? [...(bdLocations[f.division]?.[f.district] || [])].sort(byName) : [];

  async function handleSubmit(e) {
    e.preventDefault();
    if (!group) {
      toast.error('Choose the blood group first');
      return;
    }

    setSaving(true);
    try {
      const res = await apiFetch(`${API_BASE}/blood/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bloodGroup: group,
          unitsNeeded: units,
          patientName: f.patientName,
          hospital: { name: f.hospitalName, address: f.hospitalAddress },
          location: { division: f.division, district: f.district, area: f.area },
          neededBy: new Date(f.neededBy).toISOString(),
          contactPhone: f.contactPhone,
          note: f.note,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not post the request');

            const reached = Math.max(data.emailed || 0, data.pushed || 0);
      toast.success(
        reached > 0
          ? `Request posted. About ${reached} nearby ${reached === 1 ? 'donor was' : 'donors were'} alerted.`
          : 'Request posted'
      );
      router.push(`/blood/requests/${data.id}`);
    } catch (err) {
      toast.error(err.message);
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-14">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-lg shadow-rose-600/25">
          <Droplet size={24} fill="currentColor" />
        </span>
        <h1 className="mt-4 text-3xl font-semibold text-slate-900">Ask for blood</h1>
        <p className="mt-2 text-sm text-slate-600">
          Donors who match the blood group and live in your district are told about this request.
        </p>
        <p className="mt-3 flex items-start gap-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-700">
          <Siren size={14} className="mt-0.5 shrink-0" />
          In an emergency, also ask the hospital blood bank first and call 999.
        </p>
      </motion.div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-5 rounded-2xl border border-white/50 bg-white/50 p-6 backdrop-blur-xl"
        >
          <div>
            <p className="mb-2 text-sm font-medium text-slate-900">Which blood group?</p>
            <GroupPicker value={group} onChange={setGroup} id="req-form" />
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <div>
              <p className="mb-2 text-sm font-medium text-slate-900">How many bags?</p>
              <div className="flex items-center gap-3">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.85 }}
                  onClick={() => setUnits(Math.max(1, units - 1))}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300/70 bg-white text-slate-700"
                >
                  <Minus size={16} />
                </motion.button>
                <div className="relative h-10 w-10 overflow-hidden text-center">
                  <AnimatePresence mode="popLayout">
                    <motion.span
                      key={units}
                      initial={{ y: -14, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 14, opacity: 0 }}
                      className="mono absolute inset-0 flex items-center justify-center text-2xl text-slate-900"
                    >
                      {units}
                    </motion.span>
                  </AnimatePresence>
                </div>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.85 }}
                  onClick={() => setUnits(Math.min(10, units + 1))}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300/70 bg-white text-slate-700"
                >
                  <Plus size={16} />
                </motion.button>
              </div>
            </div>

            <div className="min-w-[14rem] flex-1">
              <label className={label}>Patient name</label>
              <input required maxLength={80} value={f.patientName} onChange={set('patientName')} className={field} />
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="space-y-5 rounded-2xl border border-white/50 bg-white/50 p-6 backdrop-blur-xl"
        >
          <div>
            <label className={label}>Hospital</label>
            <input
              required
              list="hospital-names"
              maxLength={120}
              value={f.hospitalName}
              onChange={set('hospitalName')}
              placeholder="Start typing the hospital name"
              className={field}
            />
            <datalist id="hospital-names">
              {hospitals.map((h) => <option key={h} value={h} />)}
            </datalist>
            <input
              value={f.hospitalAddress}
              onChange={set('hospitalAddress')}
              maxLength={200}
              placeholder="Ward, bed or address (optional)"
              className={`${field} mt-3`}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <select
              required
              value={f.division}
              onChange={(e) => setF({ ...f, division: e.target.value, district: '', area: '' })}
              className={field}
            >
              <option value="">Division</option>
              {divisions.map((d) => <option key={d}>{d}</option>)}
            </select>
            <select
              required
              value={f.district}
              disabled={!f.division}
              onChange={(e) => setF({ ...f, district: e.target.value, area: '' })}
              className={field}
            >
              <option value="">District</option>
              {districts.map((d) => <option key={d}>{d}</option>)}
            </select>
            <select value={f.area} disabled={!f.district} onChange={set('area')} className={field}>
              <option value="">Upazila (optional)</option>
              {upazilas.map((u) => <option key={u}>{u}</option>)}
            </select>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.26 }}
          className="space-y-5 rounded-2xl border border-white/50 bg-white/50 p-6 backdrop-blur-xl"
        >
          <div>
            <label className={label}>When is the blood needed?</label>
            <div className="mb-3 flex flex-wrap gap-2">
              {quickTimes.map(([text, make]) => (
                <motion.button
                  key={text}
                  type="button"
                  whileTap={{ scale: 0.94 }}
                  onClick={() => setF({ ...f, neededBy: toLocalInput(make()) })}
                  className="rounded-full border border-slate-300/70 bg-white px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                >
                  {text}
                </motion.button>
              ))}
            </div>
            <input required type="datetime-local" value={f.neededBy} onChange={set('neededBy')} className={field} />
          </div>

          <div>
            <label className={label}>Contact number</label>
            <input required type="tel" value={f.contactPhone} onChange={set('contactPhone')} placeholder="01XXXXXXXXX" className={field} />
            <p className="mt-1 text-xs text-slate-500">
              Only you, admins and registered donors can see this number.
            </p>
          </div>

          <div>
            <label className={label}>Note (optional)</label>
            <textarea rows={3} maxLength={300} value={f.note} onChange={set('note')} placeholder="Anything a donor should know" className={field} />
          </div>
        </motion.section>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-3.5 text-sm font-medium text-white shadow-lg shadow-rose-600/25 hover:bg-rose-700 disabled:opacity-60"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          {saving ? 'Posting...' : 'Post the request'}
        </motion.button>
      </form>
    </main>
  );
}

export default function BloodRequestPage() {
  return (
    <RoleGate roles={['user']} deniedText="Please log in to ask for blood.">
      <RequestForm />
    </RoleGate>
  );
}