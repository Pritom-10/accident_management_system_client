'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Coins, Eye, HeartHandshake, Plus, Receipt, Search, ShieldCheck, Wallet, X } from 'lucide-react';
import { API_BASE } from '../../lib/api';
import CampaignCard from '../../components/donate/CampaignCard';
import { TakaCount } from '../../components/donate/ui';
import { CountUp, EmptyState, Skeleton } from '../../components/blood/ui';
import LocationFields, { toLocationQuery } from '../../components/LocationFields';

const PAGE_SIZE = 9;
const emptyLoc = { division: '', district: '', areaKey: '' };
const statusTabs = [['', 'Open'], ['completed', 'Goal reached'], ['closed', 'Closed']];

const floaters = [
  { left: '70%', top: '12%', size: 50, delay: 0, icon: Coins },
  { left: '86%', top: '44%', size: 34, delay: 0.8, icon: HeartHandshake },
  { left: '62%', top: '64%', size: 28, delay: 1.6, icon: Coins },
];

const howItWorks = [
  { icon: ShieldCheck, title: 'Checked by an admin', text: 'Every campaign is reviewed with the family’s documents before it goes live.' },
  { icon: Wallet, title: 'Money goes straight to the family', text: 'You pay their bKash, Nagad, Rocket or bank account. ResQ never holds your money.' },
  { icon: Eye, title: 'Everything is public', text: 'See every donation and every bill, with a photo of the receipt.' },
];

