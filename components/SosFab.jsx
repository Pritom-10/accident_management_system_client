'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';

const hiddenOn = [/^\/sos/, /^\/donate\/[a-f0-9]{24}$/, /^\/admin/];

export default function SosFab() {
  const pathname = usePathname();
  const hidden = hiddenOn.some((re) => re.test(pathname));

  return (
    <AnimatePresence>
      {!hidden && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ type: 'spring', stiffness: 300, damping: 22, delay: 0.6 }}
          className="no-print fixed bottom-5 right-5 z-[45]"
        >
          <span className="absolute inset-0 animate-ping rounded-full bg-rose-500/40" />
          <Link
            href="/sos"
            aria-label="Send an SOS"
            className="relative flex h-16 w-16 flex-col items-center justify-center rounded-full text-white shadow-2xl shadow-rose-600/50 transition-transform hover:scale-110 active:scale-95"
            style={{ background: 'radial-gradient(circle at 30% 25%, #FB7185, #E11D48 55%, #9F1239)' }}
          >
            <span className="text-lg font-bold leading-none tracking-wide">SOS</span>
            <span className="mt-0.5 text-[9px] font-medium leading-none text-rose-100">HELP</span>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}