'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Phone, WifiOff } from 'lucide-react';
import { usePwa } from './PwaProvider';

const pill = 'fixed inset-x-4 bottom-24 z-[60] mx-auto max-w-md rounded-2xl p-4 shadow-2xl backdrop-blur-xl';

export default function NetworkBanner() {
  const { online } = usePwa();
  const [back, setBack] = useState(false);
  const was = useRef(true);

  useEffect(() => {
    if (!was.current && online) {
      setBack(true);
      was.current = true;
      const t = setTimeout(() => setBack(false), 3500);
      return () => clearTimeout(t);
    }
    was.current = online;
    return undefined;
  }, [online]);

  return (
    <AnimatePresence>
      {!online && (
        <motion.div
          key="offline"
          role="status"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          className={`no-print ${pill} border border-amber-200 bg-amber-50/95`}
        >
          <p className="flex items-center gap-2 text-sm font-semibold text-amber-900">
            <WifiOff size={16} /> You are offline
          </p>
          <p className="mt-1 text-xs leading-relaxed text-amber-800">Pages you saved still open. In an emergency, call 999.</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium">
            <a href="tel:999" className="flex items-center gap-1.5 rounded-full bg-rose-600 px-4 py-2 text-white">
              <Phone size={13} /> 999
            </a>
            <a href="/first-aid" className="rounded-full bg-white px-4 py-2 text-slate-800">First aid</a>
            <a href="/hospitals" className="rounded-full bg-white px-4 py-2 text-slate-800">Hospitals</a>
            <a href="/sos" className="rounded-full bg-white px-4 py-2 text-slate-800">SOS</a>
          </div>
        </motion.div>
      )}

      {online && back && (
        <motion.div
          key="back"
          role="status"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          className={`no-print ${pill} border border-emerald-200 bg-emerald-50/95`}
        >
          <p className="flex items-center gap-2 text-sm font-semibold text-emerald-900">
            <CheckCircle2 size={16} /> Back online
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}