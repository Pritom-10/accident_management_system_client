'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Activity, ArrowRight, CalendarDays, Clock, Coins, Download, Droplet, HeartHandshake, Loader2, MapPin,
  Minus, Newspaper, Printer, Siren, TrendingDown, TrendingUp, Users, Wallet,
} from 'lucide-react';
import { API_BASE, apiFetch } from '../../lib/api';
import { useAdminData } from '../../lib/useAdminData';
import { vehicleLabel } from '../../lib/newsOptions';
import { taka } from '../../lib/money';
import { CountUp, Skeleton } from '../blood/ui';
import { TakaCount } from '../donate/ui';
import { AreaChart, BarList, ColumnChart, Donut } from './charts';
import { Pills, cardClass } from './shared';

const periods = [['7', '7 days'], ['30', '30 days'], ['90', '90 days'], ['365', '1 year'], ['all', 'All time']];
const exportKinds = [['accidents', 'Cases'], ['news', 'News'], ['blood', 'Blood requests'], ['donations', 'Donations']];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const plural = (n, one, many) => `${Number(n).toLocaleString('en-IN')} ${n === 1 ? one : many}`;
const hourText = (h) => {
  const x = ((h % 24) + 24) % 24;
  return `${x % 12 === 0 ? 12 : x % 12} ${x >= 12 ? 'PM' : 'AM'}`;
};
const hourShort = (h) => `${h % 12 === 0 ? 12 : h % 12}${h >= 12 ? 'p' : 'a'}`;

function dateLabel(at, unit) {
  const [y, m, d] = at.split('-').map(Number);
  return unit === 'month' ? `${MONTHS[m - 1]} ${y}` : `${d} ${MONTHS[m - 1]}`;
}

function ChangeBadge({ change, good }) {
  if (change === undefined) return null;
  if (change === null) return <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">New</span>;
  if (change === 0) {
    return (
      <span className="flex items-center gap-0.5 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
        <Minus size={11} /> 0%
      </span>
    );
  }

  const up = change > 0;
  const Icon = up ? TrendingUp : TrendingDown;
  const tone = good === null ? 'bg-slate-100 text-slate-700' : (good === 'up' ? up : !up) ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700';

  return (
    <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${tone}`}>
      <Icon size={11} /> {Math.abs(change)}%
    </span>
  );
}

function Kpi({ item, index, labelOf, unit }) {
  const Icon = item.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className={`${cardClass} overflow-hidden`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.tone}`}>
          <Icon size={18} />
        </span>
        <ChangeBadge change={item.change} good={item.good} />
      </div>
      <p className="mono mt-3 text-2xl font-semibold text-slate-900">
        {item.money ? <TakaCount value={item.value} /> : <CountUp value={item.value} />}
      </p>
      <p className="mt-0.5 text-xs text-slate-600">{item.label}</p>
      <div className="-mx-5 -mb-5 mt-3">
        <AreaChart mini data={item.series} color={item.color} labelOf={(at) => labelOf(at, unit)} />
      </div>
    </motion.div>
  );
}

function Panel({ title, hint, children, className = '', delay = 0 }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay }}
      className={`${cardClass} ${className}`}
    >
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      {hint && <p className="mt-0.5 text-xs text-slate-500">{hint}</p>}
      <div className="mt-5">{children}</div>
    </motion.section>
  );
}

function Tile({ label, value, tone = 'text-slate-900', money = false }) {
  return (
    <div className="rounded-2xl bg-white/70 p-4">
      <p className={`mono text-xl font-semibold ${tone}`}>{money ? taka(value) : Number(value).toLocaleString('en-IN')}</p>
      <p className="mt-0.5 text-xs text-slate-600">{label}</p>
    </div>
  );
}

