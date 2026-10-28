'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { BellRing, HeartHandshake, Plus, Receipt, Trash2 } from 'lucide-react';
import RoleGate from '../../../components/RoleGate';
import CampaignCard from '../../../components/donate/CampaignCard';
import { MethodChip, Pill } from '../../../components/donate/ui';
import { EmptyState, Skeleton } from '../../../components/blood/ui';
import { API_BASE, apiFetch } from '../../../lib/api';
import { dateText } from '../../../lib/blood';
import { donationStatus, taka } from '../../../lib/money';
import { formatDateTime } from '../../../lib/newsOptions';

function Mine() {
  const [tab, setTab] = useState('campaigns');
  const [data, setData] = useState(null);
  const [plans, setPlans] = useState(null);

  const loadPlans = useCallback(() => {
    apiFetch(`${API_BASE}/plans`)
      .then((res) => (res.ok ? res.json() : []))
      .then(setPlans)
      .catch(() => setPlans([]));
  }, []);

  useEffect(() => {
    apiFetch(`${API_BASE}/donate/mine`)
      .then((res) => (res.ok ? res.json() : { campaigns: [], donations: [] }))
      .then(setData)
      .catch(() => setData({ campaigns: [], donations: [] }));
    loadPlans();
  }, [loadPlans]);

  async function stopPlan(plan) {
    try {
      const res = await apiFetch(`${API_BASE}/plans/${plan._id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Could not stop the reminder');
      toast.success('Reminder stopped');
      loadPlans();
    } catch (err) {
      toast.error(err.message);
    }
  }

  const tabs = [
    { id: 'campaigns', label: 'My campaigns', count: data?.campaigns.length },
    { id: 'donations', label: 'My donations', count: data?.donations.length },
    { id: 'plans', label: 'Reminders', count: plans?.length },
  ];

  function content() {
    if (tab === 'plans') {
      if (!plans) return <Skeleton className="h-32" />;
      if (plans.length === 0) {
        return <EmptyState icon={BellRing} title="No reminders" text="After you donate, choose Remind me and it will be listed here." />;
      }
      return (
        <ul className="space-y-3">
          {plans.map((p) => (
            <li key={p._id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/50 bg-white/50 p-4 backdrop-blur-xl">
              <div>
                <Link href={`/donate/${p.campaign?._id}`} className="text-sm font-semibold text-slate-900 hover:underline">
                  {p.campaign ? p.campaign.title : 'Campaign removed'}
                </Link>
                <p className="mt-0.5 text-xs text-slate-600">
                  {p.frequency === 'weekly' ? 'Every week' : 'Every month'} · next reminder {dateText(p.nextDue)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <MethodChip id={p.method} />
                <span className="mono text-sm font-semibold text-slate-900">{taka(p.amount)}</span>
                <button
                  onClick={() => stopPlan(p)}
                  aria-label="Stop this reminder"
                  className="rounded-full p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      );
    }

    if (!data) {
      return (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-72" />)}
        </div>
      );
    }

    if (tab === 'campaigns') {
      if (data.campaigns.length === 0) {
        return (
          <EmptyState icon={HeartHandshake} title="You have not started a campaign" text="Your campaigns will be listed here.">
            <Link href="/donate/start" className="mt-1 flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700">
              <Plus size={16} /> Start a campaign
            </Link>
          </EmptyState>
        );
      }
      return (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data.campaigns.map((c, i) => (
            <div key={c._id}>
              <CampaignCard campaign={c} index={i} showStatus />
              {c.status === 'rejected' && c.rejectionReason && (
                <p className="mt-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-700">Not approved: {c.rejectionReason}</p>
              )}
            </div>
          ))}
        </div>
      );
    }

    if (data.donations.length === 0) {
      return <EmptyState icon={Receipt} title="No donations yet" text="Donations you make while logged in are saved here with their receipts." />;
    }

    return (
      <ul className="space-y-3">
        {data.donations.map((d, i) => (
          <motion.li key={d._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 10) * 0.04 }}>
            <Link
              href={`/donate/receipt/${d.receiptNo}`}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/50 bg-white/50 p-4 backdrop-blur-xl transition-shadow hover:shadow-lg"
            >
              <div>
                <p className="text-sm font-semibold text-slate-900">{d.campaign ? d.campaign.title : 'Campaign removed'}</p>
                <p className="mono mt-0.5 text-xs text-slate-500">{d.receiptNo} · {formatDateTime(d.createdAt)}</p>
              </div>
              <div className="flex items-center gap-3">
                <MethodChip id={d.method} />
                <span className="mono text-sm font-semibold text-slate-900">{taka(d.amount)}</span>
                <Pill info={donationStatus[d.status] || donationStatus.pending} />
              </div>
            </Link>
          </motion.li>
        ))}
      </ul>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-14">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/25">
          <Receipt size={24} />
        </span>
        <h1 className="mt-4 text-3xl font-semibold text-slate-900">My campaigns and donations</h1>
      </motion.div>

      <div className="no-scrollbar mt-8 flex gap-1 overflow-x-auto border-b border-slate-200">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`relative shrink-0 px-5 py-3 text-sm font-medium transition-colors ${tab === t.id ? 'text-emerald-700' : 'text-slate-600 hover:text-slate-900'}`}
          >
            {t.label}
            {t.count > 0 && <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">{t.count}</span>}
            {tab === t.id && (
              <motion.span layoutId="mine-donate-tab" className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-emerald-600" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />
            )}
          </button>
        ))}
      </div>

      <div className="mt-6">
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
            {content()}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}

export default function MineDonatePage() {
  return (
    <RoleGate roles={['user']} deniedText="Please log in to see your campaigns and donations.">
      <Mine />
    </RoleGate>
  );
}