'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, HandHeart, HeartPulse, MapPin, Phone, Scale, Siren } from 'lucide-react';
import { PageHero, fieldClass } from '../../components/ui/kit';
import { Skeleton, EmptyState } from '../../components/blood/ui';
import { API_BASE } from '../../lib/api';
import { districtOptions } from '../../lib/locationOptions';
import { CATS, STEPS } from '../../lib/helpGuide';

const districts = districtOptions('');
const tone = { legal: 'bg-indigo-100 text-indigo-600', counseling: 'bg-rose-100 text-rose-600', rehab: 'bg-emerald-100 text-emerald-600', other: 'bg-slate-100 text-slate-600' };
const label = Object.fromEntries(CATS.map((c) => [c.id, c.label]));

export default function HelpPage() {
  const [category, setCategory] = useState('');
  const [district, setDistrict] = useState('');
  const [rows, setRows] = useState(null);

  useEffect(() => {
    const p = new URLSearchParams();
    if (category) p.set('category', category);
    if (district) p.set('district', district);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRows(null);
    fetch(`${API_BASE}/help-orgs?${p.toString()}`)
      .then((res) => (res.ok ? res.json() : []))
      .then(setRows)
      .catch(() => setRows([]));
  }, [category, district]);

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 md:py-12">
      <PageHero
        icon={<Scale size={24} />}
        tone="indigo"
        eyebrow="After an accident"
        title="Legal help, counseling and what to do next"
        subtitle="A simple guide for victims and families, and a list of groups that can help."
        actions={
          <a href="tel:999" className="flex items-center gap-2 rounded-full bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-600/25 hover:bg-rose-700">
            <Siren size={16} /> In danger? Call 999
          </a>
        }
      />

      <section className="mt-6 rounded-3xl border border-white/60 bg-white/60 p-6 shadow-md shadow-slate-900/5 backdrop-blur-xl md:p-8">
        <h2 className="text-lg font-semibold text-slate-900">What to do, step by step</h2>
        <ol className="mt-5 space-y-5">
          {STEPS.map((s, i) => (
            <motion.li
              key={s.title}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: Math.min(i, 3) * 0.05 }}
              className="flex gap-4"
            >
              <span className="mono flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">{i + 1}</span>
              <div>
                <p className="text-base font-semibold text-slate-900">{s.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-700">{s.text}</p>
              </div>
            </motion.li>
          ))}
        </ol>
        <p className="mt-6 rounded-2xl bg-amber-50 p-4 text-xs leading-relaxed text-amber-900">
          This is general information, not legal advice. Laws, time limits and amounts change, so talk to a lawyer or a legal aid group about your own case.
        </p>
      </section>

      <section className="mt-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900"><HandHeart size={20} /> Groups that can help</h2>

        <div className="mt-4 flex flex-wrap gap-3">
          <div className="flex flex-wrap gap-1 rounded-full bg-white/70 p-1">
            {CATS.map((c) => (
              <button key={c.id || 'all'} onClick={() => setCategory(c.id)} className="relative rounded-full px-4 py-1.5 text-xs font-medium">
                {category === c.id && <motion.span layoutId="help-cat" className="absolute inset-0 rounded-full bg-slate-900" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
                <span className={`relative ${category === c.id ? 'text-white' : 'text-slate-700'}`}>{c.label}</span>
              </button>
            ))}
          </div>
          <select value={district} onChange={(e) => setDistrict(e.target.value)} className={`${fieldClass} !w-auto`} aria-label="District">
            <option value="">All of Bangladesh</option>
            {districts.map((d) => <option key={d}>{d}</option>)}
          </select>
        </div>

        <div className="mt-5">
          {rows === null ? (
            <div className="grid gap-4 sm:grid-cols-2"><Skeleton className="h-40" /><Skeleton className="h-40" /></div>
          ) : rows.length === 0 ? (
            <EmptyState icon={HeartPulse} title="No group is listed here yet" text="We only list groups that an admin has checked by phone. Please check back soon, or call 999 for emergencies." />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {rows.map((o) => (
                <div key={o._id} className="flex flex-col gap-3 rounded-3xl border border-white/60 bg-white/60 p-5 shadow-md shadow-slate-900/5 backdrop-blur-xl">
                  <div className="flex items-start gap-3">
                    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tone[o.category]}`}><Scale size={19} /></span>
                    <div className="min-w-0">
                      <p className="text-base font-semibold leading-snug text-slate-900">{o.name}</p>
                      <p className="mt-0.5 flex flex-wrap gap-2 text-[11px]">
                        <span className="rounded-full bg-white/80 px-2 py-0.5 font-medium text-slate-700">{label[o.category]}</span>
                        {o.free && <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-medium text-emerald-700">Free</span>}
                      </p>
                    </div>
                  </div>
                  {o.description && <p className="text-sm leading-relaxed text-slate-600">{o.description}</p>}
                  {(o.address || (o.district && o.district !== 'All')) && (
                    <p className="flex items-start gap-1.5 text-xs text-slate-600"><MapPin size={13} className="mt-0.5 shrink-0" /> {[o.address, o.district !== 'All' ? o.district : ''].filter(Boolean).join(', ')}</p>
                  )}
                  <div className="mt-auto flex flex-wrap gap-2">
                    <a href={`tel:${o.phone}`} className="flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"><Phone size={14} /> {o.phone}</a>
                    {o.website && (
                      <a href={o.website} target="_blank" rel="noopener noreferrer nofollow" className="flex items-center gap-2 rounded-full border border-slate-300/70 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"><Globe size={14} /> Website</a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}