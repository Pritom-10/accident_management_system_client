'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Building2, Check, CheckCircle2, Clock, Copy, HeartPulse, MapPin, MessageCircle, Phone, ShieldCheck, Siren, XCircle } from 'lucide-react';
import { API_BASE } from '../../../../lib/api';
import { clearSos, shareMessage, smsShare, timeAgo, whatsappShare } from '../../../../lib/sos';
import { Skeleton } from '../../../../components/blood/ui';
import Radar from '../../../../components/sos/Radar';

const cardClass = 'rounded-2xl border border-white/60 bg-white/60 p-5 shadow-md shadow-slate-900/5 backdrop-blur-xl';
const stepNames = ['Sent', 'Visible to volunteers', 'Someone is coming', 'Safe'];

function Stepper({ index }) {
  return (
    <div className="flex items-start">
      {stepNames.map((name, i) => (
        <div key={name} className="flex flex-1 flex-col items-center gap-2 text-center">
          <div className="flex w-full items-center">
            <span className={`h-0.5 flex-1 ${i === 0 ? 'opacity-0' : i <= index ? 'bg-emerald-500' : 'bg-slate-200'}`} />
            <motion.span
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.1, type: 'spring', stiffness: 300 }}
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                i <= index ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
              }`}
            >
              {i <= index ? <Check size={15} /> : i + 1}
            </motion.span>
            <span className={`h-0.5 flex-1 ${i === stepNames.length - 1 ? 'opacity-0' : i < index ? 'bg-emerald-500' : 'bg-slate-200'}`} />
          </div>
          <span className={`px-1 text-[11px] leading-tight ${i <= index ? 'font-medium text-slate-900' : 'text-slate-500'}`}>{name}</span>
        </div>
      ))}
    </div>
  );
}

export default function SosStatusPage() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [state, setState] = useState('loading');
  const [hospitals, setHospitals] = useState([]);
  const [copied, setCopied] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const seen = useRef(0);

  useEffect(() => {
    let stop = false;
    let timer;

    async function tick() {
      try {
        const res = await fetch(`${API_BASE}/sos/status/${token}`);
        if (res.status === 404) {
          if (!stop) setState('missing');
          return;
        }
        if (!res.ok) throw new Error('failed');

        const d = await res.json();
        if (stop) return;

        const count = d.responders.length;
        if (count > seen.current && seen.current !== -1) {
          toast.success(count === 1 ? 'A volunteer is on the way' : `${count} volunteers are on the way`, { duration: 6000 });
          if (navigator.vibrate) navigator.vibrate([120, 80, 120]);
        }
        seen.current = count;

        setData(d);
        setState('ready');
        if (d.status !== 'active' || d.expired) return;
      } catch {
        if (!stop) setState((s) => (s === 'ready' ? 'ready' : 'failed'));
      }
      if (!stop) timer = setTimeout(tick, 8000);
    }

    tick();
    return () => {
      stop = true;
      clearTimeout(timer);
    };
  }, [token]);

  useEffect(() => {
    fetch(`${API_BASE}/hospitals`)
      .then((res) => (res.ok ? res.json() : []))
      .then(setHospitals)
      .catch(() => setHospitals([]));
  }, []);

  async function cancel() {
    if (!window.confirm('Cancel this SOS? Volunteers will stop seeing it.')) return;
    setCancelling(true);
    try {
      const res = await fetch(`${API_BASE}/sos/status/${token}/cancel`, { method: 'PATCH' });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'Could not cancel');

      clearSos();
      toast.success('The SOS was cancelled');
      setData((d) => ({ ...d, status: 'cancelled' }));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCancelling(false);
    }
  }

  async function copyLink(text) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error('Could not copy');
    }
  }

  if (state === 'loading') {
    return (
      <main className="mx-auto max-w-2xl space-y-4 px-6 py-12">
        <Skeleton className="h-64" />
        <Skeleton className="h-28" />
      </main>
    );
  }

  if (state !== 'ready') {
    return (
      <main className="mx-auto max-w-lg px-6 py-20 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">
          {state === 'missing' ? 'This SOS was not found' : 'Could not load this SOS'}
        </h1>
        <p className="mt-2 text-sm text-slate-600">If someone is in danger, call 999 now.</p>
        <a href="tel:999" className="mt-6 inline-flex items-center gap-2 rounded-full bg-rose-600 px-6 py-3 text-sm font-semibold text-white">
          <Phone size={16} /> Call 999
        </a>
      </main>
    );
  }

  const d = data;
  const live = d.status === 'active' && !d.expired;
  const responders = d.responders || [];
  const place = [d.location?.area, d.location?.district].filter(Boolean).join(', ');
  const step = d.status === 'resolved' ? 3 : responders.length > 0 ? 2 : 1;
  const hasPin = typeof d.location?.lat === 'number' && typeof d.location?.lng === 'number';
  const message = hasPin ? shareMessage(d.location.lat, d.location.lng) : '';
  const nearby = hospitals
    .filter((h) => !h.isPinned && h.district && d.location?.district && h.district.toLowerCase() === d.location.district.toLowerCase())
    .slice(0, 6);

  const closed = {
    resolved: { icon: CheckCircle2, tone: 'bg-emerald-100 text-emerald-600', title: 'This SOS was marked as resolved', text: 'We are glad you are safe.' },
    false_alarm: { icon: XCircle, tone: 'bg-slate-200 text-slate-600', title: 'This SOS was closed as a false alarm', text: 'If you still need help, please send a new SOS or call 999.' },
    cancelled: { icon: XCircle, tone: 'bg-slate-200 text-slate-600', title: 'You cancelled this SOS', text: 'You can send a new SOS any time.' },
  }[d.status];

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <AnimatePresence mode="wait">
        {live ? (
          <motion.section key="live" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <Radar size={260}>
              <motion.span
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                className="flex h-32 w-32 items-center justify-center rounded-full text-white shadow-2xl shadow-rose-600/40"
                style={{ background: 'radial-gradient(circle at 30% 25%, #FB7185, #E11D48 55%, #9F1239)' }}
              >
                <Siren size={52} />
              </motion.span>
            </Radar>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">Help has been asked for</h1>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-600">
              Volunteers near {place || 'you'} can see your SOS. Stay where you are if it is safe. Keep your phone on.
            </p>
            <p className="mt-2 flex items-center justify-center gap-1.5 text-xs text-slate-500">
              <Clock size={13} /> Sent {timeAgo(d.createdAt)}
            </p>
          </motion.section>
        ) : closed ? (
          <motion.section key="closed" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <span className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${closed.tone}`}>
              <closed.icon size={40} />
            </span>
            <h1 className="mt-5 text-2xl font-semibold text-slate-900">{closed.title}</h1>
            <p className="mt-2 text-sm text-slate-600">{closed.text}</p>
          </motion.section>
        ) : (
          <motion.section key="expired" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
            <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-200 text-slate-600">
              <Clock size={40} />
            </span>
            <h1 className="mt-5 text-2xl font-semibold text-slate-900">This SOS has expired</h1>
            <p className="mt-2 text-sm text-slate-600">Alerts stay open for 6 hours. If you still need help, send a new one.</p>
          </motion.section>
        )}
      </AnimatePresence>

      <a
        href="tel:999"
        className="mt-8 flex items-center justify-center gap-3 rounded-2xl bg-rose-600 px-5 py-5 text-xl font-semibold text-white shadow-xl shadow-rose-600/30 transition-colors hover:bg-rose-700"
      >
        <Phone size={24} /> Call 999
      </a>

      {live && (
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={`${cardClass} mt-5`}>
          <Stepper index={step} />

          <div className="mt-6 border-t border-slate-200/70 pt-4">
            {responders.length === 0 ? (
              <p className="text-sm text-slate-600">No volunteer has answered yet. Keep trying 999 if you are in danger.</p>
            ) : (
              <ul className="space-y-2">
                {responders.map((r, i) => (
                  <motion.li
                    key={`${r.name}-${i}`}
                    initial={{ opacity: 0, x: -14 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
                  >
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-600" />
                    </span>
                    <span>
                      <b>{r.name}</b> {r.status === 'arrived' ? 'has arrived' : 'is on the way'}
                    </span>
                  </motion.li>
                ))}
              </ul>
            )}
          </div>
        </motion.div>
      )}

      {live && hasPin && (
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className={`${cardClass} mt-5`}>
          <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <MapPin size={16} className="text-rose-600" /> Send your location to someone you trust
          </p>
          <p className="mt-1 text-xs text-slate-600">This opens your own phone. You press Send. It uses your own SMS or WhatsApp.</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <a
              href={whatsappShare(message)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 py-3 text-sm font-medium text-white hover:bg-emerald-700"
            >
              <MessageCircle size={16} /> WhatsApp
            </a>
            <a href={smsShare(message)} className="flex items-center justify-center gap-2 rounded-full bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800">
              <MessageCircle size={16} /> SMS
            </a>
            <button
              onClick={() => copyLink(message)}
              className="flex items-center justify-center gap-2 rounded-full border border-slate-300/70 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={`${cardClass} mt-5`}>
        <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Building2 size={16} className="text-sky-600" /> Emergency numbers{d.location?.district ? ` in ${d.location.district}` : ''}
        </p>
        {nearby.length === 0 ? (
          <p className="mt-2 text-xs text-slate-600">
            {d.location?.district ? 'No other numbers are listed for your district yet.' : 'Choose a district next time to see hospital numbers here.'}
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {nearby.map((h) => (
              <li key={h._id}>
                <a
                  href={`tel:${h.phone}`}
                  className="flex items-center justify-between gap-3 rounded-xl bg-white/80 px-4 py-3 text-sm transition-colors hover:bg-white"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-slate-900">{h.name}</span>
                    <span className="block text-xs text-slate-500">{h.type === 'fire_service' ? 'Fire service' : h.type === 'police' ? 'Police' : h.type === 'ambulance' ? 'Ambulance' : 'Hospital'}</span>
                  </span>
                  <span className="mono flex shrink-0 items-center gap-1.5 text-sm font-semibold text-slate-900">
                    <Phone size={14} /> {h.phone}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mt-5 grid gap-3 sm:grid-cols-2">
        <Link href="/first-aid#cpr" className="flex items-center gap-3 rounded-2xl bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-800 hover:bg-emerald-100">
          <HeartPulse size={20} /> CPR steps
        </Link>
        <Link href="/first-aid#bleeding" className="flex items-center gap-3 rounded-2xl bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-800 hover:bg-emerald-100">
          <ShieldCheck size={20} /> Stop bleeding
        </Link>
      </motion.div>

      {live && (
        <div className="mt-8 text-center">
          <button
            onClick={cancel}
            disabled={cancelling}
            className="rounded-full border border-slate-300/70 bg-white/80 px-6 py-3 text-sm font-medium text-slate-700 hover:bg-white disabled:opacity-60"
          >
            I am safe, cancel this SOS
          </button>
        </div>
      )}
    </main>
  );
}