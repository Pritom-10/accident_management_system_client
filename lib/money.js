export const METHODS = [
  { id: 'bkash', label: 'bKash', color: '#E2136E' },
  { id: 'nagad', label: 'Nagad', color: '#F6921E' },
  { id: 'rocket', label: 'Rocket', color: '#8C3494' },
  { id: 'bank', label: 'Bank transfer', color: '#0F766E' },
];

export const methodMeta = (id) => METHODS.find((m) => m.id === id) || METHODS[3];

export const taka = (n) => `৳${Number(n || 0).toLocaleString('en-IN')}`;

export const percent = (raised, target) => (target > 0 ? Math.min(100, Math.round((raised / target) * 100)) : 0);

export const QUICK_AMOUNTS = [100, 500, 1000, 2000, 5000];

export const statusInfo = {
  pending: { text: 'Waiting for review', cls: 'bg-amber-100 text-amber-700' },
  active: { text: 'Collecting', cls: 'bg-emerald-100 text-emerald-700' },
  completed: { text: 'Goal reached', cls: 'bg-indigo-100 text-indigo-700' },
  closed: { text: 'Closed', cls: 'bg-slate-200 text-slate-600' },
  rejected: { text: 'Not approved', cls: 'bg-rose-100 text-rose-700' },
};

export const donationStatus = {
  pending: { text: 'Waiting for confirmation', cls: 'bg-amber-100 text-amber-700' },
  confirmed: { text: 'Confirmed', cls: 'bg-emerald-100 text-emerald-700' },
  rejected: { text: 'Not confirmed', cls: 'bg-rose-100 text-rose-700' },
};