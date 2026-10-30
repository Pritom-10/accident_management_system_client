'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { AlertTriangle, BedDouble, Building2, Clock, Droplet, HeartPulse, Minus, Plus, Save } from 'lucide-react';
import RoleGate from '../../../components/RoleGate';
import { GroupBadge, Skeleton } from '../../../components/blood/ui';
import { PageHero, SectionCard, Switch, SubmitButton, fieldClass } from '../../../components/ui/kit';
import { API_BASE, apiFetch } from '../../../lib/api';
import { BLOOD_GROUPS } from '../../../lib/blood';
import { TYPE_LABEL } from '../../../lib/hospital';
import { timeAgo } from '../../../lib/sos';

function Stepper({ value, onChange, max = 9999, label }) {
  const set = (n) => onChange(Math.min(max, Math.max(0, n)));

  return (
    <div className="flex items-center gap-2" role="group" aria-label={label}>
      <button
        type="button"
        onClick={() => set(value - 1)}
        aria-label={`Less ${label}`}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-300/70 bg-white text-slate-700 hover:bg-slate-50 active:scale-90"
      >
        <Minus size={16} />
      </button>
      <input
        type="number"
        inputMode="numeric"
        min="0"
        max={max}
        value={value}
        aria-label={label}
        onChange={(e) => set(parseInt(e.target.value || '0', 10) || 0)}
        className="mono h-10 w-20 rounded-xl border border-slate-200 bg-white text-center text-base text-slate-900 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
      />
      <button
        type="button"
        onClick={() => set(value + 1)}
        aria-label={`More ${label}`}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-300/70 bg-white text-slate-700 hover:bg-slate-50 active:scale-90"
      >
        <Plus size={16} />
      </button>
    </div>
  );
}

function toForm(place) {
  const s = place.status || {};
  const stock = {};
  BLOOD_GROUPS.forEach((g) => {
    stock[g] = s.bloodStock && Number.isInteger(s.bloodStock[g]) ? s.bloodStock[g] : 0;
  });

  return {
    bedsTotal: s.beds ? s.beds.total : 0,
    bedsFree: s.beds ? s.beds.available : 0,
    icuTotal: s.icu ? s.icu.total : 0,
    icuFree: s.icu ? s.icu.available : 0,
    stock,
    accepting: s.accepting !== false,
  };
}

function Capacity({ title, icon: Icon, total, free, onTotal, onFree }) {
  return (
    <div className="rounded-2xl bg-white/70 p-4">
      <p className="flex items-center gap-2 text-sm font-semibold text-slate-900"><Icon size={16} /> {title}</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-xs text-slate-600">Total</p>
          <Stepper value={total} onChange={onTotal} max={5000} label={`${title} total`} />
        </div>
        <div>
          <p className="mb-2 text-xs text-slate-600">Free right now</p>
          <Stepper value={free} onChange={onFree} max={total} label={`${title} free`} />
        </div>
      </div>
    </div>
  );
}

