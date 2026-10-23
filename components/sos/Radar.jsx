'use client';

import { motion } from 'framer-motion';

export default function Radar({ size = 280, tone = 'rose', children }) {
  const border = tone === 'emerald' ? 'border-emerald-400' : 'border-rose-400';

  return (
    <div className="relative mx-auto flex items-center justify-center" style={{ width: size, height: size }}>
      {[0, 0.8, 1.6].map((delay) => (
        <motion.span
          key={delay}
          className={`absolute inset-0 rounded-full border-2 ${border}`}
          animate={{ scale: [0.55, 1], opacity: [0.7, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut', delay }}
        />
      ))}
      <div className="relative">{children}</div>
    </div>
  );
}