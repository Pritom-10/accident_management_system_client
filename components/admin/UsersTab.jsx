'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { Search, Ban, ShieldCheck, Trash2 } from 'lucide-react';
import { useAdminData, adminAction } from '../../lib/useAdminData';
import { useAuth } from '../AuthProvider';
import { EmptyBox, Loading, cardClass, btnGray, btnRed, fmt } from './shared';

const ROLE_LIST = ['donor', 'volunteer', 'hospital', 'bloodbank', 'ngo', 'journalist', 'admin'];
const roleName = {
  donor: 'Donor', volunteer: 'Volunteer', hospital: 'Hospital', bloodbank: 'Blood bank',
  ngo: 'NGO', journalist: 'Journalist', admin: 'Admin',
};

export default function UsersTab() {
  const { user: me } = useAuth();
  const [text, setText] = useState('');
  const [q, setQ] = useState('');
  const { data, loading, reload } = useAdminData(`/users?q=${encodeURIComponent(q)}`);
  const blocked = useAdminData('/blocked-phones');

  async function act(request, okMsg) {
    try {
      await request();
      toast.success(okMsg);
      reload();
    } catch (err) {
      toast.error(err.message);
    }
  }

  function setBlocked(u, value) {
    if (value && !window.confirm(`Block ${u.name}? They will not be able to use their account.`)) return;
    act(() => adminAction('PATCH', `/users/${u._id}/block`, { blocked: value }), value ? 'User blocked' : 'User unblocked');
  }

  function toggleRole(u, role) {
    const has = u.roles.includes(role);
    if (!has && role === 'admin' && !window.confirm(`Give ${u.name} full admin powers?`)) return;

    const next = has ? u.roles.filter((r) => r !== role) : [...u.roles, role];
    act(
      () => adminAction('PATCH', `/users/${u._id}/roles`, { roles: next.filter((r) => r !== 'user') }),
      'Roles updated'
    );
  }

  async function unblockPhone(item) {
    try {
      await adminAction('DELETE', `/blocked-phones/${item._id}`);
      toast.success('Number unblocked');
      blocked.reload();
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <form
          onSubmit={(e) => { e.preventDefault(); setQ(text.trim()); }}
          className="flex gap-2"
        >
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Search by name, email or mobile number"
            className="w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2.5 text-sm text-slate-700"
          />
          <button className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800">
            <Search size={16} /> Search
          </button>
        </form>
        <p className="text-xs text-slate-500">Shows the 50 newest users, or the matches for your search.</p>

        {loading ? (
          <Loading />
        ) : data.length === 0 ? (
          <EmptyBox text="No users found." />
        ) : (
          <div className="space-y-3">
            {data.map((u) => {
              const isMe = me && String(me._id) === String(u._id);
              return (
                <div key={u._id} className={cardClass}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-2 text-base font-semibold text-slate-900">
                        {u.name}
                        {isMe && <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">You</span>}
                        {u.isBlocked && <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-700">Blocked</span>}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-600">{[u.email, u.phone].filter(Boolean).join(' · ')}</p>
                      <p className="mono mt-0.5 text-xs text-slate-500">Joined: {fmt(u.createdAt)}</p>
                    </div>

                    {!isMe && (
                      <button
                        onClick={() => setBlocked(u, !u.isBlocked)}
                        className={u.isBlocked ? btnGray : btnRed}
                      >
                        {u.isBlocked ? <><ShieldCheck size={14} /> Unblock</> : <><Ban size={14} /> Block</>}
                      </button>
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {ROLE_LIST.map((role) => {
                      const on = u.roles.includes(role);
                      return (
                        <button
                          key={role}
                          disabled={isMe}
                          onClick={() => toggleRole(u, role)}
                          className={`rounded-full px-3 py-1 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-60 ${
                            on ? 'bg-indigo-600 text-white' : 'border border-slate-300/70 bg-white text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {roleName[role]}
                        </button>
                      );
                    })}
                  </div>
                  {isMe && <p className="mt-2 text-xs text-slate-500">You cannot change your own roles or block yourself.</p>}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-slate-900">Blocked mobile numbers</h2>
        <p className="mt-1 text-xs text-slate-600">These numbers cannot submit emergency reports.</p>

        {blocked.loading ? (
          <Loading />
        ) : blocked.data.length === 0 ? (
          <div className="mt-3"><EmptyBox text="No blocked numbers." /></div>
        ) : (
          <div className="mt-3 space-y-2">
            {blocked.data.map((b) => (
              <div key={b._id} className={`${cardClass} flex items-center justify-between gap-3 py-3`}>
                <div>
                  <p className="mono text-sm text-slate-900">{b.phone}</p>
                  {b.reason && <p className="text-xs text-slate-600">{b.reason}</p>}
                </div>
                <button onClick={() => unblockPhone(b)} className={btnGray}>
                  <Trash2 size={14} /> Unblock
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}