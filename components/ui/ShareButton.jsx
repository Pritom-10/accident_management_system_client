'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Check, Copy, MessageCircle, Send, Share2 } from 'lucide-react';

const enc = encodeURIComponent;

export default function ShareButton({ title, text, url, className = 'inline-block', children = 'Share' }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [link, setLink] = useState(url || '');
  const box = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (box.current && !box.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  function toggle() {
    if (!open) setLink(url || window.location.href);
    setOpen(!open);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error('Could not copy the link');
    }
  }

  async function more() {
    try {
      await navigator.share({ title, text: text || title, url: link });
      setOpen(false);
    } catch {
      return;
    }
  }

  const message = text || title || '';
  const items = [
    ['WhatsApp', `https://wa.me/?text=${enc(`${message} ${link}`)}`, 'bg-emerald-600', <MessageCircle key="w" size={18} />],
    ['Facebook', `https://www.facebook.com/sharer/sharer.php?u=${enc(link)}`, 'bg-blue-600', <span key="f" className="text-base font-bold">f</span>],
    ['Telegram', `https://t.me/share/url?url=${enc(link)}&text=${enc(message)}`, 'bg-sky-500', <Send key="t" size={17} />],
    ['X', `https://twitter.com/intent/tweet?text=${enc(message)}&url=${enc(link)}`, 'bg-slate-900', <span key="x" className="text-sm font-bold">X</span>],
  ];

  return (
    <div ref={box} className={`relative ${className}`}>
      <button
        onClick={toggle}
        aria-expanded={open}
        className="flex w-full items-center justify-center gap-2 rounded-full border border-slate-300/70 bg-white/80 px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-white"
      >
        <Share2 size={16} /> {children}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full z-50 mt-2 w-72 rounded-2xl border border-white/70 bg-white p-3 shadow-2xl shadow-slate-900/15"
          >
            <div className="grid grid-cols-4 gap-2">
              {items.map(([name, href, tone, icon]) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                  className="flex flex-col items-center gap-1.5 rounded-xl p-2 text-[11px] font-medium text-slate-700 hover:bg-slate-100"
                >
                  <span className={`flex h-10 w-10 items-center justify-center rounded-full text-white ${tone}`}>{icon}</span>
                  {name}
                </a>
              ))}
            </div>

            <button
              onClick={copy}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-200"
            >
              {copied ? <Check size={15} /> : <Copy size={15} />} {copied ? 'Link copied' : 'Copy link'}
            </button>

            {typeof navigator !== 'undefined' && navigator.share && (
              <button onClick={more} className="mt-2 w-full rounded-full px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100">
                More apps
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}