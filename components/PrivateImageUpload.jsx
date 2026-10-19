'use client';

import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { ImagePlus, Loader2, Lock } from 'lucide-react';
import { API_BASE, apiFetch } from '../lib/api';

async function resizeImage(file, maxSize = 1600, quality = 0.82) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  canvas.getContext('2d').drawImage(bitmap, 0, 0, w, h);
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
}

export default function PrivateImageUpload({ label = 'Add a document', onChange }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  async function pick(e) {
    const file = e.target.files?.[0];
    if (inputRef.current) inputRef.current.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose a photo of the document');
      return;
    }

    setUploading(true);
    try {
      const blob = await resizeImage(file);
      const formData = new FormData();
      formData.append('image', blob, 'document.jpg');

      const res = await apiFetch(`${API_BASE}/private-images`, { method: 'POST', body: formData });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      onChange(data.url);
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={pick} />
      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="flex h-28 w-full flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-slate-300 bg-white/60 text-sm text-slate-600 transition-colors hover:border-emerald-400 hover:bg-white/80 disabled:opacity-60"
      >
        {uploading ? <Loader2 size={20} className="animate-spin" /> : <ImagePlus size={20} />}
        <span>{uploading ? 'Uploading...' : label}</span>
        <span className="flex items-center gap-1 text-[11px] text-slate-500"><Lock size={11} /> Only admins can see this</span>
      </button>
    </div>
  );
}