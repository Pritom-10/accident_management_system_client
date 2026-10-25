'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Download, LogOut, ShieldCheck, Trash2 } from 'lucide-react';
import { API_BASE, apiFetch } from '../../lib/api';
import { detachDevice } from '../../lib/push';
import { useAuth } from '../AuthProvider';
import { PasswordField, SectionCard, SubmitButton, labelClass } from '../ui/kit';

export default function PrivacyPanel() {
  const router = useRouter();
  const { logout } = useAuth();
  const [busy, setBusy] = useState('');
  const [password, setPassword] = useState('');
  const [sure, setSure] = useState(false);

  async function download() {
    setBusy('download');
    try {
      const res = await apiFetch(`${API_BASE}/profile/export`);
      if (!res.ok) throw new Error('Could not download your data');

      const url = URL.createObjectURL(await res.blob());
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sahayota-my-data.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success('Your data was downloaded');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy('');
    }
  }

  async function logoutEverywhere() {
    if (!window.confirm('Log out of every phone and computer, including this one?')) return;
    setBusy('all');
    try {
      await detachDevice();
      const res = await apiFetch(`${API_BASE}/auth/logout-all`, { method: 'POST' });
      if (!res.ok) throw new Error('Could not log you out everywhere');

      logout();
      toast.success('You were logged out everywhere');
      router.push('/login');
    } catch (err) {
      toast.error(err.message);
      setBusy('');
    }
  }

  async function deleteAccount(e) {
    e.preventDefault();
    if (!sure) {
      toast.error('Tick the box to confirm');
      return;
    }

    setBusy('delete');
    try {
      const res = await apiFetch(`${API_BASE}/profile`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not delete the account');

      logout();
      toast.success('Your account was deleted');
      router.push('/');
    } catch (err) {
      toast.error(err.message);
      setBusy('');
    }
  }

  return (
    <div className="mt-8 space-y-5">
      <SectionCard title="Privacy and security" hint="You are in control of your data.">
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={download}
            disabled={busy === 'download'}
            className="flex items-center gap-2 rounded-full border border-slate-300/70 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            <Download size={16} /> Download my data
          </button>
          <button
            type="button"
            onClick={logoutEverywhere}
            disabled={busy === 'all'}
            className="flex items-center gap-2 rounded-full border border-slate-300/70 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            <LogOut size={16} /> Log out of all devices
          </button>
        </div>
        <p className="flex items-start gap-2 text-xs leading-relaxed text-slate-500">
          <ShieldCheck size={14} className="mt-0.5 shrink-0 text-emerald-600" />
          Your phone number and email are never shown to the public. Use &ldquo;Log out of all devices&rdquo; if you lost a phone or used a shared computer.
        </p>
      </SectionCard>

      <form onSubmit={deleteAccount}>
        <SectionCard title="Delete my account" hint="This cannot be undone.">
          <p className="text-sm leading-relaxed text-slate-600">
            Your name, email, mobile number, photo, address and blood details are erased. Reports, news and donation receipts you made stay on the site without your name.
            Close your campaigns and open blood requests first.
          </p>
          <div>
            <label htmlFor="del-pw" className={labelClass}>Your password</label>
            <PasswordField id="del-pw" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <label className="flex items-start gap-3 text-sm text-slate-700">
            <input type="checkbox" checked={sure} onChange={(e) => setSure(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-rose-600" />
            I understand that I cannot get this account back.
          </label>
          <SubmitButton loading={busy === 'delete'} tone="rose" icon={<Trash2 size={16} />} className="sm:w-fit sm:px-8">
            {busy === 'delete' ? 'Deleting...' : 'Delete my account'}
          </SubmitButton>
        </SectionCard>
      </form>
    </div>
  );
}