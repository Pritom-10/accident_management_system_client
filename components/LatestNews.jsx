import Link from 'next/link';
import { ArrowRight, Newspaper } from 'lucide-react';
import NewsCard from './NewsCard';
import Reveal from './Reveal';

export default function LatestNews({ posts = [] }) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Latest accident news</h2>
          <p className="mt-1 text-sm text-slate-600">Stories posted by our admins and journalists.</p>
        </div>
        <Link href="/news" className="flex items-center gap-1 text-sm font-medium text-slate-700 hover:text-slate-900">
          View all <ArrowRight size={16} />
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-white/50 bg-white/40 p-10 text-center text-sm text-slate-600 backdrop-blur-xl">
          <Newspaper size={28} className="text-slate-400" />
          No news yet.
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p, i) => (
            <Reveal key={p._id} delay={i * 0.07} className="h-full">
              <NewsCard post={p} />
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}