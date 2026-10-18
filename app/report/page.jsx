'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Siren, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { API_BASE } from '../../lib/api';
import { bdLocations } from '../../lib/bdLocations';
import ImageUpload from '../../components/ImageUpload';
import LocationPicker from '../../components/map/LocationPicker';

const field =
  'w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2.5 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-60';
const label = 'mb-1 block text-sm font-medium text-slate-700';
const divisions = Object.keys(bdLocations);
const byName = (a, b) => a.localeCompare(b);

function nowLocal() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const emptyForm = {
  accidentType: '',
  description: '',
  division: '',
  district: '',
  area: '',
  address: '',
  dateTime: '',
  reporterPhone: '',
};

export default function ReportAccidentPage() {
  const [form, setForm] = useState(emptyForm);
  const [photoUrl, setPhotoUrl] = useState('');
  const [pin, setPin] = useState(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm((f) => ({ ...f, dateTime: f.dateTime || nowLocal() }));
  }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const districts = form.division ? Object.keys(bdLocations[form.division] || {}).sort(byName) : [];
  const upazilas =
    form.division && form.district ? [...(bdLocations[form.division]?.[form.district] || [])].sort(byName) : [];

  function reset() {
    setForm({ ...emptyForm, dateTime: nowLocal() });
    setPhotoUrl('');
    setPin(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const payload = {
      accidentType: form.accidentType,
      description: form.description,
      photoUrl: photoUrl || undefined,
      location: {
        division: form.division,
        district: form.district,
        area: form.area,
        address: form.address,
        lat: pin ? pin.lat : undefined,
        lng: pin ? pin.lng : undefined,
      },
      dateTime: form.dateTime ? new Date(form.dateTime).toISOString() : new Date().toISOString(),
      reporterPhone: form.reporterPhone,
    };

    try {
      const res = await fetch(`${API_BASE}/accidents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not submit the report');

      toast.success('Report submitted');
      reset();
      setDone(true);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-14">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-lg shadow-rose-600/25">
          <Siren size={24} />
        </span>
        <h1 className="mt-4 text-3xl font-semibold text-slate-900">Report an accident or emergency</h1>
        <p className="mt-2 text-sm text-slate-600">
          You do not need an account. An administrator checks every report before it is shown to the public.
        </p>
        <p className="mt-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-700">
          If someone is in danger right now, call 999 first.
        </p>

        {done ? (
          <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-8 text-center">
            <CheckCircle2 size={36} className="text-emerald-600" />
            <p className="text-sm text-emerald-700">
              Thank you. Your report will appear on the map and the public list once an administrator verifies it.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDone(false)}
                className="rounded-full border border-emerald-300 bg-white/70 px-4 py-2 text-sm text-emerald-700"
              >
                Submit another
              </button>
              <Link href="/accidents" className="rounded-full bg-emerald-600 px-4 py-2 text-sm text-white">
                View accidents
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-5 rounded-2xl border border-white/50 bg-white/50 p-6 backdrop-blur-xl">
            <div>
              <label className={label}>Accident type</label>
              <input
                required
                list="accident-types"
                value={form.accidentType}
                onChange={set('accidentType')}
                placeholder="Road accident, fire, drowning..."
                className={field}
              />
              <datalist id="accident-types">
                <option value="Road accident" />
                <option value="Fire" />
                <option value="Drowning" />
                <option value="Building collapse" />
                <option value="Train accident" />
                <option value="Boat accident" />
              </datalist>
            </div>

            <div>
              <label className={label}>What happened?</label>
              <textarea required rows={4} value={form.description} onChange={set('description')} className={field} />
            </div>

            <ImageUpload value={photoUrl} onChange={setPhotoUrl} />

            <div>
              <p className="mb-2 text-sm font-medium text-slate-900">Where did it happen?</p>
              <div className="grid gap-3 sm:grid-cols-3">
                <select
                  required
                  value={form.division}
                  onChange={(e) => setForm({ ...form, division: e.target.value, district: '', area: '' })}
                  className={field}
                >
                  <option value="">Division</option>
                  {divisions.map((d) => <option key={d}>{d}</option>)}
                </select>
                <select
                  required
                  value={form.district}
                  disabled={!form.division}
                  onChange={(e) => setForm({ ...form, district: e.target.value, area: '' })}
                  className={field}
                >
                  <option value="">District</option>
                  {districts.map((d) => <option key={d}>{d}</option>)}
                </select>
                <select value={form.area} disabled={!form.district} onChange={set('area')} className={field}>
                  <option value="">Upazila (optional)</option>
                  {upazilas.map((u) => <option key={u}>{u}</option>)}
                </select>
              </div>
              <input
                value={form.address}
                onChange={set('address')}
                maxLength={200}
                placeholder="Road, landmark or nearby place (optional)"
                className={`${field} mt-3`}
              />
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-slate-900">Mark the place on the map</p>
              <LocationPicker value={pin} onChange={setPin} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={label}>Date and time</label>
                <input required type="datetime-local" value={form.dateTime} onChange={set('dateTime')} className={field} />
              </div>
              <div>
                <label className={label}>Your mobile number</label>
                <input
                  required
                  type="tel"
                  value={form.reporterPhone}
                  onChange={set('reporterPhone')}
                  placeholder="01XXXXXXXXX"
                  className={field}
                />
              </div>
            </div>
            <p className="-mt-2 text-xs text-slate-500">
              Your number is never shown to the public. Only admins and approved volunteers can see it.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-3 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-60"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              {loading ? 'Submitting...' : 'Submit report'}
            </button>
          </form>
        )}
      </motion.div>
    </main>
  );
}