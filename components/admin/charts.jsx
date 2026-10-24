'use client';

import { useId, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const W = 600;
const STEPS = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];

function axisTop(max) {
  if (max <= 4) return 4;
  const pow = 10 ** Math.floor(Math.log10(max));
  const n = max / pow;
  const step = STEPS.find((s) => s >= n) || 10;
  return Math.ceil((step * pow) / 4) * 4;
}

export function AreaChart({ data = [], height = 220, color = '#E11D48', mini = false, labelOf = (a) => a, valueText = (v) => String(v), emptyText = 'No data in this period' }) {
  const [hover, setHover] = useState(null);
  const ref = useRef(null);
  const gid = useId().replace(/:/g, '');

  const n = data.length;
  if (n < 2) return <p className="py-6 text-center text-xs text-slate-500">Not enough data yet</p>;

  const H = mini ? 64 : height;
  const padL = mini ? 0 : 40;
  const padR = mini ? 0 : 8;
  const padT = mini ? 6 : 14;
  const padB = mini ? 0 : 26;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const max = Math.max(...data.map((d) => d.value), 0);
  const top = mini ? Math.max(max, 1) : axisTop(max);
  const x = (i) => padL + (i / (n - 1)) * innerW;
  const y = (v) => padT + innerH - (v / top) * innerH;
  const pts = data.map((d, i) => [x(i), y(d.value)]);

  const line = pts
    .map((p, i) => {
      if (i === 0) return `M${p[0]},${p[1]}`;
      const mid = (pts[i - 1][0] + p[0]) / 2;
      return `C${mid},${pts[i - 1][1]} ${mid},${p[1]} ${p[0]},${p[1]}`;
    })
    .join(' ');
  const area = `${line} L${pts[n - 1][0]},${padT + innerH} L${pts[0][0]},${padT + innerH} Z`;

  const labelCount = Math.min(n, 6);
  const labelIdx = [...new Set(Array.from({ length: labelCount }, (_, k) => Math.round((k * (n - 1)) / Math.max(1, labelCount - 1))))];

  function onMove(e) {
    if (mini || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const i = Math.round(((px - padL) / innerW) * (n - 1));
    setHover(Math.min(n - 1, Math.max(0, i)));
  }

  const hoverLeft = hover === null ? 0 : (x(hover) / W) * 100;
  const shiftX = hoverLeft < 18 ? '0%' : hoverLeft > 82 ? '-100%' : '-50%';

  return (
    <div
      ref={ref}
      className="relative"
      onPointerMove={onMove}
      onPointerLeave={() => setHover(null)}
      role={mini ? undefined : 'img'}
      aria-label={mini ? undefined : 'Trend chart'}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.32" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {!mini &&
          [0, 1, 2, 3, 4].map((i) => {
            const gy = padT + innerH - (i / 4) * innerH;
            return (
              <g key={i}>
                <line x1={padL} x2={W - padR} y1={gy} y2={gy} stroke="#E2E8F0" strokeWidth="1" />
                <text x={padL - 8} y={gy + 3.5} textAnchor="end" fontSize="11" fill="#94A3B8">
                  {Math.round((top * i) / 4).toLocaleString('en-IN')}
                </text>
              </g>
            );
          })}

        <motion.path key={area} d={area} fill={`url(#${gid})`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.25 }} />
        <motion.path
          key={line}
          d={line}
          fill="none"
          stroke={color}
          strokeWidth={mini ? 2 : 2.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />

        {!mini &&
          labelIdx.map((i, k) => (
            <text
              key={i}
              x={x(i)}
              y={H - 7}
              fontSize="11"
              fill="#94A3B8"
              textAnchor={k === 0 ? 'start' : k === labelIdx.length - 1 ? 'end' : 'middle'}
            >
              {labelOf(data[i].at, true)}
            </text>
          ))}

        {hover !== null && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={padT} y2={padT + innerH} stroke={color} strokeWidth="1" strokeDasharray="4 4" opacity="0.6" />
            <circle cx={x(hover)} cy={y(data[hover].value)} r="5" fill="#fff" stroke={color} strokeWidth="3" />
          </g>
        )}
      </svg>

      {!mini && max === 0 && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="rounded-full bg-white/90 px-4 py-2 text-xs text-slate-600 shadow">{emptyText}</span>
        </div>
      )}

      {!mini && hover !== null && (
        <div
          className="pointer-events-none absolute z-10 whitespace-nowrap rounded-xl bg-slate-900 px-3 py-2 text-xs text-white shadow-xl"
          style={{ left: `${hoverLeft}%`, top: `${(y(data[hover].value) / H) * 100}%`, transform: `translate(${shiftX}, -125%)` }}
        >
          <p className="text-slate-300">{labelOf(data[hover].at, false)}</p>
          <p className="mono font-semibold">{valueText(data[hover].value)}</p>
        </div>
      )}
    </div>
  );
}

