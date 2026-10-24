'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, X, BadgeCheck, Trash2, Pencil, Plus, ExternalLink,BellRing } from 'lucide-react';
import { useAdminData, adminAction, useRunner } from '../../lib/useAdminData';
import { API_BASE, apiFetch } from '../../lib/api';
import { imageSrc } from '../../lib/imageUrl';
import { formatDateTime } from '../../lib/newsOptions';
import {
  Pills, EmptyBox, Loading, RejectBox, cardClass, btnGreen, btnRed, btnGray,
} from './shared';

const filters = [['pending', 'Pending'], ['published', 'Published'], ['rejected', 'Rejected']];

export default function NewsTab() {
  const [filter, setFilter] = useState('pending');
  const [rejecting, setRejecting] = useState(null);
  const { data, loading, reload } = useAdminData(`/news?status=${filter}`);
  const { busyId, run } = useRunner(reload);

    const approve = (p, verified, breaking = false) =>
    run(
      p._id,
      () => adminAction('PATCH', `/news/${p._id}/approve`, { verified, breaking }),
      breaking ? 'Published and alert sent' : 'Published'
    );

  const alertNow = (p) => run(p._id, () => adminAction('POST', `/news/${p._id}/alert`), 'Alert sent');

  const setVerified = (p, verified) =>
    run(p._id, () => adminAction('PATCH', `/news/${p._id}/verify`, { verified }), verified ? 'Marked as verified' : 'Marked as unverified');

  async function reject(p, reason) {
    const ok = await run(
      p._id,
      () => adminAction('PATCH', `/news/${p._id}/reject`, { reason }),
      p.status === 'published' ? 'Taken down' : 'Rejected'
    );
    if (ok) setRejecting(null);
  }

  function remove(p) {
    if (!window.confirm(`Delete "${p.title}" permanently?`)) return;
    run(
      p._id,
      async () => {
        const res = await apiFetch(`${API_BASE}/news/${p._id}`, { method: 'DELETE' });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json.error || 'Could not delete');
      },
      'Deleted'
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Pills options={filters} value={filter} onChange={(f) => { setFilter(f); setRejecting(null); }} />
        <Link
          href="/news/write"
          className="flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Plus size={16} /> Write news
        </Link>
      </div>

      {loading ? (
        <Loading />
      ) : data.length === 0 ? (
        <EmptyBox text={`No ${filter} news.`} />
      ) : (
        <div className="space-y-4">
          {data.map((p) => {
            const busy = busyId === p._id;
            return (
              <div key={p._id} className={cardClass}>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-semibold text-slate-900">{p.title}</h3>
                  {p.status === 'published' &&
                    (p.isVerified ? (
                      <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                        <BadgeCheck size={12} /> Verified
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">Unverified</span>
                    ))}
                </div>

                <p className="mono mt-1 text-xs text-slate-500">
                  By {p.authorName || 'unknown'} · {[p.location?.area, p.location?.district].filter(Boolean).join(', ')} ·{' '}
                  {formatDateTime(p.occurredAt)}
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  {p.deaths} dead · {p.injured} injured{p.road ? ` · ${p.road}` : ''}
                </p>

                <details className="mt-3 rounded-xl bg-white/60 p-3 text-sm text-slate-700">
                  <summary className="cursor-pointer text-xs font-medium text-slate-900">Read the full story</summary>
                  <p className="mt-2 whitespace-pre-line leading-relaxed">{p.body}</p>

                  {p.photos?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {p.photos.map((url) => (
                        <a key={url} href={imageSrc(url)} target="_blank" rel="noopener noreferrer">
                          <img src={imageSrc(url)} alt="" className="h-20 w-28 rounded-lg object-cover" />
                        </a>
                      ))}
                    </div>
                  )}

                  <div className="mt-3 flex flex-wrap gap-4 text-xs">
                    {p.sourceUrl && (
                      <a href={p.sourceUrl} target="_blank" rel="noopener noreferrer nofollow" className="flex items-center gap-1 text-indigo-600 hover:underline">
                        <ExternalLink size={12} /> {p.sourceName || 'Source'}
                      </a>
                    )}
                    {!p.sourceUrl && p.sourceName && <span>Source: {p.sourceName}</span>}
                    {p.videoUrl && (
                      <a href={p.videoUrl} target="_blank" rel="noopener noreferrer nofollow" className="flex items-center gap-1 text-indigo-600 hover:underline">
                        <ExternalLink size={12} /> Video
                      </a>
                    )}
                  </div>
                </details>

                {p.status === 'rejected' && p.rejectionReason && (
                  <p className="mt-2 text-xs text-rose-600">Reason: {p.rejectionReason}</p>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  {p.status !== 'published' && (
                    <>
                      <button disabled={busy} onClick={() => approve(p, true)} className={btnGreen}>
                        <Check size={14} /> Approve &amp; verify
                      </button>
                      <button disabled={busy} onClick={() => approve(p, false)} className={btnGray}>
                        <Check size={14} /> Approve (unverified)
                      </button>
                      <button disabled={busy} onClick={() => approve(p, true, true)} className={btnRed}>
                        <BellRing size={14} /> Approve, verify &amp; alert
                      </button>
                    </>
                  )}

                  {p.status === 'published' && (
                    <>
                      <Link href={`/news/${p._id}`} className={btnGray}>View</Link>
                      <button disabled={busy} onClick={() => setVerified(p, !p.isVerified)} className={btnGray}>
                        {p.isVerified ? 'Mark unverified' : 'Mark verified'}
                      </button>
                      {!p.pushedAt && (
                        <button disabled={busy} onClick={() => alertNow(p)} className={btnRed}>
                          <BellRing size={14} /> Send alert
                        </button>
                      )}
                    </>
                  )}

                  <Link href={`/news/${p._id}/edit`} className={btnGray}>
                    <Pencil size={14} /> Edit
                  </Link>

                  {p.status !== 'rejected' && (
                    <button disabled={busy} onClick={() => setRejecting(rejecting === p._id ? null : p._id)} className={btnRed}>
                      <X size={14} /> {p.status === 'published' ? 'Take down' : 'Reject'}
                    </button>
                  )}

                  <button disabled={busy} onClick={() => remove(p)} className={btnGray}>
                    <Trash2 size={14} /> Delete
                  </button>
                </div>

                {rejecting === p._id && (
                  <RejectBox
                    placeholder="Reason (the writer will see this)"
                    onConfirm={(reason) => reject(p, reason)}
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