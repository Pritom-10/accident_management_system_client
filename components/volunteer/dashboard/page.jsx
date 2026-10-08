'use client';

import { useState } from 'react';
import { LayoutDashboard, BedDouble, UserSearch } from 'lucide-react';
import PatientCountPanel from '../../../components/volunteer/PatientCountPanel';
import UnidentifiedPatientPanel from '../../../components/volunteer/UnidentifiedPatientPanel';

const tabs = [
  { id: 'count', label: 'Patient count', icon: BedDouble },
  { id: 'unidentified', label: 'Unidentified patient', icon: UserSearch },
];

export default function VolunteerDashboardPage() {
  const [tab, setTab] = useState('count');

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