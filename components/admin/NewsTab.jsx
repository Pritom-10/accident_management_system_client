'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BadgeCheck, BellRing, Check, ExternalLink, GitMerge, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useAdminData, adminAction, useRunner } from '../../lib/useAdminData';
import { API_BASE, apiFetch } from '../../lib/api';
import { imageSrc } from '../../lib/imageUrl';
import { formatDateTime } from '../../lib/newsOptions';
import { kindMeta } from '../../lib/newsExtras';
import { dateText } from '../../lib/blood';
import { Pills, EmptyBox, Loading, RejectBox, cardClass, btnGreen, btnRed, btnGray } from './shared';

const filters = [
  ['pending', 'Pending'],
  ['published', 'Published'],
  ['updates', 'Updates to approve'],
  ['rejected', 'Rejected'],
];

async function callNews(method, path) {
  const res = await apiFetch(`${API_BASE}/news${path}`, { method });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || 'Could not do that');
}

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

  const setVerified = (p, verified) =>
    run(p._id, () => adminAction('PATCH', `/news/${p._id}/verify`, { verified }), verified ? 'Marked as verified' : 'Marked as unverified');

  const alertNow = (p) => run(p._id, () => adminAction('POST', `/news/${p._id}/alert`), 'Alert sent');

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
    run(p._id, () => callNews('DELETE', `/${p._id}`), 'Deleted');
  }

  function mergeInto(keepId, dropId, title, busyKey) {
    if (!window.confirm(`Merge "${title}"? This cannot be undone.`)) return;
    run(busyKey, () => adminAction('POST', `/news/${keepId}/merge`, { duplicateId: dropId }), 'Stories merged');
  }

  const approveUpdate = (p, u) =>
    run(u._id, () => adminAction('PATCH', `/news/${p._id}/updates/${u._id}/approve`), 'Update is now live');

  function removeUpdate(p, u) {
    if (!window.confirm('Remove this update?')) return;
    run(u._id, () => callNews('DELETE', `/${p._id}/updates/${u._id}`), 'Update removed');
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Pills options={filters} value={filter} onChange={(f) => { setFilter(f); setRejecting(null); }} />
        <Link href="/news/write" className="flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700">
          <Plus size={16} /> Write news
        </Link>
      </div>

      {loading && data.length === 0 ? (
        <Loading />
      ) : data.length === 0 ? (
        <EmptyBox text={filter === 'updates' ? 'No updates are waiting.' : `No ${filter} news.`} />
      ) : (
        <div className="space-y-4">
          {data.map((p) => {
            const busy = busyId === p._id;
            const waiting = (p.updates || []).filter((u) => !u.approved);

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
                  By {p.authorName || 'unknown'} · {[p.location?.area, p.location?.district].filter(Boolean).join(', ')} · {formatDateTime(p.occurredAt)}
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  {p.deaths} dead · {p.injured} injured{p.road ? ` · ${p.road}` : ''}
                </p>

                {p.similar && p.similar.length > 0 && (
                  <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <p className="flex items-center gap-2 text-sm font-semibold text-amber-900">
                      <GitMerge size={15} /> This may be the same accident as another story
                    </p>
                    <ul className="mt-3 space-y-3">
                      {p.similar.map((s) => (
                        <li key={s.id} className="rounded-lg bg-white/80 p-3">
                          <p className="text-sm font-medium text-slate-900">{s.title}</p>
                          <p className="mt-0.5 text-xs text-slate-600">
                            {s.status === 'published' ? 'Published' : 'Waiting'} · {s.score}% match · {s.reasons.join(' · ')}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <button disabled={busy} onClick={() => mergeInto(p._id, s.id, s.title, p._id)} className={btnGray}>
                              Keep this story, merge the other into it
                            </button>
                            <button disabled={busy} onClick={() => mergeInto(s.id, p._id, p.title, p._id)} className={btnGray}>
                              Keep the other, merge this into it
                            </button>
                            <Link href={`/news/${s.id}`} className={btnGray}><ExternalLink size={14} /> Open it</Link>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {waiting.length > 0 && (
                  <div className="mt-3 rounded-xl border border-indigo-200 bg-indigo-50 p-4">
                    <p className="text-sm font-semibold text-indigo-900">
                      {waiting.length} {waiting.length === 1 ? 'update is' : 'updates are'} waiting
                    </p>
                    <ul className="mt-3 space-y-3">
                      {waiting.map((u) => (
                        <li key={u._id} className="rounded-lg bg-white/80 p-3">
                          <p className="text-xs font-semibold text-slate-700">
                            {kindMeta(u.kind).label} · {dateText(u.at)} · by {u.authorName || 'unknown'}
                          </p>
                          <p className="mt-1 whitespace-pre-line text-sm text-slate-800">{u.text}</p>
                          {(Number.isInteger(u.deaths) || Number.isInteger(u.injured)) && (
                            <p className="mt-1 text-xs text-slate-600">
                              Sets the numbers to {Number.isInteger(u.deaths) ? `${u.deaths} dead` : 'dead unchanged'}, {Number.isInteger(u.injured) ? `${u.injured} injured` : 'injured unchanged'}
                            </p>
                          )}
                          <div className="mt-2 flex gap-2">
                            <button disabled={busyId === u._id} onClick={() => approveUpdate(p, u)} className={btnGreen}>
                              <Check size={14} /> Approve
                            </button>
                            <button disabled={busyId === u._id} onClick={() => removeUpdate(p, u)} className={btnRed}>
                              <Trash2 size={14} /> Remove
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

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