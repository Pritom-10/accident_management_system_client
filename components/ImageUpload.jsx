'use client';

import { CldUploadWidget } from 'next-cloudinary';
import { ImagePlus, X } from 'lucide-react';

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2.5 text-sm text-slate-700';

// Uploads to Cloudinary when env vars are set; otherwise falls back to a plain URL box
export default function ImageUpload({ value, onChange, label = 'Photo (optional)' }) {
  const enabled = Boolean(CLOUD && PRESET);

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>

      {value ? (
        <div className="relative w-40">
          <img src={value} alt="Uploaded" className="h-28 w-40 rounded-xl border border-slate-200 object-cover" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute -right-2 -top-2 rounded-full bg-slate-900 p-1 text-white"
            aria-label="Remove photo"
          >
            <X size={14} />
          </button>
        </div>
      ) : enabled ? (
        <CldUploadWidget
          uploadPreset={PRESET}
          options={{ maxFiles: 1, sources: ['local', 'camera'] }}
          onSuccess={(result) => {
            if (result?.info?.secure_url) onChange(result.info.secure_url);
          }}
        >
          {({ open }) => (
            <button
              type="button"
              onClick={() => open()}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white/60 px-3 py-6 text-sm text-slate-600 hover:bg-white/90"
            >
              <ImagePlus size={18} /> Upload a photo
            </button>
          )}
        </CldUploadWidget>
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste image URL (Cloudinary not set up yet)"
          className={inputClass}
        />
      )}
    </div>
  );
}
