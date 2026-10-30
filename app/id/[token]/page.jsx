'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { AlertTriangle, BadgeCheck, Droplet, HeartPulse, Info, Phone, Pill, Siren } from 'lucide-react';
import { API_BASE } from '../../../lib/api';
import { displayPhone, telLink } from '../../../lib/blood';

function Row({ icon: Icon, tone, title, text }) {
  if (!text) return null;
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-white p-4 shadow-sm">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone}`}><Icon size={18} /></span>
      <div>
        <p className="text-xs font-medium text-slate-500">{title}</p>
        <p className="mt-0.5 whitespace-pre-line text-base font-medium text-slate-900">{text}</p>
      </div>
    </div>
  );
}

export default function MedicalViewPage() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [state, setState] = useState('loading');

  useEffect(() => {
    fetch(`${API_BASE}/medical-id/view/${token}`)
      .then(async (res) => {
        if (res.status === 404) return setState('missing');
        if (!res.ok) throw new Error('failed');
        setData(await res.json());
        setState('ready');
      })
      .catch(() => setState('failed'));
  }, [token]);

  if (state === 'loading') return <main className="mx-auto max-w-md px-6 py-20 text-center text-sm text-slate-600">Loading...</main>;

  if (state !== 'ready') {
    return (
      <main className="mx-auto max-w-md px-6 py-20 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">{state === 'missing' ? 'This page is not available' : 'Could not load this page'}</h1>
        <p className="mt-2 text-sm text-slate-600">The owner may have turned it off or made a new QR code.</p>
        <a href="tel:999" className="mt-6 inline-flex items-center gap-2 rounded-full bg-rose-600 px-6 py-3 text-sm font-semibold text-white"><Phone size={16} /> Call 999</a>
      </main>
    );
  }

  const d = data;
  const nothing = !d.allergies && !d.conditions && !d.medications && !d.notes;

  return (
    <main className="mx-auto max-w-md px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-3xl bg-slate-100 shadow-xl">
        <div className="bg-gradient-to-br from-rose-600 to-rose-800 p-6 text-white">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest"><HeartPulse size={15} /> Medical information</p>
          <p className="mt-3 flex items-center gap-2 text-2xl font-semibold">
            {d.name} {d.verified && <BadgeCheck size={20} />}
          </p>
          <div className="mt-4 flex items-center gap-3">
            <span className="flex h-16 min-w-16 items-center justify-center gap-1 rounded-2xl bg-white px-4 text-3xl font-bold text-rose-600">
              <Droplet size={22} fill="currentColor" /> {d.bloodGroup || '?'}
            </span>
            <p className="text-sm text-rose-100">Blood group</p>
          </div>
        </div>

        <div className="space-y-3 p-4">
          <a href="tel:999" className="flex items-center justify-center gap-2 rounded-2xl bg-rose-600 px-4 py-4 text-lg font-semibold text-white"><Siren size={20} /> Call 999</a>

          {d.emergencyContact && (
            <a href={telLink(d.emergencyContact.phone)} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-900 px-5 py-4 text-white">
              <span>
                <span className="block text-xs text-slate-300">Emergency contact</span>
                <span className="block text-base font-semibold">{d.emergencyContact.name || 'Family'}</span>
              </span>
              <span className="mono flex items-center gap-2 text-base font-semibold"><Phone size={16} /> {displayPhone(d.emergencyContact.phone)}</span>
            </a>
          )}

          <Row icon={AlertTriangle} tone="bg-amber-100 text-amber-600" title="Allergies" text={d.allergies} />
          <Row icon={HeartPulse} tone="bg-rose-100 text-rose-600" title="Health conditions" text={d.conditions} />
          <Row icon={Pill} tone="bg-indigo-100 text-indigo-600" title="Medicines" text={d.medications} />
          <Row icon={Info} tone="bg-slate-200 text-slate-600" title="Notes" text={d.notes} />

          {nothing && <p className="rounded-2xl bg-white p-4 text-sm text-slate-600">The owner has not added more health facts.</p>}

          <p className="px-1 pt-2 text-[11px] leading-relaxed text-slate-500">
            The owner wrote this information and nobody has checked it. It may be out of date. Always rely on a doctor&rsquo;s tests.
          </p>
        </div>
      </motion.div>
    </main>
  );
}