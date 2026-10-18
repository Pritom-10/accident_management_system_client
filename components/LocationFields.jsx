'use client';

import { bdLocations } from '../lib/bdLocations';
import { divisionList, districtOptions, upazilaOptions } from '../lib/locationOptions';

const field = 'w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2.5 text-sm text-slate-700';
const label = 'mb-1 block text-xs font-medium text-slate-600';

export function toLocationQuery({ division = '', district = '', areaKey = '' }) {
  const out = {};
  if (division) out.division = division;
  if (areaKey) {
    const [d, name] = areaKey.split('::');
    out.district = d;
    out.area = name;
  } else if (district) {
    out.district = district;
  }
  return out;
}

export default function LocationFields({ value, onChange, idPrefix = 'loc' }) {
  const { division = '', district = '', areaKey = '' } = value;
  const districts = districtOptions(division);
  const upazilas = upazilaOptions(division, district);
  const selected = upazilas.find((u) => u.key === areaKey);

  function changeDivision(e) {
    const next = { division: e.target.value, district, areaKey };
    if (next.division) {
      if (district && !bdLocations[next.division]?.[district]) next.district = '';
      if (selected && selected.division !== next.division) next.areaKey = '';
    }
    onChange(next);
  }

  function changeDistrict(e) {
    const next = { division, district: e.target.value, areaKey };
    if (next.district && selected && selected.district !== next.district) next.areaKey = '';
    onChange(next);
  }

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <div>
        <label htmlFor={`${idPrefix}-division`} className={label}>Division</label>
        <select id={`${idPrefix}-division`} value={division} onChange={changeDivision} className={field}>
          <option value="">All divisions</option>
          {divisionList.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor={`${idPrefix}-district`} className={label}>District</label>
        <select id={`${idPrefix}-district`} value={district} onChange={changeDistrict} className={field}>
          <option value="">All districts</option>
          {districts.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor={`${idPrefix}-area`} className={label}>Upazila</label>
        <select
          id={`${idPrefix}-area`}
          value={areaKey}
          onChange={(e) => onChange({ division, district, areaKey: e.target.value })}
          className={field}
        >
          <option value="">All upazilas</option>
          {upazilas.map((u) => (
            <option key={u.key} value={u.key}>{district ? u.name : `${u.name} (${u.district})`}</option>
          ))}
        </select>
      </div>
    </div>
  );
}