function Manage() {
  const [places, setPlaces] = useState(null);
  const [activeId, setActiveId] = useState('');
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const res = await apiFetch(`${API_BASE}/hospital-staff/mine`);
      const data = await res.json().catch(() => []);
      if (!res.ok) throw new Error(data.error || 'Could not load');
      setPlaces(data);
      setActiveId((current) => (data.some((p) => p._id === current) ? current : data[0] ? data[0]._id : ''));
    } catch (err) {
      toast.error(err.message);
      setPlaces([]);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  const place = useMemo(() => (places || []).find((p) => p._id === activeId) || null, [places, activeId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (place) setForm(toForm(place));
  }, [place]);

  const isHospital = place && place.type === 'hospital';
  const hasBlood = place && (place.type === 'hospital' || place.type === 'blood_bank');
  const s = place && place.status;

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { acceptingEmergency: form.accepting };
      if (isHospital) {
        payload.beds = { total: form.bedsTotal, available: form.bedsFree };
        payload.icu = { total: form.icuTotal, available: form.icuFree };
      }
      if (hasBlood) payload.bloodStock = form.stock;

      const res = await apiFetch(`${API_BASE}/hospital-staff/${place._id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not save');

      toast.success('Saved. The public page now shows these numbers.');
      await load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 md:py-12">
      <PageHero
        icon={<Building2 size={24} />}
        tone="sky"
        eyebrow="Hospital and blood bank staff"
        title="Update your live numbers"
        subtitle="People in an emergency use these numbers to decide where to go. Please keep them correct, and update after every change."
      />

      {places === null ? (
        <div className="mt-6 space-y-4"><Skeleton className="h-24" /><Skeleton className="h-72" /></div>
      ) : places.length === 0 ? (
        <div className="mt-6 rounded-3xl border border-white/60 bg-white/60 p-10 text-center text-sm text-slate-600 backdrop-blur-xl">
          No hospital or blood bank is linked to your account yet. Ask an admin to add you as the manager of your place.
        </div>
      ) : (
        <>
          {places.length > 1 && (
            <div className="mt-6">
              {places.length <= 4 ? (
                <div className="flex flex-wrap gap-2">
                  {places.map((p) => (
                    <button key={p._id} onClick={() => setActiveId(p._id)} className="relative rounded-full px-4 py-2 text-sm font-medium">
                      {activeId === p._id && <motion.span layoutId="place-tab" className="absolute inset-0 rounded-full bg-slate-900" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
                      <span className={`relative ${activeId === p._id ? 'text-white' : 'text-slate-700'}`}>{p.name}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <select value={activeId} onChange={(e) => setActiveId(e.target.value)} className={fieldClass} aria-label="Choose a place">
                  {places.map((p) => <option key={p._id} value={p._id}>{p.name}, {p.district}</option>)}
                </select>
              )}
            </div>
          )}

          {place && form && (
            <form onSubmit={save} className="mt-6 space-y-5">
              <div className="rounded-3xl border border-white/60 bg-white/60 p-5 backdrop-blur-xl">
                <p className="text-lg font-semibold text-slate-900">{place.name}</p>
                <p className="mt-0.5 text-xs text-slate-600">{TYPE_LABEL[place.type]} · {[place.address, place.district].filter(Boolean).join(', ')}</p>
                <p className={`mt-3 flex items-center gap-2 text-xs ${!s || s.stale ? 'font-medium text-amber-700' : 'text-slate-600'}`}>
                  {!s || s.stale ? <AlertTriangle size={13} /> : <Clock size={13} />}
                  {!s ? 'You have not shared numbers yet.' : s.stale ? `Last updated ${timeAgo(s.updatedAt)}. People see a warning that it may be out of date.` : `Last updated ${timeAgo(s.updatedAt)}`}
                </p>
              </div>

              {isHospital && (
                <SectionCard title="Beds" hint="Free means a bed a new patient could use right now.">
                  <Capacity
                    title="Beds"
                    icon={BedDouble}
                    total={form.bedsTotal}
                    free={form.bedsFree}
                    onTotal={(n) => setForm((f) => ({ ...f, bedsTotal: n, bedsFree: Math.min(f.bedsFree, n) }))}
                    onFree={(n) => setForm((f) => ({ ...f, bedsFree: n }))}
                  />
                  <Capacity
                    title="ICU beds"
                    icon={HeartPulse}
                    total={form.icuTotal}
                    free={form.icuFree}
                    onTotal={(n) => setForm((f) => ({ ...f, icuTotal: n, icuFree: Math.min(f.icuFree, n) }))}
                    onFree={(n) => setForm((f) => ({ ...f, icuFree: n }))}
                  />
                </SectionCard>
              )}

              {hasBlood && (
                <SectionCard title="Blood in stock" hint="Number of bags you have now, for each group.">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {BLOOD_GROUPS.map((g) => (
                      <div key={g} className="flex items-center justify-between gap-3 rounded-2xl bg-white/70 p-3">
                        <GroupBadge group={g} />
                        <Stepper value={form.stock[g]} onChange={(n) => setForm((f) => ({ ...f, stock: { ...f.stock, [g]: n } }))} label={`${g} bags`} />
                      </div>
                    ))}
                  </div>
                </SectionCard>
              )}

              <SectionCard title="Emergency patients">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">We are taking emergency patients</p>
                    <p className="text-xs text-slate-600">Turn this off if you cannot take new emergency patients now.</p>
                  </div>
                  <Switch checked={form.accepting} onChange={(v) => setForm((f) => ({ ...f, accepting: v }))} label="Taking emergency patients" tone="rose" />
                </div>
              </SectionCard>

              <SubmitButton loading={saving} tone="emerald" icon={<Save size={16} />}>
                {saving ? 'Saving...' : 'Save and mark as up to date'}
              </SubmitButton>
              <p className="text-center text-xs text-slate-500">If nothing changed, press Save anyway. It tells people your numbers are still correct.</p>
            </form>
          )}
        </>
      )}
    </main>
  );
}

export default function HospitalManagePage() {
  return (
    <RoleGate roles={['hospital', 'bloodbank', 'admin']} deniedText="This page is for hospital and blood bank staff. An admin can add you to your place.">
      <Manage />
    </RoleGate>
  );
}