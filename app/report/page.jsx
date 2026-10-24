'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { CheckCircle2, Phone, Send, ShieldCheck, Siren } from 'lucide-react';
import { API_BASE } from '../../lib/api';
import { bdLocations } from '../../lib/bdLocations';
import ImageUpload from '../../components/ImageUpload';
import LocationPicker from '../../components/map/LocationPicker';
import { Confetti } from '../../components/donate/ui';
import { PageHero, SectionCard, SubmitButton, fieldClass, labelClass } from '../../components/ui/kit';

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

  const required = [form.accidentType.trim().length >= 3, form.description.trim().length >= 10, form.division, form.district, form.reporterPhone.trim()];
  const filled = required.filter(Boolean).length;

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
    <main className="mx-auto max-w-3xl px-4 py-8 md:py-12">
      <PageHero
        icon={<Siren size={24} />}
        tone="rose"
        eyebrow="No account needed"
        title="Report an accident or emergency"
        subtitle="An admin checks every report before the public sees it. Your phone number is never shown."
        actions={
          <a href="tel:999" className="flex items-center gap-2 rounded-full bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-600/25 hover:bg-rose-700">
            <Phone size={16} /> In danger? Call 999 first
          </a>
        }
      />

      <AnimatePresence mode="wait">
        {done ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="relative mt-6 overflow-hidden rounded-3xl border border-emerald-200 bg-emerald-50/80 p-10 text-center"
          >
            <Confetti />
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.25, 1] }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"
            >
              <CheckCircle2 size={34} />
            </motion.span>
            <h2 className="mt-4 text-2xl font-semibold text-slate-900">Thank you for reporting</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
              Your report will appear on the map and the public list once an admin verifies it.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button onClick={() => setDone(false)} className="rounded-full border border-emerald-300 bg-white px-5 py-2.5 text-sm font-medium text-emerald-700">
                Report another
              </button>
              <Link href="/accidents" className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700">
                See verified cases
              </Link>
            </div>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={handleSubmit} exit={{ opacity: 0 }} className="mt-6 space-y-5">
            <div className="sticky top-20 z-20 flex items-center gap-3 rounded-full border border-white/70 bg-white/80 px-4 py-2.5 shadow-md shadow-slate-900/5 backdrop-blur-xl">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-rose-500 to-indigo-500"
                  animate={{ width: `${(filled / 5) * 100}%` }}
                  transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                />
              </div>
              <span className="mono text-xs font-medium text-slate-600">{filled}/5 required</span>
            </div>

            <SectionCard step="1" title="What happened?" hint="A few words are enough.">
              <div>
                <label htmlFor="type" className={labelClass}>Accident type</label>
                <input
                  id="type"
                  required
                  list="accident-types"
                  value={form.accidentType}
                  onChange={set('accidentType')}
                  placeholder="Road accident, fire, drowning..."
                  className={fieldClass}
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
                <label htmlFor="desc" className={labelClass}>Describe it</label>
                <textarea id="desc" required rows={4} value={form.description} onChange={set('description')} placeholder="How many people are hurt? What can you see?" className={fieldClass} />
              </div>
              <ImageUpload value={photoUrl} onChange={setPhotoUrl} />
            </SectionCard>

            <SectionCard step="2" title="Where is it?" hint="The map pin helps volunteers and the blackspot map most.">
              <div className="grid gap-3 sm:grid-cols-3">
                <select required value={form.division} onChange={(e) => setForm({ ...form, division: e.target.value, district: '', area: '' })} className={fieldClass}>
                  <option value="">Division</option>
                  {divisions.map((d) => <option key={d}>{d}</option>)}
                </select>
                <select required value={form.district} disabled={!form.division} onChange={(e) => setForm({ ...form, district: e.target.value, area: '' })} className={fieldClass}>
                  <option value="">District</option>
                  {districts.map((d) => <option key={d}>{d}</option>)}
                </select>
                <select value={form.area} disabled={!form.district} onChange={set('area')} className={fieldClass}>
                  <option value="">Upazila (optional)</option>
                  {upazilas.map((u) => <option key={u}>{u}</option>)}
                </select>
              </div>
              <input value={form.address} onChange={set('address')} maxLength={200} placeholder="Road, landmark or nearby place (optional)" className={fieldClass} />
              <LocationPicker value={pin} onChange={setPin} />
            </SectionCard>

            <SectionCard step="3" title="When, and who are you?">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="when" className={labelClass}>Date and time</label>
                  <input id="when" required type="datetime-local" value={form.dateTime} onChange={set('dateTime')} className={fieldClass} />
                </div>
                <div>
                  <label htmlFor="phone" className={labelClass}>Your mobile number</label>
                  <input id="phone" required type="tel" value={form.reporterPhone} onChange={set('reporterPhone')} placeholder="01XXXXXXXXX" className={fieldClass} />
                </div>
              </div>
              <p className="flex items-center gap-2 text-xs text-slate-500">
                <ShieldCheck size={14} className="text-emerald-600" /> Only admins and approved volunteers can see your number.
              </p>
            </SectionCard>

            <SubmitButton loading={loading} tone="rose" icon={<Send size={16} />}>
              {loading ? 'Submitting...' : 'Submit report'}
            </SubmitButton>
          </motion.form>
        )}
      </AnimatePresence>
    </main>
  );
}