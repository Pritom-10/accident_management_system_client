'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { BadgeCheck, Droplet, HeartPulse, Loader2, Phone, Printer, QrCode as QrIcon, RefreshCw, Save } from 'lucide-react';
import RoleGate from '../../../components/RoleGate';
import QrCode from '../../../components/ui/QrCode';
import { useAuth } from '../../../components/AuthProvider';
import { Skeleton } from '../../../components/blood/ui';
import { PageHero, SectionCard, Switch, SubmitButton, fieldClass, labelClass } from '../../../components/ui/kit';
import { API_BASE, apiFetch } from '../../../lib/api';
import { dateText } from '../../../lib/blood';

const JSON_HEADERS = { 'Content-Type': 'application/json' };
const fields = [
  ['allergies', 'Allergies', 'For example: penicillin, peanuts'],
  ['conditions', 'Health conditions', 'For example: diabetes, asthma, heart disease'],
  ['medications', 'Medicines you take', 'Name and how often'],
  ['notes', 'Other notes', 'Anything a doctor should know'],
];

function Card({ user, data }) {
  const d = user.donor || {};
  const link = typeof window !== 'undefined' && data.token ? `${window.location.origin}/id/${data.token}` : '';

  return (
    <div className="overflow-hidden rounded-3xl bg-slate-950 text-white shadow-2xl shadow-slate-900/30">
      <div className="flex items-center justify-between bg-gradient-to-r from-rose-600 to-indigo-600 px-6 py-3">
        <p className="text-xs font-semibold uppercase tracking-widest">Sahayota health card</p>
        <HeartPulse size={18} />
      </div>

      <div className="flex flex-wrap items-center gap-6 p-6">
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 text-xl font-semibold">
            {user.name}
            {user.verified && <BadgeCheck size={18} className="text-emerald-400" />}
          </p>

          <div className="mt-4 flex items-center gap-4">
            <span className="flex h-16 min-w-16 items-center justify-center gap-1 rounded-2xl bg-rose-600 px-4 text-2xl font-semibold">
              <Droplet size={18} fill="currentColor" /> {user.bloodGroup || '?'}
            </span>
            {d.isDonor && (
              <div className="text-xs text-slate-300">
                <p><span className="mono text-lg font-semibold text-white">{d.donationCount || 0}</span> {d.donationCount === 1 ? 'donation' : 'donations'}</p>
                <p>{d.lastDonationDate ? `Last on ${dateText(d.lastDonationDate)}` : 'No donation yet'}</p>
              </div>
            )}
          </div>

          {data.allergies && <p className="mt-4 text-xs text-slate-300"><b className="text-white">Allergies:</b> {data.allergies}</p>}
          {data.conditions && <p className="mt-1 text-xs text-slate-300"><b className="text-white">Conditions:</b> {data.conditions}</p>}
        </div>

        {data.enabled && link ? (
          <div className="text-center">
            <QrCode value={link} size={140} />
            <p className="mt-2 text-[10px] text-slate-400">Scan in an emergency</p>
          </div>
        ) : (
          <p className="max-w-[10rem] text-xs text-slate-400">Turn on the emergency page to get a QR code.</p>
        )}
      </div>
    </div>
  );
}

function Editor() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    apiFetch(`${API_BASE}/medical-id/me`)
      .then((res) => (res.ok ? res.json() : null))
      .then(setData)
      .catch(() => setData(null));
  }, []);

  const set = (k, v) => setData((d) => ({ ...d, [k]: v }));

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await apiFetch(`${API_BASE}/medical-id/me`, { method: 'PUT', headers: JSON_HEADERS, body: JSON.stringify(data) });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'Could not save');
      setData(json);
      toast.success('Saved');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function renew() {
    if (!window.confirm('Make a new QR code? The old QR code and any printed copy will stop working.')) return;
    setBusy(true);
    try {
      const res = await apiFetch(`${API_BASE}/medical-id/me/regenerate`, { method: 'POST' });
      if (!res.ok) throw new Error('Could not make a new QR code');
      setData(await res.json());
      toast.success('New QR code made');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 md:py-12">
      <div className="no-print">
        <PageHero
          icon={<HeartPulse size={24} />}
          tone="rose"
          eyebrow="Your digital health card"
          title="Medical ID"
          subtitle="Put your blood group and health facts behind a QR code. Anyone who scans it in an emergency can see only what you choose below."
        />
      </div>

      {!data ? (
        <div className="mt-6 space-y-4"><Skeleton className="h-52" /><Skeleton className="h-72" /></div>
      ) : (
        <>
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
            <Card user={user} data={data} />
          </motion.div>

          <div className="no-print mt-4 flex flex-wrap gap-2">
            <button onClick={() => window.print()} className="flex items-center gap-2 rounded-full border border-slate-300/70 bg-white/80 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-white">
              <Printer size={16} /> Print or save as PDF
            </button>
            {data.token && (
              <button onClick={renew} disabled={busy} className="flex items-center gap-2 rounded-full border border-slate-300/70 bg-white/80 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-white disabled:opacity-60">
                {busy ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />} Make a new QR
              </button>
            )}
            {data.enabled && data.token && (
              <Link href={`/id/${data.token}`} className="flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800">
                <QrIcon size={16} /> See what others see
              </Link>
            )}
          </div>

          <form onSubmit={save} className="no-print mt-6 space-y-5">
            <SectionCard title="Emergency page" hint="Off by default. When on, anyone with your QR code can see the details below.">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Show my emergency page</p>
                  <p className="text-xs text-slate-600">Your name, blood group and the facts you write below.</p>
                </div>
                <Switch checked={data.enabled} onChange={(v) => set('enabled', v)} label="Show my emergency page" tone="rose" />
              </div>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-900"><Phone size={14} /> Show my emergency contact</p>
                  <p className="text-xs text-slate-600">
                    Set the contact in your <Link href="/profile" className="font-medium text-indigo-600 hover:underline">profile</Link>. Your blood group is also set there.
                  </p>
                </div>
                <Switch checked={data.showPhone} onChange={(v) => set('showPhone', v)} label="Show my emergency contact" />
              </div>
            </SectionCard>

            <SectionCard title="Health facts" hint="Write only what you are happy for a stranger to read.">
              {fields.map(([key, label, hint]) => (
                <div key={key}>
                  <label htmlFor={`m-${key}`} className={labelClass}>{label}</label>
                  <textarea id={`m-${key}`} rows={2} maxLength={300} value={data[key]} onChange={(e) => set(key, e.target.value)} placeholder={hint} className={fieldClass} />
                </div>
              ))}
              <p className="text-xs text-slate-500">You write this yourself and nobody checks it. It does not replace a doctor&rsquo;s tests.</p>
            </SectionCard>

            <SubmitButton loading={saving} tone="rose" icon={<Save size={16} />}>
              {saving ? 'Saving...' : 'Save'}
            </SubmitButton>
          </form>
        </>
      )}
    </main>
  );
}

export default function MedicalIdPage() {
  return (
    <RoleGate roles={['user']} deniedText="Please log in to make your medical ID.">
      <Editor />
    </RoleGate>
  );
}