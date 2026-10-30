'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { Building2, Loader2, Pencil, Plus, Search, Trash2, UserPlus, X } from 'lucide-react';
import { useAdminData, adminAction, useRunner } from '../../lib/useAdminData';
import { bdLocations } from '../../lib/bdLocations';
import { TYPE_LABEL } from '../../lib/hospital';
import { timeAgo } from '../../lib/sos';
import { fieldClass } from '../ui/kit';
import { EmptyBox, Loading, cardClass, btnGray, btnGreen, btnRed } from './shared';

const typeKeys = ['hospital', 'blood_bank', 'ambulance', 'fire_service', 'police', 'other'];
const blank = { name: '', type: 'hospital', phone: '', division: '', district: '', address: '' };
const byName = (a, b) => a.localeCompare(b);

function HospitalForm({ initial, onSaved, onCancel }) {
  const [f, setF] = useState(
    initial
      ? { name: initial.name, type: initial.type, phone: initial.phone, division: initial.division, district: initial.district, address: initial.address }
      : blank
  );
  const [saving, setSaving] = useState(false);

  const divisions = ['All', ...Object.keys(bdLocations)];
  const districts = f.division === 'All' ? ['All'] : f.division ? Object.keys(bdLocations[f.division] || {}).sort(byName) : [];
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (initial) await adminAction('PUT', `/hospitals/${initial._id}`, f);
      else await adminAction('POST', '/hospitals', f);
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
      <p className="text-sm font-semibold text-slate-900">{initial ? 'Edit this place' : 'Add a place'}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <input required value={f.name} onChange={set('name')} maxLength={120} placeholder="Name" className={fieldClass} />
        <select value={f.type} onChange={set('type')} className={fieldClass}>
          {typeKeys.map((k) => <option key={k} value={k}>{TYPE_LABEL[k]}</option>)}
        </select>
        <input required value={f.phone} onChange={set('phone')} maxLength={30} placeholder="Phone number" className={fieldClass} />
        <input required value={f.address} onChange={set('address')} maxLength={200} placeholder="Address" className={fieldClass} />
        <select required value={f.division} onChange={(e) => setF({ ...f, division: e.target.value, district: e.target.value === 'All' ? 'All' : '' })} className={fieldClass}>
          <option value="">Division</option>
          {divisions.map((d) => <option key={d}>{d}</option>)}
        </select>
        <select required value={f.district} disabled={!f.division} onChange={set('district')} className={fieldClass}>
          <option value="">District</option>
          {districts.map((d) => <option key={d}>{d}</option>)}
        </select>
      </div>
      <div className="flex gap-2">
        <button disabled={saving} className={btnGreen}>{saving && <Loader2 size={14} className="animate-spin" />} Save</button>
        <button type="button" onClick={onCancel} className={btnGray}>Cancel</button>
      </div>
    </form>
  );
}

function ManagerAdder({ hospitalId, onDone }) {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);

  async function add(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await adminAction('PATCH', `/hospitals/${hospitalId}/managers`, { action: 'add', email });
      toast.success('Staff member added');
      setEmail('');
      onDone();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={add} className="mt-2 flex flex-wrap gap-2">
      <input
        required
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Staff member's account email"
        className={`${fieldClass} min-w-[14rem] flex-1 !py-2 text-xs`}
      />
      <button disabled={busy} className={btnGray}>
        {busy ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />} Add
      </button>
    </form>
  );
}

export default function HospitalsTab() {
  const [text, setText] = useState('');
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState(null);
  const { data, loading, reload } = useAdminData(`/hospitals?q=${encodeURIComponent(q)}`);
  const { busyId, run } = useRunner(reload);

  function remove(h) {
    if (!window.confirm(`Delete "${h.name}"?`)) return;
    run(h._id, () => adminAction('DELETE', `/hospitals/${h._id}`), 'Deleted');
  }

  function removeManager(h, m) {
    run(h._id, () => adminAction('PATCH', `/hospitals/${h._id}/managers`, { action: 'remove', email: m.email }), 'Staff member removed');
  }

  function saved() {
    setEditing(null);
    reload();
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <form onSubmit={(e) => { e.preventDefault(); setQ(text.trim()); }} className="flex min-w-[14rem] flex-1 gap-2">
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Search by name, district or address" className={fieldClass} />
          <button aria-label="Search" className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-medium text-white hover:bg-slate-800">
            <Search size={16} />
          </button>
        </form>
        <button onClick={() => setEditing('new')} className="flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700">
          <Plus size={16} /> Add a place
        </button>
      </div>

      <p className="rounded-xl bg-amber-50 p-4 text-xs leading-relaxed text-amber-800">
        Before adding a staff member, call the hospital or blood bank to check who they are. Staff can change only the live numbers of their own place.
        The person must already have an account. Adding them gives the Hospital or Blood bank role by itself.
      </p>

      {editing === 'new' && <HospitalForm onSaved={saved} onCancel={() => setEditing(null)} />}

      {loading && data.length === 0 ? (
        <Loading />
      ) : data.length === 0 ? (
        <EmptyBox text="No places found." />
      ) : (
        <div className="space-y-4">
          {data.map((h) => {
            const busy = busyId === h._id;

            if (editing === h._id) {
              return <HospitalForm key={h._id} initial={h} onSaved={saved} onCancel={() => setEditing(null)} />;
            }

            return (
              <div key={h._id} className={cardClass}>
                <div className="flex flex-wrap items-center gap-2">
                  <Building2 size={16} className="text-slate-500" />
                  <h3 className="text-base font-semibold text-slate-900">{h.name}</h3>
                  <span className="rounded-full bg-white/80 px-2.5 py-0.5 text-xs font-medium text-slate-700">{TYPE_LABEL[h.type]}</span>
                  {h.isPinned && <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-medium text-rose-700">Pinned</span>}
                </div>

                <p className="mt-1 text-xs text-slate-600">
                  {[h.address, h.district].filter(Boolean).join(', ')} · <span className="mono">{h.phone}</span>
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {h.updatedAt ? `Live numbers updated ${timeAgo(h.updatedAt)}` : 'No live numbers shared yet'}
                </p>

                {!h.isPinned && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-slate-700">Staff who can update the numbers</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {h.managers.length === 0 && <span className="text-xs text-slate-500">No one yet.</span>}
                      {h.managers.map((m) => (
                        <span key={m._id} className="flex items-center gap-1.5 rounded-full bg-white/80 py-1 pl-3 pr-1.5 text-xs text-slate-800">
                          {m.name} <span className="text-slate-500">{m.email}</span>
                          <button
                            onClick={() => removeManager(h, m)}
                            disabled={busy}
                            aria-label={`Remove ${m.name}`}
                            className="rounded-full p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                    <ManagerAdder hospitalId={h._id} onDone={reload} />
                  </div>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  <button disabled={busy} onClick={() => setEditing(h._id)} className={btnGray}>
                    <Pencil size={14} /> Edit
                  </button>
                  {!h.isPinned && (
                    <button disabled={busy} onClick={() => remove(h)} className={btnRed}>
                      <Trash2 size={14} /> Delete
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}