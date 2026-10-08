'use client';

import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { ImagePlus, Loader2, X, RefreshCw } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';


async function resizeImage(file, maxSize = 1200, quality = 0.8) {
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

export default function ImageUpload({ value, onChange, label = 'Photo (optional)' }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [localPreview, setLocalPreview] = useState(null); 

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!value) setLocalPreview(null);
  }, [value]);

3-
  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  async function processFile(file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file');
      return;
    }

    setLocalPreview(URL.createObjectURL(file)); 
    setUploading(true);

    try {
      const blob = await resizeImage(file);
      const formData = new FormData();
      formData.append('image', blob, 'photo.jpg'); 

      const res = await fetch(`${API_BASE}/upload`, { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      onChange(data.url); 
      toast.success('Photo uploaded');
    } catch (err) {
      setLocalPreview(null);
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  function handleRemove(e) {
    e.stopPropagation();
    setLocalPreview(null);
    onChange('');
  }

  function openPicker() {
    if (!uploading) inputRef.current?.click();
  }

  const preview = localPreview || value;

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => processFile(e.target.files?.[0])}
      />

      <div
        role="button"
        tabIndex={0}
        onClick={openPicker}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && openPicker()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          processFile(e.dataTransfer.files?.[0]);
        }}
        className={`group relative flex h-52 w-full cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed transition-colors ${
          dragging
            ? 'border-indigo-500 bg-indigo-50/70'
            : 'border-slate-300 bg-white/60 hover:border-indigo-400 hover:bg-white/80'
        }`}
      >
        {preview ? (
          <>
            <img src={preview} alt="Selected photo" className="h-full w-full object-cover" />

            {/* hover overlay: change photo */}
            {!uploading && (
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-slate-900/45 text-sm font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                <RefreshCw size={16} /> Change photo
              </div>
            )}

            {/* remove button */}
            {!uploading && (
              <button
                type="button"
                onClick={handleRemove}
                className="absolute right-2 top-2 rounded-full bg-slate-900/80 p-1.5 text-white hover:bg-slate-900"
                aria-label="Remove photo"
              >
                <X size={16} />
              </button>
            )}

            {/* uploading overlay */}
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-white/70 text-sm font-medium text-slate-700 backdrop-blur-sm">
                <Loader2 size={18} className="animate-spin" /> Uploading...
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 px-4 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
              <ImagePlus size={22} />
            </span>
            <p className="text-sm font-medium text-slate-700">Click to choose a photo</p>
            <p className="text-xs text-slate-500">or drag &amp; drop it here</p>
          </div>
        )}
      </div>
    </div>
  );
}