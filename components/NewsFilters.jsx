'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { BadgeCheck, Search, X } from 'lucide-react';
import { VEHICLES } from '../lib/newsOptions';
import { divisionList, districtOptions, upazilaOptions } from '../lib/locationOptions';
import { bdLocations } from '../lib/bdLocations';
import { Switch, fieldClass, glass } from './ui/kit';

const label = 'mb-1.5 block text-xs font-medium text-slate-600';

export default function NewsFilters({ initial }) {
  const router = useRouter();
  const [q, setQ] = useState(initial.q || '');
  const [division, setDivision] = useState(initial.division || '');
  const [district, setDistrict] = useState(initial.district || '');
  const [areaKey, setAreaKey] = useState(initial.district && initial.area ? `${initial.district}::${initial.area}` : '');
  const [vehicle, setVehicle] = useState(initial.vehicle || '');
  const [verifiedOnly, setVerifiedOnly] = useState(initial.verified === '1');

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
    if (q.trim()) p.set('q', q.trim());
    if (division) p.set('division', division);
    if (selectedUpazila) {
      p.set('district', selectedUpazila.district);
      p.set('area', selectedUpazila.name);
    } else if (district) {
      p.set('district', district);
    }
    if (vehicle) p.set('vehicle', vehicle);
    if (verifiedOnly) p.set('verified', '1');

    const qs = p.toString();
    router.push(qs ? `/news?${qs}` : '/news');
  }

  function clearAll() {
    setQ('');
    setDivision('');
    setDistrict('');
    setAreaKey('');
    setVehicle('');
    setVerifiedOnly(false);
    router.push('/news');
  }

  const anyFilter = q || division || district || areaKey || vehicle || verifiedOnly;

  return (
    <form onSubmit={submit} className={`${glass} space-y-5 p-5 md:p-6`}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search news by word, road or place"
            className={`${fieldClass} py-3 pl-10`}
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          className="shrink-0 rounded-xl bg-slate-900 px-6 text-sm font-medium text-white hover:bg-slate-800"
        >
          Search
        </motion.button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label htmlFor="f-division" className={label}>Division</label>
          <select id="f-division" value={division} onChange={onDivisionChange} className={fieldClass}>
            <option value="">All divisions</option>
            {divisionList.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="f-district" className={label}>District</label>
          <select id="f-district" value={district} onChange={onDistrictChange} className={fieldClass}>
            <option value="">All districts</option>
            {districts.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="f-area" className={label}>Upazila</label>
          <select id="f-area" value={areaKey} onChange={(e) => setAreaKey(e.target.value)} className={fieldClass}>
            <option value="">All upazilas</option>
            {upazilas.map((u) => (
              <option key={u.key} value={u.key}>{district ? u.name : `${u.name} (${u.district})`}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="f-vehicle" className={label}>Vehicle</label>
          <select id="f-vehicle" value={vehicle} onChange={(e) => setVehicle(e.target.value)} className={fieldClass}>
            <option value="">Any vehicle</option>
            {VEHICLES.map((v) => <option key={v.value} value={v.value}>{v.label}</option>)}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-700">
          <Switch checked={verifiedOnly} onChange={setVerifiedOnly} label="Verified news only" />
          <span className="flex items-center gap-1.5"><BadgeCheck size={15} className="text-emerald-600" /> Verified news only</span>
        </label>

        {anyFilter && (
          <button type="button" onClick={clearAll} className="flex items-center gap-1 rounded-full bg-white/80 px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-white">
            <X size={12} /> Clear all
          </button>
        )}
      </div>
    </form>
  );
}