'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { UserSearch, Send, Loader2, CheckCircle2 } from 'lucide-react';
import ImageUpload from '../../../components/ImageUpload';

const API_BASE = 'http://localhost:5000/api';
const divisions = ['Dhaka', 'Chattogram', 'Rajshahi', 'Khulna', 'Barishal', 'Sylhet', 'Rangpur', 'Mymensingh'];
const field = 'w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2.5 text-sm text-slate-700';
const label = 'mb-1 block text-sm font-medium text-slate-700';

const initialForm = {
  name: '', age: '', gender: 'other', physicalDescription: '', photoUrl: '',
  division: '', district: '', area: '', address: '',
  lastSeenDateTime: '', reporterContact: '',
};

export default function ReportMissingPersonPage() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name: form.name,
      age: Number(form.age),
      gender: form.gender,
      physicalDescription: form.physicalDescription,
      photoUrl: form.photoUrl || undefined,
      lastKnownLocation: { division: form.division, district: form.district, area: form.area, address: form.address },
      lastSeenDateTime: form.lastSeenDateTime ? new Date(form.lastSeenDateTime).toISOString() : new Date().toISOString(),
      reporterContact: form.reporterContact,
    };

    try {
      const res = await fetch(`${API_BASE}/missing-persons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      toast.success('Report submitted for review');
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
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/25">
          <UserSearch size={24} />
        </span>
        <h1 className="mt-4 text-3xl font-semibold text-slate-900">Report a missing person</h1>
        <p className="mt-2 text-sm text-slate-600">Reports are reviewed by the administrator and published once approved.</p>

        {done ? (
          <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-8 text-center">
            <CheckCircle2 size={36} className="text-emerald-600" />
            <p className="text-sm text-emerald-700">Your report has been received and is waiting for review.</p>
            <div className="flex gap-3">
              <button onClick={() => setDone(false)} className="rounded-full border border-emerald-300 bg-white/70 px-4 py-2 text-sm text-emerald-700">
                Submit another
              </button>
              <Link href="/missing-persons" className="rounded-full bg-emerald-600 px-4 py-2 text-sm text-white">
                View list
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-2xl border border-white/50 bg-white/50 p-6 backdrop-blur-xl">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={label}>Name</label>
                <input required value={form.name} onChange={update('name')} className={field} />
              </div>
              <div>
                <label className={label}>Age</label>
                <input required type="number" min="0" value={form.age} onChange={update('age')} className={field} />
              </div>
            </div>

            <div>
              <label className={label}>Gender</label>
              <select value={form.gender} onChange={update('gender')} className={field}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className={label}>Physical description</label>
              <textarea required rows={3} value={form.physicalDescription} onChange={update('physicalDescription')} className={field} />
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
                <label className={label}>Last seen date &amp; time</label>
                <input required type="datetime-local" value={form.lastSeenDateTime} onChange={update('lastSeenDateTime')} className={field} />
              </div>
              <div>
                <label className={label}>Your contact number</label>
                <input required value={form.reporterContact} onChange={update('reporterContact')} className={field} />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              {loading ? 'Submitting...' : 'Submit report'}
            </button>
          </form>
        )}
      </motion.div>
    </main>
  );
}
