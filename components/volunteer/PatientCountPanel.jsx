'use client';

import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Loader2, Send, LogOut } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';
const field = 'w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2.5 text-sm text-slate-700';
const label = 'mb-1 block text-sm font-medium text-slate-700';

export default function PatientCountPanel() {
  const [hospitals, setHospitals] = useState([]);
  const [admissions, setAdmissions] = useState([]);
  const [form, setForm] = useState({ hospital: '', patientCount: '1', caseId: '', note: '' });
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      const [h, a] = await Promise.all([
        fetch(`${API_BASE}/hospitals`).then((r) => r.json()),
        fetch(`${API_BASE}/hospital-admissions`).then((r) => r.json()),
      ]);
      setHospitals(h.filter((x) => x.type === 'hospital'));
      setAdmissions(a);
    } catch {
      toast.error('Could not load data. Is the backend running?');
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/hospital-admissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, patientCount: Number(form.patientCount) }),
      });
      if (!res.ok) throw new Error();
      toast.success('Patient count updated');
      setForm({ hospital: '', patientCount: '1', caseId: '', note: '' });
      load();
    } catch {
      toast.error('Could not save. Please check the details.');
    } finally {
      setLoading(false);
    }
  }

  async function discharge(id) {
    try {
      const res = await fetch(`${API_BASE}/hospital-admissions/${id}/discharge`, { method: 'PATCH' });
      if (!res.ok) throw new Error();
      toast.success('Marked as discharged');
      load();
    } catch {
      toast.error('Could not update.');
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form onSubmit={handleSubmit} className="h-fit space-y-4 rounded-2xl border border-white/50 bg-white/50 p-6 backdrop-blur-xl">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Add admitted patients</h2>
          <p className="mt-1 text-xs text-slate-600">Tell us which hospital the patients were taken to.</p>
        </div>

        <div>
          <label className={label}>Hospital</label>
          <select required value={form.hospital} onChange={update('hospital')} className={field}>
            <option value="">Select a hospital</option>
            {hospitals.map((h) => (
              <option key={h._id} value={h._id}>{h.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>Number of patients</label>
            <input required type="number" min="1" value={form.patientCount} onChange={update('patientCount')} className={field} />
          </div>
          <div>
            <label className={label}>Case ID (optional)</label>
            <input value={form.caseId} onChange={update('caseId')} placeholder="ACC-..." className={field} />
          </div>
        </div>

        <div>
          <label className={label}>Note (optional)</label>
          <input value={form.note} onChange={update('note')} className={field} />
        </div>

        <button
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          {loading ? 'Saving...' : 'Add patients'}
        </button>
      </form>

      <div className="rounded-2xl border border-white/50 bg-white/50 p-6 backdrop-blur-xl">
        <h2 className="text-lg font-semibold text-slate-900">Currently admitted</h2>
        <p className="mt-1 text-xs text-slate-600">Press &ldquo;Discharged&rdquo; when patients leave, so the count stays correct.</p>

        {admissions.length === 0 ? (
          <p className="mt-6 text-sm text-slate-600">No admitted patients reported yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {admissions.map((a) => (
              <li key={a._id} className="flex items-center justify-between gap-3 rounded-xl bg-white/70 p-3">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {a.hospital?.name} <span className="text-indigo-600">· {a.patientCount} patient{a.patientCount > 1 ? 's' : ''}</span>
                  </p>
                  <p className="mono mt-0.5 text-xs text-slate-600">
                    {a.caseId ? `${a.caseId} · ` : ''}{new Date(a.createdAt).toLocaleString()}
                  </p>
                  {a.note && <p className="mt-0.5 text-xs text-slate-600">{a.note}</p>}
                </div>
                <button
                  onClick={() => discharge(a._id)}
                  className="flex shrink-0 items-center gap-1.5 rounded-full border border-slate-300/70 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                >
                  <LogOut size={13} /> Discharged
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}