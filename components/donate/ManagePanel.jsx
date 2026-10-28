'use client';

import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Ban, Check, Loader2, Plus, Receipt, X } from 'lucide-react';
import { API_BASE, apiFetch } from '../../lib/api';
import { donationStatus, methodMeta, taka } from '../../lib/money';
import { formatDateTime } from '../../lib/newsOptions';
import { toLocalInput } from '../../lib/blood';
import ImageUpload from '../ImageUpload';
import { CopyButton, MethodChip, Pill } from './ui';
import DisputeActions from './DisputeActions';

const field = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700';
const label = 'mb-1 block text-sm font-medium text-slate-700';
const today = () => toLocalInput(new Date()).slice(0, 10);

export default function ManagePanel({ campaign, onChanged }) {
  const [rows, setRows] = useState(null);
  const [busy, setBusy] = useState('');
  const [rejecting, setRejecting] = useState(null);
  const [reason, setReason] = useState('');
  const [showExpense, setShowExpense] = useState(false);
  const [exp, setExp] = useState({ title: '', amount: '', spentOn: today() });
  const [proof, setProof] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await apiFetch(`${API_BASE}/donate/campaigns/${campaign._id}/manage`);
      if (!res.ok) throw new Error('failed');
      setRows(await res.json());
    } catch {
      setRows([]);
      toast.error('Could not load the donations');
    }
  }, [campaign._id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  async function act(key, path, body, okMessage) {
    setBusy(key);
    try {
      const res = await apiFetch(`${API_BASE}/donate${path}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body || {}),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Something went wrong');

      toast.success(okMessage);
      setRejecting(null);
      setReason('');
      await load();
      onChanged();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy('');
    }
  }

  async function addExpense(e) {
    e.preventDefault();
    if (!proof) {
      toast.error('Add a photo of the receipt or bill');
      return;
    }

    setSaving(true);
    try {
      const res = await apiFetch(`${API_BASE}/donate/campaigns/${campaign._id}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: exp.title, amount: Number(exp.amount), spentOn: exp.spentOn, proofUrl: proof }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not save the expense');

      toast.success('Expense added to the public ledger');
      setExp({ title: '', amount: '', spentOn: today() });
      setProof('');
      setShowExpense(false);
      onChanged();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function closeCampaign() {
    if (!window.confirm('Close this campaign? People will not be able to donate any more.')) return;
    await act('close', `/campaigns/${campaign._id}/close`, {}, 'Campaign closed');
  }

  const pending = (rows || []).filter((r) => r.status === 'pending');
  const complaints = (rows || []).filter((r) => r.dispute && r.dispute.status === 'open');
  const decided = (rows || []).filter((r) => r.status !== 'pending');
  const open = campaign.status === 'active' || campaign.status === 'completed';
  const left = Math.max(0, campaign.raised - campaign.spent);

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8 space-y-6 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 backdrop-blur-xl"
    >
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Manage this campaign</h2>
        <p className="mt-1 text-xs text-slate-600">Only you and the admins can see this part.</p>
      </div>

            {complaints.length > 0 && (
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            Complaints from donors
            <span className="rounded-full bg-rose-600 px-2 py-0.5 text-xs font-semibold text-white">{complaints.length}</span>
          </p>
          <div className="mt-3 space-y-3">
            {complaints.map((d) => (
              <DisputeActions key={d._id} donation={d} onDone={() => { load(); onChanged(); }} />
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          Donations to confirm
          {pending.length > 0 && (
            <span className="rounded-full bg-rose-600 px-2 py-0.5 text-xs font-semibold text-white">{pending.length}</span>
          )}
        </p>

        {rows === null ? (
          <p className="mt-3 text-sm text-slate-600">Loading...</p>
        ) : pending.length === 0 ? (
          <p className="mt-3 rounded-xl bg-white/70 p-4 text-sm text-slate-600">No donation is waiting for you.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            <AnimatePresence initial={false}>
              {pending.map((d) => (
                <motion.li
                  key={d._id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 40 }}
                  className="rounded-xl bg-white p-4 shadow-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="mono text-xl font-semibold text-slate-900">{taka(d.amount)}</span>
                      <MethodChip id={d.method} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="mono rounded-lg bg-slate-100 px-2.5 py-1 text-xs text-slate-800">{d.trxId}</span>
                      <CopyButton text={d.trxId} label="Copy ID" />
                    </div>
                  </div>

                  <p className="mt-2 text-xs text-slate-600">
                    {d.donorName || 'No name'}
                    {d.isAnonymous ? ' (hidden from the public)' : ''}
                    {d.donorPhone ? ` · ${d.donorPhone}` : ''}
                    {d.donorEmail ? ` · ${d.donorEmail}` : ''} · {formatDateTime(d.createdAt)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Open your {methodMeta(d.method).label} account. Confirm only if this transaction ID arrived with this amount.
                  </p>
                  {d.byOwner && <p className="mt-1 text-xs font-medium text-amber-700">Made by the campaign owner. An admin must confirm it.</p>}

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      disabled={busy === d._id}
                      onClick={() => act(d._id, `/donations/${d._id}/confirm`, {}, 'Donation confirmed')}
                      className="flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
                    >
                      {busy === d._id ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />} Confirm
                    </button>
                    <button
                      disabled={busy === d._id}
                      onClick={() => { setRejecting(rejecting === d._id ? null : d._id); setReason(''); }}
                      className="flex items-center gap-1.5 rounded-full bg-rose-600 px-4 py-2 text-xs font-medium text-white hover:bg-rose-700 disabled:opacity-60"
                    >
                      <X size={13} /> Not received
                    </button>
                  </div>

                  <AnimatePresence>
                    {rejecting === d._id && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="mt-3 flex flex-wrap gap-2">
                          <input
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Reason (optional)"
                            className="min-w-[12rem] flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm"
                          />
                          <button
                            onClick={() => act(d._id, `/donations/${d._id}/reject`, { reason }, 'Donation marked as not received')}
                            className="rounded-full bg-slate-900 px-4 py-2 text-xs font-medium text-white"
                          >
                            Confirm
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}

        {decided.length > 0 && (
          <details className="mt-3 rounded-xl bg-white/70 p-4 text-sm">
            <summary className="cursor-pointer text-xs font-medium text-slate-900">Earlier donations ({decided.length})</summary>
            <ul className="mt-3 space-y-2">
              {decided.map((d) => (
                <li key={d._id} className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-700">
                  <span>{taka(d.amount)} · {methodMeta(d.method).label} · <span className="mono">{d.trxId}</span></span>
                  <Pill info={donationStatus[d.status]} />
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>

      {open && (
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold text-slate-900">Spending</p>
            <button
              onClick={() => setShowExpense(!showExpense)}
              className="flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800"
            >
              <Plus size={13} /> Add an expense
            </button>
          </div>
          <p className="mt-1 text-xs text-slate-600">
            Money in hand: <b>{taka(left)}</b>. Each expense needs a photo of the bill. It is shown to everyone.
          </p>

          <AnimatePresence>
            {showExpense && (
              <motion.form
                onSubmit={addExpense}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-4 space-y-4 rounded-xl bg-white p-4">
                  <div>
                    <label className={label}>What was it spent on?</label>
                    <input required maxLength={120} value={exp.title} onChange={(e) => setExp({ ...exp, title: e.target.value })} placeholder="Medicine, hospital bill, tests..." className={field} />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className={label}>Amount (৳)</label>
                      <input required type="number" min="1" value={exp.amount} onChange={(e) => setExp({ ...exp, amount: e.target.value })} className={field} />
                    </div>
                    <div>
                      <label className={label}>Date</label>
                      <input required type="date" value={exp.spentOn} onChange={(e) => setExp({ ...exp, spentOn: e.target.value })} className={field} />
                    </div>
                  </div>
                  <ImageUpload label="Photo of the receipt or bill" value={proof} onChange={setProof} />
                  <button
                    disabled={saving}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
                  >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Receipt size={16} />}
                    {saving ? 'Saving...' : 'Add to the public ledger'}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      )}

      {open && (
        <div className="border-t border-emerald-200 pt-4">
          <button
            onClick={closeCampaign}
            disabled={busy === 'close'}
            className="flex items-center gap-2 rounded-full border border-slate-300/70 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            <Ban size={15} /> Close this campaign
          </button>
        </div>
      )}
    </motion.section>
  );
}