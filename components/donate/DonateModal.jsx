'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, ShieldCheck, X } from 'lucide-react';
import { API_BASE, apiFetch } from '../../lib/api';
import { QUICK_AMOUNTS, methodMeta, taka } from '../../lib/money';
import { useAuth } from '../AuthProvider';
import { Confetti, CopyButton } from './ui';

const field = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700';
const label = 'mb-1 block text-sm font-medium text-slate-700';
const stepNames = ['Amount', 'Pay', 'Confirm'];

function Stepper({ step }) {
  return (
    <div className="flex items-center px-1">
      {stepNames.map((name, i) => (
        <div key={name} className="flex flex-1 items-center last:flex-none">
          <div className="flex flex-col items-center gap-1">
            <motion.span
              animate={{ scale: i === step ? 1.12 : 1 }}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                i <= step ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
              }`}
            >
              {i < step ? <CheckCircle2 size={16} /> : i + 1}
            </motion.span>
            <span className={`text-[11px] ${i <= step ? 'font-medium text-slate-900' : 'text-slate-500'}`}>{name}</span>
          </div>
          {i < stepNames.length - 1 && (
            <div className="mx-2 mb-4 h-0.5 flex-1 overflow-hidden rounded-full bg-slate-200">
              <motion.div
                className="h-full bg-emerald-600"
                initial={false}
                animate={{ width: i < step ? '100%' : '0%' }}
                transition={{ duration: 0.4 }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function Row({ title, value, copy }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3">
      <div className="min-w-0">
        <p className="text-xs text-slate-500">{title}</p>
        <p className="mono truncate text-base font-semibold text-slate-900">{value}</p>
      </div>
      {copy && <CopyButton text={copy} />}
    </div>
  );
}

function PayInstructions({ account, amount }) {
  const meta = methodMeta(account.method);

  if (account.method === 'bank') {
    return (
      <div className="space-y-2">
        <Row title="Bank" value={account.bankName} />
        {account.branch && <Row title="Branch" value={account.branch} />}
        <Row title="Account name" value={account.accountName} />
        <Row title="Account number" value={account.number} copy={account.number} />
        <Row title="Amount" value={taka(amount)} copy={String(amount)} />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <ol className="list-decimal space-y-1 pl-5 text-sm text-slate-700">
        <li>Open the {meta.label} app.</li>
        <li>Choose <b>Send Money</b>.</li>
        <li>Send exactly <b>{taka(amount)}</b> to the number below.</li>
        <li>Keep the <b>Transaction ID</b> from the confirmation message.</li>
      </ol>
      <Row title={`${meta.label} number`} value={account.number} copy={account.number} />
      <Row title="Account name" value={account.accountName} />
      <Row title="Amount" value={taka(amount)} copy={String(amount)} />
    </div>
  );
}

export default function DonateModal({ campaign, onClose }) {
  const { user } = useAuth();
  const accounts = campaign.paymentAccounts || [];
  const closeRef = useRef(onClose);
  // eslint-disable-next-line react-hooks/refs
  closeRef.current = onClose;

  const [step, setStep] = useState(0);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState(accounts[0]?.method || '');
  const [f, setF] = useState({
    trxId: '',
    donorName: user?.name || '',
    donorEmail: user?.email || '',
    donorPhone: '',
  });
  const [anonymous, setAnonymous] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') closeRef.current();
    };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, []);

  const amountNumber = Number(amount);
  const amountOk = Number.isInteger(amountNumber) && amountNumber >= 10 && amountNumber <= 5000000;
  const account = accounts.find((a) => a.method === method);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setSending(true);
    try {
      const res = await apiFetch(`${API_BASE}/donate/campaigns/${campaign._id}/donations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amountNumber,
          method,
          trxId: f.trxId,
          donorName: f.donorName,
          isAnonymous: anonymous,
          donorEmail: f.donorEmail,
          donorPhone: f.donorPhone,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not submit your donation');

      setResult(data);
      setStep(3);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSending(false);
    }
  }

  const slide = {
    initial: { opacity: 0, x: 28 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -28 },
    transition: { duration: 0.22 },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 backdrop-blur-sm sm:items-center sm:p-6"
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        initial={{ y: 60, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl"
      >
        {step < 3 && (
          <>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs text-slate-500">You are helping</p>
                <h2 className="text-lg font-semibold leading-snug text-slate-900">{campaign.title}</h2>
              </div>
              <button onClick={onClose} aria-label="Close" className="rounded-full p-2 text-slate-500 hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>
            <div className="mt-5"><Stepper step={step} /></div>
          </>
        )}

        <div className="mt-6">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="amount" {...slide} className="space-y-5">
                <div>
                  <p className="text-sm font-medium text-slate-900">How much would you like to give?</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {QUICK_AMOUNTS.map((n) => (
                      <motion.button
                        key={n}
                        type="button"
                        whileTap={{ scale: 0.93 }}
                        onClick={() => setAmount(String(n))}
                        className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                          amountNumber === n ? 'bg-emerald-600 text-white' : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {taka(n)}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={label}>Or type an amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-500">৳</span>
                    <input
                      type="number"
                      min="10"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0"
                      className={`${field} mono py-3 pl-9 text-xl`}
                    />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">From ৳10 to ৳50,00,000.</p>
                </div>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  disabled={!amountOk}
                  onClick={() => setStep(1)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Continue <ArrowRight size={16} />
                </motion.button>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="pay" {...slide} className="space-y-5">
                <div>
                  <p className="text-sm font-medium text-slate-900">Pay {taka(amountNumber)} using</p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {accounts.map((a) => {
                      const meta = methodMeta(a.method);
                      const active = a.method === method;
                      return (
                        <motion.button
                          key={a.method}
                          type="button"
                          whileTap={{ scale: 0.96 }}
                          onClick={() => setMethod(a.method)}
                          className={`flex items-center gap-2 rounded-xl border-2 px-3 py-3 text-sm font-medium transition-colors ${
                            active ? 'border-emerald-500 bg-emerald-50 text-slate-900' : 'border-slate-200 bg-white text-slate-700'
                          }`}
                        >
                          <span className="h-3 w-3 rounded-full" style={{ background: meta.color }} />
                          {meta.label}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {account && (
                    <motion.div key={account.method} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                      <PayInstructions account={account} amount={amountNumber} />
                    </motion.div>
                  )}
                </AnimatePresence>

                <p className="flex items-start gap-2 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800">
                  <ShieldCheck size={15} className="mt-0.5 shrink-0" />
                  The money goes straight to the family&rsquo;s account. ResQ never holds your money, and never asks you to send it anywhere else.
                </p>

                <div className="flex gap-3">
                  <button onClick={() => setStep(0)} className="flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50">
                    <ArrowLeft size={16} /> Back
                  </button>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setStep(2)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white hover:bg-emerald-700"
                  >
                    I have paid <ArrowRight size={16} />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.form key="confirm" {...slide} onSubmit={submit} className="space-y-4">
                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm">
                  <span className="text-slate-600">You sent</span>
                  <span className="mono font-semibold text-slate-900">{taka(amountNumber)} via {methodMeta(method).label}</span>
                </div>

                <div>
                  <label className={label}>Transaction ID (TrxID)</label>
                  <input
                    required
                    value={f.trxId}
                    onChange={(e) => setF({ ...f, trxId: e.target.value.toUpperCase() })}
                    placeholder="From your payment message"
                    className={`${field} mono`}
                  />
                </div>

                <div>
                  <label className={label}>Your name</label>
                  <input value={f.donorName} onChange={set('donorName')} maxLength={60} className={field} />
                </div>

                <label className="flex items-start gap-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={anonymous}
                    onChange={(e) => setAnonymous(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-emerald-600"
                  />
                  <span>
                    <span className="font-medium text-slate-900">Hide my name from the public</span>
                    <span className="mt-0.5 block text-xs text-slate-500">It will show as &ldquo;Anonymous&rdquo;. The family still sees it.</span>
                  </span>
                </label>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className={label}>Email for the receipt</label>
                    <input type="email" value={f.donorEmail} onChange={set('donorEmail')} placeholder="Optional" className={field} />
                  </div>
                  <div>
                    <label className={label}>Mobile number</label>
                    <input type="tel" value={f.donorPhone} onChange={set('donorPhone')} placeholder="Optional" className={field} />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(1)} className="flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50">
                    <ArrowLeft size={16} /> Back
                  </button>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    disabled={sending}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
                  >
                    {sending ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                    {sending ? 'Submitting...' : 'Submit donation'}
                  </motion.button>
                </div>
              </motion.form>
            )}

            {step === 3 && result && (
              <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative py-4 text-center">
                <Confetti />
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.25, 1] }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                  className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"
                >
                  <CheckCircle2 size={34} />
                </motion.span>
                <h2 className="mt-4 text-xl font-semibold text-slate-900">Thank you for your kindness</h2>
                <p className="mx-auto mt-2 max-w-sm text-sm text-slate-600">
                  The family will see your payment in their account and confirm it. Your receipt is ready.
                </p>
                <p className="mono mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900">{result.receiptNo}</p>
                <div className="mt-5 flex flex-wrap justify-center gap-3">
                  <Link
                    href={`/donate/receipt/${result.receiptNo}`}
                    className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
                  >
                    View receipt
                  </Link>
                  <button onClick={onClose} className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                    Close
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}