export default function DonatePage() {
  const [stats, setStats] = useState(null);
  const [qInput, setQInput] = useState('');
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [loc, setLoc] = useState(emptyLoc);
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const query = useMemo(
    () => ({ ...(q ? { q } : {}), ...(status ? { status } : {}), ...toLocationQuery(loc) }),
    [q, status, loc]
  );
  const anyFilter = Boolean(q || status || loc.division || loc.district || loc.areaKey);

  useEffect(() => {
    fetch(`${API_BASE}/donate/stats`)
      .then((res) => (res.ok ? res.json() : null))
      .then(setStats)
      .catch(() => setStats(null));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setQ(qInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [qInput]);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ ...query, page: String(page), limit: String(PAGE_SIZE) });

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setFailed(false);

    fetch(`${API_BASE}/donate/campaigns?${params.toString()}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error('failed');
        return res.json();
      })
      .then((json) => {
        setItems((prev) => (page === 1 ? json.items : [...prev, ...json.items]));
        setMeta({ total: json.total, pages: json.pages });
        setLoading(false);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setFailed(true);
        setLoading(false);
      });

    return () => controller.abort();
  }, [query, page]);

  function clearAll() {
    setQInput('');
    setQ('');
    setStatus('');
    setLoc(emptyLoc);
    setPage(1);
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="relative overflow-hidden rounded-3xl border border-white/50 p-8 shadow-xl shadow-slate-900/5 md:p-12"
        style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.16), rgba(129,140,248,0.16))' }}
      >
        {floaters.map((f, i) => {
          const Icon = f.icon;
          return (
            <motion.span
              key={i}
              className="pointer-events-none absolute text-emerald-600/25"
              style={{ left: f.left, top: f.top }}
              animate={{ y: [0, -16, 0], rotate: [0, 8, 0] }}
              transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut', delay: f.delay }}
            >
              <Icon size={f.size} />
            </motion.span>
          );
        })}

        <div className="relative max-w-xl">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/25">
            <HeartHandshake size={24} />
          </span>
          <h1 className="mt-4 text-3xl font-semibold leading-tight text-slate-900 md:text-4xl">
            Small gifts, big recoveries.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Help families pay for treatment after an accident. Every campaign is checked, and every taka is tracked in public.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Link href="/donate/start" className="flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-emerald-600/25 hover:bg-emerald-700">
                <Plus size={18} /> Start a campaign
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Link href="/donate/mine" className="flex items-center gap-2 rounded-full border border-slate-300/70 bg-white/80 px-5 py-3 text-sm font-medium text-slate-700 hover:bg-white">
                <Receipt size={18} /> My campaigns and donations
              </Link>
            </motion.div>
          </div>
        </div>

        <div className="relative mt-8 grid grid-cols-3 gap-3 md:max-w-xl">
          <div className="rounded-2xl border border-white/60 bg-white/60 p-4 backdrop-blur-xl">
            {stats ? <p className="mono text-xl text-slate-900"><TakaCount value={stats.raised} /></p> : <Skeleton className="h-7 w-20" />}
            <p className="mt-1 text-xs leading-snug text-slate-600">Raised so far</p>
          </div>
          <div className="rounded-2xl border border-white/60 bg-white/60 p-4 backdrop-blur-xl">
            {stats ? <p className="mono text-xl text-slate-900"><CountUp value={stats.activeCampaigns} /></p> : <Skeleton className="h-7 w-12" />}
            <p className="mt-1 text-xs leading-snug text-slate-600">Open campaigns</p>
          </div>
          <div className="rounded-2xl border border-white/60 bg-white/60 p-4 backdrop-blur-xl">
            {stats ? <p className="mono text-xl text-slate-900"><CountUp value={stats.donations} /></p> : <Skeleton className="h-7 w-12" />}
            <p className="mt-1 text-xs leading-snug text-slate-600">Donations</p>
          </div>
        </div>
      </motion.section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        {howItWorks.map(({ icon: Icon, title, text }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="rounded-2xl border border-white/50 bg-white/50 p-5 backdrop-blur-xl"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <Icon size={20} />
            </span>
            <p className="mt-3 text-sm font-semibold text-slate-900">{title}</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">{text}</p>
          </motion.div>
        ))}
      </section>

      <section className="mt-8 space-y-4 rounded-2xl border border-white/50 bg-white/50 p-5 backdrop-blur-xl">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[14rem] flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={qInput}
              onChange={(e) => setQInput(e.target.value)}
              placeholder="Search by patient, title or hospital"
              className="w-full rounded-xl border border-slate-200 bg-white/70 py-2.5 pl-10 pr-3 text-sm text-slate-700"
            />
          </div>
          <div className="flex gap-1 rounded-full bg-white/70 p-1">
            {statusTabs.map(([value, text]) => (
              <button
                key={text}
                onClick={() => { setStatus(value); setPage(1); }}
                className="relative rounded-full px-4 py-1.5 text-xs font-medium"
              >
                {status === value && (
                  <motion.span
                    layoutId="donate-status"
                    className="absolute inset-0 rounded-full bg-slate-900"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <span className={`relative ${status === value ? 'text-white' : 'text-slate-700'}`}>{text}</span>
              </button>
            ))}
          </div>
          {anyFilter && (
            <button onClick={clearAll} className="flex items-center gap-1 rounded-full bg-white/70 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-white">
              <X size={12} /> Clear all
            </button>
          )}
        </div>
        <LocationFields value={loc} onChange={(v) => { setLoc(v); setPage(1); }} idPrefix="camp" />
      </section>

      <p className="mt-6 text-sm text-slate-600">
        {meta.total} {meta.total === 1 ? 'campaign' : 'campaigns'}{anyFilter ? ' for this search' : ''}
      </p>

      <div className="mt-4">
        {failed ? (
          <EmptyState icon={HeartHandshake} title="Could not load the campaigns" text="Please check your connection and try again." />
        ) : loading && items.length === 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-80" />)}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={HeartHandshake}
            title={anyFilter ? 'No campaign matches this search' : 'No campaign yet'}
            text={anyFilter ? 'Try fewer filters.' : 'Be the first to start one for a family in need.'}
          >
            <Link href="/donate/start" className="mt-1 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700">
              Start a campaign
            </Link>
          </EmptyState>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((c, i) => <CampaignCard key={c._id} campaign={c} index={i % PAGE_SIZE} />)}
          </div>
        )}
      </div>

      {page < meta.pages && !failed && (
        <div className="mt-8 text-center">
          <button
            onClick={() => setPage(page + 1)}
            disabled={loading}
            className="rounded-full border border-slate-300/70 bg-white/80 px-6 py-3 text-sm font-medium text-slate-700 hover:bg-white disabled:opacity-60"
          >
            {loading ? 'Loading...' : 'Show more'}
          </button>
        </div>
      )}
    </main>
  );
}