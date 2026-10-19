'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { ArrowLeft, Building2, HeartHandshake, Info, MapPin, Share2, UserRound, XCircle } from 'lucide-react';
import { API_BASE, apiFetch } from '../../../lib/api';
import { imageSrc } from '../../../lib/imageUrl';
import { percent, statusInfo, taka } from '../../../lib/money';
import { useAuth } from '../../../components/AuthProvider';
import { Skeleton } from '../../../components/blood/ui';
import { Pill, ProgressRing, TakaCount, VerifiedBadge } from '../../../components/donate/ui';
import DonateModal from '../../../components/donate/DonateModal';
import ManagePanel from '../../../components/donate/ManagePanel';
import ReportCampaign from '../../../components/donate/ReportCampaign';
import { DonorsList, Ledger } from '../../../components/donate/Lists';

const cardClass = 'rounded-2xl border border-white/50 bg-white/50 p-5 shadow-md shadow-slate-900/5 backdrop-blur-xl';
const SHOWN = ['active', 'completed', 'closed'];

const rise = (i) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay: i * 0.07 },
});

export default function CampaignPage() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const [campaign, setCampaign] = useState(null);
  const [state, setState] = useState('loading');
  const [donors, setDonors] = useState(null);
  const [expenses, setExpenses] = useState(null);
  const [tab, setTab] = useState('story');
  const [photo, setPhoto] = useState(0);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await apiFetch(`${API_BASE}/donate/campaigns/${id}`);
      if (res.status === 404) {
        setState('missing');
        return;
      }
      if (!res.ok) throw new Error('failed');

      const data = await res.json();
      setCampaign(data);
      setState('ready');

      if (SHOWN.includes(data.status)) {
        const [d, e] = await Promise.all([
          fetch(`${API_BASE}/donate/campaigns/${id}/donors`).then((r) => (r.ok ? r.json() : [])).catch(() => []),
          fetch(`${API_BASE}/donate/campaigns/${id}/expenses`).then((r) => (r.ok ? r.json() : [])).catch(() => []),
        ]);
        setDonors(d);
        setExpenses(e);
      } else {
        setDonors([]);
        setExpenses([]);
      }
    } catch {
      setState('failed');
    }
  }, [id]);

  useEffect(() => {
    if (authLoading) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [authLoading, user?._id, load]);

  async function removeExpense(expense) {
    if (!window.confirm(`Remove "${expense.title}" from the ledger?`)) return;
    try {
      const res = await apiFetch(`${API_BASE}/donate/expenses/${expense._id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not remove it');
      toast.success('Expense removed');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function share() {
    const url = window.location.href;
    const text = `Please help: ${campaign.title}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: campaign.title, text, url });
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
      <main className="mx-auto max-w-6xl space-y-4 px-6 py-12">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-96" />
      </main>
    );
  }

  if (state !== 'ready') {
    return (
      <main className="mx-auto max-w-lg px-6 py-20 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">
          {state === 'missing' ? 'This campaign is not available' : 'Could not load this campaign'}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          {state === 'missing' ? 'It may not exist, or it is still waiting for review.' : 'Please try again in a moment.'}
        </p>
        <Link href="/donate" className="mt-6 inline-block rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700">
          See all campaigns
        </Link>
      </main>
    );
  }

  const c = campaign;
  const p = percent(c.raised, c.targetAmount);
  const photos = c.photos || [];
  const place = [c.location?.area, c.location?.district, c.location?.division].filter(Boolean).join(', ');
  const isAdmin = Boolean(user?.roles?.includes('admin'));
  const canDonate = c.status === 'active';
  const tabs = [
    { id: 'story', label: 'Story' },
    { id: 'donors', label: 'Donors', count: c.donorCount },
    { id: 'ledger', label: 'Where the money goes' },
  ];

  return (
    <main className="mx-auto max-w-6xl px-6 py-12 pb-28 lg:pb-12">
      <motion.div {...rise(0)}>
        <Link href="/donate" className="flex w-fit items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900">
          <ArrowLeft size={16} /> All campaigns
        </Link>
      </motion.div>

      {c.status === 'pending' && (
        <motion.p {...rise(1)} className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
          <Info size={16} className="mt-0.5 shrink-0" /> This campaign is waiting for an admin to review it. Only you and the admins can see it now.
        </motion.p>
      )}
      {c.status === 'rejected' && (
        <motion.p {...rise(1)} className="mt-4 flex items-start gap-2 rounded-xl bg-rose-50 p-4 text-sm text-rose-700">
          <XCircle size={16} className="mt-0.5 shrink-0" /> This campaign was not approved{c.rejectionReason ? `: ${c.rejectionReason}` : '.'}
        </motion.p>
      )}
      {c.status === 'completed' && (
        <motion.p {...rise(1)} className="mt-4 rounded-xl bg-indigo-50 p-4 text-sm text-indigo-800">
          The goal was reached. Thank you to everyone who gave.
        </motion.p>
      )}
      {c.status === 'closed' && (
        <motion.p {...rise(1)} className="mt-4 rounded-xl bg-slate-100 p-4 text-sm text-slate-600">
          This campaign is closed. You can still see where the money went.
        </motion.p>
      )}

      <div className="mt-6 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <motion.div {...rise(1)}>
            <div
              className="relative aspect-[16/10] overflow-hidden rounded-3xl border border-white/50"
              style={{ background: 'linear-gradient(135deg, #D1FAE5, #E0E7FF)' }}
            >
              {photos.length > 0 ? (
                <AnimatePresence mode="wait">
                  <motion.img
                    key={photo}
                    src={imageSrc(photos[photo])}
                    alt=""
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </AnimatePresence>
              ) : (
                <div className="flex h-full items-center justify-center text-emerald-500/60">
                  <HeartHandshake size={56} />
                </div>
              )}
            </div>

            {photos.length > 1 && (
              <div className="mt-3 flex gap-3">
                {photos.map((url, i) => (
                  <motion.button
                    key={url}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => setPhoto(i)}
                    className={`h-16 w-24 overflow-hidden rounded-xl border-2 ${i === photo ? 'border-emerald-500' : 'border-transparent opacity-70'}`}
                  >
                    <img src={imageSrc(url)} alt="" className="h-full w-full object-cover" />
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div {...rise(2)} className="mt-6">
            <div className="flex flex-wrap items-center gap-2">
              {c.isVerified && <VerifiedBadge />}
              <Pill info={statusInfo[c.status] || statusInfo.pending} />
            </div>
            <h1 className="mt-3 text-3xl font-semibold leading-tight text-slate-900">{c.title}</h1>
            <div className="mt-4 flex flex-col gap-1.5 text-sm text-slate-600">
              <span className="flex items-center gap-2"><UserRound size={15} /> Patient: {c.patientName}</span>
              <span className="flex items-center gap-2"><Building2 size={15} /> {c.hospital?.name}{c.hospital?.address ? `, ${c.hospital.address}` : ''}</span>
              <span className="flex items-center gap-2"><MapPin size={15} /> {place}</span>
              <span className="flex items-center gap-2"><HeartHandshake size={15} /> Started by {c.ownerName}</span>
            </div>
          </motion.div>

          <motion.div {...rise(3)} className="mt-8">
            <div className="flex gap-1 border-b border-slate-200">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`relative px-4 py-3 text-sm font-medium transition-colors ${tab === t.id ? 'text-emerald-700' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  {t.label}
                  {t.count > 0 && (
                    <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">{t.count}</span>
                  )}
                  {tab === t.id && (
                    <motion.span
                      layoutId="campaign-tab"
                      className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-emerald-600"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                </button>
              ))}
            </div>

            <div className="mt-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={tab}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  {tab === 'story' && (
                    <div className={cardClass}>
                      <p className="whitespace-pre-line text-base leading-relaxed text-slate-700">{c.story}</p>
                    </div>
                  )}
                  {tab === 'donors' && <DonorsList donors={donors} />}
                  {tab === 'ledger' && <Ledger campaign={c} expenses={expenses} isAdmin={isAdmin} onDelete={removeExpense} />}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>

          {c.canManage && SHOWN.includes(c.status) && <ManagePanel campaign={c} onChanged={load} />}
        </div>

        <motion.aside {...rise(2)} className="lg:sticky lg:top-24 lg:h-fit">
          <div className={`${cardClass} p-6`}>
            <div className="flex items-center gap-5">
              <ProgressRing value={p} />
              <div>
                <p className="text-xs text-slate-600">Raised</p>
                <p className="mono text-2xl text-slate-900"><TakaCount key={c.raised} value={c.raised} /></p>
                <p className="text-xs text-slate-600">of {taka(c.targetAmount)}</p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 text-center">
              <div className="rounded-xl bg-white/70 p-3">
                <p className="mono text-lg text-slate-900">{c.donorCount}</p>
                <p className="text-xs text-slate-600">Donors</p>
              </div>
              <div className="rounded-xl bg-white/70 p-3">
                <p className="mono text-lg text-slate-900">{taka(c.spent)}</p>
                <p className="text-xs text-slate-600">Spent</p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: canDonate ? 1.02 : 1 }}
              whileTap={{ scale: canDonate ? 0.97 : 1 }}
              disabled={!canDonate}
              onClick={() => setOpen(true)}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3.5 text-sm font-medium text-white shadow-lg shadow-emerald-600/25 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <HeartHandshake size={18} /> {canDonate ? 'Donate now' : 'Not taking donations'}
            </motion.button>

            <button
              onClick={share}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300/70 bg-white/80 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-white"
            >
              <Share2 size={16} /> Share
            </button>

            {SHOWN.includes(c.status) && c.status !== 'closed' && (
              <div className="mt-5 border-t border-slate-200/70 pt-4">
                <ReportCampaign campaignId={c._id} />
              </div>
            )}
          </div>
        </motion.aside>
      </div>

      {canDonate && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/60 bg-white/90 p-4 backdrop-blur-xl lg:hidden">
          <div className="mx-auto flex max-w-md items-center gap-4">
            <div className="min-w-0 flex-1">
              <p className="mono truncate text-sm font-semibold text-slate-900">{taka(c.raised)} <span className="font-normal text-slate-500">of {taka(c.targetAmount)}</span></p>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-emerald-600" style={{ width: `${p}%` }} />
              </div>
            </div>
            <button onClick={() => setOpen(true)} className="shrink-0 rounded-full bg-emerald-600 px-6 py-3 text-sm font-medium text-white">
              Donate
            </button>
          </div>
        </div>
      )}

      <AnimatePresence>
        {open && <DonateModal campaign={c} onClose={() => { setOpen(false); load(); }} />}
      </AnimatePresence>
    </main>
  );
}