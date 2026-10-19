import Link from 'next/link';
import { ArrowRight, HeartHandshake } from 'lucide-react';
import CampaignCard from './donate/CampaignCard';

export default function LatestCampaigns({ campaigns = [] }) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Help a family heal</h2>
          <p className="mt-1 text-sm text-slate-600">Checked campaigns. Every donation and every bill is public.</p>
        </div>
        <Link href="/donate" className="flex shrink-0 items-center gap-1 text-sm font-medium text-slate-700 hover:text-slate-900">
          See all <ArrowRight size={16} />
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/50 bg-white/40 p-10 text-center backdrop-blur-xl">
          <HeartHandshake size={28} className="text-emerald-500" />
          <p className="text-sm text-slate-600">No open campaign right now.</p>
          <Link href="/donate/start" className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700">
            Start a campaign
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((c, i) => (
            <CampaignCard key={c._id} campaign={c} index={i} />
          ))}
        </div>
      )}
    </section>
  );
}