'use client';

import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { BadgeCheck, Clock, Send, ShieldCheck, X, XCircle } from 'lucide-react';
import { API_BASE, apiFetch } from '../../lib/api';
import PrivateImage from '../PrivateImage';
import PrivateImageUpload from '../PrivateImageUpload';
import { SectionCard, SubmitButton, fieldClass, labelClass } from '../ui/kit';

const DOCS = [['nid', 'National ID card'], ['license', 'Driving license'], ['passport', 'Passport'], ['student', 'Student ID']];

export default function VerifyPanel() {
  const [info, setInfo] = useState(null);
  const [docType, setDocType] = useState('nid');
  const [images, setImages] = useState([]);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    apiFetch(`${API_BASE}/verification/me`)
      .then((res) => (res.ok ? res.json() : null))
      .then(setInfo)
      .catch(() => setInfo(null));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function submit(e) {
    e.preventDefault();
    if (images.length < 1) {
      toast.error('Add a photo of the document');
      return;
    }
    setBusy(true);
    try {
      const res = await apiFetch(`${API_BASE}/verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docType, images }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not send');
      toast.success('Sent. An admin will check it.');
      setImages([]);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (!info) return null;

  return (
    <div className="mt-8">
      <SectionCard title="Verified badge" hint="A verified badge tells others that an admin has seen your ID.">
        {info.status === 'approved' && (
          <p className="flex items-center gap-2 rounded-2xl bg-emerald-50 p-4 text-sm font-medium text-emerald-800"><BadgeCheck size={18} /> You are verified.</p>
        )}

        {info.status === 'pending' && (
          <p className="flex items-center gap-2 rounded-2xl bg-amber-50 p-4 text-sm font-medium text-amber-800"><Clock size={18} /> An admin is checking your document.</p>
        )}

        {(info.status === 'none' || info.status === 'rejected') && (
          <>
            {info.status === 'rejected' && (
              <p className="flex items-start gap-2 rounded-2xl bg-rose-50 p-4 text-sm text-rose-800">
                <XCircle size={18} className="mt-0.5 shrink-0" /> Not approved{info.reason ? `: ${info.reason}` : '.'} You can send it again.
              </p>
            )}

            <form onSubmit={submit} className="space-y-4">
              <div>
                <label htmlFor="v-doc" className={labelClass}>Document</label>
                <select id="v-doc" value={docType} onChange={(e) => setDocType(e.target.value)} className={fieldClass}>
                  {DOCS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {images.map((url) => (
                  <div key={url} className="relative">
                    <PrivateImage src={url} className="h-32 w-full rounded-xl border border-slate-200 object-cover" />
                    <button type="button" onClick={() => setImages(images.filter((i) => i !== url))} aria-label="Remove photo" className="absolute -right-2 -top-2 rounded-full bg-slate-900 p-1 text-white"><X size={14} /></button>
                  </div>
                ))}
                {images.length < 2 && <PrivateImageUpload label={images.length ? 'Back side (optional)' : 'Front of the document'} onChange={(u) => setImages([...images, u])} />}
              </div>

              <p className="flex items-start gap-2 text-xs leading-relaxed text-slate-500">
                <ShieldCheck size={14} className="mt-0.5 shrink-0 text-emerald-600" />
                Only you and the admins can see these photos. They are deleted from our database as soon as an admin decides.
              </p>

              <SubmitButton loading={busy} tone="slate" icon={<Send size={16} />} className="sm:w-fit sm:px-8">
                {busy ? 'Sending...' : 'Send for checking'}
              </SubmitButton>
            </form>
          </>
        )}
      </SectionCard>
    </div>
  );
}