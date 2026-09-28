'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Siren, Send, Loader2, CheckCircle2 } from 'lucide-react';
import ImageUpload from '../../components/ImageUpload';

const API_BASE = 'http://localhost:5000/api';
const divisions = ['Dhaka', 'Chattogram', 'Rajshahi', 'Khulna', 'Barishal', 'Sylhet', 'Rangpur', 'Mymensingh'];
const field = 'w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2.5 text-sm text-slate-700';
const label = 'mb-1 block text-sm font-medium text-slate-700';

const initialForm = {
  accidentType: '', description: '', photoUrl: '',
  division: '', district: '', area: '', address: '',
  dateTime: '', reporterPhone: '',
};

export default function ReportAccidentPage() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const payload = {
      caseId: `ACC-${Date.now()}`,
      accidentType: form.accidentType,
      description: form.description,
      photoUrl: form.photoUrl || undefined,
      location: { division: form.division, district: form.district, area: form.area, address: form.address },
      dateTime: form.dateTime ? new Date(form.dateTime).toISOString() : new Date().toISOString(),
      reporterPhone: form.reporterPhone,
    };

    try {
      const res = await fetch(`${API_BASE}/accidents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      toast.success('Report submitted successfully');
      setForm(initialForm);
      setDone(true);
    } catch {
      toast.error('Could not submit the report. Is the backend running?');
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
          Your report goes to the administrator for verification, and nearby volunteers are notified immediately.
        </p>

        {done ? (
          <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-8 text-center">
            <CheckCircle2 size={36} className="text-emerald-600" />
            <p className="text-sm text-emerald-700">
              Thank you. Your report will appear on the public list once an administrator verifies it.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDone(false)} className="rounded-full border border-emerald-300 bg-white/70 px-4 py-2 text-sm text-emerald-700">
                Submit another
              </button>
              <Link href="/accidents" className="rounded-full bg-emerald-600 px-4 py-2 text-sm text-white">
                View accidents
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-2xl border border-white/50 bg-white/50 p-6 backdrop-blur-xl">
            <div>
              <label className={label}>Accident type</label>
              <input required value={form.accidentType} onChange={update('accidentType')} placeholder="Road accident, fire, drowning..." className={field} />
            </div>
            <div>
              <label className={label}>Description</label>
              <textarea required rows={4} value={form.description} onChange={update('description')} className={field} />
            </div>

            <ImageUpload value={form.photoUrl} onChange={(url) => setForm({ ...form, photoUrl: url })} />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={label}>Division</label>
                <select required value={form.division} onChange={update('division')} className={field}>
                  <option value="">Select</option>
                  {divisions.map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className={label}>District</label>
                <input required value={form.district} onChange={update('district')} className={field} />
              </div>
              <div>
                <label className={label}>Area</label>
                <input required value={form.area} onChange={update('area')} className={field} />
              </div>
              <div>
                <label className={label}>Address (optional)</label>
                <input value={form.address} onChange={update('address')} className={field} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={label}>Date &amp; time</label>
                <input required type="datetime-local" value={form.dateTime} onChange={update('dateTime')} className={field} />
              </div>
              <div>
                <label className={label}>Your mobile number</label>
                <input required value={form.reporterPhone} onChange={update('reporterPhone')} className={field} />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-3 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-60">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              {loading ? 'Submitting...' : 'Submit report'}
            </button>
          </form>
        )}
      </motion.div>
    </main>
  );
}
