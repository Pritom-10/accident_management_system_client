'use client';

import { Children, useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Building2, ChevronLeft, ChevronRight, Droplet, HeartHandshake, MapPinned, Newspaper } from 'lucide-react';
import { EmptyState } from '../blood/ui';

const icons = {
  droplet: { Icon: Droplet, tone: 'bg-rose-100 text-rose-600' },
  news: { Icon: Newspaper, tone: 'bg-indigo-100 text-indigo-600' },
  donate: { Icon: HeartHandshake, tone: 'bg-emerald-100 text-emerald-600' },
  accident: { Icon: MapPinned, tone: 'bg-violet-100 text-violet-600' },
  hospital: { Icon: Building2, tone: 'bg-sky-100 text-sky-600' },
};

export default function Rail({
  id,
  icon = 'news',
  title,
  subtitle,
  href,
  hrefLabel = 'See all',
  emptyText = 'Nothing here yet.',
  emptyHref,
  emptyLabel,
  children,
}) {
  const track = useRef(null);
  const [edges, setEdges] = useState({ start: true, end: true });
  const items = Children.toArray(children);
  const { Icon, tone } = icons[icon] || icons.news;

  const measure = useCallback(() => {
    const el = track.current;
    if (!el) return;
    setEdges({
      start: el.scrollLeft <= 4,
      end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4,
    });
  }, []);

  useEffect(() => {
    measure();
    const el = track.current;
    if (!el) return undefined;
    el.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure);
    return () => {
      el.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
    };
  }, [measure, items.length]);

  function slide(dir) {
    const el = track.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: 'smooth' });
  }

  const canScroll = !(edges.start && edges.end);

  return (
    <section id={id} className="mx-auto max-w-6xl px-6 py-14">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="flex flex-wrap items-end justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${tone}`}>
            <Icon size={22} />
          </span>
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 md:text-3xl">{title}</h2>
            {subtitle && <p className="mt-1 text-sm text-slate-600">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canScroll && (
            <>
              <button
                onClick={() => slide(-1)}
                disabled={edges.start}
                aria-label="Previous"
                className="hidden h-10 w-10 items-center justify-center rounded-full border border-slate-300/70 bg-white/80 text-slate-700 transition-colors hover:bg-white disabled:opacity-40 sm:flex"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => slide(1)}
                disabled={edges.end}
                aria-label="Next"
                className="hidden h-10 w-10 items-center justify-center rounded-full border border-slate-300/70 bg-white/80 text-slate-700 transition-colors hover:bg-white disabled:opacity-40 sm:flex"
              >
                <ChevronRight size={18} />
              </button>
            </>
          )}
          {href && (
            <Link
              href={href}
              className="group flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-white/70 hover:text-slate-900"
            >
              {hrefLabel} <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          )}
        </div>
      </motion.div>

      {items.length === 0 ? (
        <div className="mt-8">
          <EmptyState icon={Icon} title={emptyText}>
            {emptyHref && (
              <Link href={emptyHref} className="mt-1 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800">
                {emptyLabel}
              </Link>
            )}
          </EmptyState>
        </div>
      ) : (
        <div
          ref={track}
          className="no-scrollbar -mx-6 mt-8 flex scroll-pl-6 snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-4"
        >
          {items.map((child, i) => (
            <motion.div
              key={child.key ?? i}
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.5, delay: Math.min(i, 4) * 0.06 }}
              className="w-[84%] shrink-0 snap-start sm:w-[46%] lg:w-[calc((100%-2.5rem)/3)]"
            >
              {child}
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}