'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Loader2, Send, Info } from 'lucide-react';
import ImageUpload from '../ImageUpload';

const API_BASE = 'http://localhost:5000/api';
const field = 'w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2.5 text-sm text-slate-700';
const label = 'mb-1 block text-sm font-medium text-slate-700';

const initialForm = {
  photoUrl: '',
  estimatedAge: '',
  admittingHospital: '',
  admissionDate: '',
  physicalDescription: '',
};

export default function UnidentifiedPatientPanel() {
  const [hospitals, setHospitals] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/hospitals`)
      .then((r) => r.json())
      .then((h) => setHospitals(h.filter((x) => x.type === 'hospital')))
      .catch(() => toast.error('Could not load hospitals. Is the backend running?'));
  }, []);

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const payload = {
      photoUrl: form.photoUrl || undefined,
      estimatedAge: form.estimatedAge ? Number(form.estimatedAge) : undefined,
      admittingHospital: form.admittingHospital,
      admissionDate: new Date(form.admissionDate).toISOString(),
      physicalDescription: form.physicalDescription,
    };

    try {
      const res = await fetch(`${API_BASE}/unidentified-patients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      toast.success('Submitted. It will be public once the administrator verifies it.');
      setForm(initialForm);
    } catch {
      toast.error('Could not submit. Please check the details.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-white/50 bg-white/50 p-6 backdrop-blur-xl">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Report an unidentified patient</h2>
          <p className="mt-1 text-xs text-slate-600">For patients admitted to a hospital whose identity is not known.</p>
        </div>

        <ImageUpload
          label="Patient photo (optional)"
          value={form.photoUrl}
          onChange={(url) => setForm({ ...form, photoUrl: url })}
        />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>Estimated age (optional)</label>
            <input type="number" min="0" value={form.estimatedAge} onChange={update('estimatedAge')} className={field} />
          </div>
          <div>
            <label className={label}>Admission date</label>
            <input required type="date" value={form.admissionDate} onChange={update('admissionDate')} className={field} />
          </div>
        </div>

        <div>
          <label className={label}>Admitting hospital</label>
          <select required value={form.admittingHospital} onChange={update('admittingHospital')} className={field}>
            <option value="">Select a hospital</option>
            {hospitals.map((h) => (
              <option key={h._id} value={h._id}>{h.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={label}>Physical description</label>
          <textarea
            required
            rows={4}
            value={form.physicalDescription}
            onChange={update('physicalDescription')}
            placeholder="Build, hair, clothing, marks or anything that helps someone recognise the person"
            className={field}
          />
        </div>

        <button
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          {loading ? 'Submitting...' : 'Submit for verification'}
        </button>
      </form>

      <div className="h-fit rounded-2xl border border-indigo-200 bg-indigo-50/60 p-5 text-sm text-indigo-900">
        <p className="flex items-center gap-2 font-semibold"><Info size={16} /> What happens next</p>
        <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-xs leading-relaxed">
          <li>Your report is saved as &ldquo;pending&rdquo;.</li>
          <li>The administrator checks it.</li>
          <li>Once verified, it appears on the public Unidentified patients page.</li>
        </ol>
      </div>
    </div>
  );
}