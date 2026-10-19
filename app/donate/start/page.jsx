'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { HeartHandshake, Loader2, Lock, Plus, Send, Trash2, X } from 'lucide-react';
import RoleGate from '../../../components/RoleGate';
import ImageUpload from '../../../components/ImageUpload';
import PrivateImage from '../../../components/PrivateImage';
import PrivateImageUpload from '../../../components/PrivateImageUpload';
import { API_BASE, apiFetch } from '../../../lib/api';
import { bdLocations } from '../../../lib/bdLocations';
import { METHODS } from '../../../lib/money';

const field =
  'w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2.5 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-60';
const label = 'mb-1 block text-sm font-medium text-slate-700';
const sectionClass = 'space-y-5 rounded-2xl border border-white/50 bg-white/50 p-6 backdrop-blur-xl';
const divisions = Object.keys(bdLocations);
const byName = (a, b) => a.localeCompare(b);
const blankAccount = (method) => ({ method, number: '', accountName: '', bankName: '', branch: '' });

const rise = (i) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.08 },
});

function StartForm() {
  const router = useRouter();
  const [f, setF] = useState({
    title: '',
    patientName: '',
    story: '',
    hospitalName: '',
    hospitalAddress: '',
    division: '',
    district: '',
    area: '',
    targetAmount: '',
  });
  const [photos, setPhotos] = useState([]);
  const [docs, setDocs] = useState([]);
  const [accounts, setAccounts] = useState([blankAccount('bkash')]);
  const [agree, setAgree] = useState(false);
  const [saving, setSaving] = useState(false);

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const districts = f.division ? Object.keys(bdLocations[f.division] || {}).sort(byName) : [];
  const upazilas = f.division && f.district ? [...(bdLocations[f.division]?.[f.district] || [])].sort(byName) : [];
  const usedMethods = accounts.map((a) => a.method);
  const nextMethod = METHODS.find((m) => !usedMethods.includes(m.id));

  const updateAccount = (i, patch) =>
    setAccounts(accounts.map((a, idx) => (idx === i ? { ...a, ...patch } : a)));

  async function handleSubmit(e) {
    e.preventDefault();
    if (docs.length < 1) {
      toast.error('Add at least one photo of a document that proves the need');
      return;
    }
    if (!agree) {
      toast.error('Please confirm the promise at the bottom');
      return;
    }

    setSaving(true);
    try {
      const res = await apiFetch(`${API_BASE}/donate/campaigns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: f.title,
          patientName: f.patientName,
          story: f.story,
          hospital: { name: f.hospitalName, address: f.hospitalAddress },
          location: { division: f.division, district: f.district, area: f.area },
          targetAmount: Number(f.targetAmount),
          photos,
          documents: docs,
          paymentAccounts: accounts,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not send the campaign');

      toast.success('Sent for review. An admin will check it soon.');
      router.push(`/donate/${data.id}`);
    } catch (err) {
      toast.error(err.message);
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-14">
      <motion.div {...rise(0)}>
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/25">
          <HeartHandshake size={24} />
        </span>
        <h1 className="mt-4 text-3xl font-semibold text-slate-900">Start a campaign</h1>
        <p className="mt-2 text-sm text-slate-600">
          For a real patient who needs help paying for treatment. An admin checks every campaign before it is shown.
        </p>
      </motion.div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <motion.section {...rise(1)} className={sectionClass}>
          <h2 className="text-base font-semibold text-slate-900">The patient</h2>
          <div>
            <label className={label}>Campaign title</label>
            <input required maxLength={120} value={f.title} onChange={set('title')} placeholder="Help Rahim recover after a road accident" className={field} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={label}>Patient name</label>
              <input required maxLength={80} value={f.patientName} onChange={set('patientName')} className={field} />
            </div>
            <div>
              <label className={label}>Money needed (৳)</label>
              <input required type="number" min="500" value={f.targetAmount} onChange={set('targetAmount')} className={field} />
            </div>
          </div>
          <div>
            <label className={label}>The story</label>
            <textarea
              required
              rows={7}
              maxLength={5000}
              value={f.story}
              onChange={set('story')}
              placeholder="What happened, what treatment is needed, and how the money will be used."
              className={field}
            />
            <p className="mt-1 text-xs text-slate-500">At least 50 characters.</p>
          </div>
        </motion.section>

        <motion.section {...rise(2)} className={sectionClass}>
          <h2 className="text-base font-semibold text-slate-900">Hospital and place</h2>
          <div>
            <label className={label}>Hospital</label>
            <input required maxLength={120} value={f.hospitalName} onChange={set('hospitalName')} className={field} />
            <input value={f.hospitalAddress} onChange={set('hospitalAddress')} maxLength={200} placeholder="Ward, bed or address (optional)" className={`${field} mt-3`} />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <select required value={f.division} onChange={(e) => setF({ ...f, division: e.target.value, district: '', area: '' })} className={field}>
              <option value="">Division</option>
              {divisions.map((d) => <option key={d}>{d}</option>)}
            </select>
            <select required value={f.district} disabled={!f.division} onChange={(e) => setF({ ...f, district: e.target.value, area: '' })} className={field}>
              <option value="">District</option>
              {districts.map((d) => <option key={d}>{d}</option>)}
            </select>
            <select value={f.area} disabled={!f.district} onChange={set('area')} className={field}>
              <option value="">Upazila (optional)</option>
              {upazilas.map((u) => <option key={u}>{u}</option>)}
            </select>
          </div>
        </motion.section>

        <motion.section {...rise(3)} className={sectionClass}>
          <h2 className="text-base font-semibold text-slate-900">Photos</h2>
          <p className="-mt-3 text-xs text-slate-600">Up to 3 photos of the patient or the situation. Everyone can see them.</p>
          <div className="grid gap-4 sm:grid-cols-3">
            {photos.map((url, i) => (
              <ImageUpload
                key={`photo-${url}`}
                label={`Photo ${i + 1}`}
                value={url}
                onChange={(u) => setPhotos(u ? photos.map((p, idx) => (idx === i ? u : p)) : photos.filter((_, idx) => idx !== i))}
              />
            ))}
            {photos.length < 3 && (
              <ImageUpload key={`new-${photos.length}`} label="Add a photo" value="" onChange={(u) => u && setPhotos([...photos, u])} />
            )}
          </div>
        </motion.section>

        <motion.section {...rise(4)} className={sectionClass}>
          <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
            <Lock size={16} className="text-emerald-600" /> Proof for the admin
          </h2>
          <p className="-mt-3 text-xs text-slate-600">
            Photos of a prescription, hospital letter or bill. Only you and the admins can open them. Cover any ID number you do not want shown.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {docs.map((url) => (
              <div key={url} className="relative">
                <PrivateImage src={url} className="h-28 w-full rounded-xl border border-slate-200 object-cover" />
                <button
                  type="button"
                  onClick={() => setDocs(docs.filter((d) => d !== url))}
                  aria-label="Remove document"
                  className="absolute -right-2 -top-2 rounded-full bg-slate-900 p-1 text-white"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            {docs.length < 3 && <PrivateImageUpload onChange={(u) => setDocs([...docs, u])} />}
          </div>
        </motion.section>

        <motion.section {...rise(5)} className={sectionClass}>
          <h2 className="text-base font-semibold text-slate-900">Where should the money go?</h2>
          <p className="-mt-3 text-xs text-slate-600">
            Donors send money straight to these accounts. Use accounts that belong to the patient&rsquo;s family, and that you can check.
          </p>

          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {accounts.map((a, i) => (
                <motion.div
                  key={a.method}
                  layout
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  className="space-y-3 rounded-xl bg-white/70 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <select
                      value={a.method}
                      onChange={(e) => updateAccount(i, { method: e.target.value })}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800"
                    >
                      {METHODS.map((m) => (
                        <option key={m.id} value={m.id} disabled={m.id !== a.method && usedMethods.includes(m.id)}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                    {accounts.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setAccounts(accounts.filter((_, idx) => idx !== i))}
                        aria-label="Remove this account"
                        className="rounded-full p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  {a.method === 'bank' && (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input required value={a.bankName} onChange={(e) => updateAccount(i, { bankName: e.target.value })} placeholder="Bank name" className={field} />
                      <input value={a.branch} onChange={(e) => updateAccount(i, { branch: e.target.value })} placeholder="Branch (optional)" className={field} />
                    </div>
                  )}

                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      required
                      value={a.number}
                      onChange={(e) => updateAccount(i, { number: e.target.value })}
                      placeholder={a.method === 'bank' ? 'Account number' : `${METHODS.find((m) => m.id === a.method).label} number`}
                      className={`${field} mono`}
                    />
                    <input required value={a.accountName} onChange={(e) => updateAccount(i, { accountName: e.target.value })} placeholder="Name on the account" className={field} />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {nextMethod && (
            <button
              type="button"
              onClick={() => setAccounts([...accounts, blankAccount(nextMethod.id)])}
              className="flex items-center gap-2 rounded-full border border-slate-300/70 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <Plus size={15} /> Add another account
            </button>
          )}
        </motion.section>

        <motion.label {...rise(6)} className="flex items-start gap-3 rounded-2xl border border-white/50 bg-white/50 p-5 text-sm text-slate-700 backdrop-blur-xl">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-emerald-600" />
          <span>
            I promise the information is true. I will confirm donations only after I see them in my account, and I will add a photo of every bill I pay.
          </span>
        </motion.label>

        <motion.button
          {...rise(7)}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3.5 text-sm font-medium text-white shadow-lg shadow-emerald-600/25 hover:bg-emerald-700 disabled:opacity-60"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          {saving ? 'Sending...' : 'Send for review'}
        </motion.button>
      </form>
    </main>
  );
}

export default function StartCampaignPage() {
  return (
    <RoleGate roles={['user']} deniedText="Please log in to start a campaign.">
      <StartForm />
    </RoleGate>
  );
}