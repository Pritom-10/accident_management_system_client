import { Coins, Frown, Heart, Info, Scale, Stethoscope, ThumbsUp } from 'lucide-react';

export const UPDATE_KINDS = [
  { value: 'injured', label: 'Injured: condition', icon: Stethoscope, tone: 'bg-rose-100 text-rose-600' },
  { value: 'case', label: 'Case and police', icon: Scale, tone: 'bg-indigo-100 text-indigo-600' },
  { value: 'compensation', label: 'Compensation', icon: Coins, tone: 'bg-emerald-100 text-emerald-600' },
  { value: 'general', label: 'Other news', icon: Info, tone: 'bg-slate-100 text-slate-600' },
];

export const kindMeta = (value) => UPDATE_KINDS.find((k) => k.value === value) || UPDATE_KINDS[3];

export const REACTIONS = [
  { type: 'helpful', label: 'Helpful', icon: ThumbsUp, on: 'border-indigo-600 bg-indigo-600 text-white' },
  { type: 'sad', label: 'Sad', icon: Frown, on: 'border-slate-800 bg-slate-800 text-white' },
  { type: 'care', label: 'Sending care', icon: Heart, on: 'border-rose-600 bg-rose-600 text-white' },
];