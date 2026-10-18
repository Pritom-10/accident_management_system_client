export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const CAN_RECEIVE_FROM = {
  'A+': ['A+', 'A-', 'O+', 'O-'],
  'A-': ['A-', 'O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'B-': ['B-', 'O-'],
  'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  'AB-': ['A-', 'B-', 'AB-', 'O-'],
  'O+': ['O+', 'O-'],
  'O-': ['O-'],
};

export const RULES = { minAge: 18, maxAge: 60, minWeightKg: 50, gapDays: 120 };

const DAY = 24 * 60 * 60 * 1000;

export const canDonateTo = (donorGroup, recipientGroup) =>
  (CAN_RECEIVE_FROM[recipientGroup] || []).includes(donorGroup);

export function ageOn(dob, now = new Date()) {
  const d = new Date(dob);
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age -= 1;
  return age;
}

export const dateText = (d) =>
  new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Dhaka' });

export function checkEligibility({ dateOfBirth, weightKg, lastDonationDate } = {}, now = new Date()) {
  const checks = [];
  let nextEligibleDate = null;

  if (!dateOfBirth) {
    checks.push({ key: 'age', state: 'missing', text: 'Enter your date of birth' });
  } else {
    const age = ageOn(dateOfBirth, now);
    const ok = age >= RULES.minAge && age <= RULES.maxAge;
    checks.push({
      key: 'age',
      state: ok ? 'ok' : 'fail',
      text: ok ? `Age ${age} is fine` : `Age ${age}: donors must be ${RULES.minAge} to ${RULES.maxAge}`,
    });
  }

  const w = Number(weightKg);
  if (!w) {
    checks.push({ key: 'weight', state: 'missing', text: 'Enter your weight' });
  } else {
    const ok = w >= RULES.minWeightKg;
    checks.push({
      key: 'weight',
      state: ok ? 'ok' : 'fail',
      text: ok ? `${w} kg is fine` : `${w} kg: donors must weigh at least ${RULES.minWeightKg} kg`,
    });
  }

  if (!lastDonationDate) {
    checks.push({ key: 'gap', state: 'ok', text: 'No recent donation' });
  } else {
    const next = new Date(new Date(lastDonationDate).getTime() + RULES.gapDays * DAY);
    if (next > now) {
      nextEligibleDate = next;
      checks.push({ key: 'gap', state: 'fail', text: `Rest until ${dateText(next)}` });
    } else {
      checks.push({ key: 'gap', state: 'ok', text: `Last donation was over ${RULES.gapDays} days ago` });
    }
  }

  return { eligible: checks.every((c) => c.state === 'ok'), checks, nextEligibleDate };
}

export function timeLeft(neededBy, now = Date.now()) {
  const ms = new Date(neededBy).getTime() - now;
  const abs = Math.abs(Math.round(ms / 60000));
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  const d = Math.floor(h / 24);
  const text = d >= 1 ? `${d}d ${h % 24}h` : h >= 1 ? `${h}h ${m}m` : `${m}m`;
  const hours = ms / 3600000;
  const tier = ms < 0 ? 'overdue' : hours <= 6 ? 'critical' : hours <= 24 ? 'urgent' : 'normal';
  return { text: ms < 0 ? `${text} overdue` : `in ${text}`, tier, ms };
}

export const tierStyle = {
  critical: { cls: 'bg-rose-100 text-rose-700', accent: '#E11D48' },
  urgent: { cls: 'bg-orange-100 text-orange-700', accent: '#F97316' },
  normal: { cls: 'bg-slate-100 text-slate-700', accent: '#64748B' },
  overdue: { cls: 'bg-slate-200 text-slate-600', accent: '#94A3B8' },
};

export const waLink = (phone, text) =>
  `https://wa.me/${String(phone).replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;

export const telLink = (phone) => `tel:+${String(phone).replace(/\D/g, '')}`;

export function displayPhone(phone) {
  const d = String(phone || '').replace(/\D/g, '');
  return d.startsWith('880') ? `0${d.slice(3)}` : d;
}

export function toLocalInput(date) {
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}