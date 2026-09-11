import { useLanguage } from "@/components/common/LanguageContext";

export default function EscrowModal({
  isOpen,
  cluster,
  selectedIds = [],
  totalFarmers = 0,
  onClose,
  onConfirm,
}) {
  const { t } = useLanguage();

  if (!isOpen || !cluster) {
    return null;
  }

  const isWholeCluster = selectedIds.length === totalFarmers && totalFarmers > 0;
  const summaryText = isWholeCluster
    ? `Lock the entire ${cluster.region} cluster into a simulated escrow for ${cluster.totalTonnes} tonnes of agri-waste?`
    : `Lock ${selectedIds.length} selected farmer${selectedIds.length === 1 ? "" : "s"} in ${cluster.region} into a simulated escrow?`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{t.confirmEscrow}</p>
            <h3 className="mt-2 text-2xl font-bold text-slate-900">{cluster.region}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 px-2 py-1 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        <p className="text-base leading-7 text-slate-600">{summaryText}</p>

        <div className="mt-5 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800 ring-1 ring-amber-200">
          {t.demoEscrowNote}
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-base font-semibold text-slate-700 hover:bg-slate-50"
          >
            {t.cancel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-emerald-600 px-4 py-3 text-base font-semibold text-white hover:bg-emerald-500"
          >
            {isWholeCluster ? t.confirmWholeCluster : t.confirmSelection}
          </button>
        </div>
      </div>
    </div>
  );
}
