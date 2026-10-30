'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import { useAdminData, adminAction, useRunner } from '../../lib/useAdminData';
import { districtOptions } from '../../lib/locationOptions';
import { CATS } from '../../lib/helpGuide';
import { fieldClass } from '../ui/kit';
import { EmptyBox, Loading, cardClass, btnGray, btnGreen, btnRed } from './shared';

const districts = districtOptions('');
const blank = { name: '', category: 'legal', description: '', phone: '', website: '', address: '', district: 'All', free: true, active: true };

function OrgForm({ initial, onSaved, onCancel }) {
  const [f, setF] = useState(initial ? { ...blank, ...initial } : blank);
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (initial) await adminAction('PUT', `/help-orgs/${initial._id}`, f);
      else await adminAction('POST', '/help-orgs', f);
      toast.success('Saved');
      onSaved();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-2xl border border-indigo-200 bg-indigo-50/60 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <input required value={f.name} onChange={set('name')} maxLength={120} placeholder="Name" className={fieldClass} />
        <select value={f.category} onChange={set('category')} className={fieldClass}>
          {CATS.filter((c) => c.id).map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
        <input required value={f.phone} onChange={set('phone')} maxLength={30} placeholder="Phone (check it by calling)" className={fieldClass} />
        <input value={f.website} onChange={set('website')} maxLength={200} placeholder="Website (optional, https://...)" className={fieldClass} />
        <input value={f.address} onChange={set('address')} maxLength={200} placeholder="Address (optional)" className={fieldClass} />
        <select value={f.district} onChange={set('district')} className={fieldClass}>
          <option value="All">All of Bangladesh</option>
          {districts.map((d) => <option key={d}>{d}</option>)}
        </select>
      </div>
      <textarea rows={2} value={f.description} onChange={set('description')} maxLength={400} placeholder="What they do (short)" className={fieldClass} />
      <div className="flex flex-wrap gap-5 text-sm text-slate-700">
        <label className="flex items-center gap-2"><input type="checkbox" checked={f.free} onChange={(e) => setF({ ...f, free: e.target.checked })} className="accent-emerald-600" /> Free service</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={f.active} onChange={(e) => setF({ ...f, active: e.target.checked })} className="accent-emerald-600" /> Show on the site</label>
      </div>
      <div className="flex gap-2">
        <button disabled={saving} className={btnGreen}>{saving && <Loader2 size={14} className="animate-spin" />} Save</button>
        <button type="button" onClick={onCancel} className={btnGray}>Cancel</button>
      </div>
    </form>
  );
}

export default function HelpOrgsTab() {
  const [editing, setEditing] = useState(null);
  const { data, loading, reload } = useAdminData('/help-orgs');
  const { busyId, run } = useRunner(reload);

  const saved = () => {
    setEditing(null);
    reload();
  };

  function remove(o) {
    if (!window.confirm(`Delete "${o.name}"?`)) return;
    run(o._id, () => adminAction('DELETE', `/help-orgs/${o._id}`), 'Deleted');
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xl rounded-xl bg-amber-50 p-4 text-xs leading-relaxed text-amber-800">
          Add only groups you have checked yourself, and call the number before you save it. People may rely on it in a hard moment.
        </p>
        <button onClick={() => setEditing('new')} className="flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700">
          <Plus size={16} /> Add a group
        </button>
      </div>

      {editing === 'new' && <OrgForm onSaved={saved} onCancel={() => setEditing(null)} />}

      {loading && data.length === 0 ? (
        <Loading />
      ) : data.length === 0 ? (
        <EmptyBox text="No group added yet." />
      ) : (
        <div className="space-y-4">
          {data.map((o) =>
            editing === o._id ? (
              <OrgForm key={o._id} initial={o} onSaved={saved} onCancel={() => setEditing(null)} />
            ) : (
              <div key={o._id} className={cardClass}>
                <p className="text-base font-semibold text-slate-900">
                  {o.name} {!o.active && <span className="ml-2 rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600">Hidden</span>}
                </p>
                <p className="mt-1 text-xs text-slate-600">{o.category} · <span className="mono">{o.phone}</span> · {o.district}</p>
                <div className="mt-3 flex gap-2">
                  <button disabled={busyId === o._id} onClick={() => setEditing(o._id)} className={btnGray}><Pencil size={14} /> Edit</button>
                  <button disabled={busyId === o._id} onClick={() => remove(o)} className={btnRed}><Trash2 size={14} /> Delete</button>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}