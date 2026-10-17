'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LayoutDashboard, BedDouble, UserSearch, Lock, Clock } from 'lucide-react';
import { useAuth } from '../../../components/AuthProvider';
import PatientCountPanel from '../../../components/volunteer/PatientCountPanel';
import UnidentifiedPatientPanel from '../../../components/volunteer/UnidentifiedPatientPanel';

const tabs = [
  { id: 'count', label: 'Patient count', icon: BedDouble },
  { id: 'unidentified', label: 'Unidentified patient', icon: UserSearch },
];

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

export default function VolunteerDashboardPage() {
  const { user, loading } = useAuth();
  const [tab, setTab] = useState('count');

  if (loading) {
    return <main className="mx-auto max-w-lg px-6 py-20 text-center text-sm text-slate-600">Loading...</main>;
  }

  if (!user) {
    return (
      <Notice icon={Lock} title="Please log in" text="The volunteer dashboard is only for logged-in volunteers.">
        <Link href="/login" className="rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700">
          Login
        </Link>
      </Notice>
    );
  }

  const allowed = user.roles.includes('volunteer') || user.roles.includes('admin');

  if (!allowed) {
    const pending = user.volunteer?.status === 'pending';
    return (
      <Notice
        icon={pending ? Clock : Lock}
        title={pending ? 'Waiting for approval' : 'Volunteers only'}
        text={
          pending
            ? 'Your volunteer application has been received. An administrator will approve it soon.'
            : 'Your account is not a volunteer account.'
        }
      >
        <Link href="/" className="rounded-full border border-slate-300/70 bg-white/70 px-5 py-2.5 text-sm font-medium text-slate-700">
          Back to home
        </Link>
      </Notice>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-14">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/25">
        <LayoutDashboard size={24} />
      </span>
      <h1 className="mt-4 text-3xl font-semibold text-slate-900">Volunteer dashboard</h1>
      <p className="mt-2 max-w-xl text-sm text-slate-600">
        Keep hospital patient counts up to date and report patients who have not been identified yet.
      </p>

      <div className="mt-8 flex flex-wrap gap-2">
        {tabs.map(({ id, label, icon: Icon }) => (
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
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === 'count' ? <PatientCountPanel /> : <UnidentifiedPatientPanel />}
      </div>
    </main>
  );
}