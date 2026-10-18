'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { VEHICLES } from '../lib/newsOptions';
import { divisionList, districtOptions, upazilaOptions } from '../lib/locationOptions';
import { bdLocations } from '../lib/bdLocations';

const field = 'w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2.5 text-sm text-slate-700';
const label = 'mb-1 block text-xs font-medium text-slate-600';

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
    <form onSubmit={submit} className="space-y-4 rounded-2xl border border-white/50 bg-white/50 p-5 backdrop-blur-xl">
      <div className="flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search news by word, road or place"
          className={field}
        />
        <button className="flex shrink-0 items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800">
          <Search size={16} /> Search
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label htmlFor="f-division" className={label}>Division</label>
          <select id="f-division" value={division} onChange={onDivisionChange} className={field}>
            <option value="">All divisions</option>
            {divisionList.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="f-district" className={label}>District</label>
          <select id="f-district" value={district} onChange={onDistrictChange} className={field}>
            <option value="">All districts</option>
            {districts.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="f-area" className={label}>Upazila</label>
          <select id="f-area" value={areaKey} onChange={(e) => setAreaKey(e.target.value)} className={field}>
            <option value="">All upazilas</option>
            {upazilas.map((u) => (
              <option key={u.key} value={u.key}>{district ? u.name : `${u.name} (${u.district})`}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="f-vehicle" className={label}>Vehicle</label>
          <select id="f-vehicle" value={vehicle} onChange={(e) => setVehicle(e.target.value)} className={field}>
            <option value="">Any vehicle</option>
            {VEHICLES.map((v) => <option key={v.value} value={v.value}>{v.label}</option>)}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={verifiedOnly}
            onChange={(e) => setVerifiedOnly(e.target.checked)}
            className="h-4 w-4 accent-emerald-600"
          />
          Verified news only
        </label>

        {anyFilter && (
          <button
            type="button"
            onClick={clearAll}
            className="flex items-center gap-1 rounded-full bg-white/70 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-white"
          >
            <X size={12} /> Clear all
          </button>
        )}
      </div>
    </form>
  );
}