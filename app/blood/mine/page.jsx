'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ClipboardList, Droplet, HeartHandshake, Plus } from 'lucide-react';
import RoleGate from '../../../components/RoleGate';
import BloodRequestCard from '../../../components/blood/BloodRequestCard';
import { EmptyState, Skeleton } from '../../../components/blood/ui';
import { API_BASE, apiFetch } from '../../../lib/api';

function Activity() {
  const [tab, setTab] = useState('feed');
  const [feed, setFeed] = useState(null);
  const [mine, setMine] = useState(null);

  useEffect(() => {
    apiFetch(`${API_BASE}/blood/feed`)
      .then((res) => (res.ok ? res.json() : { items: [], isDonor: false }))
      .then(setFeed)
      .catch(() => setFeed({ items: [], isDonor: false }));

    apiFetch(`${API_BASE}/blood/mine`)
      .then((res) => (res.ok ? res.json() : { requests: [], offers: [] }))
      .then(setMine)
      .catch(() => setMine({ requests: [], offers: [] }));
  }, []);

  const tabs = [
    { id: 'feed', label: 'For you', count: feed?.items.length },
    { id: 'requests', label: 'My requests', count: mine?.requests.length },
    { id: 'offers', label: 'My offers', count: mine?.offers.length },
  ];

  function renderTab() {
    const loadingNow = (tab === 'feed' && !feed) || (tab !== 'feed' && !mine);
    if (loadingNow) {
      return (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-56" />)}
        </div>
      );
    }

    if (tab === 'feed') {
      if (!feed.isDonor) {
        return (
          <EmptyState icon={HeartHandshake} title="Join as a donor" text="Requests that match your blood group and district will show up here.">
            <Link href="/blood/donor" className="mt-1 rounded-full bg-rose-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-rose-700">
              Become a donor
            </Link>
          </EmptyState>
        );
      }
      if (feed.items.length === 0) {
        return <EmptyState icon={Droplet} title="Nothing for you right now" text="When someone near you needs your blood group, it will appear here." />;
      }
    }

    if (tab === 'requests' && mine.requests.length === 0) {
      return (
        <EmptyState icon={ClipboardList} title="You have not asked for blood" text="Your requests will be listed here.">
          <Link href="/blood/request" className="mt-1 flex items-center gap-2 rounded-full bg-rose-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-rose-700">
            <Plus size={16} /> Ask for blood
          </Link>
        </EmptyState>
      );
    }

    if (tab === 'offers' && mine.offers.length === 0) {
      return <EmptyState icon={HeartHandshake} title="No offers yet" text="When you say you can donate, the request is saved here." />;
    }

    const list = tab === 'feed' ? feed.items : tab === 'requests' ? mine.requests : mine.offers;
    return (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((r, i) => <BloodRequestCard key={r._id} request={r} index={i} />)}
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-14">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-lg shadow-rose-600/25">
          <ClipboardList size={24} />
        </span>
        <h1 className="mt-4 text-3xl font-semibold text-slate-900">My blood activity</h1>
      </motion.div>

      <div className="mt-8 flex gap-1 border-b border-slate-200">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`relative px-5 py-3 text-sm font-medium transition-colors ${tab === t.id ? 'text-rose-600' : 'text-slate-600 hover:text-slate-900'}`}
          >
            {t.label}
            {t.count > 0 && (
              <span className="ml-2 rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700">{t.count}</span>
            )}
            {tab === t.id && (
              <motion.span
                layoutId="mine-tab"
                className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-rose-600"
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
            {renderTab()}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}

export default function MyBloodPage() {
  return (
    <RoleGate roles={['user']} deniedText="Please log in to see your blood activity.">
      <Activity />
    </RoleGate>
  );
}