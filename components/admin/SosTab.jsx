'use client';

import { useEffect, useState } from 'react';
import { Check, ExternalLink, Flag, MapPin, Phone, UserRound } from 'lucide-react';
import { useAdminData, adminAction, useRunner } from '../../lib/useAdminData';
import { osmLink } from '../../lib/geo';
import { timeAgo } from '../../lib/sos';
import { Pills, EmptyBox, Loading, RejectBox, cardClass, btnGreen, btnRed, btnGray, fmt } from './shared';

const filters = [['active', 'Active'], ['closed', 'Closed']];
const closedText = { resolved: 'Resolved', false_alarm: 'False alarm', cancelled: 'Cancelled by the caller' };

export default function SosTab() {
  const [filter, setFilter] = useState('active');
  const [flagging, setFlagging] = useState(null);
  const { data, loading, reload } = useAdminData(`/sos?status=${filter}`);
  const { busyId, run } = useRunner(reload);

  useEffect(() => {
    if (filter !== 'active') return undefined;
    const t = setInterval(reload, 15000);
    return () => clearInterval(t);
  }, [filter, reload]);

  const resolve = (a) => run(a._id, () => adminAction('PATCH', `/sos/${a._id}/resolve`), 'Marked as resolved');

  async function falseAlarm(a, reason, flags) {
    const ok = await run(
      a._id,
      () => adminAction('PATCH', `/sos/${a._id}/false-alarm`, { blockPhone: !!flags.blockPhone }),
      'Closed as a false alarm'
    );
    if (ok) setFlagging(null);
  }

  return (
    <div className="space-y-5">
      <Pills options={filters} value={filter} onChange={(f) => { setFilter(f); setFlagging(null); }} />

      {loading && data.length === 0 ? (
        <Loading />
      ) : data.length === 0 ? (
        <EmptyBox text={filter === 'active' ? 'No active SOS right now.' : 'No closed SOS yet.'} />
      ) : (
        <div className="space-y-4">
          {data.map((a) => {
            const busy = busyId === a._id;
            const hasPin = typeof a.location?.lat === 'number' && typeof a.location?.lng === 'number';
            // eslint-disable-next-line react-hooks/purity
            const expired = a.status === 'active' && Date.now() - new Date(a.createdAt).getTime() > 6 * 3600000;
            const place = [a.location?.area, a.location?.district, a.location?.division].filter(Boolean).join(', ');
            const answering = (a.responders || []).filter((r) => r.status !== 'cannot');

            return (
              <div key={a._id} className={`${cardClass} ${a.status === 'active' && !expired ? 'border-l-4 border-l-rose-500' : ''}`}>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-semibold text-slate-900">{place || 'No place given'}</h3>
                  {a.status === 'active' && !expired && (
                    <span className="flex items-center gap-1.5 rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-medium text-rose-700">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-500 opacity-75" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-rose-600" />
                      </span>
                      Live
                    </span>
                  )}
                  {expired && <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-600">Expired</span>}
                  {a.status !== 'active' && (
                    <span className="rounded-full bg-white/80 px-2.5 py-0.5 text-xs font-medium text-slate-700">{closedText[a.status] || a.status}</span>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-600">
                  <span className="flex items-center gap-1"><UserRound size={13} /> {a.callerName || 'No name'}</span>
                  <span className="flex items-center gap-1"><Phone size={13} /> {a.callerPhone || 'No number'}</span>
                  <span>{fmt(a.createdAt)} ({timeAgo(a.createdAt)})</span>
                  {hasPin ? (
                    <a href={osmLink(a.location.lat, a.location.lng)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 font-medium text-indigo-600 hover:underline">
                      <ExternalLink size={13} /> Open the place
                    </a>
                  ) : (
                    <span className="flex items-center gap-1 text-slate-400"><MapPin size={13} /> No map pin</span>
                  )}
                </div>

                {a.note && <p className="mt-3 rounded-xl bg-white/70 p-3 text-sm text-slate-700">{a.note}</p>}

                <p className="mt-3 text-xs text-slate-600">
                  {answering.length === 0
                    ? 'No volunteer has answered.'
                    : `Answered by: ${answering.map((r) => `${r.name} (${r.status === 'arrived' ? 'arrived' : 'on the way'})`).join(', ')}`}
                </p>

                {a.status === 'active' && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button disabled={busy} onClick={() => resolve(a)} className={btnGreen}>
                      <Check size={14} /> Resolved
                    </button>
                    <button disabled={busy} onClick={() => setFlagging(flagging === a._id ? null : a._id)} className={btnRed}>
                      <Flag size={14} /> False alarm
                    </button>
                    {hasPin && (
                      <a href={osmLink(a.location.lat, a.location.lng)} target="_blank" rel="noopener noreferrer" className={btnGray}>
                        <ExternalLink size={14} /> Map
                      </a>
                    )}
                  </div>
                )}

                {flagging === a._id && (
                  <RejectBox
                    placeholder="Note (optional, only for you)"
                    checks={a.callerPhone ? [{ key: 'blockPhone', label: `Also block ${a.callerPhone} from sending alerts and reports` }] : []}
                    onConfirm={(reason, flags) => falseAlarm(a, reason, flags)}
                    onCancel={() => setFlagging(null)}
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