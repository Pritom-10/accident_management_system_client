'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, ExternalLink, Flag, ShieldOff, X } from 'lucide-react';
import { useAdminData, adminAction, useRunner } from '../../lib/useAdminData';
import { methodMeta, percent, statusInfo, taka } from '../../lib/money';
import { formatDateTime } from '../../lib/newsOptions';
import PrivateImage from '../PrivateImage';
import { MethodChip, Pill, VerifiedBadge } from '../donate/ui';
import { Pills, EmptyBox, Loading, RejectBox, cardClass, btnGreen, btnRed, btnGray } from './shared';

const filters = [
  ['pending', 'Pending'],
  ['active', 'Live'],
  ['flagged', 'Reported'],
  ['closed', 'Closed'],
];

export default function CampaignsTab() {
  const [filter, setFilter] = useState('pending');
  const [rejecting, setRejecting] = useState(null);
  const { data, loading, reload } = useAdminData(`/campaigns?status=${filter}`);
  const { busyId, run } = useRunner(reload);

  const approve = (c) => run(c._id, () => adminAction('PATCH', `/campaigns/${c._id}/approve`), 'Campaign approved');
  const dismiss = (c) => run(c._id, () => adminAction('PATCH', `/campaigns/${c._id}/clear-flags`), 'Reports dismissed');

  async function reject(c, reason) {
    const ok = await run(
      c._id,
      () => adminAction('PATCH', `/campaigns/${c._id}/reject`, { reason }),
      c.status === 'pending' ? 'Campaign rejected' : 'Campaign taken down'
    );
    if (ok) setRejecting(null);
  }

  return (
    <div className="space-y-5">
      <Pills options={filters} value={filter} onChange={(f) => { setFilter(f); setRejecting(null); }} />

      {filter === 'pending' && (
        <p className="rounded-xl bg-amber-50 p-4 text-xs leading-relaxed text-amber-800">
          Before approving: open the documents, check that the patient, hospital and payment account names match, and call the family or the hospital if you can. Money goes straight to these accounts.
        </p>
      )}

      {loading ? (
        <Loading />
      ) : data.length === 0 ? (
        <EmptyBox text={`No ${filter === 'flagged' ? 'reported' : filter} campaigns.`} />
      ) : (
        <div className="space-y-4">
          {data.map((c) => {
            const busy = busyId === c._id;
            const flags = c.flags || [];
            const live = c.status === 'active' || c.status === 'completed';
            return (
              <div key={c._id} className={cardClass}>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-semibold text-slate-900">{c.title}</h3>
                  {c.isVerified && <VerifiedBadge />}
                  <Pill info={statusInfo[c.status] || statusInfo.pending} />
                </div>

                <p className="mt-1 text-xs text-slate-600">
                  By {c.ownerName} · patient {c.patientName} · {c.hospital?.name} · {[c.location?.area, c.location?.district].filter(Boolean).join(', ')}
                </p>
                <p className="mono mt-1 text-xs text-slate-500">
                  Target {taka(c.targetAmount)} · raised {taka(c.raised)} ({percent(c.raised, c.targetAmount)}%) · spent {taka(c.spent)} · {formatDateTime(c.createdAt)}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {(c.paymentAccounts || []).map((a) => (
                    <span key={a.method} className="flex items-center gap-2 rounded-xl bg-white/70 px-3 py-1.5 text-xs text-slate-700">
                      <MethodChip id={a.method} />
                      <span className="mono">{a.number}</span>
                      <span className="text-slate-500">{a.accountName}{a.method === 'bank' ? ` · ${a.bankName}` : ''}</span>
                    </span>
                  ))}
                </div>

                <details className="mt-3 rounded-xl bg-white/60 p-3 text-sm text-slate-700">
                  <summary className="cursor-pointer text-xs font-medium text-slate-900">Story and proof documents</summary>
                  <p className="mt-2 whitespace-pre-line leading-relaxed">{c.story}</p>
                  <p className="mt-3 text-xs font-medium text-slate-900">Proof documents (private)</p>
                  <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {(c.documents || []).map((url) => (
                      <PrivateImage key={url} src={url} className="h-32 w-full rounded-xl border border-slate-200 object-cover" />
                    ))}
                  </div>
                </details>

                {c.status === 'rejected' && c.rejectionReason && (
                  <p className="mt-2 text-xs text-rose-600">Reason: {c.rejectionReason}</p>
                )}

                {flags.length > 0 && (
                  <div className="mt-3 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
                    <p className="flex items-center gap-1.5 font-medium">
                      <Flag size={13} /> Reported {flags.length} {flags.length === 1 ? 'time' : 'times'}
                    </p>
                    {flags.filter((f) => f.reason).slice(0, 5).map((f, i) => (
                      <p key={i} className="mt-1">{f.reason}</p>
                    ))}
                  </div>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  {(c.status === 'pending' || c.status === 'rejected') && (
                    <button disabled={busy} onClick={() => approve(c)} className={btnGreen}>
                      <Check size={14} /> Approve
                    </button>
                  )}
                  {flags.length > 0 && (
                    <button disabled={busy} onClick={() => dismiss(c)} className={btnGray}>
                      <ShieldOff size={14} /> Dismiss reports
                    </button>
                  )}
                  {c.status !== 'rejected' && c.status !== 'closed' && (
                    <button disabled={busy} onClick={() => setRejecting(rejecting === c._id ? null : c._id)} className={btnRed}>
                      <X size={14} /> {live ? 'Take down' : 'Reject'}
                    </button>
                  )}
                  <Link href={`/donate/${c._id}`} className={btnGray}>
                    <ExternalLink size={14} /> Open page
                  </Link>
                </div>

                {rejecting === c._id && (
                  <RejectBox
                    placeholder="Reason (the owner will see this)"
                    onConfirm={(reason) => reject(c, reason)}
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