'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';

export function Stars({ value = 0, size = 14 }) {
  const rounded = Math.round(value);
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size} fill={i <= rounded ? 'currentColor' : 'none'} className={i <= rounded ? 'text-amber-400' : 'text-slate-300'} />
      ))}
    </span>
  );
}

export function StarPicker({ onPick, disabled }) {
  const [hover, setHover] = useState(0);

  return (
    <span className="inline-flex items-center gap-1" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          disabled={disabled}
          aria-label={`${i} ${i === 1 ? 'star' : 'stars'}`}
          onMouseEnter={() => setHover(i)}
          onClick={() => onPick(i)}
          className="rounded p-1 transition-transform hover:scale-125 active:scale-90 disabled:opacity-50"
        >
          <Star size={22} fill={i <= hover ? 'currentColor' : 'none'} className={i <= hover ? 'text-amber-400' : 'text-slate-300'} />
        </button>
      ))}
    </span>
  );
}