import { BadgeCheck } from 'lucide-react';

export default function VerifiedMark({ size = 14, className = '' }) {
  return (
    <span title="Verified by an admin" className={`inline-flex shrink-0 text-emerald-500 ${className}`}>
      <BadgeCheck size={size} aria-label="Verified" />
    </span>
  );
}