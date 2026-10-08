'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { Bell, Loader2 } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';
const divisions = ['Dhaka', 'Chattogram', 'Rajshahi', 'Khulna', 'Barishal', 'Sylhet', 'Rangpur', 'Mymensingh'];
const field = 'w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2.5 text-sm text-slate-700';

export default function SubscribeBox() {
  const [form, setForm] = useState({ email: '', division: '', district: '' });
  const [loading, setLoading] = useState(false);

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/subscribers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success('Subscribed! You will get an email for new accidents in your district.');
      setForm({ email: '', division: '', district: '' });
    } catch {
      toast.error('Could not subscribe. Please check your details and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-8 rounded-2xl border border-white/50 bg-white/50 p-5 shadow-lg shadow-slate-900/5 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white">
          <Bell size={18} />
        </span>
        <div>
          <p className="text-sm font-semibold text-slate-900">Get notified for your district</p>
          <p className="text-xs text-slate-600">We&rsquo;ll email you the moment a new accident is reported nearby.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr]">
        <input
          required
          type="email"
          placeholder="name@email.com"
          value={form.email}
          onChange={update('email')}
          className={`${field} sm:col-span-2`}
        />
        <select required value={form.division} onChange={update('division')} className={field}>
          <option value="">Division</option>
          {divisions.map((d) => <option key={d}>{d}</option>)}
        </select>
        <input required placeholder="District" value={form.district} onChange={update('district')} className={field} />
        <button
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60 sm:col-span-2"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Bell size={16} />}
          {loading ? 'Subscribing...' : 'Subscribe'}
        </button>
      </form>
    </div>
  );
}