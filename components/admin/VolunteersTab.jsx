'use client';

import { useState } from 'react';
import { Check, X, MapPin, Phone, Mail } from 'lucide-react';
import { useAdminData, adminAction, useRunner } from '../../lib/useAdminData';
import {
  Pills, EmptyBox, Loading, RejectBox, cardClass, btnGreen, btnRed, fmt,
} from './shared';

const filters = [['pending', 'Pending'], ['approved', 'Approved'], ['rejected', 'Rejected']];
const skillName = { first_aid: 'First aid', driving: 'Driving', other: 'Other' };

export default function VolunteersTab() {
  const [filter, setFilter] = useState('pending');
  const [rejecting, setRejecting] = useState(null);
  const { data, loading, reload } = useAdminData(`/volunteers?status=${filter}`);
  const { busyId, run } = useRunner(reload);

  const approve = (u) =>
    run(u._id, () => adminAction('PATCH', `/volunteers/${u._id}/approve`), 'Volunteer approved');

  async function reject(u, reason) {
    const ok = await run(
      u._id,
      () => adminAction('PATCH', `/volunteers/${u._id}/reject`, { reason }),
      filter === 'approved' ? 'Volunteer removed' : 'Application rejected'
    );
    if (ok) setRejecting(null);
  }

  return (
    <div className="space-y-5">
      <Pills options={filters} value={filter} onChange={(f) => { setFilter(f); setRejecting(null); }} />

      {loading ? (
        <Loading />
      ) : data.length === 0 ? (
        <EmptyBox text={`No ${filter} volunteers.`} />
      ) : (
        <div className="space-y-4">
          {data.map((u) => {
            const busy = busyId === u._id;
            const area = u.volunteer?.serviceArea || {};
            const skills = (u.volunteer?.skills || []).map((s) => skillName[s] || s).join(', ');
            return (
              <div key={u._id} className={cardClass}>
                <h3 className="text-base font-semibold text-slate-900">{u.name}</h3>
                <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-600">
                  {u.email && <span className="flex items-center gap-1"><Mail size={13} /> {u.email}</span>}
                  {u.phone && <span className="flex items-center gap-1"><Phone size={13} /> {u.phone}</span>}
                  <span className="flex items-center gap-1">
                    <MapPin size={13} /> {[area.area, area.district, area.division].filter(Boolean).join(', ') || 'No area given'}
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-600">Skills: {skills || 'None given'}</p>
                <p className="mono mt-1 text-xs text-slate-500">Registered: {fmt(u.createdAt)}</p>

                {u.volunteer?.status === 'rejected' && u.volunteer?.rejectionReason && (
                  <p className="mt-2 text-xs text-rose-600">Reason: {u.volunteer.rejectionReason}</p>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  {filter !== 'approved' && (
                    <button disabled={busy} onClick={() => approve(u)} className={btnGreen}>
                      <Check size={14} /> Approve
                    </button>
                  )}
                  {filter !== 'rejected' && (
                    <button disabled={busy} onClick={() => setRejecting(rejecting === u._id ? null : u._id)} className={btnRed}>
                      <X size={14} /> {filter === 'approved' ? 'Remove volunteer' : 'Reject'}
                    </button>
                  )}
                </div>

                {rejecting === u._id && (
                  <RejectBox
                    onConfirm={(reason) => reject(u, reason)}
                    onCancel={() => setRejecting(null)}
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