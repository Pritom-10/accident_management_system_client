'use client';

import { motion } from 'framer-motion';
import { kindMeta } from '../../lib/newsExtras';
import { dateText } from '../../lib/blood';
import { glass } from '../ui/styles';

export default function UpdatesTimeline({ updates = [] }) {
  if (updates.length === 0) return null;

  return (
    <section className={`${glass} mt-6 p-6 md:p-8`}>
      <h2 className="text-lg font-semibold text-slate-900">Updates on this story</h2>
      <p className="mt-1 text-xs text-slate-500">Newest first.</p>

      <ol className="relative mt-6 space-y-7 border-l-2 border-slate-200 pl-7">
        {updates.map((u, i) => {
          const meta = kindMeta(u.kind);
          const Icon = meta.icon;
          return (
            <motion.li
              key={u._id}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: Math.min(i, 4) * 0.06 }}
              className="relative"
            >
              <span className={`absolute -left-[2.85rem] top-0 flex h-9 w-9 items-center justify-center rounded-full border-4 border-white shadow ${meta.tone}`}>
                <Icon size={15} />
              </span>
              <p className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="font-medium text-slate-700">{meta.label}</span>
                <span className="mono">{dateText(u.at)}</span>
              </p>
              <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-slate-800">{u.text}</p>
              {(Number.isInteger(u.deaths) || Number.isInteger(u.injured)) && (
                <p className="mt-2 flex flex-wrap gap-2 text-xs">
                  {Number.isInteger(u.deaths) && <span className="rounded-full bg-rose-100 px-3 py-1 font-medium text-rose-700">Dead now: {u.deaths}</span>}
                  {Number.isInteger(u.injured) && <span className="rounded-full bg-white/80 px-3 py-1 font-medium text-slate-700">Injured now: {u.injured}</span>}
                </p>
              )}
            </motion.li>
          );
        })}
      </ol>
    </section>
  );
}