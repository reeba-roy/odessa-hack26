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
          <Link href="/" className="rounded-full px-3 py-1.5 transition hover:bg-slate-100">
            Home
          </Link>
          <Link href="/login" className="rounded-full border border-slate-200 px-3 py-1.5 transition hover:bg-slate-50">
            Login
          </Link>
          <Link href="/signup" className="rounded-full bg-slate-900 px-3 py-1.5 text-white transition hover:bg-slate-800">
            Sign up
          </Link>
        </nav>
      </div>
    </header>
  );
}
