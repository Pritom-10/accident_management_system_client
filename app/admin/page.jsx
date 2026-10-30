'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Coins, Droplet, FileWarning,MessageSquare,LayoutDashboard, HeartHandshake, History, Lock, Newspaper, ShieldCheck, Siren, UserSearch, Users, Scale,Building2, BadgeCheck } from 'lucide-react';
import { useAuth } from '../../components/AuthProvider';
import { useAdminData } from '../../lib/useAdminData';
import SosTab from '../../components/admin/SosTab';
import ReportsTab from '../../components/admin/ReportsTab';
import NewsTab from '../../components/admin/NewsTab';
import BloodTab from '../../components/admin/BloodTab';
import CampaignsTab from '../../components/admin/CampaignsTab';
import VolunteersTab from '../../components/admin/VolunteersTab';
import PatientsTab from '../../components/admin/PatientsTab';
import UsersTab from '../../components/admin/UsersTab';
import ActivityTab from '../../components/admin/ActivityTab';
import OverviewTab from '../../components/admin/OverviewTab';
import CommentsTab from '../../components/admin/CommentsTab';
import DisputesTab from '../../components/admin/DisputesTab';
import HospitalsTab from '../../components/admin/HospitalsTab';
import VerificationsTab from '../../components/admin/VerificationsTab';
import HelpOrgsTab from '../../components/admin/HelpOrgsTab';

const views = {
  overview: OverviewTab,
  sos: SosTab,
  reports: ReportsTab,
  patients: PatientsTab,
  news: NewsTab,
  blood: BloodTab,
  campaigns: CampaignsTab,
  volunteers: VolunteersTab,
  users: UsersTab,
  activity: ActivityTab,
  comments: CommentsTab,
  disputes: DisputesTab,
  hospitals: HospitalsTab,
  verifications: VerificationsTab,
  helporgs: HelpOrgsTab
};

function Notice({ icon, title, text, children }) {
  return (
    <main className="mx-auto max-w-lg px-6 py-20 text-center">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/80 text-slate-600 shadow-md">{icon}</span>
      <h1 className="mt-5 text-2xl font-semibold text-slate-900">{title}</h1>
      <p className="mt-2 text-sm text-slate-600">{text}</p>
      <div className="mt-6">{children}</div>
    </main>
  );
}

function NavButton({ item, row, active, onSelect }) {
  const Icon = item.icon;

  return (
    <button
      onClick={() => onSelect(item.id)}
      aria-current={active ? 'page' : undefined}
      className={`relative flex items-center gap-3 rounded-2xl text-sm font-medium transition-colors ${
        row ? 'w-full px-4 py-3' : 'shrink-0 whitespace-nowrap px-4 py-2.5'
      }`}
    >
      {active && (
        <motion.span
          layoutId={row ? 'admin-side' : 'admin-top'}
          className="absolute inset-0 rounded-2xl bg-slate-900 shadow-lg shadow-slate-900/20"
          transition={{ type: 'spring', stiffness: 400, damping: 32 }}
        />
      )}
      <span className={`relative flex flex-1 items-center gap-3 ${active ? 'text-white' : 'text-slate-700'}`}>
        <Icon size={17} className={item.hot && !active ? 'text-rose-600' : ''} />
        <span className="text-left">{item.label}</span>
      </span>
      {item.badge > 0 && (
        <span
          className={`relative rounded-full px-2 py-0.5 text-xs font-semibold ${
            item.hot ? 'animate-pulse bg-rose-600 text-white' : active ? 'bg-white text-slate-900' : 'bg-rose-600 text-white'
          }`}
        >
          {item.badge}
        </span>
      )}
    </button>
  );
}

