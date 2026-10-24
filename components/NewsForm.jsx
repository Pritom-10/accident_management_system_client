'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Send, Loader2 } from 'lucide-react';
import { API_BASE, apiFetch } from '../lib/api';
import { bdLocations } from '../lib/bdLocations';
import { VEHICLES } from '../lib/newsOptions';
import ImageUpload from './ImageUpload';

const field =
  'w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2.5 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-60';
const label = 'mb-1 block text-sm font-medium text-slate-700';
const byName = (a, b) => a.localeCompare(b);
const divisions = Object.keys(bdLocations);


function toLocalInput(iso) {
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function NewsForm({ post = null, isAdmin = false }) {
  const router = useRouter();
  const editing = Boolean(post);

  const [f, setF] = useState(() => ({
    title: post?.title || '',
    body: post?.body || '',
    occurredAt: toLocalInput(post?.occurredAt || new Date().toISOString()),
    division: post?.location?.division || '',
    district: post?.location?.district || '',
    area: post?.location?.area || '',
    address: post?.location?.address || '',
    road: post?.road || '',
    vehicleTypes: post?.vehicleTypes || [],
    deaths: String(post?.deaths ?? 0),
    injured: String(post?.injured ?? 0),
    videoUrl: post?.videoUrl || '',
    sourceName: post?.sourceName || '',
    sourceUrl: post?.sourceUrl || '',
    isVerified: post ? Boolean(post.isVerified) : true, 
    breaking: false,
  }));
  const [photos, setPhotos] = useState(post?.photos || []);
  const [saving, setSaving] = useState(false);

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const districts = f.division ? Object.keys(bdLocations[f.division] || {}).sort(byName) : [];
  const upazilas = f.division && f.district ? [...(bdLocations[f.division]?.[f.district] || [])].sort(byName) : [];

  function toggleVehicle(value) {
    const has = f.vehicleTypes.includes(value);
    setF({ ...f, vehicleTypes: has ? f.vehicleTypes.filter((v) => v !== value) : [...f.vehicleTypes, value] });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title: f.title,
        body: f.body,
        occurredAt: new Date(f.occurredAt).toISOString(),
        location: { division: f.division, district: f.district, area: f.area, address: f.address },
        road: f.road,
        vehicleTypes: f.vehicleTypes,
        deaths: Number(f.deaths || 0),
        injured: Number(f.injured || 0),
        photos,
        videoUrl: f.videoUrl,
        sourceName: f.sourceName,
        sourceUrl: f.sourceUrl,
        isVerified: isAdmin ? f.isVerified : undefined,
        breaking: isAdmin && !editing ? f.breaking : undefined,
      };

      const res = await apiFetch(editing ? `${API_BASE}/news/${post._id}` : `${API_BASE}/news`, {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not save');

      if (data.status === 'published') {
        toast.success(editing ? 'Saved' : 'Published');
        router.push(`/news/${data.id}`);
      } else {
        toast.success(isAdmin ? 'Saved' : 'Sent for review. An admin will check it soon.');
        router.push(isAdmin ? '/admin' : '/news/mine');
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-white/50 bg-white/50 p-6 backdrop-blur-xl">
      <div>
        <label className={label}>Title</label>
        <input required maxLength={200} value={f.title} onChange={set('title')} className={field} />
      </div>

      <div>
        <label className={label}>Details</label>
        <textarea required rows={8} maxLength={10000} value={f.body} onChange={set('body')} className={field} />
        <p className="mt-1 text-xs text-slate-500">Plain text only. A blank line starts a new paragraph.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label}>When did it happen?</label>
          <input required type="datetime-local" value={f.occurredAt} onChange={set('occurredAt')} className={field} />
        </div>
        <div>
          <label className={label}>Road or highway (optional)</label>
          <input maxLength={150} value={f.road} onChange={set('road')} placeholder="Dhaka-Chattogram Highway" className={field} />
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-slate-900">Where?</p>
        <div className="grid gap-3 sm:grid-cols-3">
          <select
            required
            value={f.division}
            onChange={(e) => setF({ ...f, division: e.target.value, district: '', area: '' })}
            className={field}
          >
            <option value="">Division</option>
            {divisions.map((d) => <option key={d}>{d}</option>)}
          </select>
          <select
            required
            value={f.district}
            disabled={!f.division}
            onChange={(e) => setF({ ...f, district: e.target.value, area: '' })}
            className={field}
          >
            <option value="">District</option>
            {districts.map((d) => <option key={d}>{d}</option>)}
          </select>
          <select value={f.area} disabled={!f.district} onChange={set('area')} className={field}>
            <option value="">Upazila (optional)</option>
            {upazilas.map((u) => <option key={u}>{u}</option>)}
          </select>
        </div>
        <input
          value={f.address}
          onChange={set('address')}
          maxLength={200}
          placeholder="Place or landmark (optional)"
          className={`${field} mt-3`}
        />
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-slate-900">Vehicles involved</p>
        <div className="flex flex-wrap gap-2">
          {VEHICLES.map((v) => (
            <button
              key={v.value}
              type="button"
              onClick={() => toggleVehicle(v.value)}
              className={`rounded-full px-4 py-1.5 text-sm ${
                f.vehicleTypes.includes(v.value)
                  ? 'bg-indigo-600 text-white'
                  : 'border border-slate-300/70 bg-white text-slate-700'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label}>Dead</label>
          <input type="number" min="0" max="10000" value={f.deaths} onChange={set('deaths')} className={field} />
        </div>
        <div>
          <label className={label}>Injured</label>
          <input type="number" min="0" max="10000" value={f.injured} onChange={set('injured')} className={field} />
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-slate-900">Photos (up to 4)</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {photos.map((url, i) => (
            <ImageUpload
              key={`photo-${url}`}
              label={`Photo ${i + 1}`}
              value={url}
              onChange={(u) =>
                setPhotos(u ? photos.map((p, idx) => (idx === i ? u : p)) : photos.filter((_, idx) => idx !== i))
              }
            />
          ))}
          {photos.length < 4 && (
            <ImageUpload
              key={`new-${photos.length}`} 
              label="Add a photo"
              value=""
              onChange={(u) => u && setPhotos([...photos, u])}
            />
          )}
        </div>
      </div>

      <div>
        <label className={label}>Video link (optional)</label>
        <input value={f.videoUrl} onChange={set('videoUrl')} placeholder="https://www.youtube.com/watch?v=..." className={field} />
        <p className="mt-1 text-xs text-slate-500">A YouTube link plays on the page. Other links show as a button.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label}>Source name</label>
          <input maxLength={100} value={f.sourceName} onChange={set('sourceName')} placeholder="Prothom Alo, police, eyewitness..." className={field} />
        </div>
        <div>
          <label className={label}>Source link (optional)</label>
          <input value={f.sourceUrl} onChange={set('sourceUrl')} placeholder="https://..." className={field} />
        </div>
      </div>

      {isAdmin && (
        <label className="flex items-start gap-3 rounded-xl bg-white/70 p-4 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={f.isVerified}
            onChange={(e) => setF({ ...f, isVerified: e.target.checked })}
            className="mt-0.5 h-4 w-4 shrink-0 accent-emerald-600"
          />
          <span>
            <span className="font-medium text-slate-900">Mark as verified</span>
            <span className="mt-0.5 block text-xs text-slate-600">Tick this only if the facts have been confirmed.</span>
          </span>
        </label>
      )}

            {isAdmin && !editing && (
        <label className="flex items-start gap-3 rounded-xl bg-rose-50/70 p-4 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={f.breaking}
            onChange={(e) => setF({ ...f, breaking: e.target.checked })}
            className="mt-0.5 h-4 w-4 shrink-0 accent-rose-600"
          />
          <span>
            <span className="font-medium text-slate-900">Send a push alert (breaking news)</span>
            <span className="mt-0.5 block text-xs text-slate-600">
              People who turned on breaking news alerts for this district will get a notification. Use it only for important news.
            </span>
          </span>
        </label>
      )}

      {!isAdmin && (
        <p className="rounded-xl bg-amber-50 p-4 text-xs text-amber-800">
          After you send it, an admin will read it first. It appears on the site once approved.
        </p>
      )}

      <button
        disabled={saving}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
      >
        {saving ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        {saving ? 'Saving...' : editing ? 'Save changes' : isAdmin ? 'Publish' : 'Send for review'}
      </button>
    </form>
  );
}