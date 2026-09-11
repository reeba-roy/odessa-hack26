const STATUS_STYLES = {
  Listed: "bg-slate-100 text-slate-700 ring-slate-200",
  Clustered: "bg-blue-100 text-blue-700 ring-blue-200",
  EscrowLocked: "bg-amber-100 text-amber-700 ring-amber-200",
  Paid: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  locked: "bg-amber-100 text-amber-700 ring-amber-200",
  available: "bg-emerald-100 text-emerald-700 ring-emerald-200",
};

export default function ListingCard({ listing }) {
  const rawStatus = String(listing.status || "listed").toLowerCase();
  const uiStatus = rawStatus === "locked" ? "EscrowLocked" : rawStatus === "available" ? "Listed" : rawStatus;

  return (
    <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
            {listing.wasteCategory || listing.cropType || "Waste"}
          </p>
          <h3 className="mt-2 text-xl font-bold text-slate-900">{listing.farmerName}</h3>
        </div>
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${STATUS_STYLES[uiStatus] || STATUS_STYLES.Listed}`}
        >
          {rawStatus === "locked" ? "Escrow Locked" : String(listing.status || "Listed")}
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-white p-3">
          <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Quantity</p>
          <p className="mt-1 text-lg font-bold text-slate-900">{listing.quantityTonnes} t</p>
        </div>
        <div className="rounded-xl bg-white p-3">
          <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Moisture</p>
          <p className="mt-1 text-lg font-bold text-slate-900">{listing.moisturePct}%</p>
        </div>
        <div className="rounded-xl bg-white p-3">
          <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Location</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            {listing.lat?.toFixed(4)}, {listing.lng?.toFixed(4)}
          </p>
        </div>
      </div>
    </article>
  );
}