export default function OverviewTab({ onNavigate, stats = {} }) {
  const [days, setDays] = useState('30');
  const [exporting, setExporting] = useState('');
  const { data, loading } = useAdminData(`/analytics/overview?days=${days}`);

  const ready = Boolean(data) && !Array.isArray(data) && Boolean(data.kpis);
  const unit = ready ? data.period.unit : 'day';

  const labelOf = (at, short) => {
    const text = dateLabel(at, unit);
    return !short && unit === 'week' ? `Week of ${text}` : text;
  };

  const insights = useMemo(() => {
    if (!ready || data.charts.total < 5) return [];

    const { total, byHour, byWeekday, districts } = data.charts;
    const out = [];

    const peak = byHour.indexOf(Math.max(...byHour));
    const night = [21, 22, 23, 0, 1, 2, 3, 4, 5].reduce((sum, h) => sum + byHour[h], 0);
    out.push({
      icon: Clock,
      tone: 'bg-indigo-100 text-indigo-600',
      title: `Busiest time: ${hourText(peak)} to ${hourText(peak + 1)}`,
      text: `${Math.round((night / total) * 100)}% of cases happen at night, between 9 PM and 6 AM.`,
    });

    const day = byWeekday.indexOf(Math.max(...byWeekday));
    out.push({
      icon: CalendarDays,
      tone: 'bg-violet-100 text-violet-600',
      title: `Busiest day: ${WEEKDAYS[day]}`,
      text: `${byWeekday[day]} of ${total} cases.`,
    });

    if (districts[0]) {
      out.push({
        icon: MapPin,
        tone: 'bg-rose-100 text-rose-600',
        title: `Most cases: ${districts[0].name}`,
        text: `${districts[0].count} of ${total} cases, ${Math.round((districts[0].count / total) * 100)}%.`,
      });
    }

    return out;
  }, [data, ready]);

  async function exportCsv(kind) {
    setExporting(kind);
    try {
      const res = await apiFetch(`${API_BASE}/admin/analytics/export/${kind}?days=${days}`);
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || 'Could not export');
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sahayota-${kind}-${days}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success('Download started');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setExporting('');
    }
  }

  const attention = [
    ['SOS happening now', stats.activeSos, 'sos', true],
    ['Reports to review', (stats.pendingReports || 0) + (stats.flaggedReports || 0), 'reports'],
    ['News waiting', stats.pendingNews, 'news'],
    ['Campaigns to check', (stats.pendingCampaigns || 0) + (stats.flaggedCampaigns || 0), 'campaigns'],
    ['Volunteers waiting', stats.pendingVolunteers, 'volunteers'],
    ['Patients to verify', stats.pendingPatients, 'patients'],
  ].filter((a) => a[1] > 0);

  return (
    <div className="space-y-6">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <Pills options={periods} value={days} onChange={setDays} />
        <div className="flex flex-wrap items-center gap-2">
          {exportKinds.map(([kind, text]) => (
            <button
              key={kind}
              onClick={() => exportCsv(kind)}
              disabled={exporting === kind}
              title={`Download ${text} as a CSV file`}
              className="flex items-center gap-1.5 rounded-full border border-slate-300/70 bg-white/80 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-white disabled:opacity-60"
            >
              {exporting === kind ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />} {text}
            </button>
          ))}
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800"
          >
            <Printer size={13} /> Print or save as PDF
          </button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className={`no-print ${cardClass} ${attention.length > 0 ? 'border-l-4 border-l-rose-500' : ''}`}
      >
        {attention.length === 0 ? (
          <p className="text-sm text-slate-600">Nothing is waiting for you right now. Well done.</p>
        ) : (
          <>
            <p className="text-sm font-semibold text-slate-900">Needs your attention</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {attention.map(([label, count, tab, hot]) => (
                <button
                  key={tab}
                  onClick={() => onNavigate(tab)}
                  className={`group flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    hot ? 'bg-rose-600 text-white hover:bg-rose-700' : 'bg-white/80 text-slate-800 hover:bg-white'
                  }`}
                >
                  <span className={`mono rounded-full px-2 py-0.5 text-xs font-semibold ${hot ? 'animate-pulse bg-white text-rose-600' : 'bg-rose-600 text-white'}`}>{count}</span>
                  {label}
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                </button>
              ))}
            </div>
          </>
        )}
      </motion.div>

      {!ready ? (
        loading ? (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              {[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-44" />)}
            </div>
            <Skeleton className="h-72" />
          </div>
        ) : (
          <p className="rounded-2xl bg-rose-50 p-5 text-sm text-rose-700">Could not load the numbers. Please try again in a moment.</p>
        )
      ) : (
        <div className={`space-y-6 transition-opacity duration-200 ${loading ? 'opacity-50' : ''}`}>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {[
              { icon: Activity, tone: 'bg-rose-100 text-rose-600', label: 'Verified cases', value: data.kpis.cases.value, change: data.kpis.cases.change, good: 'down', series: data.series.cases, color: '#E11D48' },
              { icon: Users, tone: 'bg-indigo-100 text-indigo-600', label: 'New users', value: data.kpis.users.value, change: data.kpis.users.change, good: 'up', series: data.series.users, color: '#6366F1' },
              { icon: Droplet, tone: 'bg-rose-100 text-rose-600', label: 'Blood requests', value: data.kpis.blood.value, change: data.kpis.blood.change, good: null, series: data.series.blood, color: '#F43F5E' },
              { icon: Wallet, tone: 'bg-emerald-100 text-emerald-600', label: 'Donations received', value: data.kpis.raised.value, change: data.kpis.raised.change, good: 'up', series: data.series.raised, color: '#059669', money: true },
              { icon: Siren, tone: 'bg-amber-100 text-amber-600', label: 'SOS alerts', value: data.kpis.sos.value, change: data.kpis.sos.change, good: null, series: data.series.sos, color: '#F59E0B' },
            ].map((item, i) => (
              <Kpi key={item.label} item={item} index={i} labelOf={labelOf} unit={unit} />
            ))}
          </div>

          {insights.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-3">
              {insights.map((it, i) => {
                const Icon = it.icon;
                return (
                  <motion.div
                    key={it.title}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.07 }}
                    className={`${cardClass} flex items-start gap-3`}
                  >
                    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${it.tone}`}>
                      <Icon size={20} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{it.title}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-slate-600">{it.text}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <p className="rounded-2xl bg-white/60 p-4 text-xs text-slate-600">
              Patterns like the busiest hour and the busiest day will appear here once there are at least 5 verified cases in this period.
            </p>
          )}

          <Panel title="Verified cases over time" hint={data.period.unit === 'day' ? 'One point for each day.' : data.period.unit === 'week' ? 'One point for each week.' : 'One point for each month.'}>
            <AreaChart
              data={data.series.cases}
              labelOf={labelOf}
              valueText={(v) => plural(v, 'case', 'cases')}
              emptyText="No verified cases in this period"
            />
          </Panel>

          <div className="grid gap-6 lg:grid-cols-2">
            <Panel title="Top districts" hint="Where most cases happened.">
              <BarList
                items={data.charts.districts.map((d) => ({ label: d.name, value: d.count }))}
                color="#E11D48"
                valueText={(v) => plural(v, 'case', 'cases')}
                empty="No cases in this period"
              />
            </Panel>

            <Panel title="Types of accidents" hint="What kind of accident it was.">
              <BarList
                items={data.charts.types.map((d) => ({ label: d.name, value: d.count }))}
                color="#6366F1"
                valueText={(v) => plural(v, 'case', 'cases')}
                empty="No cases in this period"
              />
            </Panel>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            <Panel title="Time of day" hint="Bangladesh time. The red bar is the busiest hour.">
              <ColumnChart
                data={data.charts.byHour.map((value, h) => ({ label: hourText(h), short: hourShort(h), value }))}
                labelEvery={3}
                valueText={(v) => plural(v, 'case', 'cases')}
              />
            </Panel>

            <Panel title="Day of the week">
              <ColumnChart
                data={data.charts.byWeekday.map((value, i) => ({ label: WEEKDAYS[i], short: WEEKDAYS[i].slice(0, 3), value }))}
                color="#8B5CF6"
                valueText={(v) => plural(v, 'case', 'cases')}
              />
            </Panel>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Panel title="Lives affected" hint="From published news stories in this period.">
              <div className="grid grid-cols-3 gap-3">
                <Tile label="Dead" value={data.casualties.deaths} tone="text-rose-600" />
                <Tile label="Injured" value={data.casualties.injured} />
                <Tile label="Stories" value={data.casualties.stories} />
              </div>
              <p className="mb-3 mt-6 flex items-center gap-2 text-sm font-medium text-slate-900">
                <Newspaper size={15} /> Vehicles involved
              </p>
              <BarList
                items={data.casualties.vehicles.map((v) => ({ label: vehicleLabel(v.name), value: v.count }))}
                color="#0EA5E9"
                valueText={(v) => plural(v, 'story', 'stories')}
                empty="No vehicle data in this period"
              />
            </Panel>

            <Panel title="Case status" hint="Verified cases in this period.">
              <Donut
                parts={[
                  { label: 'Rescue in progress', value: data.charts.status.rescue, color: '#E11D48' },
                  { label: 'Cleared', value: data.charts.status.cleared, color: '#059669' },
                ]}
                center={data.charts.total}
                centerLabel="cases"
              />
              <div className="mt-6 grid grid-cols-2 gap-3">
                <Tile label="SOS alerts" value={data.sos.total} />
                <Tile label="Answered by a volunteer" value={data.sos.answered} tone="text-emerald-600" />
                <Tile label="Marked resolved" value={data.sos.resolved} tone="text-emerald-600" />
                <Tile label="False alarms" value={data.sos.falseAlarm} tone="text-amber-600" />
              </div>
            </Panel>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Panel title="Blood requests" hint={`${data.blood.unitsDonated} of ${data.blood.unitsNeeded} bags donated in this period.`}>
              <Donut
                parts={[
                  { label: 'Completed', value: data.blood.status.completed, color: '#059669' },
                  { label: 'Donor found', value: data.blood.status.accepted, color: '#0EA5E9' },
                  { label: 'Waiting', value: data.blood.status.pending, color: '#F59E0B' },
                  { label: 'Cancelled', value: data.blood.status.cancelled, color: '#94A3B8' },
                ]}
                center={data.blood.total}
                centerLabel="requests"
              />
            </Panel>

            <Panel title="Which blood groups are asked for" hint="Number of requests by group.">
              <ColumnChart
                data={Object.entries(data.blood.groups).map(([label, value]) => ({ label, value }))}
                color="#F43F5E"
                hot="#9F1239"
                valueText={(v) => plural(v, 'request', 'requests')}
              />
            </Panel>
          </div>

          <Panel title="Everything so far" hint="All time, not only this period.">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <Tile label="Registered users" value={data.totals.users} />
              <Tile label="Approved volunteers" value={data.totals.volunteers} tone="text-indigo-600" />
              <Tile label="Blood donors" value={data.totals.donors} tone="text-rose-600" />
              <Tile label="Live campaigns" value={data.totals.campaignsLive} tone="text-emerald-600" />
              <Tile label="Verified cases" value={data.totals.verifiedCases} />
              <Tile label="News stories" value={data.totals.stories} />
              <Tile label="Raised for treatment" value={data.totals.raisedAll} money tone="text-emerald-600" />
              <Tile label="Spent, with receipts" value={data.totals.spentAll} money />
            </div>
            <p className="mt-4 flex items-center gap-2 text-xs text-slate-500">
              <Coins size={13} /> <HeartHandshake size={13} /> Money is counted only after the campaign owner confirms the payment.
            </p>
          </Panel>
        </div>
      )}
    </div>
  );
}