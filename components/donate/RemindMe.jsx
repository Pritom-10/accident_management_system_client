'use client';

import { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { BellRing, CheckCircle2, Loader2 } from 'lucide-react';
import { API_BASE, apiFetch } from '../../lib/api';
import { taka } from '../../lib/money';
import { useAuth } from '../AuthProvider';

export default function RemindMe({ campaign, amount, method }) {
  const { user } = useAuth();
  const [frequency, setFrequency] = useState('monthly');
  const [state, setState] = useState('idle');

  async function save() {
    setState('saving');
    try {
      const res = await apiFetch(`${API_BASE}/plans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId: campaign._id, amount, method, frequency }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not save the reminder');
      setState('done');
    } catch (err) {
      toast.error(err.message);
      setState('idle');
    }
  }

  if (state === 'done') {
    return (
      <p className="mt-5 flex items-center justify-center gap-2 rounded-2xl bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
        <CheckCircle2 size={17} /> We will remind you {frequency === 'weekly' ? 'every week' : 'every month'}.
      </p>
    );
  }

  return (
    <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-left">
      <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
        <BellRing size={16} /> Want to help again?
      </p>
      <p className="mt-1 text-xs leading-relaxed text-slate-600">
        We never take money for you. We only remind you to send {taka(amount)} again, by push alert, Telegram or email.
      </p>

      {user ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {[['weekly', 'Every week'], ['monthly', 'Every month']].map(([value, label]) => (
            <button
              key={value}
              onClick={() => setFrequency(value)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium ${frequency === value ? 'bg-slate-900 text-white' : 'border border-slate-300 bg-white text-slate-700'}`}
            >
              {label}
            </button>
          ))}
          <button
            onClick={save}
            disabled={state === 'saving'}
            className="flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {state === 'saving' && <Loader2 size={13} className="animate-spin" />} Remind me
          </button>
        </div>
      ) : (
        <p className="mt-3 text-xs text-slate-600">
          <Link href="/login" className="font-semibold text-indigo-600 hover:underline">Log in</Link> to get reminders.
        </p>
      )}
    </div>
  );
}