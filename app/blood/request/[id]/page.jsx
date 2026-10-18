'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Ban, Building2, CalendarClock, CheckCircle2, HeartHandshake, Info, Loader2,
  Lock, MapPin, MessageCircle, Phone, Share2, UserRound, Users, XCircle,
} from 'lucide-react';
import { useAuth } from '../../../../components/AuthProvider';
import { GroupBadge, Skeleton, StatusBadge, TimeLeft } from '../../../../components/blood/ui';
import { API_BASE, apiFetch } from '../../../../lib/api';
import { canDonateTo, checkEligibility, displayPhone, telLink, waLink } from '../../../../lib/blood';
import { formatDateTime } from '../../../../lib/newsOptions';

const cardClass = 'rounded-2xl border border-white/50 bg-white/50 p-5 shadow-md shadow-slate-900/5 backdrop-blur-xl';

const rise = (i) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay: i * 0.07 },
});

function Stepper({ status }) {
  const steps = ['Waiting for donors', 'Donor found', 'Completed'];
  const index = status === 'completed' ? 2 : status === 'accepted' ? 1 : 0;

  return (
    <div className="relative flex items-start justify-between">
      <div className="absolute left-12 right-12 top-4 h-1 rounded-full bg-slate-200" />
      <motion.div
        className="absolute left-12 right-12 top-4 h-1 origin-left rounded-full bg-rose-600"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: index / 2 }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
      />
      {steps.map((s, i) => (
        <div key={s} className="relative z-10 flex w-24 flex-col items-center gap-2 text-center">
          <motion.span
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15 * i, type: 'spring', stiffness: 300 }}
            className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-semibold ${
              i <= index ? 'border-rose-600 bg-rose-600 text-white' : 'border-slate-300 bg-white text-slate-400'
            }`}
          >
            {i <= index ? <CheckCircle2 size={18} /> : i + 1}
          </motion.span>
          <span className={`text-xs ${i <= index ? 'font-medium text-slate-900' : 'text-slate-500'}`}>{s}</span>
        </div>
      ))}
    </div>
  );
}

function ContactButtons({ phone, message }) {
  return (
    <div className="flex flex-wrap gap-2">
      <a href={telLink(phone)} className="flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800">
        <Phone size={16} /> Call {displayPhone(phone)}
      </a>
      <a
        href={waLink(phone, message)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
      >
        <MessageCircle size={16} /> WhatsApp
      </a>
    </div>
  );
}

export default function BloodRequestDetailPage() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const [request, setRequest] = useState(null);
  const [state, setState] = useState('loading');
  const [busy, setBusy] = useState('');
  const [thanks, setThanks] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await apiFetch(`${API_BASE}/blood/requests/${id}`);
      if (res.status === 404) {
        setState('missing');
        return;
      }
      if (!res.ok) throw new Error('failed');
      setRequest(await res.json());
      setState('ready');
    } catch {
      setState('failed');
    }
  }, [id]);

  useEffect(() => {
    if (authLoading) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [authLoading, user?._id, load]);

  async function act(key, request_, okMessage, after) {
    setBusy(key);
    try {
      const res = await request_();
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      if (okMessage) toast.success(okMessage);
      if (after) after();
      await load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy('');
    }
  }

  const offer = () => act('offer', () => apiFetch(`${API_BASE}/blood/requests/${id}/offer`, { method: 'POST' }), '', () => setThanks(true));
  const withdraw = () => {
    if (!window.confirm('Withdraw your offer?')) return;
    act('withdraw', () => apiFetch(`${API_BASE}/blood/requests/${id}/offer`, { method: 'DELETE' }), 'Offer withdrawn');
  };
  const confirmDonated = (donorId) =>
    act(`d-${donorId}`, () => apiFetch(`${API_BASE}/blood/requests/${id}/responses/${donorId}/donated`, { method: 'PATCH' }), 'Donation confirmed. Thank you!');
  const cancel = () => {
    if (!window.confirm('Cancel this request? Donors will no longer see it.')) return;
    act('cancel', () => apiFetch(`${API_BASE}/blood/requests/${id}/cancel`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    }), 'Request cancelled');
  };

  async function share() {
    const url = window.location.href;
    const text = `${request.bloodGroup} blood needed at ${request.hospital?.name}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Blood needed', text, url });
      } catch {
        return;
      }
      return;
    }
    await navigator.clipboard.writeText(url);
    toast.success('Link copied. Share it with friends.');
  }

  if (state === 'loading') {
    return (
      <main className="mx-auto max-w-3xl space-y-4 px-6 py-12">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-40" />
        <Skeleton className="h-32" />
      </main>
    );
  }

  if (state === 'missing' || state === 'failed') {
    return (
      <main className="mx-auto max-w-lg px-6 py-20 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">
          {state === 'missing' ? 'This request is not available' : 'Could not load this request'}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          {state === 'missing' ? 'It may have been cancelled or removed.' : 'Please try again in a moment.'}
        </p>
        <Link href="/blood" className="mt-6 inline-block rounded-full bg-rose-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-rose-700">
          See all requests
        </Link>
      </main>
    );
  }

  const r = request;
  const open = r.status === 'pending' || r.status === 'accepted';
  const canManage = r.isOwner || Boolean(r.responses);
  const place = [r.location?.area, r.location?.district, r.location?.division].filter(Boolean).join(', ');
  const pct = Math.min(100, Math.round((r.unitsDonated / r.unitsNeeded) * 100));
  const message = `Hello, I saw the ${r.bloodGroup} blood request at ${r.hospital?.name} on Sahayota.`;

  const isDonor = Boolean(user?.donor?.isDonor);
  const eligibility = isDonor ? checkEligibility(user.donor) : null;
  let blocker = '';
  if (user && !r.isOwner) {
    if (!isDonor) blocker = 'Become a donor to offer your blood.';
    else if (user.donor.availability !== 'available') blocker = 'Your availability is off. Turn it on from the donor page.';
    else if (!eligibility.eligible) blocker = eligibility.checks.find((c) => c.state !== 'ok')?.text || 'You are not eligible right now.';
    else if (!canDonateTo(user.bloodGroup, r.bloodGroup)) blocker = `Your blood group (${user.bloodGroup}) cannot be given to a ${r.bloodGroup} patient.`;
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <motion.div {...rise(0)}>
        <Link href="/blood" className="flex w-fit items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900">
          <ArrowLeft size={16} /> All requests
        </Link>
      </motion.div>

      <motion.section {...rise(1)} className={`${cardClass} mt-5`}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <GroupBadge group={r.bloodGroup} size="lg" />
            <div>
              <h1 className="text-2xl font-semibold leading-tight text-slate-900">
                {r.unitsNeeded} {r.unitsNeeded === 1 ? 'bag' : 'bags'} of {r.bloodGroup} blood
              </h1>
              <p className="mt-1 text-sm text-slate-600">For {r.patientName}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <StatusBadge status={r.status} />
            {open && <TimeLeft neededBy={r.neededBy} />}
          </div>
        </div>

        {r.status === 'cancelled' ? (
          <p className="mt-6 flex items-center gap-2 rounded-xl bg-slate-100 p-4 text-sm text-slate-600">
            <Ban size={16} /> This request was cancelled{r.cancelledReason ? `: ${r.cancelledReason}` : '.'}
          </p>
        ) : (
          <div className="mt-8"><Stepper status={r.status} /></div>
        )}

        <div className="mt-8">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-slate-900">{r.unitsDonated} of {r.unitsNeeded} donated</span>
            <span className="text-slate-500">{r.offers} {r.offers === 1 ? 'offer' : 'offers'}</span>
          </div>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-200/80">
            <motion.div
              className="h-full rounded-full bg-rose-600"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
            />
          </div>
        </div>
      </motion.section>

      <motion.section {...rise(2)} className={`${cardClass} mt-5 grid gap-4 sm:grid-cols-2`}>
        <div className="flex items-start gap-3">
          <Building2 size={18} className="mt-0.5 text-rose-500" />
          <div>
            <p className="text-sm font-medium text-slate-900">{r.hospital?.name}</p>
            {r.hospital?.address && <p className="text-xs text-slate-600">{r.hospital.address}</p>}
          </div>
        </div>
        <div className="flex items-start gap-3">
          <MapPin size={18} className="mt-0.5 text-rose-500" />
          <p className="text-sm text-slate-700">{place}</p>
        </div>
        <div className="flex items-start gap-3">
          <CalendarClock size={18} className="mt-0.5 text-rose-500" />
          <p className="text-sm text-slate-700">Needed by {formatDateTime(r.neededBy)}</p>
        </div>
        <div className="flex items-start gap-3">
          <UserRound size={18} className="mt-0.5 text-rose-500" />
          <p className="text-sm text-slate-700">Posted by {r.requesterName}</p>
        </div>
        {r.note && (
          <p className="flex items-start gap-3 rounded-xl bg-white/70 p-3 text-sm text-slate-700 sm:col-span-2">
            <Info size={16} className="mt-0.5 shrink-0 text-slate-500" /> {r.note}
          </p>
        )}
      </motion.section>

      <motion.section {...rise(3)} className={`${cardClass} mt-5`}>
        <p className="text-sm font-semibold text-slate-900">Contact</p>
        {r.contactPhone ? (
          <div className="mt-3"><ContactButtons phone={r.contactPhone} message={message} /></div>
        ) : (
          <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl bg-white/70 p-4 text-sm text-slate-600">
            <Lock size={16} />
            <span>The contact number is only shown to registered donors.</span>
            {!user ? (
              <Link href="/login" className="font-medium text-indigo-600 hover:underline">Log in</Link>
            ) : (
              <Link href="/blood/donor" className="font-medium text-indigo-600 hover:underline">Become a donor</Link>
            )}
          </div>
        )}
      </motion.section>

      {open && !r.isOwner && (
        <motion.section {...rise(4)} className={`${cardClass} mt-5`}>
          {r.myOffer ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="flex items-center gap-2 text-sm font-medium text-emerald-700">
                <CheckCircle2 size={18} />
                {r.myOffer.status === 'donated' ? 'Your donation is confirmed. Thank you!' : 'You offered to donate. Please contact them now.'}
              </p>
              {r.myOffer.status === 'offered' && (
                <button
                  onClick={withdraw}
                  disabled={busy === 'withdraw'}
                  className="rounded-full border border-slate-300/70 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-60"
                >
                  Withdraw offer
                </button>
              )}
            </div>
          ) : !user ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-700">Can you give {r.bloodGroup} blood? Log in and say so.</p>
              <Link href="/login" className="rounded-full bg-rose-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-rose-700">Log in</Link>
            </div>
          ) : blocker ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="flex items-center gap-2 text-sm text-slate-700"><XCircle size={16} className="text-slate-400" /> {blocker}</p>
              {!isDonor && (
                <Link href="/blood/donor" className="rounded-full bg-rose-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-rose-700">
                  Become a donor
                </Link>
              )}
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={offer}
              disabled={busy === 'offer'}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-3.5 text-sm font-medium text-white shadow-lg shadow-rose-600/25 hover:bg-rose-700 disabled:opacity-60"
            >
              {busy === 'offer' ? <Loader2 size={16} className="animate-spin" /> : <HeartHandshake size={18} />}
              I can donate
            </motion.button>
          )}
        </motion.section>
      )}

      {canManage && r.responses && (
        <motion.section {...rise(5)} className={`${cardClass} mt-5`}>
          <p className="flex items-center gap-2 text-sm font-semibold text-slate-900"><Users size={16} /> People who offered</p>
          {r.responses.length === 0 ? (
            <p className="mt-3 text-sm text-slate-600">No one has offered yet. Share this request to reach more people.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {r.responses.map((x) => (
                <motion.li
                  key={x.donor}
                  layout
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white/70 p-3"
                >
                  <div className="flex items-center gap-3">
                    <GroupBadge group={x.donorGroup} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">{x.donorName}</p>
                      <p className="text-xs text-slate-600">{x.status === 'donated' ? 'Donated' : 'Offered to donate'}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {x.donorPhone && (
                      <>
                        <a href={telLink(x.donorPhone)} className="flex items-center gap-1.5 rounded-full border border-slate-300/70 bg-white px-3 py-1.5 text-xs font-medium text-slate-700">
                          <Phone size={13} /> {displayPhone(x.donorPhone)}
                        </a>
                        <a
                          href={waLink(x.donorPhone, `Hello ${x.donorName.split(' ')[0]}, thank you for offering to donate blood.`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white"
                        >
                          <MessageCircle size={13} /> WhatsApp
                        </a>
                      </>
                    )}
                    {x.status === 'offered' && r.status !== 'cancelled' && (
                      <button
                        onClick={() => confirmDonated(x.donor)}
                        disabled={busy === `d-${x.donor}`}
                        className="flex items-center gap-1.5 rounded-full bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-700 disabled:opacity-60"
                      >
                        <CheckCircle2 size={13} /> Confirm donated
                      </button>
                    )}
                  </div>
                </motion.li>
              ))}
            </ul>
          )}
        </motion.section>
      )}

      <motion.div {...rise(6)} className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={share}
          className="flex items-center gap-2 rounded-full border border-slate-300/70 bg-white/80 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-white"
        >
          <Share2 size={16} /> Share this request
        </button>
        {canManage && open && (
          <button
            onClick={cancel}
            disabled={busy === 'cancel'}
            className="flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
          >
            <Ban size={16} /> Cancel request
          </button>
        )}
      </motion.div>

      <AnimatePresence>
        {thanks && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setThanks(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-6 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.7, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-2xl"
            >
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.25, 1] }}
                transition={{ delay: 0.15, duration: 0.5 }}
                className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"
              >
                <CheckCircle2 size={34} />
              </motion.span>
              <h2 className="mt-4 text-xl font-semibold text-slate-900">Thank you, hero</h2>
              <p className="mt-2 text-sm text-slate-600">
                The family has been told. Please contact them now to arrange the donation.
              </p>
              <div className="mt-5 flex justify-center">
                {request.contactPhone ? (
                  <ContactButtons phone={request.contactPhone} message={message} />
                ) : (
                  <button onClick={() => setThanks(false)} className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white">
                    Close
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}