function AdminPanel() {
  const [tab, setTab] = useState('overview');
  const { data: stats, reload } = useAdminData('/stats');

  useEffect(() => {
    reload();
  }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

  const groups = useMemo(
    () => [
            { title: 'Dashboard', items: [{ id: 'overview', label: 'Overview', icon: LayoutDashboard }] },
      {
        title: 'Emergency',
        items: [
          { id: 'sos', label: 'SOS', icon: Siren, badge: stats.activeSos, hot: true },
          { id: 'reports', label: 'Reports', icon: FileWarning, badge: (stats.pendingReports || 0) + (stats.flaggedReports || 0) },
          { id: 'patients', label: 'Unidentified patients', icon: UserSearch, badge: stats.pendingPatients },
        ],
      },
      {
        title: 'Content',
        items: [
          { id: 'news', label: 'News', icon: Newspaper, badge: stats.pendingNews },
          { id: 'blood', label: 'Blood', icon: Droplet },
          { id: 'campaigns', label: 'Campaigns', icon: Coins, badge: (stats.pendingCampaigns || 0) + (stats.flaggedCampaigns || 0) },
          { id: 'hospitals', label: 'Hospitals', icon: Building2 },
          { id: 'disputes', label: 'Disputes', icon: Scale, badge: stats.openDisputes },
          { id: 'comments', label: 'Comments', icon: MessageSquare, badge: stats.reportedComments },
          { id: 'helporgs', label: 'Help groups', icon: Scale },
        ],
      },
      {
        title: 'People',
        items: [
          { id: 'volunteers', label: 'Volunteers', icon: HeartHandshake, badge: stats.pendingVolunteers },
          { id: 'users', label: 'Users', icon: Users },
          { id: 'verifications', label: 'Verification', icon: BadgeCheck },
        ],
      },
      { title: 'System', items: [{ id: 'activity', label: 'Activity log', icon: History }] },
    ],
    [stats]
  );

  const flat = groups.flatMap((g) => g.items);
  const attention = flat.reduce((sum, i) => sum + (i.badge || 0), 0);
  const View = views[tab];

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 md:py-12">
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg shadow-slate-900/25">
            <ShieldCheck size={24} />
          </span>
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Admin panel</h1>
            <p className="text-sm text-slate-600">Approve, review and keep the site safe.</p>
          </div>
        </div>

        <div
          className={`flex items-center gap-3 rounded-full px-5 py-2.5 text-sm font-medium ${
            attention > 0 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
          }`}
        >
          <span className="relative flex h-2.5 w-2.5">
            {attention > 0 && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-500 opacity-75" />}
            <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${attention > 0 ? 'bg-rose-600' : 'bg-emerald-600'}`} />
          </span>
          {attention > 0 ? `${attention} ${attention === 1 ? 'item needs' : 'items need'} your attention` : 'All caught up'}
        </div>
      </motion.div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[16rem_1fr]">
          <aside className="no-print hidden lg:block">
          <div className="sticky top-24 space-y-5 rounded-3xl border border-white/60 bg-white/60 p-3 shadow-md shadow-slate-900/5 backdrop-blur-xl">
            {groups.map((g) => (
              <div key={g.title}>
                <p className="px-4 pb-1.5 text-[11px] font-semibold uppercase tracking-widest text-slate-400">{g.title}</p>
                <div className="space-y-1">
                  {g.items.map((item) => (
                    <NavButton key={item.id} item={item} row active={tab === item.id} onSelect={setTab} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>

        <div className="min-w-0">
            <div className="no-print no-scrollbar -mx-4 overflow-x-auto px-4 lg:hidden">
            <div className="flex w-max gap-1 rounded-3xl border border-white/60 bg-white/70 p-1.5 backdrop-blur-xl">
              {flat.map((item) => (
                <NavButton key={item.id} item={item} active={tab === item.id} onSelect={setTab} />
              ))}
            </div>
          </div>

          <div className="mt-5 lg:mt-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
              <View onNavigate={setTab} stats={stats} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function AdminPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return <main className="mx-auto max-w-lg px-6 py-20 text-center text-sm text-slate-600">Loading...</main>;
  }

  if (!user) {
    return (
      <Notice icon={<Lock size={28} />} title="Please log in" text="The admin panel is only for logged-in admins.">
        <Link href="/login" className="rounded-full bg-indigo-600 px-6 py-3 text-sm font-medium text-white hover:bg-indigo-700">
          Login
        </Link>
      </Notice>
    );
  }

  if (!user.roles.includes('admin')) {
    return (
      <Notice icon={<Lock size={28} />} title="Admins only" text="Your account does not have permission to open this page.">
        <Link href="/" className="rounded-full border border-slate-300/70 bg-white/80 px-6 py-3 text-sm font-medium text-slate-700">
          Back to home
        </Link>
      </Notice>
    );
  }

  return <AdminPanel />;
}