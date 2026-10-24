'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { BellOff, BellRing, Droplet, HeartHandshake, Loader2, Lock, Mail, Newspaper, Send, Siren } from 'lucide-react';
import { API_BASE, apiFetch } from '../../lib/api';
import { currentSubscription, disablePush, enablePush, pushSupported, saveSubscription } from '../../lib/push';
import { districtOptions } from '../../lib/locationOptions';
import { useAuth } from '../../components/AuthProvider';
import { PageHero, Switch, fieldClass, glass } from '../../components/ui/kit';

const allDistricts = districtOptions('');
const JSON_HEADERS = { 'Content-Type': 'application/json' };

const topics = [
  {
    key: 'sos',
    icon: Siren,
    tone: 'bg-rose-100 text-rose-600',
    title: 'SOS near me',
    desc: 'When someone in your district presses SOS. For approved volunteers and blood donors.',
    login: true,
  },
  {
    key: 'blood',
    icon: Droplet,
    tone: 'bg-rose-100 text-rose-600',
    title: 'Blood requests',
    desc: 'Requests that match your blood group in your district, and offers on your own requests.',
    login: true,
  },
  {
    key: 'news',
    icon: Newspaper,
    tone: 'bg-indigo-100 text-indigo-600',
    title: 'Breaking news',
    desc: 'Important accident news. Anyone can get these, no account needed.',
    login: false,
  },
  {
    key: 'campaigns',
    icon: HeartHandshake,
    tone: 'bg-emerald-100 text-emerald-600',
    title: 'Campaign updates',
    desc: 'When your donation is confirmed, and when a campaign you helped spends money.',
    login: true,
  },
];

