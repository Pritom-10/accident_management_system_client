import Link from 'next/link';
import { ArrowRight, HeartPulse } from 'lucide-react';
import BloodRequestCard from './blood/BloodRequestCard';

export default function LatestBlood({ requests = [] }) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Blood needed now</h2>
          <p className="mt-1 text-sm text-slate-600">The most urgent requests. One donor can make the difference.</p>
        </div>
        <Link href="/blood" className="flex shrink-0 items-center gap-1 text-sm font-medium text-slate-700 hover:text-slate-900">
          See all <ArrowRight size={16} />
        </Link>
      </div>

      {requests.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/50 bg-white/40 p-10 text-center backdrop-blur-xl">
          <HeartPulse size={28} className="text-rose-500" />
          <p className="text-sm text-slate-600">No one needs blood right now. Join as a donor so you are ready next time.</p>
          <Link href="/blood/donor" className="rounded-full bg-rose-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-rose-700">
            Become a donor
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {requests.map((r, i) => (
            <BloodRequestCard key={r._id} request={r} index={i} />
          ))}
        </div>
      )}
    </section>
  );
}