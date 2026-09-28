'use client';

import { Toaster } from 'react-hot-toast';

export default function ToasterProvider() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        style: {
          background: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(12px)',
          color: '#0F172A',
          border: '1px solid rgba(255,255,255,0.6)',
          borderRadius: '14px',
          fontSize: '14px',
        },
      }}
    />
  );
}
