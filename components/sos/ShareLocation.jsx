'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { Check, Copy, MessageCircle } from 'lucide-react';
import { shareMessage, smsShare, whatsappShare } from '../../lib/sos';

export default function ShareLocation({ pos }) {
  const [copied, setCopied] = useState(false);
  if (!pos) return null;

  const message = `${shareMessage(pos.lat, pos.lng)} (${pos.lat}, ${pos.lng})`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (e) {
      toast.error('Could not copy');
    }
  }

  return (
    <div className="mt-4 border-t border-rose-200 pt-4">
      <p className="text-sm font-semibold text-rose-900">No internet? Send your location to someone you trust.</p>
      <p className="mt-1 text-xs text-rose-800">This opens your own phone. You press Send.</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <a href={smsShare(message)} className="flex items-center justify-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-white">
          <MessageCircle size={15} /> SMS
        </a>
        <a href={whatsappShare(message)} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white">
          <MessageCircle size={15} /> WhatsApp
        </a>
        <button onClick={copy} className="flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700">
          {copied ? <Check size={15} /> : <Copy size={15} />} {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  );
}