'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, X } from 'lucide-react';
import { bdLocations } from '../lib/bdLocations';

const select =
  'w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2.5 text-sm text-slate-700';
const label = 'mb-1 block text-xs font-medium text-slate-600';


const allDistricts = [];
const allUpazilas = []; 

for (const [division, districts] of Object.entries(bdLocations)) {
  for (const [district, upazilas] of Object.entries(districts)) {
    allDistricts.push({ division, district });
    for (const name of upazilas) {

      allUpazilas.push({ division, district, name, key: `${district}::${name}` });
    }
  }
}

const divisions = Object.keys(bdLocations);

export default function LocationSearch() {
  const [division, setDivision] = useState('');
  const [district, setDistrict] = useState('');
  const [areaKey, setAreaKey] = useState('');

  const selectedUpazila = allUpazilas.find((u) => u.key === areaKey);


  const districtOptions = (division ? allDistricts.filter((d) => d.division === division) : allDistricts)
    .map((d) => d.district)
    .sort((a, b) => a.localeCompare(b));


  const upazilaOptions = allUpazilas
    .filter((u) => (district ? u.district === district : division ? u.division === division : true))
    .sort((a, b) => a.name.localeCompare(b.name) || a.district.localeCompare(b.district));


  const showDistrictInLabel = !district;

  function onDivisionChange(e) {
    const value = e.target.value;
    setDivision(value);
    if (!value) return;

    if (district && !bdLocations[value][district]) setDistrict('');
    if (selectedUpazila && selectedUpazila.division !== value) setAreaKey('');
  }

  function onDistrictChange(e) {
    const value = e.target.value;
    setDistrict(value);
    if (value && selectedUpazila && selectedUpazila.district !== value) setAreaKey('');
  }

  function clearAll() {
    setDivision('');
    setDistrict('');
    setAreaKey('');
  }


  const params = new URLSearchParams();
  if (division) params.set('division', division);
  if (district) params.set('district', district);
  if (selectedUpazila) {
    params.set('area', selectedUpazila.name);
   
    params.set('district', selectedUpazila.district);
  }
  const href = params.toString() ? `/accidents?${params.toString()}` : '/accidents';

  const anySelected = division || district || areaKey;

  return (
    <div className="rounded-2xl border border-white/50 bg-white/50 p-6 shadow-xl shadow-slate-900/5 backdrop-blur-xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-900">Find accidents near you</p>
          <p className="mt-1 text-xs text-slate-600">Use any box on its own, or combine them.</p>
        </div>
        {anySelected && (
          <button
            type="button"
            onClick={clearAll}
            className="flex shrink-0 items-center gap-1 rounded-full bg-white/70 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-white"
          >
            <X size={12} /> Clear
          </button>
        )}
      </div>

      <div className="mt-5 space-y-3">
        <div>
          <label htmlFor="division" className={label}>Division ({divisions.length})</label>
          <select id="division" value={division} onChange={onDivisionChange} className={select}>
            <option value="">All divisions</option>
            {divisions.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="district" className={label}>District ({districtOptions.length})</label>
          <select id="district" value={district} onChange={onDistrictChange} className={select}>
            <option value="">All districts</option>
            {districtOptions.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="area" className={label}>Area / Upazila ({upazilaOptions.length})</label>
          <select id="area" value={areaKey} onChange={(e) => setAreaKey(e.target.value)} className={select}>
            <option value="">All upazilas</option>
            {upazilaOptions.map((u) => (
              <option key={u.key} value={u.key}>
                {showDistrictInLabel ? `${u.name} (${u.district})` : u.name}
              </option>
            ))}
          </select>
        </div>

        <Link
          href={href}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-3 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
        >
          <Search size={16} /> Search
        </Link>
      </div>
    </div>
  );
}