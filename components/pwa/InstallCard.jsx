'use client';

import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { CheckCircle2, Download, MoreVertical, PlusSquare, Share, Smartphone } from 'lucide-react';
import { usePwa } from './PwaProvider';
import { glass } from '../ui/styles';

export default function InstallCard() {
  const { standalone, canInstall, ios, install } = usePwa();

  async function go() {
    const outcome = await install();
    if (outcome === 'accepted') toast.success('Installing Sahayota');
  }

  if (standalone) {
    return (
      <div className={`${glass} flex items-center gap-3 p-5`}>
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
          <CheckCircle2 size={20} />
        </span>
        <p className="text-sm font-medium text-slate-800">You are using the installed app.</p>
      </div>
    );
  }

  return (
    <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className={`${glass} p-6`}>
      <div className="flex items-start gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
          <Smartphone size={20} />
        </span>
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-slate-900">Install the app</h2>
          <p className="mt-1 text-xs leading-relaxed text-slate-600">
            It gets its own icon, opens in one tap, and saves the first aid guide and hospital numbers for when the internet is weak.
          </p>
        </div>
      </div>

      {canInstall ? (
        <button onClick={go} className="mt-4 flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-medium text-white hover:bg-slate-800">
          <Download size={16} /> Install the app
        </button>
      ) : ios ? (
        <ol className="mt-4 space-y-3 text-sm text-slate-700">
          <li className="flex items-center gap-3">
            <span className="mono flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs text-white">1</span>
            Open this site in Safari.
          </li>
          <li className="flex items-center gap-3">
            <span className="mono flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs text-white">2</span>
            <span className="flex items-center gap-1.5">Tap the Share button <Share size={15} /></span>
          </li>
          <li className="flex items-center gap-3">
            <span className="mono flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs text-white">3</span>
            <span className="flex items-center gap-1.5">Choose Add to Home Screen <PlusSquare size={15} /></span>
          </li>
          <li className="flex items-center gap-3">
            <span className="mono flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs text-white">4</span>
            Open Sahayota from your Home Screen, then turn on alerts. Needs iOS 16.4 or newer.
          </li>
        </ol>
      ) : (
        <p className="mt-4 flex items-center gap-2 rounded-2xl bg-slate-100 p-4 text-sm text-slate-700">
          <MoreVertical size={16} className="shrink-0" /> Open your browser menu and choose Install app, or Add to Home screen.
        </p>
      )}
    </motion.section>
  );
}