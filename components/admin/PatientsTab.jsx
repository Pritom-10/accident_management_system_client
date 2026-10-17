'use client';

import { useState } from 'react';
import { Check, X, Building2, CalendarDays, UserRound } from 'lucide-react';
import { useAdminData, adminAction, useRunner } from '../../lib/useAdminData';
import { imageSrc } from '../../lib/imageUrl';
import { Pills, EmptyBox, Loading, cardClass, btnGreen, btnRed } from './shared';

const filters = [['pending', 'Pending'], ['verified', 'Verified'], ['rejected', 'Rejected']];

export default function PatientsTab() {
  const [filter, setFilter] = useState('pending');
  const { data, loading, reload } = useAdminData(`/patients?status=${filter}`);
  const { busyId, run } = useRunner(reload);

  const verify = (p) => run(p._id, () => adminAction('PATCH', `/patients/${p._id}/verify`), 'Patient verified');
  const reject = (p) => run(p._id, () => adminAction('PATCH', `/patients/${p._id}/reject`), 'Patient rejected');

  return (
    <div className="space-y-5">
      <Pills options={filters} value={filter} onChange={setFilter} />

      {loading ? (
        <Loading />
      ) : data.length === 0 ? (
        <EmptyBox text={`No ${filter} patients.`} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {data.map((p) => {
            const busy = busyId === p._id;
            return (
              <div key={p._id} className={cardClass}>
                <div className="flex gap-4">
                  <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-slate-200/70 bg-slate-100">
                    {p.photoUrl ? (
                      <img src={imageSrc(p.photoUrl)} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-400"><UserRound size={32} /></div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-base font-semibold text-slate-900">
                      {p.estimatedAge ? `About ${p.estimatedAge} years old` : 'Age unknown'}
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-600">
                      <Building2 size={13} /> {p.admittingHospital?.name || 'Hospital not found'}
                    </p>
                    <p className="mono mt-0.5 flex items-center gap-1.5 text-xs text-slate-600">
                      <CalendarDays size={13} /> {p.admissionDate ? new Date(p.admissionDate).toLocaleDateString() : ''}
                    </p>
                  </div>
                </div>

                <p className="mt-3 text-sm leading-relaxed text-slate-600">{p.physicalDescription}</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {filter !== 'verified' && (
                    <button disabled={busy} onClick={() => verify(p)} className={btnGreen}>
                      <Check size={14} /> Verify
                    </button>
                  )}
                  {filter !== 'rejected' && (
                    <button disabled={busy} onClick={() => reject(p)} className={btnRed}>
                      <X size={14} /> {filter === 'verified' ? 'Take down' : 'Reject'}
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