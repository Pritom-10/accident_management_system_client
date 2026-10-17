'use client';

import { useAdminData } from '../../lib/useAdminData';
import { EmptyBox, Loading, cardClass, fmt } from './shared';

export default function ActivityTab() {
  const { data, loading } = useAdminData('/logs');

  if (loading) return <Loading />;
  if (data.length === 0) return <EmptyBox text="No activity yet." />;

  return (
    <div className="space-y-2">
      <p className="text-xs text-slate-600">The last 100 actions taken by admins.</p>
      {data.map((l) => (
        <div key={l._id} className={`${cardClass} py-3`}>
          <p className="text-sm text-slate-900">
            <span className="font-medium">{l.adminName}</span>{' '}
            <span className="mono rounded bg-white/80 px-1.5 py-0.5 text-xs">{l.action}</span>
          </p>
          <p className="mt-1 text-xs text-slate-600">
            {[l.targetType, l.targetId].filter(Boolean).join(' · ')}
            {l.details ? ` — ${l.details}` : ''}
          </p>
          <p className="mono mt-0.5 text-xs text-slate-500">{fmt(l.createdAt)}</p>
        </div>
      ))}
    </div>
  );
}