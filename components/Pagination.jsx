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

  const box = 'flex h-10 min-w-10 items-center justify-center rounded-full px-3 text-sm font-medium';

  return (
    <nav className="mt-10 flex flex-wrap items-center justify-center gap-2" aria-label="Pages">
      {page > 1 && (
        <Link href={href(page - 1)} className={`${box} border border-slate-300/70 bg-white/70 text-slate-700 hover:bg-white`}>
          <ChevronLeft size={16} /> Prev
        </Link>
      )}

      {numbers.map((n, i) => (
        <span key={n} className="flex items-center gap-2">
          {i > 0 && n - numbers[i - 1] > 1 && <span className="text-slate-400">…</span>}
          <Link
            href={href(n)}
            className={`${box} ${
              n === page ? 'bg-slate-900 text-white' : 'border border-slate-300/70 bg-white/70 text-slate-700 hover:bg-white'
            }`}
          >
            {n}
          </Link>
        </span>
      ))}

      {page < pages && (
        <Link href={href(page + 1)} className={`${box} border border-slate-300/70 bg-white/70 text-slate-700 hover:bg-white`}>
          Next <ChevronRight size={16} />
        </Link>
      )}
    </nav>
  );
}