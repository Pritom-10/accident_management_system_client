import Link from 'next/link';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import AccidentCard from './AccidentCard';
import Reveal from './Reveal';

export default function AccidentGrid({ accidents = [], showViewAll = true }) {
  return (
    <section id="accidents" className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Verified accidents</h2>
          <p className="mt-1 text-sm text-slate-600">Confirmed by the administrator, most recent first.</p>
        </div>
        {showViewAll && (
          <Link href="/accidents" className="flex items-center gap-1 text-sm font-medium text-slate-700 hover:text-slate-900">
            View all <ArrowRight size={16} />
          </Link>
        )}
      </div>

      {accidents.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-white/50 bg-white/40 p-10 text-center text-sm text-slate-600 backdrop-blur-xl">
          <ShieldCheck size={28} className="text-emerald-600" />
          No verified accidents right now.
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {accidents.map((a, i) => (
            <Reveal key={a.caseId || a._id} delay={i * 0.07} className="h-full">
              <AccidentCard accident={a} />
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}
