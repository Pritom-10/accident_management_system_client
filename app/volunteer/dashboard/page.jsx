'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { BedDouble, BellRing, Clock, LayoutDashboard, Lock, UserSearch } from 'lucide-react';
import { useAuth } from '../../../components/AuthProvider';
import PatientCountPanel from '../../../components/volunteer/PatientCountPanel';
import UnidentifiedPatientPanel from '../../../components/volunteer/UnidentifiedPatientPanel';
import { PageHero } from '../../../components/ui/kit';

const tabs = [
  { id: 'count', label: 'Patient count', icon: BedDouble, hint: 'Tell us how many patients are in each hospital' },
  { id: 'unidentified', label: 'Unidentified patient', icon: UserSearch, hint: 'Report a patient nobody has identified yet' },
];

function Notice({ icon, title, text, children }) {
  return (
    <main className="mx-auto max-w-lg px-6 py-20 text-center">
      <motion.span
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/80 text-slate-600 shadow-md"
      >
        {icon}
      </motion.span>
      <h1 className="mt-5 text-2xl font-semibold text-slate-900">{title}</h1>
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
      <Notice icon={<Lock size={28} />} title="Please log in" text="The volunteer dashboard is only for logged-in volunteers.">
        <Link href="/login" className="rounded-full bg-indigo-600 px-6 py-3 text-sm font-medium text-white hover:bg-indigo-700">Login</Link>
      </Notice>
    );
  }

  const allowed = user.roles.includes('volunteer') || user.roles.includes('admin');

  if (!allowed) {
    const pending = user.volunteer?.status === 'pending';
    return (
      <Notice
        icon={pending ? <Clock size={28} /> : <Lock size={28} />}
        title={pending ? 'Waiting for approval' : 'Volunteers only'}
        text={pending ? 'Your volunteer application has been received. An administrator will approve it soon.' : 'Your account is not a volunteer account.'}
      >
        <Link href="/" className="rounded-full border border-slate-300/70 bg-white/80 px-6 py-3 text-sm font-medium text-slate-700">Back to home</Link>
      </Notice>
    );
  }

  const active = tabs.find((t) => t.id === tab);
  const available = user.volunteer?.availability === 'available';

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 md:py-12">
      <PageHero
        icon={<LayoutDashboard size={24} />}
        tone="indigo"
        eyebrow="Volunteer dashboard"
        title={`Welcome, ${user.name.split(' ')[0]}`}
        subtitle="Keep hospital patient counts up to date and report patients nobody has identified yet."
        actions={
          <Link href="/sos/nearby" className="flex items-center gap-2 rounded-full bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-600/25 hover:bg-rose-700">
            <BellRing size={16} /> Nearby SOS alerts
          </Link>
        }
        aside={
          <span className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium ${available ? 'bg-emerald-100 text-emerald-700' : 'bg-white/80 text-slate-600'}`}>
            <span className="relative flex h-2 w-2">
              {available && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />}
              <span className={`relative inline-flex h-2 w-2 rounded-full ${available ? 'bg-emerald-600' : 'bg-slate-400'}`} />
            </span>
            {available ? 'Available for emergencies' : 'Not available'}
          </span>
        }
      />

      <div className="mt-6 flex flex-wrap gap-2">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)} className="relative flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium">
            {tab === id && (
              <motion.span layoutId="vol-tab" className="absolute inset-0 rounded-full bg-slate-900" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />
            )}
            <span className={`relative flex items-center gap-2 ${tab === id ? 'text-white' : 'text-slate-700'}`}>
              <Icon size={16} /> {label}
            </span>
          </button>
        ))}
      </div>
      <p className="mt-3 text-xs text-slate-500">{active.hint}</p>

      <div className="mt-5">
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
            {tab === 'count' ? <PatientCountPanel /> : <UnidentifiedPatientPanel />}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}