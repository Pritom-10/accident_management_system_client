'use client';

const links = [
  { label: 'Accidents', href: '/accidents' },
  { label: 'Hospitals', href: '/hospitals' },
  { label: 'Missing persons', href: '/missing-persons' },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/40 bg-white/50 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="/" className="text-lg font-semibold tracking-tight text-slate-900">
          Sahayota
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-slate-600 transition-colors hover:text-slate-900"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="/login"
            className="rounded-full border border-slate-300/70 bg-white/60 px-4 py-2 text-sm font-medium text-slate-700 backdrop-blur hover:bg-white/90"
          >
            Login
          </a>
          <a
            href="/volunteer/register"
            className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700"
          >
            Sign up as Volunteer
          </a>
        </div>
      </div>
    </header>
  );
}
