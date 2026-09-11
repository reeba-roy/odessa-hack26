import { useLanguage } from "@/components/common/LanguageContext";

export default function ClusterDetailPanel({
  cluster,
  listings,
  selectedListingIds,
  onToggleListing,
  onSelectAll,
  onClearSelection,
  onLockEscrow,
}) {
  const { t } = useLanguage();

  if (!cluster) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-slate-500">
        {t.selectClusterDetail}
      </div>
    );
  }

  const clusterListings = listings.filter((listing) => (cluster.listingIds || []).includes(listing.id));
  const isLocked = cluster.status === "EscrowLocked";
  const isAllSelected = clusterListings.length > 0 && clusterListings.every((listing) => selectedListingIds.includes(listing.id));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{t.clusterLabel}</p>
          <h3 className="mt-1 text-2xl font-bold text-slate-900">{cluster.region}</h3>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
          {cluster.status}
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs uppercase tracking-[0.12em] text-slate-500">{t.totalTonnesValue}</p>
          <p className="mt-1 text-lg font-bold text-slate-900">{cluster.totalTonnes} t</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs uppercase tracking-[0.12em] text-slate-500">{t.farmersValue}</p>
          <p className="mt-1 text-lg font-bold text-slate-900">{clusterListings.length}</p>
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-slate-600">{t.contributingFarmers}</p>
          <button
            type="button"
            onClick={isAllSelected ? onClearSelection : onSelectAll}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
          >
            {isAllSelected ? t.clearAll : t.selectAll}
          </button>
        </div>

        <ul className="mt-3 space-y-2">
          {clusterListings.map((listing) => {
            const checked = selectedListingIds.includes(listing.id);

            return (
              <li key={listing.id} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <label className="flex cursor-pointer items-center justify-between gap-3 text-sm text-slate-700">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-slate-800">{listing.farmerName}</div>
                    <div className="mt-0.5 text-xs text-slate-500">
                      {listing.wasteCategory || listing.cropType || "Waste"} · {listing.quantityTonnes} t
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggleListing(listing.id)}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                </label>
              </li>
            );
          })}
        </ul>
      </div>

      <button
        type="button"
        onClick={() => onLockEscrow(cluster, selectedListingIds)}
        disabled={isLocked || selectedListingIds.length === 0}
        className={`mt-6 w-full rounded-xl px-4 py-3 text-base font-semibold transition ${
          isLocked || selectedListingIds.length === 0
            ? "cursor-not-allowed bg-amber-100 text-amber-700 ring-1 ring-amber-200"
            : "bg-slate-900 text-white hover:bg-slate-800"
        }`}
      >
        {isLocked ? t.escrowLocked : `${t.lockSelectedFarmers} ${selectedListingIds.length} ${selectedListingIds.length === 1 ? t.farmerSingular : t.farmerPlural}`}
      </button>
    </div>
  );
}
