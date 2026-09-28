'use client';

import { useState } from 'react';

const API_BASE = 'http://localhost:5000/api';

const initialForm = {
  accidentType: '',
  description: '',
  photoUrl: '',
  division: '',
  district: '',
  area: '',
  address: '',
  dateTime: '',
  reporterPhone: '',
};

export default function ReportAccidentPage() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [errorMsg, setErrorMsg] = useState('');

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg('');

    const payload = {
      caseId: `ACC-${Date.now()}`, // simple unique id — swap for a proper sequence later
      accidentType: form.accidentType,
      description: form.description,
      photoUrl: form.photoUrl || undefined,
      location: {
        division: form.division,
        district: form.district,
        area: form.area,
        address: form.address,
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
      <h1 className="text-3xl font-semibold text-slate-900">Report an accident or emergency</h1>
      <p className="mt-2 text-sm text-slate-600">
        Your report goes to the administrator for verification, and nearby volunteers are notified immediately.
      </p>

      {status === 'success' ? (
        <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-6 text-sm text-emerald-700">
          Report submitted. It will appear on the public list once an administrator verifies it.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-2xl border border-white/50 bg-white/50 p-6 backdrop-blur-xl">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Accident type</label>
            <input required value={form.accidentType} onChange={update('accidentType')}
              placeholder="Road accident, fire, drowning..."
              className="w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2.5 text-sm text-slate-700" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
            <textarea required value={form.description} onChange={update('description')} rows={4}
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
            <label className="mb-1 block text-sm font-medium text-slate-700">Date &amp; time</label>
            <input required type="datetime-local" value={form.dateTime} onChange={update('dateTime')}
              className="w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2.5 text-sm text-slate-700" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Your mobile number</label>
            <input required value={form.reporterPhone} onChange={update('reporterPhone')}
              className="w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2.5 text-sm text-slate-700" />
          </div>

          {status === 'error' && (
            <p className="text-sm text-rose-600">Something went wrong: {errorMsg}</p>
          )}

          <button type="submit" disabled={status === 'submitting'}
            className="w-full rounded-xl bg-rose-600 px-4 py-3 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-60">
            {status === 'submitting' ? 'Submitting...' : 'Submit report'}
          </button>
        </form>
      )}
    </main>
  );
}
