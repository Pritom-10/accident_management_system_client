'use client';

import { useState } from 'react';
import { Ban, Clock, MapPin, Phone, Trash2 } from 'lucide-react';
import { useAdminData, adminAction, useRunner } from '../../lib/useAdminData';
import { formatDateTime } from '../../lib/newsOptions';
import { GroupBadge, StatusBadge } from '../blood/ui';
import { Pills, EmptyBox, Loading, RejectBox, cardClass, btnGray, btnRed } from './shared';

const filters = [['open', 'Open'], ['closed', 'Closed']];

export default function BloodTab() {
  const [filter, setFilter] = useState('open');
  const [cancelling, setCancelling] = useState(null);
  const { data, loading, reload } = useAdminData(`/blood?status=${filter}`);
  const { busyId, run } = useRunner(reload);

  async function cancel(r, reason) {
    const ok = await run(r._id, () => adminAction('PATCH', `/blood/${r._id}/cancel`, { reason }), 'Request cancelled');
    if (ok) setCancelling(null);
  }

  function remove(r) {
    if (!window.confirm('Delete this request permanently?')) return;
    run(r._id, () => adminAction('DELETE', `/blood/${r._id}`), 'Request deleted');
  }

  return (
    <div className="space-y-5">
      <Pills options={filters} value={filter} onChange={(f) => { setFilter(f); setCancelling(null); }} />

      {loading ? (
        <Loading />
      ) : data.length === 0 ? (
        <EmptyBox text={`No ${filter} blood requests.`} />
      ) : (
        <div className="space-y-4">
          {data.map((r) => {
            const busy = busyId === r._id;
            const place = [r.location?.area, r.location?.district, r.location?.division].filter(Boolean).join(', ');
            return (
              <div key={r._id} className={cardClass}>
                <div className="flex flex-wrap items-center gap-3">
                  <GroupBadge group={r.bloodGroup} />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {r.unitsNeeded} {r.unitsNeeded === 1 ? 'bag' : 'bags'} for {r.patientName}
                    </p>
                    <p className="text-xs text-slate-600">{r.hospital?.name}</p>
                  </div>
                  <StatusBadge status={r.status} />
                </div>

                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-600">
                  <span className="flex items-center gap-1"><MapPin size={13} /> {place}</span>
                  <span className="flex items-center gap-1"><Clock size={13} /> {formatDateTime(r.neededBy)}</span>
                  <span className="flex items-center gap-1"><Phone size={13} /> {r.contactPhone}</span>
                  <span>By {r.requesterName}</span>
                  <span>{r.unitsDonated} of {r.unitsNeeded} donated</span>
                </div>

                {r.note && <p className="mt-2 text-sm text-slate-600">{r.note}</p>}
                {r.status === 'cancelled' && r.cancelledReason && (
                  <p className="mt-2 text-xs text-rose-600">Reason: {r.cancelledReason}</p>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  {(r.status === 'pending' || r.status === 'accepted') && (
                    <button disabled={busy} onClick={() => setCancelling(cancelling === r._id ? null : r._id)} className={btnRed}>
                      <Ban size={14} /> Cancel request
                    </button>
                  )}
                  <button disabled={busy} onClick={() => remove(r)} className={btnGray}>
                    <Trash2 size={14} /> Delete
                  </button>
                </div>

                {cancelling === r._id && (
                  <RejectBox
                    placeholder="Reason (the requester will see this)"
                    onConfirm={(reason) => cancel(r, reason)}
                    onCancel={() => setCancelling(null)}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}