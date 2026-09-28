'use client';

import { useState } from 'react';

const API_BASE = 'http://localhost:5000/api';

const initialForm = {
  name: '',
  age: '',
  gender: 'other',
  physicalDescription: '',
  photoUrl: '',
  division: '',
  district: '',
  area: '',
  address: '',
  lastSeenDateTime: '',
  reporterContact: '',
};

export default function ReportMissingPersonPage() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg('');

    const payload = {
      name: form.name,
      age: Number(form.age),
      gender: form.gender,
      physicalDescription: form.physicalDescription,
      photoUrl: form.photoUrl || undefined,
      lastKnownLocation: {
        division: form.division,
        district: form.district,
        area: form.area,
        address: form.address,
      },
      lastSeenDateTime: form.lastSeenDateTime ? new Date(form.lastSeenDateTime).toISOString() : new Date().toISOString(),
      reporterContact: form.reporterContact,
    };

    try {
      const res = await fetch(`${API_BASE}/missing-persons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Submission failed');
      setStatus('success');
      setForm(initialForm);
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-semibold text-slate-900">Report a missing person</h1>
      <p className="mt-2 text-sm text-slate-600">
        Reports are reviewed by the administrator and published once approved.
      </p>

      {status === 'success' ? (
        <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-6 text-sm text-emerald-700">
          Report submitted for review.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-2xl border border-white/50 bg-white/50 p-6 backdrop-blur-xl">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Name</label>
              <input required value={form.name} onChange={update('name')}
                className="w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2.5 text-sm text-slate-700" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Age</label>
              <input required type="number" min="0" value={form.age} onChange={update('age')}
                className="w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2.5 text-sm text-slate-700" />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Gender</label>
            <select value={form.gender} onChange={update('gender')}
              className="w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2.5 text-sm text-slate-700">
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Physical description</label>
            <textarea required value={form.physicalDescription} onChange={update('physicalDescription')} rows={3}
              className="w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2.5 text-sm text-slate-700" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Photo URL (optional)</label>
            <input value={form.photoUrl} onChange={update('photoUrl')} placeholder="https://..."
              className="w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2.5 text-sm text-slate-700" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Division</label>
              <input required value={form.division} onChange={update('division')}
                className="w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2.5 text-sm text-slate-700" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">District</label>
              <input required value={form.district} onChange={update('district')}
                className="w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2.5 text-sm text-slate-700" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Area</label>
              <input required value={form.area} onChange={update('area')}
                className="w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2.5 text-sm text-slate-700" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Address (optional)</label>
              <input value={form.address} onChange={update('address')}
                className="w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2.5 text-sm text-slate-700" />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Last seen date &amp; time</label>
            <input required type="datetime-local" value={form.lastSeenDateTime} onChange={update('lastSeenDateTime')}
              className="w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2.5 text-sm text-slate-700" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Your contact number</label>
            <input required value={form.reporterContact} onChange={update('reporterContact')}
              className="w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2.5 text-sm text-slate-700" />
          </div>

          {status === 'error' && (
            <p className="text-sm text-rose-600">Something went wrong: {errorMsg}</p>
          )}

          <button type="submit" disabled={status === 'submitting'}
            className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60">
            {status === 'submitting' ? 'Submitting...' : 'Submit report'}
          </button>
        </form>
      )}
    </main>
  );
}
