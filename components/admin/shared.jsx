'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';

export const cardClass =
  'rounded-2xl border border-white/50 bg-white/50 p-5 shadow-md shadow-slate-900/5 backdrop-blur-xl';
const btnBase =
  'flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-60';
export const btnGreen = `${btnBase} bg-emerald-600 text-white hover:bg-emerald-700`;
export const btnRed = `${btnBase} bg-rose-600 text-white hover:bg-rose-700`;
export const btnGray = `${btnBase} border border-slate-300/70 bg-white text-slate-700 hover:bg-slate-100`;

export const fmt = (d) => (d ? new Date(d).toLocaleString() : '');

export function Pills({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(([id, text]) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            value === id
              ? 'bg-slate-900 text-white'
              : 'border border-slate-300/70 bg-white/60 text-slate-700 hover:bg-white/90'
          }`}
        >
          {text}
        </button>
      ))}
    </div>
  );
}

export function Loading() {
  return <p className="py-10 text-center text-sm text-slate-600">Loading...</p>;
}

export function EmptyBox({ text }) {
  return (
    <div className="rounded-2xl border border-white/50 bg-white/40 p-10 text-center text-sm text-slate-600 backdrop-blur-xl">
      {text}
    </div>
  );
}


export function RejectBox({ checks = [], placeholder = 'Reason (optional)', onConfirm, onCancel }) {
  const [reason, setReason] = useState('');
  const [flags, setFlags] = useState({});
  const [busy, setBusy] = useState(false);

  async function confirm() {
    setBusy(true);
    await onConfirm(reason, flags);
    setBusy(false);
  }

  return (
    <div className="mt-3 space-y-3 rounded-xl border border-rose-200 bg-rose-50/60 p-4">
      <input
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
      />
      {checks.map((c) => (
        <label key={c.key} className="flex items-center gap-2 text-xs text-slate-700">
          <input
            type="checkbox"
            checked={!!flags[c.key]}
            onChange={(e) => setFlags({ ...flags, [c.key]: e.target.checked })}
            className="h-4 w-4 accent-rose-600"
          />
          {c.label}
        </label>
      ))}
      <div className="flex gap-2">
        <button onClick={confirm} disabled={busy} className={btnRed}>
          {busy && <Loader2 size={14} className="animate-spin" />} Confirm reject
        </button>
        <button onClick={onCancel} disabled={busy} className={btnGray}>
          Cancel
        </button>
      </div>
    </div>
  );
}