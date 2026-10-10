'use client';

import { HeartHandshake, MessageCircle, ExternalLink } from 'lucide-react';


const CHANNEL_URL = 'https://whatsapp.com/channel/0029VbDj3IT2v1InRV8uAk3k';

export default function SubscribeBox() {
  return (
    <div className="mt-8 rounded-2xl border border-white/50 bg-white/50 p-5 shadow-lg shadow-slate-900/5 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
          <HeartHandshake size={18} />
        </span>
        <div>
          <p className="text-sm font-semibold text-slate-900">Want to donate? Get alerts on WhatsApp</p>
          <p className="text-xs text-slate-600">
            Follow our channel and we&rsquo;ll post whenever a case opens for donation.
          </p>
        </div>
      </div>

      <a
        href={CHANNEL_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
      >
        <MessageCircle size={16} /> Join our WhatsApp channel <ExternalLink size={14} />
      </a>

      <p className="mt-3 text-center text-xs text-slate-500">
        Your phone number stays private. Channel followers cannot see each other.
      </p>
    </div>
  );
}