'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Building2, MapPin, Users } from 'lucide-react';
import { GroupBadge, StatusBadge, TimeLeft } from './ui';
import { timeLeft, tierStyle } from '../../lib/blood';

export default function BloodRequestCard({ request, index = 0 }) {
  const { tier } = timeLeft(request.neededBy);
  const pct = Math.min(100, Math.round((request.unitsDonated / request.unitsNeeded) * 100));
  const place = [request.location?.area, request.location?.district].filter(Boolean).join(', ');

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index, 8) * 0.05 }}
      whileHover={{ y: -4 }}
      className="h-full"
    >
      <Link
        href={`/blood/requests/${request._id}`}
        className="flex h-full flex-col gap-4 rounded-2xl border border-white/50 bg-white/50 p-5 shadow-md shadow-slate-900/5 backdrop-blur-xl transition-shadow hover:shadow-xl"
        style={{ borderLeft: `4px solid ${tierStyle[tier].accent}` }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <GroupBadge group={request.bloodGroup} size="lg" />
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {request.unitsNeeded} {request.unitsNeeded === 1 ? 'unit' : 'units'} needed
              </p>
              <p className="text-xs text-slate-600">For {request.patientName}</p>
            </div>
          </div>
          <TimeLeft neededBy={request.neededBy} />
        </div>

        <div className="space-y-1.5 text-xs text-slate-600">
          <p className="flex items-center gap-1.5"><Building2 size={13} /> {request.hospital?.name}</p>
          <p className="flex items-center gap-1.5"><MapPin size={13} /> {place}</p>
        </div>

        <div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-200/80">
            <motion.div
              className="h-full rounded-full bg-rose-600"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
          <p className="mt-1.5 text-xs text-slate-500">
            {request.unitsDonated} of {request.unitsNeeded} donated
          </p>
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-slate-200/70 pt-3">
          <StatusBadge status={request.status} />
          <span className="flex items-center gap-1.5 text-xs text-slate-600">
            <Users size={13} /> {request.offers} {request.offers === 1 ? 'offer' : 'offers'}
          </span>
        </div>
      </Link>
    </motion.div>
  );
}