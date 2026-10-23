'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { CheckCircle2, ChevronDown, HeartPulse, LocateFixed, Loader2, Phone, Radio, ShieldAlert, Siren } from 'lucide-react';
import { API_BASE, apiFetch } from '../../lib/api';
import { bdLocations } from '../../lib/bdLocations';
import { displayPhone } from '../../lib/blood';
import { readSos, saveSos } from '../../lib/sos';
import { useLocate } from '../../lib/useLocate';
import { useAuth } from '../../components/AuthProvider';
import LocationPicker from '../../components/map/LocationPicker';
import Radar from '../../components/sos/Radar';

const field =
  'w-full rounded-xl border border-slate-200 bg-white/80 px-3 py-2.5 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-60';
const label = 'mb-1 block text-sm font-medium text-slate-700';
const divisions = Object.keys(bdLocations);
const byName = (a, b) => a.localeCompare(b);
const SECONDS = 5;
const PHONE_RE = /^(\+?88)?01[3-9]\d{8}$/;

const steps = [
  [Radio, 'Volunteers near you are told'],
  [LocateFixed, 'You get a page to follow the help'],
  [Phone, 'Always call 999 for anyone in danger'],
];

export default function SosPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { state: geo, pos, setPos, locate } = useLocate({ auto: true });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', note: '', division: '', district: '', area: '' });
  const [count, setCount] = useState(null);
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState('');
  const [active, setActive] = useState(null);
  const sendRef = useRef(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActive(readSos());
  }, []);

  useEffect(() => {
    if (!user) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm((f) => ({
      ...f,
      name: f.name || user.name || '',
      phone: f.phone || displayPhone(user.phone || user.donor?.contactPhone || ''),
      division: f.division || user.address?.division || '',
      district: f.district || user.address?.district || '',
      area: f.area || user.address?.area || '',
    }));
  }, [user]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const districts = form.division ? Object.keys(bdLocations[form.division] || {}).sort(byName) : [];
  const upazilas =
    form.division && form.district ? [...(bdLocations[form.division]?.[form.district] || [])].sort(byName) : [];

  async function send() {
    setCount(null);
    setSending(true);
    setFailed('');

    try {
      const res = await apiFetch(`${API_BASE}/sos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callerName: form.name,
          callerPhone: form.phone,
          note: form.note,
          location: {
            lat: pos ? pos.lat : undefined,
            lng: pos ? pos.lng : undefined,
            accuracy: pos ? pos.accuracy : undefined,
            division: form.division,
            district: form.district,
            area: form.area,
          },
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not send the SOS.');

      saveSos(data.token);
      router.push(`/sos/status/${data.token}`);
    } catch (err) {
      setSending(false);
      setFailed(err.message);
    }
  }
  // eslint-disable-next-line react-hooks/refs
  sendRef.current = send;

  useEffect(() => {
    if (count === null) return undefined;
    if (count === 0) {
      sendRef.current();
      return undefined;
    }
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(60);
    const t = setTimeout(() => setCount((c) => (c === null ? null : c - 1)), 1000);
    return () => clearTimeout(t);
  }, [count]);

  function begin() {
    if (sending || count !== null) return;

    if (!pos && !form.district) {
      setOpen(true);
      toast.error('Turn on your location, or choose your district first');
      return;
    }
    if (form.phone.trim() && !PHONE_RE.test(form.phone.replace(/[\s-]/g, ''))) {
      setOpen(true);
      toast.error('Check your mobile number, like 01712345678');
      return;
    }

    setFailed('');
    setCount(SECONDS);
  }

  const chip = {
    idle: { icon: Loader2, spin: true, text: 'Getting ready...', tone: 'bg-white/80 text-slate-600' },
    locating: { icon: Loader2, spin: true, text: 'Finding your location...', tone: 'bg-white/80 text-slate-600' },
    found: {
      icon: CheckCircle2,
      text: `Location found${pos?.accuracy ? `, about ${pos.accuracy} m` : ''}`,
      tone: 'bg-emerald-100 text-emerald-700',
    },
    denied: { icon: ShieldAlert, text: 'Location is off. Choose your district below, or turn it on.', tone: 'bg-amber-100 text-amber-800' },
    unavailable: { icon: ShieldAlert, text: 'Could not find your location. Choose your district below.', tone: 'bg-amber-100 text-amber-800' },
    outside: { icon: ShieldAlert, text: 'Your location is outside Bangladesh. Choose your district below.', tone: 'bg-amber-100 text-amber-800' },
  }[geo];
  const ChipIcon = chip.icon;

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center">
        <h1 className="text-3xl font-semibold leading-tight text-slate-900 md:text-4xl">Do you need help right now?</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-600">
          Press SOS to tell volunteers near you. If someone is in danger, call 999 first. Sahayota does not replace 999.
        </p>
      </motion.div>

      <motion.a
        href="tel:999"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-6 flex items-center justify-center gap-3 rounded-2xl border-2 border-rose-600 bg-white/80 px-5 py-4 text-lg font-semibold text-rose-600 backdrop-blur-xl transition-colors hover:bg-rose-50"
      >
        <Phone size={22} /> Life in danger? Call 999
      </motion.a>

      {active && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
          <Link
            href={`/sos/status/${active}`}
            className="flex items-center justify-between gap-3 rounded-2xl bg-amber-50 px-5 py-4 text-sm font-medium text-amber-900"
          >
            <span>You have an SOS in progress. Open it to follow the help.</span>
            <span className="shrink-0 rounded-full bg-amber-600 px-4 py-1.5 text-xs text-white">Open</span>
          </Link>
        </motion.div>
      )}

      <div className="mt-10">
        <Radar size={300}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.93 }}
            onClick={begin}
            disabled={sending || count !== null}
            aria-label="Send an SOS"
            className="relative flex h-48 w-48 flex-col items-center justify-center gap-1 rounded-full text-white shadow-2xl shadow-rose-600/50 disabled:opacity-80"
            style={{ background: 'radial-gradient(circle at 30% 25%, #FB7185, #E11D48 55%, #9F1239)' }}
          >
            {sending ? <Loader2 size={48} className="animate-spin" /> : <Siren size={48} />}
            <span className="text-4xl font-bold tracking-wide">{sending ? 'Sending' : 'SOS'}</span>
            <span className="text-xs text-rose-100">{sending ? 'Please wait' : 'Tap for help'}</span>
          </motion.button>
        </Radar>
      </div>

      <AnimatePresence>
        {failed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            role="alert"
            className="mt-4 rounded-2xl bg-rose-50 p-4 text-sm text-rose-800"
          >
            <p className="font-semibold">The SOS was not sent.</p>
            <p className="mt-1">{failed}</p>
            <a href="tel:999" className="mt-3 inline-flex items-center gap-2 rounded-full bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white">
              <Phone size={15} /> Call 999
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <span className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium ${chip.tone}`}>
          <ChipIcon size={14} className={chip.spin ? 'animate-spin' : ''} /> {chip.text}
        </span>
        {(geo === 'denied' || geo === 'unavailable' || geo === 'outside') && (
          <button
            onClick={locate}
            className="flex items-center gap-1.5 rounded-full border border-slate-300/70 bg-white/80 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-white"
          >
            <LocateFixed size={14} /> Try again
          </button>
        )}
      </div>

      <div className="mt-8 rounded-2xl border border-white/60 bg-white/60 backdrop-blur-xl">
        <button
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
        >
          <span>
            <span className="block text-sm font-semibold text-slate-900">Add details (recommended)</span>
            <span className="block text-xs text-slate-600">Your phone number lets a volunteer call you</span>
          </span>
          <ChevronDown size={18} className={`shrink-0 text-slate-500 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="space-y-4 px-5 pb-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={label}>Your name</label>
                    <input value={form.name} onChange={set('name')} maxLength={60} className={field} />
                  </div>
                  <div>
                    <label className={label}>Your mobile number</label>
                    <input type="tel" value={form.phone} onChange={set('phone')} placeholder="01XXXXXXXXX" className={field} />
                  </div>
                </div>

                <div>
                  <label className={label}>What is happening? (optional)</label>
                  <textarea
                    rows={2}
                    maxLength={200}
                    value={form.note}
                    onChange={set('note')}
                    placeholder="For example: bus accident, two people hurt"
                    className={field}
                  />
                </div>

                <div>
                  <p className={label}>Where are you?</p>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <select
                      value={form.division}
                      onChange={(e) => setForm({ ...form, division: e.target.value, district: '', area: '' })}
                      className={field}
                    >
                      <option value="">Division</option>
                      {divisions.map((d) => <option key={d}>{d}</option>)}
                    </select>
                    <select
                      value={form.district}
                      disabled={!form.division}
                      onChange={(e) => setForm({ ...form, district: e.target.value, area: '' })}
                      className={field}
                    >
                      <option value="">District</option>
                      {districts.map((d) => <option key={d}>{d}</option>)}
                    </select>
                    <select value={form.area} disabled={!form.district} onChange={set('area')} className={field}>
                      <option value="">Upazila</option>
                      {upazilas.map((u) => <option key={u}>{u}</option>)}
                    </select>
                  </div>
                  <p className="mt-1.5 text-xs text-slate-500">
                    The district also lets us show you hospitals and emergency numbers near you.
                  </p>
                </div>

                <LocationPicker
                  height={240}
                  value={pos ? { lat: pos.lat, lng: pos.lng } : null}
                  onChange={(p) => setPos(p ? { lat: p.lat, lng: p.lng, accuracy: null } : null)}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {steps.map(([Icon, text], i) => (
          <motion.div
            key={text}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.08 }}
            className="rounded-2xl border border-white/60 bg-white/50 p-4 backdrop-blur-xl"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
              <Icon size={17} />
            </span>
            <p className="mt-2.5 text-xs leading-relaxed text-slate-700">{text}</p>
          </motion.div>
        ))}
      </div>

      <Link
        href="/first-aid"
        className="mt-6 flex items-center justify-center gap-2 rounded-2xl bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-800 hover:bg-emerald-100"
      >
        <HeartPulse size={18} /> Read the first aid guide while you wait
      </Link>

      <AnimatePresence>
        {count !== null && (
          <motion.div
            role="alertdialog"
            aria-live="assertive"
            aria-label="Sending your SOS"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex flex-col items-center justify-center bg-rose-600 px-6 text-center text-white"
          >
            <p className="text-sm font-medium uppercase tracking-widest text-rose-100">Sending your SOS in</p>
            <div className="relative mt-4 h-48 w-48">
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={count}
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.6, opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="mono absolute inset-0 flex items-center justify-center text-[10rem] font-bold leading-none"
                >
                  {count}
                </motion.span>
              </AnimatePresence>
            </div>
            <p className="mt-2 max-w-xs text-sm text-rose-100">Tap Cancel if this was a mistake.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button onClick={() => setCount(null)} className="rounded-full bg-white px-10 py-4 text-base font-semibold text-rose-600">
                Cancel
              </button>
              <button
                onClick={() => sendRef.current()}
                className="rounded-full border-2 border-white/70 px-10 py-4 text-base font-semibold text-white"
              >
                Send now
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}