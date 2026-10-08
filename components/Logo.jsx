
export default function Logo({ size = 34, showText = true, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg width={size} height={(size * 50) / 48} viewBox="0 0 48 50" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="sahayotaGrad" x1="8" y1="4" x2="40" y2="44" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F43F5E" />
            <stop offset="1" stopColor="#4F46E5" />
          </linearGradient>
        </defs>
        <ellipse cx="24" cy="46" rx="12" ry="2.6" stroke="#4F46E5" strokeOpacity="0.35" strokeWidth="1.2" />
        <ellipse cx="24" cy="46" rx="6" ry="1.4" fill="#4F46E5" fillOpacity="0.28" />
        <path
          d="M24 3C15.2 3 8 10 8 18.6 8 29.5 24 44 24 44s16-14.5 16-25.4C40 10 32.8 3 24 3Z"
          fill="url(#sahayotaGrad)"
        />
        <rect x="21.5" y="11" width="5" height="15" rx="1.6" fill="#fff" />
        <rect x="16.5" y="16" width="15" height="5" rx="1.6" fill="#fff" />
      </svg>
      {showText && (
        <span
          className="text-xl font-semibold tracking-tight text-slate-900"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Sahayota
        </span>
      )}
    </span>
  );
}
