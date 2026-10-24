import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ basePath, params, page, pages }) {
  if (pages <= 1) return null;

  const href = (n) => {
    const p = new URLSearchParams(params);
    if (n > 1) p.set('page', String(n));
    else p.delete('page');
    const qs = p.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  const numbers = [...new Set([1, page - 1, page, page + 1, pages])]
    .filter((n) => n >= 1 && n <= pages)
    .sort((a, b) => a - b);

  const box = 'flex h-11 min-w-11 items-center justify-center rounded-full px-4 text-sm font-medium transition-all duration-200';
  const idle = 'border border-white/70 bg-white/70 text-slate-700 backdrop-blur-xl hover:-translate-y-0.5 hover:bg-white hover:shadow-md';

  return (
    <nav className="mt-12 flex flex-wrap items-center justify-center gap-2" aria-label="Pages">
      {page > 1 && (
        <Link href={href(page - 1)} className={`${box} ${idle} gap-1`}>
          <ChevronLeft size={16} /> Prev
        </Link>
      )}

      {numbers.map((n, i) => (
        <span key={n} className="flex items-center gap-2">
          {i > 0 && n - numbers[i - 1] > 1 && <span className="text-slate-400">…</span>}
          <Link
            href={href(n)}
            aria-current={n === page ? 'page' : undefined}
            className={`${box} ${n === page ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' : idle}`}
          >
            {n}
          </Link>
        </span>
      ))}

      {page < pages && (
        <Link href={href(page + 1)} className={`${box} ${idle} gap-1`}>
          Next <ChevronRight size={16} />
        </Link>
      )}
    </nav>
  );
}