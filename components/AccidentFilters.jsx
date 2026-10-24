'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { divisionList, districtOptions, upazilaOptions } from '../lib/locationOptions';
import { bdLocations } from '../lib/bdLocations';
import { fieldClass, glass } from './ui/kit';

const label = 'mb-1.5 block text-xs font-medium text-slate-600';
const pills = [
  ['', 'All cases'],
  ['rescue_in_progress', 'Rescue in progress'],
  ['cleared', 'Cleared'],
];

export default function AccidentFilters({ initial }) {
  const router = useRouter();
  const [division, setDivision] = useState(initial.division || '');
  const [district, setDistrict] = useState(initial.district || '');
  const [areaKey, setAreaKey] = useState(initial.district && initial.area ? `${initial.district}::${initial.area}` : '');
  const [status, setStatus] = useState(initial.status || '');

  const districts = districtOptions(division);
  const upazilas = upazilaOptions(division, district);
  const selectedUpazila = upazilas.find((u) => u.key === areaKey);

  function onDivisionChange(e) {
    const value = e.target.value;
    setDivision(value);
    if (!value) return;
    if (district && !bdLocations[value]?.[district]) setDistrict('');
    if (selectedUpazila && selectedUpazila.division !== value) setAreaKey('');
  }

  function onDistrictChange(e) {
    const value = e.target.value;
    setDistrict(value);
    if (value && selectedUpazila && selectedUpazila.district !== value) setAreaKey('');
  }

  function submit(e) {
    e.preventDefault();
    const p = new URLSearchParams();
    if (division) p.set('division', division);
    if (selectedUpazila) {
      p.set('district', selectedUpazila.district);
      p.set('area', selectedUpazila.name);
    } else if (district) {
      p.set('district', district);
    }
    if (status) p.set('status', status);

    const qs = p.toString();
    router.push(qs ? `/accidents?${qs}` : '/accidents');
  }

  function clearAll() {
    setDivision('');
    setDistrict('');
    setAreaKey('');
    setStatus('');
    router.push('/accidents');
  }

  const anyFilter = division || district || areaKey || status;

  return (
    <form onSubmit={submit} className={`${glass} space-y-5 p-5 md:p-6`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <SlidersHorizontal size={16} /> Filter cases
        </p>
        <div className="flex gap-1 rounded-full bg-white/70 p-1">
          {pills.map(([value, text]) => (
            <button key={text} type="button" onClick={() => setStatus(value)} className="relative rounded-full px-4 py-1.5 text-xs font-medium">
              {status === value && (
                <motion.span
                  layoutId="acc-status"
                  className="absolute inset-0 rounded-full bg-slate-900"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              <span className={`relative ${status === value ? 'text-white' : 'text-slate-700'}`}>{text}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label htmlFor="a-division" className={label}>Division</label>
          <select id="a-division" value={division} onChange={onDivisionChange} className={fieldClass}>
            <option value="">All divisions</option>
            {divisionList.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="a-district" className={label}>District</label>
          <select id="a-district" value={district} onChange={onDistrictChange} className={fieldClass}>
            <option value="">All districts</option>
            {districts.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="a-area" className={label}>Upazila</label>
          <select id="a-area" value={areaKey} onChange={(e) => setAreaKey(e.target.value)} className={fieldClass}>
            <option value="">All upazilas</option>
            {upazilas.map((u) => (
              <option key={u.key} value={u.key}>{district ? u.name : `${u.name} (${u.district})`}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          className="flex items-center gap-2 rounded-full bg-slate-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
        >
          <Search size={16} /> Search
        </motion.button>
        {anyFilter && (
          <button type="button" onClick={clearAll} className="flex items-center gap-1 rounded-full bg-white/80 px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-white">
            <X size={12} /> Clear all
          </button>
        )}
      </div>
    </form>
  );
}