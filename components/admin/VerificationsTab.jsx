'use client';

import { useState } from 'react';
import { BadgeCheck, Mail, Phone, X } from 'lucide-react';
import { useAdminData, adminAction, useRunner } from '../../lib/useAdminData';
import { dateText } from '../../lib/blood';
import PrivateImage from '../PrivateImage';
import { EmptyBox, Loading, RejectBox, cardClass, btnGreen, btnRed } from './shared';

const docName = { nid: 'National ID card', license: 'Driving license', passport: 'Passport', student: 'Student ID' };

export default function VerificationsTab() {
  const { data, loading, reload } = useAdminData('/verifications');
  const { busyId, run } = useRunner(reload);
  const [rejecting, setRejecting] = useState(null);

  const approve = (u) => run(u._id, () => adminAction('PATCH', `/verifications/${u._id}/approve`), 'Verified');

  async function reject(u, reason) {
    const ok = await run(u._id, () => adminAction('PATCH', `/verifications/${u._id}/reject`, { reason }), 'Not approved');
    if (ok) setRejecting(null);
  }

  return (
    <div className="space-y-5">
      <p className="rounded-xl bg-amber-50 p-4 text-xs leading-relaxed text-amber-800">
        Check that the name on the document matches the account, and that the photo is clear and not edited. The photos are deleted when you decide.
      </p>

      {loading && data.length === 0 ? (
        <Loading />
      ) : data.length === 0 ? (
        <EmptyBox text="No one is waiting to be verified." />
      ) : (
        <div className="space-y-4">
          {data.map((u) => (
            <div key={u._id} className={cardClass}>
              <p className="text-base font-semibold text-slate-900">{u.name}</p>
              <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
                {u.email && <span className="flex items-center gap-1"><Mail size={12} /> {u.email}</span>}
                {u.phone && <span className="flex items-center gap-1"><Phone size={12} /> {u.phone}</span>}
                <span>{docName[u.docType]} · sent {dateText(u.submittedAt)}</span>
              </p>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {u.images.map((src) => <PrivateImage key={src} src={src} className="h-56 w-full rounded-xl border border-slate-200 object-contain bg-white" />)}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button disabled={busyId === u._id} onClick={() => approve(u)} className={btnGreen}><BadgeCheck size={14} /> Verify</button>
                <button disabled={busyId === u._id} onClick={() => setRejecting(rejecting === u._id ? null : u._id)} className={btnRed}><X size={14} /> Not approve</button>
              </div>

              {rejecting === u._id && (
                <RejectBox placeholder="Reason (the user will see this)" onConfirm={(reason) => reject(u, reason)} onCancel={() => setRejecting(null)} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}