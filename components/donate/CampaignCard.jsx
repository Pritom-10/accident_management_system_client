'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Building2, HeartHandshake, MapPin, Users } from 'lucide-react';
import { imageSrc } from '../../lib/imageUrl';
import { percent, statusInfo, taka } from '../../lib/money';
import { Pill, ProgressBar, VerifiedBadge } from './ui';

export default function CampaignCard({ campaign, index = 0, showStatus = false }) {
  const p = percent(campaign.raised, campaign.targetAmount);
  const photo = campaign.photos?.[0];
  const place = [campaign.location?.area, campaign.location?.district].filter(Boolean).join(', ');

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index, 8) * 0.05 }}
      whileHover={{ y: -4 }}
      className="h-full"
    >
      <Link
        href={`/donate/${campaign._id}`}
        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/50 bg-white/50 shadow-md shadow-slate-900/5 backdrop-blur-xl transition-shadow hover:shadow-xl"
      >
        <div
          className="relative h-44 w-full overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #D1FAE5, #E0E7FF)' }}
        >
          {photo ? (
            <img
              src={imageSrc(photo)}
              alt=""
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-emerald-500/60">
              <HeartHandshake size={44} />
            </div>
          )}
          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            {campaign.isVerified && <VerifiedBadge />}
            {showStatus && <Pill info={statusInfo[campaign.status] || statusInfo.pending} />}
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-3 p-5">
          <h3 className="line-clamp-2 text-base font-semibold leading-snug text-slate-900">{campaign.title}</h3>

          <div className="space-y-1 text-xs text-slate-600">
            <p className="flex items-center gap-1.5"><Building2 size={13} /> {campaign.hospital?.name}</p>
            <p className="flex items-center gap-1.5"><MapPin size={13} /> {place}</p>
          </div>

          <div className="mt-auto pt-1">
            <ProgressBar value={p} />
            <div className="mt-2 flex items-end justify-between">
              <div>
                <p className="mono text-lg font-semibold text-slate-900">{taka(campaign.raised)}</p>
                <p className="text-xs text-slate-500">raised of {taka(campaign.targetAmount)}</p>
              </div>
              <span className="flex items-center gap-1.5 text-xs text-slate-600">
                <Users size={13} /> {campaign.donorCount}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}