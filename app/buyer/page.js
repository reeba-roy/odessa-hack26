"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import ClusterDetailPanel from "@/components/buyer/ClusterDetailPanel";
import ClusterList from "@/components/buyer/ClusterList";
import EscrowModal from "@/components/buyer/EscrowModal";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/components/auth/AuthProvider";
import { useLanguage } from "@/components/common/LanguageContext";
import { summarizeClusterData, sortClustersForDisplay } from "@/lib/buyerCluster";
import { getClusters, getListings, lockListingSelection, subscribeClusters, subscribeListings } from "@/lib/firestore";

const MapView = dynamic(() => import("@/components/map/MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[440px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-slate-500">
      Loading map...
    </div>
  ),
});

export default function BuyerPage() {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const [listings, setListings] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [selectedCluster, setSelectedCluster] = useState(null);
  const [selectedListingIds, setSelectedListingIds] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [mapMode, setMapMode] = useState("clusters");
  const [activeWasteFilter, setActiveWasteFilter] = useState("all");
  const [sortBy, setSortBy] = useState("quantity");

  useEffect(() => {
    let unsubscribeListings = () => {};
    let unsubscribeClusters = () => {};

    const seed = async () => {
      try {
        const [initialListings, initialClusters] = await Promise.all([getListings(), getClusters()]);
        setListings(initialListings);
        setClusters(initialClusters);
        setSelectedCluster((current) => {
          if (!current) return initialClusters[0] ?? null;
          return initialClusters.find((cluster) => cluster.id === current.id) ?? initialClusters[0] ?? null;
        });
      } catch (error) {
        console.warn("Initial Firestore fetch failed; buyer page kept demo fallback data.", error);
      }
    };

    seed();

    unsubscribeListings = subscribeListings((items) => setListings(items));
    unsubscribeClusters = subscribeClusters((items) => {
      setClusters(items);
      setSelectedCluster((current) => {
        if (!current) return items[0] ?? null;
        return items.find((cluster) => cluster.id === current.id) ?? items[0] ?? null;
      });
    });

    return () => {
      unsubscribeListings();
      unsubscribeClusters();
    };
  }, []);

  const clusterOptions = useMemo(() => {
    const pool = clusters.map((cluster) => {
      const summary = summarizeClusterData(cluster, listings);
      return {
        ...cluster,
        ...summary,
      };
    });

    const filtered = activeWasteFilter === "all"
      ? pool
      : pool.filter((cluster) => {
          const matched = listings.filter((listing) => (cluster.listingIds || []).includes(listing.id));
          return matched.some((listing) => (listing.wasteCategory || listing.cropType || "Other") === activeWasteFilter);
        });

    return sortClustersForDisplay(filtered, sortBy, listings);
  }, [clusters, listings, activeWasteFilter, sortBy]);

  const selectedClusterList = useMemo(() => {
    const selectedFromOptions = clusterOptions.find((cluster) => cluster.id === selectedCluster?.id);
    if (selectedFromOptions) {
      return selectedFromOptions;
    }

    const selectedFromClusters = clusters.find((cluster) => cluster.id === selectedCluster?.id);
    if (selectedFromClusters) {
      return selectedFromClusters;
    }

    return clusterOptions[0] ?? clusters[0] ?? null;
  }, [clusterOptions, clusters, selectedCluster]);

  useEffect(() => {
    if (!selectedClusterList) {
      return;
    }

    const clusterListingIds = (selectedClusterList.listingIds || []).filter((id) => listings.some((listing) => listing.id === id));

    setSelectedListingIds((current) => {
      const existing = current[selectedClusterList.id] ?? [];
      const validCurrent = existing.filter((id) => clusterListingIds.includes(id));
      return {
        ...current,
        [selectedClusterList.id]: validCurrent.length ? validCurrent : clusterListingIds,
      };
    });
  }, [selectedClusterList, listings]);

  const toggleListingSelection = (listingId) => {
    if (!selectedClusterList) {
      return;
    }

    const clusterId = selectedClusterList.id;
    setSelectedListingIds((current) => {
      const existing = current[clusterId] ?? [];
      const next = existing.includes(listingId)
        ? existing.filter((id) => id !== listingId)
        : [...existing, listingId];

      return {
        ...current,
        [clusterId]: next,
      };
    });
  };

  const selectAllFarmers = () => {
    if (!selectedClusterList) {
      return;
    }

    const clusterListingIds = (selectedClusterList.listingIds || []).filter((id) => listings.some((listing) => listing.id === id));

    setSelectedListingIds((current) => ({
      ...current,
      [selectedClusterList.id]: clusterListingIds,
    }));
  };

  const clearSelection = () => {
    if (!selectedClusterList) {
      return;
    }

    setSelectedListingIds((current) => ({
      ...current,
      [selectedClusterList.id]: [],
    }));
  };

  const handleLockEscrow = async (cluster, chosenListingIds) => {
    if (!cluster) {
      return;
    }

    if (!currentUser?.uid) {
      setStatusMessage("Please sign in before locking an offer.");
      setIsModalOpen(false);
      return;
    }

    try {
      setStatusMessage("");
      await lockListingSelection(cluster.id, chosenListingIds || [], currentUser.uid);
      setStatusMessage("✓ Demo escrow locked — no real payment processed");
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
      setStatusMessage("Escrow could not be locked. Please try again.");
      setIsModalOpen(false);
    }
  };

  return (
    <ProtectedRoute role="buyer" requireAuth={true}>
      <main className="agri-buyer-shell">
        <header className="agri-buyer-header">
          <span className="agri-section-label light">{t.buyerView}</span>
          <h1>{t.regionalWasteDemand}</h1>
          <p>{t.buyerPitch}</p>
        </header>

        <section className="agri-buyer-grid">
          <aside className="agri-buyer-sidebar agri-buyer-cluster-panel">
            <div className="agri-buyer-panel-title">
              <span className="agri-section-label">{t.clusters}</span>
              <h2>{t.availableLots}</h2>
            </div>

            <div className="agri-buyer-filter-block">
              <div className="agri-buyer-filter-row">
                {[
                  { value: "all", label: t.allWaste },
                  { value: "Paddy Stubble", label: t.paddy },
                  { value: "Sugarcane Bagasse", label: t.bagasse },
                  { value: "Banana Stem", label: t.banana },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setActiveWasteFilter(option.value)}
                    className={`agri-buyer-filter-button ${activeWasteFilter === option.value ? "selected" : ""}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <label className="agri-buyer-sort">
                <span>{t.sortBy}</span>
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  className="agri-buyer-sort-select"
                >
                  <option value="quantity">{t.quantity}</option>
                  <option value="urgency">{t.urgency}</option>
                  <option value="distance">{t.distance}</option>
                </select>
              </label>
            </div>

            <ClusterList
              clusters={clusterOptions}
              selectedClusterId={selectedClusterList?.id ?? null}
              onSelectCluster={setSelectedCluster}
            />
          </aside>

          <section className="agri-buyer-map-panel">
            <div className="agri-buyer-map-toolbar">
              <div className="agri-buyer-view-switch">
                <button
                  type="button"
                  className={mapMode === "clusters" ? "selected" : ""}
                  onClick={() => setMapMode("clusters")}
                >
                  {t.clusterView}
                </button>
                <button
                  type="button"
                  className={mapMode === "farmers" ? "selected" : ""}
                  onClick={() => setMapMode("farmers")}
                >
                  {t.farmerMapView}
                </button>
              </div>
            </div>

            <div className="agri-buyer-summary">
              {selectedClusterList ? (
                <div className="agri-buyer-summary-inner">
                  <div>
                    <span className="agri-section-label">{t.clusterSummary}</span>
                    <h3>{selectedClusterList.region}</h3>
                  </div>
                  <div className="agri-buyer-summary-stats">
                  <span>{selectedClusterList.totalTonnes || 0} t {t.total}</span>
                  <span>{selectedClusterList.farmerCount || 0} {t.farmers}</span>
                  <span>{selectedClusterList.avgMoisture || 0}% {t.avgMoisture}</span>
                </div>
              </div>
            ) : (
              <p>{t.selectCluster}</p>
            )}
          </div>

          <MapView
            clusters={clusterOptions}
            listings={listings}
            selectedCluster={selectedClusterList}
            onSelectCluster={setSelectedCluster}
            mode={mapMode}
          />
        </section>

        <aside className="agri-buyer-sidebar agri-buyer-detail-panel">
          <ClusterDetailPanel
            cluster={selectedClusterList}
            listings={listings}
            selectedListingIds={selectedClusterList ? selectedListingIds[selectedClusterList.id] ?? [] : []}
            onToggleListing={toggleListingSelection}
            onSelectAll={selectAllFarmers}
            onClearSelection={clearSelection}
            onLockEscrow={(cluster, chosenIds) => {
              if (!chosenIds || chosenIds.length === 0) {
                setStatusMessage(t.chooseFarmer);
                return;
              }
              setIsModalOpen(true);
            }}
          />

          {statusMessage ? (
            <div className="agri-buyer-status-message">
              {statusMessage}
            </div>
          ) : null}
        </aside>
      </section>

        <EscrowModal
          isOpen={isModalOpen}
          cluster={selectedClusterList}
          selectedIds={selectedClusterList ? selectedListingIds[selectedClusterList.id] ?? [] : []}
          totalFarmers={selectedClusterList ? (selectedClusterList.listingIds || []).length : 0}
          onClose={() => setIsModalOpen(false)}
          onConfirm={() => handleLockEscrow(selectedClusterList, selectedClusterList ? selectedListingIds[selectedClusterList.id] ?? [] : [])}
        />
      </main>
    </ProtectedRoute>
  );
}