function Row({ icon: Icon, tone, title, desc, note, children }) {
  return (
    <div className="flex items-center gap-4 py-4">
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tone}`}>
        <Icon size={20} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-slate-600">{desc}</p>
        {note && (
          <p className="mt-1 flex items-center gap-1 text-xs font-medium text-amber-700">
            <Lock size={11} /> {note}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}

export default function NotificationsPage() {
  const { user, loading } = useAuth();
  const [support, setSupport] = useState('checking');
  const [permission, setPermission] = useState('default');
  const [device, setDevice] = useState(null);
  const [busy, setBusy] = useState('');
  const [email, setEmail] = useState(null);

  const refresh = useCallback(async () => {
    if (!pushSupported()) {
      setSupport('unsupported');
      return;
    }

    setSupport('ready');
    setPermission(Notification.permission);

    const sub = await currentSubscription();
    if (!sub) {
      setDevice(null);
      return;
    }

    try {
      const res = await apiFetch(`${API_BASE}/notifications/state`, {
        method: 'POST',
        headers: JSON_HEADERS,
        body: JSON.stringify({ endpoint: sub.endpoint }),
      });
      const data = await res.json().catch(() => ({}));
      setDevice(data.subscribed ? { prefs: data.prefs, district: data.district, attached: data.attached } : null);
    } catch {
      setDevice(null);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (loading || !user || !device || device.attached) return;

    (async () => {
      const sub = await currentSubscription();
      if (!sub) return;
      try {
        await saveSubscription(sub);
        await refresh();
      } catch {
        return;
      }
    })();
  }, [loading, user, device, refresh]);

  useEffect(() => {
    if (!user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEmail(null);
      return;
    }
    apiFetch(`${API_BASE}/notifications/email-prefs`)
      .then((res) => (res.ok ? res.json() : null))
      .then(setEmail)
      .catch(() => setEmail(null));
  }, [user]);

  async function turnOn() {
    setBusy('on');
    try {
      const { saved } = await enablePush({});
      setDevice({ prefs: saved.prefs, district: saved.district, attached: saved.attached });
      setPermission('granted');
      toast.success('Alerts are on for this device');
    } catch (err) {
      toast.error(err.message);
      setPermission(Notification.permission);
    } finally {
      setBusy('');
    }
  }

  async function turnOff() {
    setBusy('off');
    try {
      await disablePush();
      setDevice(null);
      toast.success('Alerts are off for this device');
    } catch {
      toast.error('Could not turn alerts off');
    } finally {
      setBusy('');
    }
  }

  async function update(prefs, district) {
    const previous = device;
    setDevice({ ...device, prefs, district });

    try {
      const sub = await currentSubscription();
      if (!sub) throw new Error('This device is not registered');
      await saveSubscription(sub, { prefs, district });
    } catch (err) {
      setDevice(previous);
      toast.error(err.message);
    }
  }

  async function sendTest() {
    setBusy('test');
    try {
      const sub = await currentSubscription();
      const res = await fetch(`${API_BASE}/notifications/test`, {
        method: 'POST',
        headers: JSON_HEADERS,
        body: JSON.stringify({ endpoint: sub ? sub.endpoint : '' }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not send the test');
      toast.success('Test sent. Look at your notifications.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy('');
    }
  }

  async function changeEmail(patch) {
    const previous = email;
    setEmail({ ...email, ...patch });
    try {
      const res = await apiFetch(`${API_BASE}/notifications/email-prefs`, {
        method: 'PATCH',
        headers: JSON_HEADERS,
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error('Could not save');
    } catch (err) {
      setEmail(previous);
      toast.error(err.message);
    }
  }

  const on = Boolean(device);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 md:py-12">
      <PageHero
        icon={<BellRing size={24} />}
        tone="violet"
        eyebrow="Alerts"
        title="Alerts on your phone"
        subtitle="Get SOS, blood and breaking news alerts as notifications, even when Sahayota is closed. Free, and you can turn it off any time."
      />

      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`${glass} mt-6 p-6 md:p-8`}
      >
        <div className="flex flex-wrap items-center gap-5">
          <motion.span
            animate={on ? { rotate: [0, -14, 14, -10, 10, 0] } : { rotate: 0 }}
            transition={{ duration: 1.2, repeat: on ? Infinity : 0, repeatDelay: 3 }}
            className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${
              on ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30' : 'bg-slate-200 text-slate-500'
            }`}
          >
            {on ? <BellRing size={28} /> : <BellOff size={28} />}
          </motion.span>

          <div className="min-w-0 flex-1">
            <p className="text-lg font-semibold text-slate-900">
              {support === 'checking' ? 'Checking this device...' : on ? 'Alerts are on for this device' : 'Alerts are off for this device'}
            </p>
            <p className="mt-0.5 text-sm text-slate-600">
              {support === 'unsupported'
                ? 'This browser cannot show push alerts. iPhone is not supported yet. Android and computers work.'
                : permission === 'denied'
                  ? 'Alerts are blocked for this site. Click the lock icon in the address bar, allow Notifications, then reload.'
                  : on
                    ? 'Choose what you want to hear about below.'
                    : 'Turn them on to get help and news without opening the site.'}
            </p>
          </div>

          {support === 'ready' && permission !== 'denied' && (
            <div className="flex flex-wrap gap-2">
              {on ? (
                <>
                  <button
                    onClick={sendTest}
                    disabled={busy === 'test'}
                    className="flex items-center gap-2 rounded-full border border-slate-300/70 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                  >
                    {busy === 'test' ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />} Send a test
                  </button>
                  <button
                    onClick={turnOff}
                    disabled={busy === 'off'}
                    className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
                  >
                    Turn off
                  </button>
                </>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={turnOn}
                  disabled={busy === 'on'}
                  className="flex items-center gap-2 rounded-full bg-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 hover:bg-violet-700 disabled:opacity-60"
                >
                  {busy === 'on' ? <Loader2 size={16} className="animate-spin" /> : <BellRing size={16} />} Turn on alerts
                </motion.button>
              )}
            </div>
          )}
        </div>

        {!user && !loading && (
          <p className="mt-5 rounded-2xl bg-amber-50 p-4 text-xs leading-relaxed text-amber-800">
            You are not logged in, so you will only get breaking news.{' '}
            <Link href="/login" className="font-semibold underline">Log in</Link> to get SOS, blood and campaign alerts too.
          </p>
        )}
      </motion.section>

      <AnimatePresence>
        {on && (
          <motion.section
            key="topics"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={`${glass} mt-6 p-6 md:p-8`}
          >
            <h2 className="text-lg font-semibold text-slate-900">What to tell you about</h2>

            <div className="mt-2 divide-y divide-slate-200/70">
              {topics.map((t) => {
                const locked = t.login && !user;
                return (
                  <Row key={t.key} icon={t.icon} tone={t.tone} title={t.title} desc={t.desc} note={locked ? 'Log in to use this' : ''}>
                    <Switch
                      checked={Boolean(device.prefs[t.key]) && !locked}
                      disabled={locked}
                      label={t.title}
                      onChange={(value) => update({ ...device.prefs, [t.key]: value }, device.district)}
                    />
                  </Row>
                );
              })}
            </div>

            <div className="mt-4 border-t border-slate-200/70 pt-5">
              <label htmlFor="alert-district" className="mb-1.5 block text-sm font-medium text-slate-700">
                Breaking news for
              </label>
              <select
                id="alert-district"
                value={device.district}
                onChange={(e) => update(device.prefs, e.target.value)}
                className={fieldClass}
              >
                <option value="">All of Bangladesh</option>
                {allDistricts.map((d) => <option key={d}>{d}</option>)}
              </select>
              <p className="mt-1.5 text-xs text-slate-500">
                SOS and blood alerts follow the district in your profile or volunteer service area.
              </p>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {user && email && (
        <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className={`${glass} mt-6 p-6 md:p-8`}>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Mail size={18} /> Email
          </h2>
          <p className="mt-1 text-xs text-slate-600">
            {email.hasEmail ? `Sent to ${user.email}.` : 'Your account has no email address, so email alerts cannot be sent.'}
          </p>

          <div className="mt-2 divide-y divide-slate-200/70">
            <Row
              icon={Droplet}
              tone="bg-rose-100 text-rose-600"
              title="Blood requests near me"
              desc="Email me when my blood group is needed in my district."
              note={!email.isDonor ? 'Only for registered blood donors' : ''}
            >
              <Switch
                checked={email.donorEmail && email.isDonor}
                disabled={!email.isDonor || !email.hasEmail}
                label="Blood request emails"
                onChange={(value) => changeEmail({ donorEmail: value })}
              />
            </Row>
            <Row
              icon={Siren}
              tone="bg-rose-100 text-rose-600"
              title="SOS in my district"
              desc="Email me when someone presses SOS and I am available."
              note={!email.isVolunteer ? 'Only for approved volunteers' : ''}
            >
              <Switch
                checked={email.sosEmail && email.isVolunteer}
                disabled={!email.isVolunteer || !email.hasEmail}
                label="SOS emails"
                onChange={(value) => changeEmail({ sosEmail: value })}
              />
            </Row>
          </div>
        </motion.section>
      )}

      <p className="mt-6 rounded-2xl bg-slate-100 p-5 text-xs leading-relaxed text-slate-600">
        We never put names, phone numbers or exact places in a notification. Those are shown only after you open Sahayota and log in.
        Alerts do not replace 999. For anyone in danger, call 999 first.
      </p>
    </main>
  );
}