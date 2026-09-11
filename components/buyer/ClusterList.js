const STATUS_STYLES = {
  Available: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  EscrowLocked: "bg-amber-100 text-amber-700 ring-amber-200",
  Paid: "bg-slate-900 text-white ring-slate-700",
};

export default function ClusterList({ clusters, selectedClusterId, onSelectCluster }) {
  return (
    <div className="space-y-3">
      {clusters.map((cluster) => (
        <button
          key={cluster.id}
          type="button"
          onClick={() => onSelectCluster(cluster)}
          className={`w-full rounded-2xl border p-4 text-left transition ${
            selectedClusterId === cluster.id
              ? "border-emerald-300 bg-emerald-50 shadow-sm"
              : "border-slate-200 bg-white hover:border-slate-300"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Region</p>
              <h3 className="mt-1 text-lg font-bold text-slate-900">{cluster.region}</h3>
            </div>
            <span
              className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${STATUS_STYLES[cluster.status] || STATUS_STYLES.Available}`}
            >
              {cluster.status}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-slate-600">
            <div>
              <p className="font-medium text-slate-400">Tonnes</p>
              <p className="mt-1 text-base font-bold text-slate-900">{cluster.totalTonnes} t</p>
            </div>
            <div>
              <p className="font-medium text-slate-400">Listings</p>
              <p className="mt-1 text-base font-bold text-slate-900">{cluster.listingIds.length}</p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
