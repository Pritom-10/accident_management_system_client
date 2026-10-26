'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Download, Share, X } from 'lucide-react';
import Logo from '../Logo';
import { usePwa } from './PwaProvider';

const KEY = 'sahayota_install_hidden';
const WAIT = 14 * 24 * 60 * 60 * 1000;
const quiet = [/^\/sos/, /^\/admin/, /^\/donate\/[a-f0-9]{24}$/];

export default function InstallBanner() {
  const pathname = usePathname();
  const { canInstall, ios, standalone, online, install } = usePwa();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const at = Number(localStorage.getItem(KEY));
      if (at && Date.now() - at < WAIT) return undefined;
    } catch (e) {
      return undefined;
    }
    const t = setTimeout(() => setReady(true), 20000);
    return () => clearTimeout(t);
  }, []);

  function hide() {
    try {
      localStorage.setItem(KEY, String(Date.now()));
    } catch (e) {
      setReady(false);
    }
    setReady(false);
  }

  async function go() {
    await install();
    hide();
  }

  const show = ready && online && !standalone && (canInstall || ios) && !quiet.some((re) => re.test(pathname));

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className="no-print fixed inset-x-4 bottom-24 z-[46] rounded-3xl border border-white/70 bg-white/95 p-4 shadow-2xl shadow-slate-900/15 backdrop-blur-xl md:inset-x-auto md:right-5 md:w-96"
        >
          <button onClick={hide} aria-label="Not now" className="absolute right-3 top-3 rounded-full p-1.5 text-slate-400 hover:bg-slate-100">
            <X size={16} />
          </button>
          <div className="flex items-start gap-3 pr-6">
            <Logo size={34} showText={false} />
            <div>
              <p className="text-sm font-semibold text-slate-900">Install Sahayota on your phone</p>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
                Opens in one tap, works with a weak connection, and lets you get alerts.
              </p>
            </div>
          </div>

          {canInstall ? (
            <button onClick={go} className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800">
              <Download size={15} /> Install the app
            </button>
          ) : (
            <p className="mt-3 flex items-center gap-2 rounded-2xl bg-slate-100 p-3 text-xs text-slate-700">
              <Share size={15} className="shrink-0" /> Tap the Share button in Safari, then choose Add to Home Screen.
            </p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}