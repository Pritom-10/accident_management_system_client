'use client';

import { useEffect, useState } from 'react';

export default function QrCode({ value, size = 200, className = '' }) {
  const [src, setSrc] = useState('');

  useEffect(() => {
    let alive = true;
    import('qrcode')
      .then((mod) => (mod.default || mod).toDataURL(value, { margin: 1, width: size * 2, errorCorrectionLevel: 'M' }))
      .then((url) => {
        if (alive) setSrc(url);
      })
      .catch(() => {
        if (alive) setSrc('');
      });
    return () => {
      alive = false;
    };
  }, [value, size]);

  if (!src) return <div style={{ width: size, height: size }} className={`animate-pulse rounded-xl bg-slate-200 ${className}`} />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} width={size} height={size} alt="QR code" className={`rounded-xl bg-white ${className}`} />;
}