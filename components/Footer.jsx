'use client';

export default function Footer() {
  return (
    <footer className="border-t border-white/40">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-10 rounded-2xl border border-white/50 bg-white/40 p-8 backdrop-blur-xl md:grid-cols-[1fr_1fr]">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">
              Get notified for your district
            </h2>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
              Leave your email and district — we&rsquo;ll send you a message the
              moment a new accident is reported nearby.
            </p>
          </div>

          <form className="flex flex-col gap-3 sm:flex-row sm:items-start">
            <input
              type="email"
              placeholder="name@email.com"
              className="w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2.5 text-sm text-slate-700 sm:max-w-xs"
            />
            <select className="w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2.5 text-sm text-slate-700 sm:w-40">
              <option>District</option>
              <option>Chattogram</option>
              <option>Dhaka</option>
            </select>
            <button className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 sm:w-auto">
              Subscribe
            </button>
          </form>
        </div>

        <div className="mt-10 flex flex-col justify-between gap-4 text-xs text-slate-500 sm:flex-row">
          <p>ResQ — accident &amp; emergency response, Bangladesh.</p>
          <p>
            In an active emergency, call{" "}
            <a href="tel:999" className="text-slate-900 hover:underline">
              999
            </a>{" "}
            first.
          </p>
        </div>
      </div>
    </footer>
  );
}