export function ColumnChart({ data = [], height = 180, color = '#6366F1', hot = '#E11D48', labelEvery = 1, valueText = (v) => String(v) }) {
  const max = Math.max(...data.map((d) => d.value), 0);
  const hotIndex = max > 0 ? data.findIndex((d) => d.value === max) : -1;

  return (
    <div>
      <div className="flex items-end gap-1" style={{ height }}>
        {data.map((d, i) => (
          <div key={d.label} className="group relative flex h-full flex-1 flex-col justify-end" aria-label={`${d.label}: ${valueText(d.value)}`}>
            <span className="pointer-events-none absolute left-1/2 top-0 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100">
              {d.label}: {valueText(d.value)}
            </span>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: max > 0 ? `${d.value > 0 ? Math.max(4, (d.value / max) * 100) : 1}%` : '1%' }}
              transition={{ duration: 0.6, delay: i * 0.015, ease: 'easeOut' }}
              style={{ background: i === hotIndex ? hot : color, opacity: d.value > 0 ? 1 : 0.25 }}
              className="w-full rounded-t-md"
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-1">
        {data.map((d, i) => (
          <span key={d.label} className="flex-1 text-center text-[10px] text-slate-500">
            {i % labelEvery === 0 ? d.short || d.label : ''}
          </span>
        ))}
      </div>
    </div>
  );
}

export function BarList({ items = [], color = '#6366F1', empty = 'No data yet', valueText = (v) => String(v) }) {
  const max = Math.max(...items.map((i) => i.value), 0);
  if (items.length === 0 || max === 0) return <p className="text-sm text-slate-500">{empty}</p>;

  return (
    <ul className="space-y-3.5">
      {items.map((it, i) => (
        <li key={it.label}>
          <div className="mb-1 flex items-center justify-between gap-3 text-sm">
            <span className="truncate text-slate-700">{it.label}</span>
            <span className="mono shrink-0 text-xs font-semibold text-slate-900">{valueText(it.value)}</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-slate-200/70">
            <motion.div
              className="h-full rounded-full"
              style={{ background: color }}
              initial={{ width: 0 }}
              animate={{ width: `${(it.value / max) * 100}%` }}
              transition={{ duration: 0.7, delay: i * 0.05, ease: 'easeOut' }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function Donut({ parts = [], size = 140, thickness = 18, center, centerLabel }) {
  const total = parts.reduce((sum, p) => sum + p.value, 0);
  const r = (size - thickness) / 2;
  const C = 2 * Math.PI * r;
  let acc = 0;

  return (
    <div className="flex flex-wrap items-center gap-6">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full -rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E2E8F0" strokeWidth={thickness} />
          {total > 0 &&
            parts
              .filter((p) => p.value > 0)
              .map((p) => {
                const len = (p.value / total) * C;
                const offset = -acc;
                acc += len;
                return (
                  <motion.circle
                    key={p.label}
                    cx={size / 2}
                    cy={size / 2}
                    r={r}
                    fill="none"
                    stroke={p.color}
                    strokeWidth={thickness}
                    strokeDashoffset={offset}
                    initial={{ strokeDasharray: `0 ${C}` }}
                    animate={{ strokeDasharray: `${len} ${C - len}` }}
                    transition={{ duration: 0.9, ease: 'easeOut' }}
                  />
                );
              })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="mono text-xl font-semibold text-slate-900">{center}</span>
          {centerLabel && <span className="text-[10px] text-slate-500">{centerLabel}</span>}
        </div>
      </div>

      <ul className="space-y-2 text-sm">
        {parts.map((p) => (
          <li key={p.label} className="flex items-center gap-2 text-slate-700">
            <span className="h-3 w-3 rounded-full" style={{ background: p.color }} />
            {p.label} <span className="mono font-semibold text-slate-900">{p.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}