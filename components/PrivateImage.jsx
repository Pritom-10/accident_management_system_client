'use client';

import { useEffect, useState } from 'react';
import { API_ORIGIN, apiFetch } from '../lib/api';

export default function PrivateImage({ src, className = '' }) {
  const [url, setUrl] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let objectUrl = null;

    apiFetch(`${API_ORIGIN}${src}`)
      .then((res) => {
        if (!res.ok) throw new Error('failed');
        return res.blob();
      })
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      })
      .catch(() => setFailed(true));

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src]);

  if (failed) {
    return <div className={`flex items-center justify-center bg-slate-100 text-xs text-slate-500 ${className}`}>Could not load</div>;
  }
  if (!url) return <div className={`animate-pulse bg-slate-200 ${className}`} />;

  return (
    <a href={url} target="_blank" rel="noopener noreferrer">
      <img src={url} alt="" className={className} />
    </a>
  );
}