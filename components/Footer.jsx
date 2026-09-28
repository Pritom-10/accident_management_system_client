'use client';

import { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Bell, Loader2, Phone } from 'lucide-react';
import Logo from './Logo';

const API_BASE = 'http://localhost:5000/api';
const divisions = ['Dhaka', 'Chattogram', 'Rajshahi', 'Khulna', 'Barishal', 'Sylhet', 'Rangpur', 'Mymensingh'];
const field = 'w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2.5 text-sm text-slate-700';

export default function Footer() {
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
    <footer className="border-t border-white/40">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-8 rounded-2xl border border-white/50 bg-white/40 p-8 backdrop-blur-xl md:grid-cols-2">
          <div>
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <Bell size={20} />
            </span>
            <h2 className="mt-4 text-2xl font-semibold text-slate-900">Get notified for your district</h2>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-600">
              Leave your email and district — we&rsquo;ll send you a message the moment a new
              accident is reported nearby.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input required type="email" placeholder="name@email.com" value={form.email} onChange={update('email')} className={field} />
            <div className="grid grid-cols-2 gap-3">
              <select required value={form.division} onChange={update('division')} className={field}>
                <option value="">Division</option>
                {divisions.map((d) => <option key={d}>{d}</option>)}
              </select>
              <input required placeholder="District" value={form.district} onChange={update('district')} className={field} />
            </div>
            <button
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Bell size={16} />}
              {loading ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <Logo size={28} />
            <p className="mt-2 text-xs text-slate-600">Accident &amp; emergency response, Bangladesh.</p>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-600">
            <Link href="/" className="hover:text-slate-900">Home</Link>
            <Link href="/accidents" className="hover:text-slate-900">Accidents</Link>
            <Link href="/hospitals" className="hover:text-slate-900">Hospitals</Link>
            <Link href="/missing-persons" className="hover:text-slate-900">Missing persons</Link>
            <a href="tel:999" className="flex items-center gap-1.5 font-medium text-rose-600 hover:underline">
              <Phone size={14} /> Emergency: 999
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
