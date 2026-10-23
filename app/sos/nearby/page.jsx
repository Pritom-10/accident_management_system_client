'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { BellRing, CheckCircle2, Clock, Loader2, LocateFixed, MapPin, MessageCircle, Navigation, Phone, ShieldCheck, UserRound } from 'lucide-react';
import RoleGate from '../../../components/RoleGate';
import { useAuth } from '../../../components/AuthProvider';
import MapView from '../../../components/map/MapView';
import { Skeleton } from '../../../components/blood/ui';
import { API_BASE, apiFetch } from '../../../lib/api';
import { displayPhone, telLink, waLink } from '../../../lib/blood';
import { osmLink } from '../../../lib/geo';
import { km, timeAgo } from '../../../lib/sos';
import { useLocate } from '../../../lib/useLocate';

const RADII = [1, 2, 5, 10];
const cardClass = 'rounded-2xl border border-white/60 bg-white/60 p-5 shadow-md shadow-slate-900/5 backdrop-blur-xl';
const answerText = { on_the_way: 'You are on the way', arrived: 'You have arrived', cannot: 'You cannot go' };

function AlertCard({ item, onRespond, busy }) {
  const place = [item.location?.area, item.location?.district].filter(Boolean).join(', ');
  const hasPin = typeof item.location?.lat === 'number' && typeof item.location?.lng === 'number';

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 40 }}
      className={`${cardClass} border-l-4 border-l-rose-500`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-base font-semibold text-slate-900">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-500 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose-600" />
            </span>
            {place || 'Location not shared'}
          </p>
          <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
            <span className="flex items-center gap-1"><Clock size={12} /> {timeAgo(item.createdAt)}</span>
            {item.distanceKm !== null && (
              <span className="flex items-center gap-1"><Navigation size={12} /> {item.details ? '' : 'about '}{km(item.distanceKm)} away</span>
            )}
          </p>
        </div>
        {item.details ? (
          item.responders.length > 0 && (
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
              {item.responders.filter((r) => r.status !== 'cannot').length} on it
            </span>
          )
        ) : (
          item.responderCount > 0 && (
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">{item.responderCount} on it</span>
          )
        )}
      </div>

      {item.details ? (
        <>
          <div className="mt-4 space-y-2 text-sm text-slate-700">
            <p className="flex items-center gap-2"><UserRound size={15} className="text-slate-400" /> {item.callerName || 'No name given'}</p>
            {item.note && <p className="rounded-xl bg-white/70 p-3 text-sm text-slate-700">{item.note}</p>}
            {hasPin && item.location.accuracy ? (
              <p className="text-xs text-slate-500">Location accuracy: about {item.location.accuracy} m</p>
            ) : null}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {item.callerPhone ? (
              <>
                <a href={telLink(item.callerPhone)} className="flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800">
                  <Phone size={13} /> Call {displayPhone(item.callerPhone)}
                </a>
                <a
                  href={waLink(item.callerPhone, 'Hello, I saw your SOS on ResQ. I am coming to help.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-700"
                >
                  <MessageCircle size={13} /> WhatsApp
                </a>
              </>
            ) : (
              <span className="rounded-full bg-amber-100 px-3 py-1.5 text-xs font-medium text-amber-800">No phone number given</span>
            )}
            {hasPin && (
              <a
                href={osmLink(item.location.lat, item.location.lng)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-full border border-slate-300/70 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                <MapPin size={13} /> Open the place
              </a>
            )}
          </div>

          <div className="mt-4 border-t border-slate-200/70 pt-4">
            {item.myStatus && <p className="mb-2 text-xs font-medium text-emerald-700">{answerText[item.myStatus]}</p>}
            <div className="flex flex-wrap gap-2">
              <button
                disabled={busy}
                onClick={() => onRespond(item.id, 'on_the_way')}
                className="rounded-full bg-rose-600 px-4 py-2 text-xs font-medium text-white hover:bg-rose-700 disabled:opacity-60"
              >
                I am on my way
              </button>
              <button
                disabled={busy}
                onClick={() => onRespond(item.id, 'arrived')}
                className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                I have arrived
              </button>
              <button
                disabled={busy}
                onClick={() => onRespond(item.id, 'cannot')}
                className="rounded-full border border-slate-300/70 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                I cannot go
              </button>
            </div>
          </div>
        </>
      ) : (
        <p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">
          Someone near you needs help. The exact place is private. If you are close and it is safe, call 999 or go to the area and help others reach them.
        </p>
      )}
    </motion.li>
  );
}

function Nearby() {
  const { user, refresh } = useAuth();
  const isVolunteer = user.roles.includes('volunteer') || user.roles.includes('admin');
  const isRealVolunteer = user.roles.includes('volunteer');
  const { state: geo, pos, locate } = useLocate({ auto: true });
  const [radius, setRadius] = useState(2);
  const [data, setData] = useState(null);
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [switching, setSwitching] = useState(false);
  const seen = useRef(null);

  const ready = geo !== 'idle' && geo !== 'locating';

  const load = useCallback(async () => {
    if (!ready) return;
    try {
      const params = new URLSearchParams({ radius: String(radius) });
      if (pos) {
        params.set('lat', String(pos.lat));
        params.set('lng', String(pos.lng));
      }
      const res = await apiFetch(`${API_BASE}/sos/nearby?${params.toString()}`);
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'failed');
      setData(json);
      setFailed(false);
    } catch {
      setFailed(true);
    }
  }, [ready, pos, radius]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, [load]);

  useEffect(() => {
    if (!data) return;
    const ids = new Set(data.items.map((i) => i.id));
    if (seen.current) {
      const fresh = data.items.filter((i) => !seen.current.has(i.id));
      if (fresh.length > 0) {
        toast.error(`${fresh.length} new SOS ${fresh.length === 1 ? 'alert' : 'alerts'} near you`, { duration: 8000 });
        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
      }
    }
    seen.current = ids;
  }, [data]);

  async function respond(id, status) {
    setBusy(true);
    try {
      const res = await apiFetch(`${API_BASE}/sos/alerts/${id}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'Could not save your answer');

      toast.success(status === 'cannot' ? 'Noted' : 'Thank you. The person can see that you are coming.');
      await load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function toggleAvailability() {
    const next = user.volunteer?.availability === 'available' ? 'unavailable' : 'available';
    setSwitching(true);
    try {
      const res = await apiFetch(`${API_BASE}/sos/availability`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availability: next }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'Could not change');

      toast.success(next === 'available' ? 'You will get emails for SOS in your district' : 'Emails turned off');
      await refresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSwitching(false);
    }
  }

  const items = data?.items || [];
  const available = user.volunteer?.availability === 'available';

  const markers = [
    ...items
      .filter((i) => typeof i.location?.lat === 'number' && typeof i.location?.lng === 'number')
      .map((i) => ({
        id: i.id,
        lat: i.location.lat,
        lng: i.location.lng,
        status: 'rescue_in_progress',
        title: 'SOS',
        subtitle: [i.location.area, i.location.district].filter(Boolean).join(', '),
      })),
    ...(pos ? [{ id: 'me', lat: pos.lat, lng: pos.lng, status: 'cleared', title: 'You are here' }] : []),
  ];

  const geoNote = {
    locating: 'Finding your location...',
    found: `Showing alerts within ${radius} km of you`,
    denied: 'Location is off, so we show alerts in your district',
    unavailable: 'Could not find you, so we show alerts in your district',
    outside: 'Your location is outside Bangladesh, so we show alerts in your district',
  }[geo];

  return (
    <main className="mx-auto max-w-4xl px-6 py-14">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-lg shadow-rose-600/25">
          <BellRing size={24} />
        </span>
        <h1 className="mt-4 text-3xl font-semibold text-slate-900">Nearby SOS alerts</h1>
        <p className="mt-2 max-w-xl text-sm text-slate-600">
          This page updates by itself every 15 seconds. Keep it open when you are ready to help.
        </p>
        <p className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">
          <ShieldCheck size={15} className="mt-0.5 shrink-0" />
          Do not put yourself in danger. For fire, crashes in traffic or anything serious, call 999 first.
        </p>
      </motion.div>

      {isRealVolunteer && (
        <div className={`${cardClass} mt-6 flex flex-wrap items-center justify-between gap-4`}>
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {available ? 'You are available for emergencies' : 'You are not available now'}
            </p>
            <p className="mt-0.5 text-xs text-slate-600">When on, we email you if someone presses SOS in your district.</p>
          </div>
          <button
            role="switch"
            aria-checked={available}
            onClick={toggleAvailability}
            disabled={switching}
            className={`relative h-9 w-16 shrink-0 rounded-full p-1 transition-colors disabled:opacity-60 ${available ? 'bg-emerald-500' : 'bg-slate-300'}`}
          >
            <motion.span
              layout
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className={`flex h-7 w-7 items-center justify-center rounded-full bg-white shadow ${available ? 'ml-auto' : ''}`}
            >
              {switching && <Loader2 size={14} className="animate-spin text-slate-500" />}
            </motion.span>
          </button>
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="flex gap-1 rounded-full bg-white/70 p-1">
          {RADII.map((r) => (
            <button key={r} onClick={() => setRadius(r)} className="relative rounded-full px-4 py-1.5 text-xs font-medium">
              {radius === r && (
                <motion.span
                  layoutId="radius-pill"
                  className="absolute inset-0 rounded-full bg-slate-900"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              <span className={`relative ${radius === r ? 'text-white' : 'text-slate-700'}`}>{r} km</span>
            </button>
          ))}
        </div>
        <button
          onClick={locate}
          className="flex items-center gap-1.5 rounded-full border border-slate-300/70 bg-white/80 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-white"
        >
          <LocateFixed size={14} /> Update my location
        </button>
        {geoNote && <span className="text-xs text-slate-500">{geoNote}</span>}
      </div>

      {markers.length > 0 && (
        <div className="mt-5">
          <MapView markers={markers} height={320} />
        </div>
      )}

      <div className="mt-6">
        {failed && !data ? (
          <div className={`${cardClass} text-center text-sm text-slate-600`}>Could not load the alerts. Please try again in a moment.</div>
        ) : !data ? (
          <div className="space-y-4">
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
          </div>
        ) : data.mode === 'none' ? (
          <div className={`${cardClass} text-center text-sm text-slate-600`}>
            Turn on your location, or add your district in your profile, to see alerts.
          </div>
        ) : items.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className={`${cardClass} flex flex-col items-center gap-3 py-10 text-center`}>
            <motion.span
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600"
            >
              <CheckCircle2 size={28} />
            </motion.span>
            <p className="text-base font-semibold text-slate-900">No SOS near you right now</p>
            <p className="max-w-sm text-sm text-slate-600">Try a bigger distance. New alerts will pop up here by themselves.</p>
          </motion.div>
        ) : (
          <ul className="space-y-4">
            <AnimatePresence initial={false}>
              {items.map((item) => (
                <AlertCard key={item.id} item={item} onRespond={respond} busy={busy} />
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>

      {!isVolunteer && (
        <p className="mt-8 text-center text-xs text-slate-500">
          You see this because you are a blood donor. Exact places and phone numbers are only shown to approved volunteers.
        </p>
      )}
    </main>
  );
}

export default function NearbyPage() {
  return (
    <RoleGate roles={['volunteer', 'donor', 'admin']} deniedText="Only approved volunteers and registered blood donors can see nearby alerts.">
      <Nearby />
    </RoleGate>
  );
}