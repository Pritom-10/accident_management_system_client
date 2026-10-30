export const LEVELS = {
  ok: { text: 'Free', bar: 'bg-emerald-500', chip: 'bg-emerald-100 text-emerald-700' },
  low: { text: 'Few left', bar: 'bg-amber-500', chip: 'bg-amber-100 text-amber-700' },
  full: { text: 'Full', bar: 'bg-rose-500', chip: 'bg-rose-100 text-rose-700' },
  none: { text: 'None', bar: 'bg-slate-300', chip: 'bg-slate-100 text-slate-600' },
};

export const stockTone = (n) => (n <= 3 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-700');

export const TYPE_LABEL = {
  hospital: 'Hospital',
  blood_bank: 'Blood bank',
  ambulance: 'Ambulance',
  fire_service: 'Fire service',
  police: 'Police',
  other: 'Emergency',
};