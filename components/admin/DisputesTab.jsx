'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ExternalLink, Mail, Phone } from 'lucide-react';
import { useAdminData } from '../../lib/useAdminData';
import { taka } from '../../lib/money';
import DisputeActions, { reasonText } from '../donate/DisputeActions';
import { Pills, EmptyBox, Loading, cardClass, btnGray } from './shared';

const filters = [['open', 'Open'], ['closed', 'Closed']];

export default function DisputesTab() {
  const [filter, setFilter] = useState('open');
  const { data, loading, reload } = useAdminData(`/disputes?status=${filter}`);

  return (
    <div className="space-y-5">
      <Pills options={filters} value={filter} onChange={setFilter} />

      <p className="rounded-xl bg-amber-50 p-4 text-xs leading-relaxed text-amber-800">
        The campaign owner answers first. Step in if they do not reply. You can confirm a donation, record a refund, or close the complaint.
      </p>

      {loading && data.length === 0 ? (
        <Loading />
      ) : data.length === 0 ? (
        <EmptyBox text={filter === 'open' ? 'No open complaints.' : 'No closed complaints.'} />
      ) : (
        <div className="space-y-4">
          {data.map((d) => (
            <div key={d._id} className={cardClass}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-900">
                  {d.campaign ? d.campaign.title : 'Campaign removed'}
                  {d.campaign && <span className="ml-2 text-xs font-normal text-slate-500">owner: {d.campaign.ownerName}</span>}
                </p>
                {d.campaign && (
                  <Link href={`/donate/${d.campaign._id}`} className={btnGray}>
                    <ExternalLink size={14} /> Campaign
                  </Link>
                )}
              </div>

              <p className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-600">
                <span>{d.donorName || 'No name'}</span>
                {d.donorPhone && <span className="flex items-center gap-1"><Phone size={12} /> {d.donorPhone}</span>}
                {d.donorEmail && <span className="flex items-center gap-1"><Mail size={12} /> {d.donorEmail}</span>}
                <span className="mono">{d.receiptNo}</span>
              </p>

              {filter === 'open' ? (
                <div className="mt-3">
                  <DisputeActions donation={d} onDone={reload} />
                </div>
              ) : (
                <div className="mt-3 rounded-xl bg-white/70 p-3 text-sm text-slate-700">
                  <p>
                    <span className="mono">{taka(d.amount)}</span> · {reasonText[d.dispute.reason]} · <b>{d.dispute.status}</b>
                  </p>
                  {d.dispute.response && <p className="mt-1 whitespace-pre-line text-slate-600">{d.dispute.response}</p>}
                  {d.dispute.refundRef && <p className="mono mt-1 text-xs text-slate-500">Refund reference: {d.dispute.refundRef}</p>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}