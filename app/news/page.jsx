import { Newspaper } from 'lucide-react';
import NewsCard from '../../components/NewsCard';
import NewsFilters from '../../components/NewsFilters';
import Pagination from '../../components/Pagination';
import WriteNewsLinks from '../../components/WriteNewsLinks';
import { API_BASE } from '../../lib/api';

const PAGE_SIZE = 9;
const FILTER_KEYS = ['q', 'division', 'district', 'area', 'vehicle', 'verified'];

export const metadata = { title: 'Accident news | ResQ' };

async function getNews(params) {
  try {
    const qs = new URLSearchParams({ ...params, limit: String(PAGE_SIZE) }).toString();
    const res = await fetch(`${API_BASE}/news?${qs}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function NewsPage({ searchParams }) {
  const sp = (await searchParams) || {};

  const filters = {};
  for (const k of FILTER_KEYS) {
    if (typeof sp[k] === 'string' && sp[k]) filters[k] = sp[k];
  }
  const requestedPage = typeof sp.page === 'string' ? sp.page : '1';

  const data = await getNews({ ...filters, page: requestedPage });
  const hasFilters = Object.keys(filters).length > 0;

  return (
    <main className="mx-auto max-w-6xl px-6 py-14">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/25">
            <Newspaper size={24} />
          </span>
          <h1 className="mt-4 text-3xl font-semibold text-slate-900">Accident news</h1>
          <p className="mt-2 max-w-xl text-sm text-slate-600">
            Search by word or place, and filter by area, vehicle or whether the news is verified.
          </p>
        </div>
        <WriteNewsLinks />
      </div>

    
      <div className="mt-8">
        <NewsFilters key={JSON.stringify(filters)} initial={filters} />
      </div>

      {data === null ? (
        <div className="mt-8 rounded-2xl border border-white/50 bg-white/40 p-10 text-center text-sm text-slate-600 backdrop-blur-xl">
          Could not load the news. Please try again in a moment.
        </div>
      ) : (
        <>
          <p className="mt-6 text-sm text-slate-600">
            {data.total} {data.total === 1 ? 'story' : 'stories'}
            {hasFilters ? ' match your search' : ''}
            {data.pages > 1 ? ` · page ${data.page} of ${data.pages}` : ''}
          </p>

          {data.items.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-white/50 bg-white/40 p-10 text-center text-sm text-slate-600 backdrop-blur-xl">
              {hasFilters ? 'No news matches this search. Try fewer filters.' : 'No news has been posted yet.'}
            </div>
          ) : (
            <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {data.items.map((p) => (
                <NewsCard key={p._id} post={p} />
              ))}
            </div>
          )}

          <Pagination basePath="/news" params={filters} page={data.page} pages={data.pages} />
        </>
      )}
    </main>
  );
}