'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { AlertCircle, ArrowLeft, CheckCircle2, Clock, Loader2, Printer, RotateCcw, Send, XCircle } from 'lucide-react';
import { API_BASE } from '../../../../lib/api';
import { donationStatus, methodMeta, taka } from '../../../../lib/money';
import { formatDateTime } from '../../../../lib/newsOptions';
import { Skeleton } from '../../../../components/blood/ui';
import { Pill } from '../../../../components/donate/ui';
import { reasonText } from '../../../../components/donate/DisputeActions';
import { fieldClass } from '../../../../components/ui/styles';

function Line({ name, value, mono = false }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 text-sm">
      <span className="text-slate-500">{name}</span>
      <span className={`text-right font-medium text-slate-900 ${mono ? 'mono' : ''}`}>{value}</span>
    </div>
  );
}

function DisputeBox({ receiptNo, status, dispute, onSent }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(status === 'pending' ? 'not_confirmed' : 'other');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function send(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch(`${API_BASE}/donate/receipts/${receiptNo}/dispute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, message }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not send your complaint');

      toast.success('Your complaint was sent');
      setOpen(false);
      setMessage('');
      onSent();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  const isOpen = dispute && dispute.status === 'open';
  const closed = dispute && (dispute.status === 'resolved' || dispute.status === 'refunded');

  return (
    <div className="no-print mt-6 rounded-2xl border border-slate-200 bg-white p-5">
      {isOpen && (
        <p className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
          <AlertCircle size={16} className="mt-0.5 shrink-0" /> Your complaint was sent to the campaign owner. They will answer here.
        </p>
      )}

      {closed && (
        <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-800">
          <p className="font-semibold">
            Your complaint was {dispute.status === 'refunded' ? 'answered with a refund' : 'closed'}
          </p>
          {dispute.response && <p className="mt-1 whitespace-pre-line">{dispute.response}</p>}
        </div>
      )}

      {!isOpen && status !== 'refunded' && (
        <>
          {!open ? (
            <button onClick={() => setOpen(true)} className="mt-0 text-sm font-medium text-indigo-600 hover:underline">
              {closed ? 'Still not solved? Send another complaint' : 'Something wrong with this donation?'}
            </button>
          ) : (
            <form onSubmit={send} className="space-y-3">
              <select value={reason} onChange={(e) => setReason(e.target.value)} className={fieldClass}>
                {Object.entries(reasonText).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <textarea
                required
                rows={3}
                maxLength={500}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell the campaign owner what went wrong"
                className={fieldClass}
              />
              <div className="flex gap-2">
                <button disabled={busy} className="flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60">
                  {busy ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />} Send
                </button>
                <button type="button" onClick={() => setOpen(false)} className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700">
                  Cancel
                </button>
              </div>
            </form>
          )}
        </>
      )}
    </div>
  );
}

export default function ReceiptPage() {
  const { receiptNo } = useParams();
  const [data, setData] = useState(null);
  const [state, setState] = useState('loading');

  const load = useCallback(() => {
    fetch(`${API_BASE}/donate/receipts/${receiptNo}`)
      .then(async (res) => {
        if (res.status === 404) {
          setState('missing');
          return;
        }
        if (!res.ok) throw new Error('failed');
        setData(await res.json());
        setState('ready');
      })
      .catch(() => setState('failed'));
  }, [receiptNo]);

  useEffect(() => {
    load();
  }, [load]);

  if (state === 'loading') {
    return (
      <main className="mx-auto max-w-lg px-6 py-14">
        <Skeleton className="h-96" />
      </main>
    );
  }

  if (state !== 'ready') {
    return (
      <main className="mx-auto max-w-lg px-6 py-20 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">
          {state === 'missing' ? 'Receipt not found' : 'Could not load the receipt'}
        </h1>
        <p className="mt-2 text-sm text-slate-600">Check the receipt number and try again.</p>
        <Link href="/donate" className="mt-6 inline-block rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700">
          Back to campaigns
        </Link>
      </main>
    );
  }

  const d = data;
  const banner = {
    confirmed: { icon: CheckCircle2, cls: 'bg-emerald-50 text-emerald-800', text: 'Your donation is confirmed. Thank you.' },
    pending: { icon: Clock, cls: 'bg-amber-50 text-amber-800', text: 'Waiting for the family to confirm your payment.' },
    rejected: { icon: XCircle, cls: 'bg-rose-50 text-rose-800', text: `The family could not find this payment${d.rejectionReason ? `: ${d.rejectionReason}` : '.'}` },
    refunded: { icon: RotateCcw, cls: 'bg-slate-100 text-slate-800', text: 'This donation was refunded to you.' },
  }[d.status] || { icon: Clock, cls: 'bg-slate-100 text-slate-800', text: '' };
  const Icon = banner.icon;

  return (
    <main className="mx-auto max-w-lg px-6 py-14">
      <Link href={`/donate/${d.campaign._id}`} className="no-print flex w-fit items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900">
        <ArrowLeft size={16} /> Back to the campaign
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mt-5 overflow-hidden rounded-3xl border border-white/50 bg-white shadow-xl shadow-slate-900/10"
      >
        <div className="px-6 py-6 text-center" style={{ background: 'linear-gradient(135deg, #D1FAE5, #E0E7FF)' }}>
          <p className="text-xs font-medium uppercase tracking-widest text-slate-600">Donation receipt</p>
          <p className="mono mt-2 text-2xl font-semibold text-slate-900">{taka(d.amount)}</p>
          <p className="mono mt-1 text-xs text-slate-600">{d.receiptNo}</p>
        </div>

        <div className="px-6 py-5">
          <div className={`flex items-start gap-2 rounded-xl p-3 text-sm ${banner.cls}`}>
            <Icon size={16} className="mt-0.5 shrink-0" /> {banner.text}
          </div>

          <div className="mt-4 divide-y divide-dashed divide-slate-200">
            <Line name="Campaign" value={d.campaign.title} />
            <Line name="Patient" value={d.campaign.patientName} />
            {d.campaign.hospital && <Line name="Hospital" value={d.campaign.hospital} />}
            <Line name="Donor" value={d.donorName} />
            <Line name="Paid with" value={methodMeta(d.method).label} />
            <Line name="Transaction ID" value={d.trxId} mono />
            <Line name="Submitted" value={formatDateTime(d.createdAt)} />
            {d.confirmedAt && <Line name="Confirmed" value={formatDateTime(d.confirmedAt)} />}
            <div className="flex items-center justify-between py-2.5 text-sm">
              <span className="text-slate-500">Status</span>
              <Pill info={donationStatus[d.status] || donationStatus.pending} />
            </div>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-slate-500">
            This is a receipt for your donation. It is not a government tax certificate.
          </p>
        </div>
      </motion.div>

      <DisputeBox receiptNo={d.receiptNo} status={d.status} dispute={d.dispute} onSent={load} />

      <div className="no-print mt-6 flex justify-center">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 rounded-full border border-slate-300/70 bg-white/80 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-white"
        >
          <Printer size={16} /> Print or save as PDF
        </button>
      </div>
    </main>
  );
}