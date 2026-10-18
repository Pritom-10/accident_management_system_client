'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, FileWarning, Newspaper, HeartHandshake, UserSearch, Users, History } from 'lucide-react';
import { useAuth } from '../../components/AuthProvider';
import { useAdminData } from '../../lib/useAdminData';
import ReportsTab from '../../components/admin/ReportsTab';
import NewsTab from '../../components/admin/NewsTab';
import VolunteersTab from '../../components/admin/VolunteersTab';
import PatientsTab from '../../components/admin/PatientsTab';
import UsersTab from '../../components/admin/UsersTab';
import ActivityTab from '../../components/admin/ActivityTab';

function Notice({ icon: Icon, title, text, children }) {
  return (
    <main className="mx-auto max-w-lg px-6 py-20 text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/70 text-slate-600">
        <Icon size={26} />
      </span>
      <h1 className="mt-4 text-2xl font-semibold text-slate-900">{title}</h1>
      <p className="mt-2 text-sm text-slate-600">{text}</p>
      <div className="mt-6">{children}</div>
    </main>
  );
}

function AdminPanel() {
  const [tab, setTab] = useState('reports');
  const { data: stats, reload: reloadStats } = useAdminData('/stats');


  useEffect(() => {
    reloadStats();
  }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

  const tabs = [
    { id: 'reports', label: 'Reports', icon: FileWarning, badge: stats.pendingReports },
    { id: 'news', label: 'News', icon: Newspaper, badge: stats.pendingNews },
    { id: 'volunteers', label: 'Volunteers', icon: HeartHandshake, badge: stats.pendingVolunteers },
    { id: 'patients', label: 'Unidentified patients', icon: UserSearch, badge: stats.pendingPatients },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'activity', label: 'Activity', icon: History },
  ];

  return (
    <main className="mx-auto max-w-6xl px-6 py-14">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg shadow-slate-900/20">
        <ShieldCheck size={24} />
      </span>
      <h1 className="mt-4 text-3xl font-semibold text-slate-900">Admin panel</h1>
      <p className="mt-2 max-w-xl text-sm text-slate-600">
        Approve reports and news, review volunteers and patients, and manage users. The number on a tab is how many are waiting.
      </p>

      <div className="mt-8 flex flex-wrap gap-2">
        {tabs.map(({ id, label, icon: Icon, badge }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-colors ${
              tab === id
                ? 'bg-slate-900 text-white'
                : 'border border-slate-300/70 bg-white/60 text-slate-700 hover:bg-white/90'
            }`}
          >
            <Icon size={16} /> {label}
            {badge > 0 && (
              <span className="rounded-full bg-rose-600 px-2 py-0.5 text-xs font-semibold text-white">{badge}</span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === 'reports' && <ReportsTab />}
        {tab === 'news' && <NewsTab />}
        {tab === 'volunteers' && <VolunteersTab />}
        {tab === 'patients' && <PatientsTab />}
        {tab === 'users' && <UsersTab />}
        {tab === 'activity' && <ActivityTab />}
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
      <Notice icon={Lock} title="Please log in" text="The admin panel is only for logged-in admins.">
        <Link href="/login" className="rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700">
          Login
        </Link>
      </Notice>
    );
  }

  if (!user.roles.includes('admin')) {
    return (
      <Notice icon={Lock} title="Admins only" text="Your account does not have permission to open this page.">
        <Link href="/" className="rounded-full border border-slate-300/70 bg-white/70 px-5 py-2.5 text-sm font-medium text-slate-700">
          Back to home
        </Link>
      </Notice>
    );
  }

  return <AdminPanel />;
}