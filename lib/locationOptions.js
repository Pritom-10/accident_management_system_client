import { bdLocations } from './bdLocations';

export const divisionList = Object.keys(bdLocations);


export function districtOptions(division) {
  const names = division
    ? Object.keys(bdLocations[division] || {})
    : Object.values(bdLocations).flatMap((d) => Object.keys(d));
  return names.sort((a, b) => a.localeCompare(b));
}


export function upazilaOptions(division, district) {
  const out = [];
  for (const [div, districts] of Object.entries(bdLocations)) {
    if (division && div !== division) continue;
    for (const [dist, list] of Object.entries(districts)) {
      if (district && dist !== district) continue;
      for (const name of list) out.push({ key: `${dist}::${name}`, name, district: dist, division: div });
    }
  }
  return out.sort((a, b) => a.name.localeCompare(b.name) || a.district.localeCompare(b.district));
}