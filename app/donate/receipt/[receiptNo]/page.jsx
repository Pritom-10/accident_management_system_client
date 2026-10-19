'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Clock, Printer, XCircle } from 'lucide-react';
import { API_BASE } from '../../../../lib/api';
import { donationStatus, methodMeta, taka } from '../../../../lib/money';
import { formatDateTime } from '../../../../lib/newsOptions';
import { Skeleton } from '../../../../components/blood/ui';
import { Pill } from '../../../../components/donate/ui';

function Line({ name, value, mono = false }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 text-sm">
      <span className="text-slate-500">{name}</span>
      <span className={`text-right font-medium text-slate-900 ${mono ? 'mono' : ''}`}>{value}</span>
    </div>
  );
}

export default function ReceiptPage() {
  const { receiptNo } = useParams();
  const [data, setData] = useState(null);
  const [state, setState] = useState('loading');

  useEffect(() => {
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
  }[d.status];
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
              <Pill info={donationStatus[d.status]} />
            </div>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-slate-500">
            This is a receipt for your donation. It is not a government tax certificate.
          </p>
        </div>
      </motion.div>

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