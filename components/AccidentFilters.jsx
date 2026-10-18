'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { divisionList, districtOptions, upazilaOptions } from '../lib/locationOptions';
import { bdLocations } from '../lib/bdLocations';

const field = 'w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2.5 text-sm text-slate-700';
const label = 'mb-1 block text-xs font-medium text-slate-600';

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
    <form onSubmit={submit} className="space-y-4 rounded-2xl border border-white/50 bg-white/50 p-5 backdrop-blur-xl">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label htmlFor="a-division" className={label}>Division</label>
          <select id="a-division" value={division} onChange={onDivisionChange} className={field}>
            <option value="">All divisions</option>
            {divisionList.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="a-district" className={label}>District</label>
          <select id="a-district" value={district} onChange={onDistrictChange} className={field}>
            <option value="">All districts</option>
            {districts.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="a-area" className={label}>Upazila</label>
          <select id="a-area" value={areaKey} onChange={(e) => setAreaKey(e.target.value)} className={field}>
            <option value="">All upazilas</option>
            {upazilas.map((u) => (
              <option key={u.key} value={u.key}>{district ? u.name : `${u.name} (${u.district})`}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="a-status" className={label}>Status</label>
          <select id="a-status" value={status} onChange={(e) => setStatus(e.target.value)} className={field}>
            <option value="">All</option>
            <option value="rescue_in_progress">Rescue in progress</option>
            <option value="cleared">Cleared</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800">
          <Search size={16} /> Search
        </button>
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