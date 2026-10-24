'use client';

import toast from 'react-hot-toast';
import { Share2 } from 'lucide-react';

export default function ShareButton({ title, text, className = '', children = 'Share' }) {
  async function share() {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {
        return;
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied. Share it with friends.');
    } catch {
      toast.error('Could not copy the link');
    }
  }

  return (
    <button
      onClick={share}
      className={`flex items-center justify-center gap-2 rounded-full border border-slate-300/70 bg-white/80 px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-white ${className}`}
    >
      <Share2 size={16} /> {children}
    </button>
  );
}