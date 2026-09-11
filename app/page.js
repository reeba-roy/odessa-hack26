import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-slate-100 px-4 py-10">
      <div className="w-full max-w-5xl rounded-[32px] border border-emerald-100 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-12">
        <div className="mb-10 space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-600">
            AgriNode
          </p>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            A smarter marketplace for agri-waste trading.
          </h1>
        </div>

        <p className="max-w-2xl text-lg leading-8 text-slate-600">
          Connect smallholder farmers with industrial buyers through regional clusters, transparent lot volumes,
          and simulated escrow for a fast demo workflow.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <Link
            href="/signup?role=farmer"
            className="flex h-14 items-center justify-center rounded-2xl bg-agri-green px-6 text-base font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5"
          >
            Sign up as Farmer
          </Link>
          <Link
            href="/signup?role=buyer"
            className="flex h-14 items-center justify-center rounded-2xl border border-slate-200 bg-slate-900 px-6 text-base font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5"
          >
            Sign up as Buyer
          </Link>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-600">
          <span>Already have an account?</span>
          <Link href="/login" className="font-semibold text-emerald-700 hover:text-emerald-800">
            Log in
          </Link>
        </div>
      </div>
    </main>
  );
}
