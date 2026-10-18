'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { Flag, Loader2 } from 'lucide-react';
import { API_BASE } from '../lib/api';

export default function FlagButton({ caseId }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function send() {
    setBusy(true);
    try {
      const res = await fetch(`${API_BASE}/accidents/${encodeURIComponent(caseId)}/flag`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not send your report');

      toast.success('Thank you. An admin will look at this case.');
      setSent(true);
      setOpen(false);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return <p className="text-xs text-slate-500">You reported this case. Thank you.</p>;
  }

  return (
    <div>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-full border border-slate-300/70 bg-white/70 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-white"
        >
          <Flag size={14} /> Report as fake or wrong
        </button>
      ) : (
        <div className="space-y-3 rounded-xl border border-slate-200 bg-white/70 p-4">
          <p className="text-sm font-medium text-slate-900">What is wrong with this case?</p>
          <textarea
            rows={3}
            maxLength={200}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Optional. For example: this did not happen here."
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
          />
          <div className="flex gap-2">
            <button
              onClick={send}
              disabled={busy}
              className="flex items-center gap-1.5 rounded-full bg-rose-600 px-4 py-2 text-xs font-medium text-white hover:bg-rose-700 disabled:opacity-60"
            >
              {busy && <Loader2 size={14} className="animate-spin" />} Send
            </button>
            <button
              onClick={() => setOpen(false)}
              disabled={busy}
              className="rounded-full border border-slate-300/70 bg-white px-4 py-2 text-xs font-medium text-slate-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}p