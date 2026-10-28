'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { Check, Loader2, RotateCcw, X } from 'lucide-react';
import { API_BASE, apiFetch } from '../../lib/api';
import { methodMeta, taka } from '../../lib/money';
import { dateText } from '../../lib/blood';
import { fieldClass } from '../ui/styles';
import { btnGray, btnGreen, btnRed } from '../admin/shared';

export const reasonText = {
  not_confirmed: 'I paid, but it was not confirmed',
  wrong_amount: 'The amount is wrong',
  refund: 'I want my money back',
  other: 'Something else',
};

const done = {
  confirm: 'The donation was confirmed',
  refund: 'Refund saved. The numbers were updated.',
  resolve: 'The complaint was closed',
};

export default function DisputeActions({ donation, onDone }) {
  const [response, setResponse] = useState('');
  const [refundRef, setRefundRef] = useState('');
  const [busy, setBusy] = useState('');
  const d = donation;

  async function act(action) {
    setBusy(action);
    try {
      const res = await apiFetch(`${API_BASE}/donate/donations/${d._id}/dispute`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, response, refundRef }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not save');

      toast.success(done[action]);
      onDone();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy('');
    }
  }

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-semibold text-amber-900">
        <span className="mono">{taka(d.amount)}</span>
        <span>{methodMeta(d.method).label}</span>
        <span className="mono text-xs font-normal">{d.trxId}</span>
      </p>
      <p className="mt-2 text-sm text-amber-900">
        <b>{reasonText[d.dispute.reason] || 'Complaint'}</b>
        {d.dispute.openedAt ? <span className="text-xs text-amber-700"> · {dateText(d.dispute.openedAt)}</span> : null}
      </p>
      <p className="mt-1 whitespace-pre-line rounded-lg bg-white/80 p-3 text-sm text-slate-800">{d.dispute.message}</p>

      <div className="mt-3 space-y-2">
        <textarea
          rows={2}
          maxLength={500}
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          placeholder="Your answer to the donor (they will see it)"
          className={fieldClass}
        />
        <input
          value={refundRef}
          onChange={(e) => setRefundRef(e.target.value)}
          maxLength={60}
          placeholder="Only for a refund: transaction ID of the money you sent back"
          className={fieldClass}
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {d.status !== 'confirmed' && (
          <button disabled={Boolean(busy)} onClick={() => act('confirm')} className={btnGreen}>
            {busy === 'confirm' ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} I found it. Confirm the donation
          </button>
        )}
        <button disabled={Boolean(busy)} onClick={() => act('refund')} className={btnRed}>
          {busy === 'refund' ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />} I sent the money back
        </button>
        <button disabled={Boolean(busy)} onClick={() => act('resolve')} className={btnGray}>
          {busy === 'resolve' ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />} Close with my answer
        </button>
      </div>
    </div>
  );
}