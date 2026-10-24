'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Ambulance, BedDouble, Building2, Flame, MapPin, Phone, Search, ShieldAlert, Siren, X } from 'lucide-react';
import { fieldClass } from '../ui/kit';

const types = [
  { id: '', label: 'All', icon: Building2 },
  { id: 'hospital', label: 'Hospitals', icon: Building2 },
  { id: 'ambulance', label: 'Ambulance', icon: Ambulance },
  { id: 'fire_service', label: 'Fire service', icon: Flame },
  { id: 'police', label: 'Police', icon: ShieldAlert },
  { id: 'other', label: 'Other', icon: Siren },
];

const tones = {
  hospital: 'bg-sky-100 text-sky-600',
  ambulance: 'bg-rose-100 text-rose-600',
  fire_service: 'bg-orange-100 text-orange-600',
  police: 'bg-indigo-100 text-indigo-600',
  other: 'bg-slate-100 text-slate-600',
};

const iconFor = (type) => (types.find((t) => t.id === type) || types[1]).icon;

export default function HospitalExplorer({ hospitals = [] }) {
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const [district, setDistrict] = useState('');

  const items = useMemo(() => hospitals.filter((h) => !h.isPinned), [hospitals]);
  const districts = useMemo(
    () => [...new Set(items.map((h) => h.district).filter((d) => d && d !== 'All'))].sort((a, b) => a.localeCompare(b)),
    [items]
  );
  const counts = useMemo(() => {
    const out = { '': items.length };
    items.forEach((h) => {
      out[h.type] = (out[h.type] || 0) + 1;
    });
    return out;
  }, [items]);

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return items
      .filter((h) => !type || h.type === type)
      .filter((h) => !district || h.district === district)
      .filter((h) => !needle || `${h.name} ${h.address || ''} ${h.district || ''}`.toLowerCase().includes(needle))
      .sort((a, b) => (b.patientCount || 0) - (a.patientCount || 0) || a.name.localeCompare(b.name));
  }, [items, q, type, district]);

  const anyFilter = q || type || district;

  return (
    <div>
      <motion.a
        href="tel:999"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative mt-6 flex items-center justify-between gap-4 overflow-hidden rounded-3xl bg-gradient-to-br from-rose-500 to-rose-700 p-6 text-white shadow-xl shadow-rose-600/25 transition-transform hover:scale-[1.01]"
      >
        <span className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 animate-ping rounded-full bg-white/10" />
        <div className="relative flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20">
            <Siren size={26} />
          </span>
          <div>
            <p className="text-lg font-semibold">National emergency</p>
            <p className="text-sm text-rose-100">Police, fire and ambulance. Free, any time.</p>
          </div>
        </div>
        <span className="mono relative flex items-center gap-2 rounded-full bg-white px-6 py-3 text-xl font-semibold text-rose-600">
          <Phone size={18} /> 999
        </span>
      </motion.a>

      <div className="mt-6 space-y-4 rounded-3xl border border-white/60 bg-white/60 p-5 shadow-md shadow-slate-900/5 backdrop-blur-xl">
        <div className="flex flex-wrap gap-3">
          <div className="relative min-w-[14rem] flex-1">
            <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, address or district" className={`${fieldClass} py-3 pl-10`} />
          </div>
          <select value={district} onChange={(e) => setDistrict(e.target.value)} className={`${fieldClass} sm:w-52`}>
            <option value="">All districts</option>
            {districts.map((d) => <option key={d}>{d}</option>)}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {types.filter((t) => t.id === '' || counts[t.id]).map((t) => {
            const Icon = t.icon;
            const active = type === t.id;
            return (
              <button key={t.id || 'all'} onClick={() => setType(t.id)} className="relative flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium">
                {active && (
                  <motion.span layoutId="hosp-type" className="absolute inset-0 rounded-full bg-slate-900" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />
                )}
                <span className={`relative flex items-center gap-1.5 ${active ? 'text-white' : 'text-slate-700'}`}>
                  <Icon size={14} /> {t.label} <span className={active ? 'text-white/70' : 'text-slate-400'}>{counts[t.id] || 0}</span>
                </span>
              </button>
            );
          })}
          {anyFilter && (
            <button onClick={() => { setQ(''); setType(''); setDistrict(''); }} className="ml-auto flex items-center gap-1 rounded-full bg-white/80 px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-white">
              <X size={12} /> Clear all
            </button>
          )}
        </div>
      </div>

      <p className="mt-6 text-sm text-slate-600">
        {list.length} {list.length === 1 ? 'place' : 'places'}{anyFilter ? ' match your search' : ''}
      </p>

      {list.length === 0 ? (
        <div className="mt-4 rounded-3xl border border-white/60 bg-white/50 p-10 text-center text-sm text-slate-600 backdrop-blur-xl">
          {anyFilter ? 'Nothing matches this search. Try fewer filters.' : 'No hospitals have been added yet.'}
        </div>
      ) : (
        <motion.div layout className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {list.map((h) => {
              const Icon = iconFor(h.type);
              const count = h.patientCount || 0;
              return (
                <motion.div
                  key={h._id}
                  layout
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  transition={{ duration: 0.25 }}
                  whileHover={{ y: -4 }}
                  className="flex flex-col gap-4 rounded-3xl border border-white/60 bg-white/60 p-5 shadow-md shadow-slate-900/5 backdrop-blur-xl transition-shadow hover:shadow-xl"
                >
                  <div className="flex items-start gap-3">
                    <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${tones[h.type] || tones.other}`}>
                      <Icon size={22} />
                    </span>
                    <div className="min-w-0">
                      <p className="line-clamp-2 text-base font-semibold leading-snug text-slate-900">{h.name}</p>
                      <p className="mt-1 flex items-start gap-1.5 text-xs text-slate-600">
                        <MapPin size={12} className="mt-0.5 shrink-0" />
                        <span className="line-clamp-2">{[h.address, h.district].filter((x) => x && x !== 'All' && x !== 'Nationwide').join(', ') || 'Address not given'}</span>
                      </p>
                    </div>
                  </div>

                  {h.type === 'hospital' && (
                    <p className={`flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${count > 0 ? 'bg-indigo-100 text-indigo-700' : 'bg-white/80 text-slate-600'}`}>
                      <BedDouble size={14} /> {count > 0 ? `${count} ${count === 1 ? 'patient' : 'patients'} admitted` : 'No patients reported'}
                    </p>
                  )}

                  <a href={`tel:${h.phone}`} className="mt-auto flex items-center justify-center gap-2 rounded-full bg-slate-900 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-800">
                    <Phone size={15} /> {h.phone}
                  </a>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}