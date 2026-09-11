import Link from "next/link";

export default function Navbar() {
  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="transition hover:opacity-80">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">AgriNode</p>
            <h2 className="text-lg font-bold text-slate-900">Agri waste marketplace</h2>
          </div>
        </Link>

        <nav className="flex items-center gap-3 text-sm font-medium text-slate-600">
          <Link href="/farmer" className="rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-700 transition hover:bg-emerald-100">
            Farmer
          </Link>
          <Link href="/buyer" className="rounded-full bg-slate-100 px-3 py-1.5 transition hover:bg-slate-200">
            Buyer
          </Link>
        </nav>
      </div>
    </header>
  );
}
