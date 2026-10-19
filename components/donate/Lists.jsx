'use client';

import { motion } from 'framer-motion';
import { Heart, Receipt, Trash2 } from 'lucide-react';
import { imageSrc } from '../../lib/imageUrl';
import { taka } from '../../lib/money';
import { dateText } from '../../lib/blood';
import { EmptyState, Skeleton } from '../blood/ui';
import { MethodChip } from './ui';

export function DonorsList({ donors }) {
  if (donors === null) {
    return <div className="space-y-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-16" />)}</div>;
  }
  if (donors.length === 0) {
    return <EmptyState icon={Heart} title="Be the first to give" text="Confirmed donations will appear here." />;
  }

  return (
    <ul className="space-y-3">
      {donors.map((d, i) => (
        <motion.li
          key={d._id}
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: Math.min(i, 10) * 0.04 }}
          className="flex items-center justify-between gap-3 rounded-2xl border border-white/50 bg-white/50 p-4 backdrop-blur-xl"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700">
              {d.isAnonymous ? <Heart size={16} /> : d.name.charAt(0).toUpperCase()}
            </span>
            <div>
              <p className="text-sm font-medium text-slate-900">{d.name}</p>
              <p className="text-xs text-slate-500">{d.at ? dateText(d.at) : ''}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MethodChip id={d.method} />
            <span className="mono text-sm font-semibold text-slate-900">{taka(d.amount)}</span>
          </div>
        </motion.li>
      ))}
    </ul>
  );
}

export function Ledger({ campaign, expenses, isAdmin, onDelete }) {
  const left = Math.max(0, campaign.raised - campaign.spent);
  const spentPct = campaign.raised > 0 ? Math.min(100, Math.round((campaign.spent / campaign.raised) * 100)) : 0;

  const tiles = [
    ['Received', campaign.raised, 'text-emerald-600'],
    ['Spent', campaign.spent, 'text-rose-600'],
    ['In hand', left, 'text-slate-900'],
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        {tiles.map(([name, value, color]) => (
          <div key={name} className="rounded-2xl border border-white/50 bg-white/50 p-4 backdrop-blur-xl">
            <p className={`mono text-lg font-semibold ${color}`}>{taka(value)}</p>
            <p className="mt-1 text-xs text-slate-600">{name}</p>
          </div>
        ))}
      </div>

      <div>
        <div className="h-3 overflow-hidden rounded-full bg-emerald-200/70">
          <motion.div
            className="h-full rounded-full bg-rose-500"
            initial={{ width: 0 }}
            animate={{ width: `${spentPct}%` }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
          />
        </div>
        <p className="mt-2 text-xs text-slate-500">{spentPct}% of the money received has been spent.</p>
      </div>

      {expenses === null ? (
        <div className="space-y-3">{[0, 1].map((i) => <Skeleton key={i} className="h-20" />)}</div>
      ) : expenses.length === 0 ? (
        <EmptyState icon={Receipt} title="Nothing spent yet" text="Every taka spent will be listed here with a photo of the bill." />
      ) : (
        <ul className="space-y-3">
          {expenses.map((e, i) => (
            <motion.li
              key={e._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i, 10) * 0.04 }}
              className="flex items-center gap-4 rounded-2xl border border-white/50 bg-white/50 p-3 backdrop-blur-xl"
            >
              <a href={imageSrc(e.proofUrl)} target="_blank" rel="noopener noreferrer" className="shrink-0">
                <img src={imageSrc(e.proofUrl)} alt="Receipt" className="h-16 w-16 rounded-xl border border-white object-cover" />
              </a>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900">{e.title}</p>
                <p className="text-xs text-slate-500">{dateText(e.spentOn)}</p>
              </div>
              <span className="mono text-sm font-semibold text-rose-600">{taka(e.amount)}</span>
              {isAdmin && (
                <button
                  onClick={() => onDelete(e)}
                  aria-label="Remove this expense"
                  className="rounded-full p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}