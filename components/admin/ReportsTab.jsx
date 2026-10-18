'use client';

import { useState } from 'react';
import { Check, X, MapPin, Clock, Phone, Flag, ExternalLink, ShieldOff } from 'lucide-react';
import { useAdminData, adminAction, useRunner } from '../../lib/useAdminData';
import { imageSrc } from '../../lib/imageUrl';
import { osmLink } from '../../lib/geo';
import {
  Pills, EmptyBox, Loading, RejectBox, cardClass, btnGreen, btnRed, btnGray, fmt,
} from './shared';

const filters = [
  ['pending', 'Pending'],
  ['verified', 'Verified'],
  ['flagged', 'Reported'],
  ['rejected', 'Rejected'],
];

const statusLabel = {
  pending: 'Pending',
  verified: 'Verified',
  rescue_in_progress: 'Rescue in progress',
  cleared: 'Cleared',
  rejected: 'Rejected',
};

export default function ReportsTab() {
  const [filter, setFilter] = useState('pending');
  const [rejecting, setRejecting] = useState(null);
  const { data, loading, reload } = useAdminData(`/reports?status=${filter}`);
  const { busyId, run } = useRunner(reload);

  const setStatus = (r, status, msg) =>
    run(r._id, () => adminAction('PATCH', `/reports/${r._id}/status`, { status }), msg);

  const dismissFlags = (r) =>
    run(r._id, () => adminAction('PATCH', `/reports/${r._id}/clear-flags`), 'Reports dismissed');

  async function reject(r, reason, flags) {
    const ok = await run(
      r._id,
      () => adminAction('PATCH', `/reports/${r._id}/reject`, {
        reason,
        fake: !!flags.fake,
        blockPhone: !!flags.blockPhone,
      }),
      'Report rejected'
    );
    if (ok) setRejecting(null);
  }

  return (
    <div className="space-y-5">
      <Pills options={filters} value={filter} onChange={(f) => { setFilter(f); setRejecting(null); }} />

      {loading ? (
        <Loading />
      ) : data.length === 0 ? (
        <EmptyBox text={`No ${filter === 'flagged' ? 'reported' : filter} reports.`} />
      ) : (
        <div className="space-y-4">
          {data.map((r) => {
            const busy = busyId === r._id;
            const isPublic = ['verified', 'rescue_in_progress', 'cleared'].includes(r.status);
            const hasPin = typeof r.location?.lat === 'number' && typeof r.location?.lng === 'number';
            const flagCount = r.flags?.length || 0;
            const place = [r.location?.area, r.location?.district, r.location?.division].filter(Boolean).join(', ');

            return (
              <div key={r._id} className={cardClass}>
                <div className="flex flex-col gap-4 sm:flex-row">
                  {r.photoUrl && (
                    <img src={imageSrc(r.photoUrl)} alt="" className="h-28 w-full rounded-xl object-cover sm:w-40" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold text-slate-900">{r.accidentType}</h3>
                      <span className="rounded-full bg-white/80 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                        {statusLabel[r.status] || r.status}
                      </span>
                    </div>
                    <p className="mono mt-0.5 text-xs text-slate-600">{r.caseId}</p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{r.description}</p>

                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-600">
                      <span className="flex items-center gap-1"><MapPin size={13} /> {place}</span>
                      <span className="flex items-center gap-1"><Clock size={13} /> {fmt(r.dateTime)}</span>
                      <span className="flex items-center gap-1"><Phone size={13} /> {r.reporterPhone}</span>
                      {hasPin ? (
                        <a
                          href={osmLink(r.location.lat, r.location.lng)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 font-medium text-indigo-600 hover:underline"
                        >
                          <ExternalLink size={13} /> Open on map
                        </a>
                      ) : (
                        <span className="text-slate-400">No map pin</span>
                      )}
                    </div>

                    {r.status === 'rejected' && r.rejectionReason && (
                      <p className="mt-2 text-xs text-rose-600">Reason: {r.rejectionReason}</p>
                    )}
                  </div>
                </div>

                {flagCount > 0 && (
                  <div className="mt-3 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
                    <p className="flex items-center gap-1.5 font-medium">
                      <Flag size={13} /> Reported {flagCount} {flagCount === 1 ? 'time' : 'times'} as fake or wrong
                    </p>
                    {r.flags.filter((f) => f.reason).slice(0, 5).map((f, i) => (
                      <p key={i} className="mt-1">{f.reason}</p>
                    ))}
                  </div>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  {!isPublic && (
                    <>
                      <button disabled={busy} onClick={() => setStatus(r, 'rescue_in_progress', 'Approved')} className={btnGreen}>
                        <Check size={14} /> Approve: rescue in progress
                      </button>
                      <button disabled={busy} onClick={() => setStatus(r, 'cleared', 'Approved')} className={btnGreen}>
                        <Check size={14} /> Approve: cleared
                      </button>
                    </>
                  )}

                  {isPublic && r.status !== 'rescue_in_progress' && (
                    <button disabled={busy} onClick={() => setStatus(r, 'rescue_in_progress', 'Status updated')} className={btnGray}>
                      Mark rescue in progress
                    </button>
                  )}
                  {isPublic && r.status !== 'cleared' && (
                    <button disabled={busy} onClick={() => setStatus(r, 'cleared', 'Status updated')} className={btnGray}>
                      Mark cleared
                    </button>
                  )}

                  {flagCount > 0 && (
                    <button disabled={busy} onClick={() => dismissFlags(r)} className={btnGray}>
                      <ShieldOff size={14} /> Dismiss reports
                    </button>
                  )}

                  {r.status !== 'rejected' && (
                    <button disabled={busy} onClick={() => setRejecting(rejecting === r._id ? null : r._id)} className={btnRed}>
                      <X size={14} /> {isPublic ? 'Take down' : 'Reject'}
                    </button>
                  )}
                </div>

                {rejecting === r._id && (
                  <RejectBox
                    placeholder="Reason (optional)"
                    checks={[
                      { key: 'fake', label: 'This is fake information' },
                      { key: 'blockPhone', label: `Also block ${r.reporterPhone} from submitting reports` },
                    ]}
                    onConfirm={(reason, flags) => reject(r, reason, flags)}
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