"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import ClusterDetailPanel from "@/components/buyer/ClusterDetailPanel";
import ClusterList from "@/components/buyer/ClusterList";
import EscrowModal from "@/components/buyer/EscrowModal";
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

    try {
      setStatusMessage("");
      await lockListingSelection(cluster.id, chosenListingIds || []);
      setStatusMessage("✓ Demo escrow locked — no real payment processed");
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
      setStatusMessage("Escrow could not be locked. Please try again.");
      setIsModalOpen(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 rounded-3xl border border-slate-200 bg-slate-900 p-6 text-white shadow-sm sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">Buyer view</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Regional waste demand</h1>
        <p className="mt-3 text-sm text-slate-300">
          Clustered by similar produce within a ~10 km radius. Map shows cluster points only; farmer details appear after selection.
        </p>
      </header>

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)_360px]">
        <aside className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Clusters</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">Available lots</h2>
          </div>

          <div className="mb-4 space-y-3">
            <div className="flex flex-wrap gap-2">
              {[
                { value: "all", label: "All waste" },
                { value: "Paddy Stubble", label: "Paddy" },
                { value: "Sugarcane Bagasse", label: "Bagasse" },
                { value: "Banana Stem", label: "Banana" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setActiveWasteFilter(option.value)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${activeWasteFilter === option.value ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Sort by
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none"
              >
                <option value="quantity">Quantity</option>
                <option value="urgency">Urgency</option>
                <option value="distance">Distance</option>
              </select>
            </label>
          </div>

          <ClusterList
            clusters={clusterOptions}
            selectedClusterId={selectedClusterList?.id ?? null}
            onSelectCluster={setSelectedCluster}
          />
        </aside>

        <section className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 p-1">
              <button
                type="button"
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${mapMode === "clusters" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`}
                onClick={() => setMapMode("clusters")}
              >
                Cluster view
              </button>
              <button
                type="button"
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${mapMode === "farmers" ? "bg-emerald-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}
                onClick={() => setMapMode("farmers")}
              >
                Farmer view
              </button>
            </div>
          </div>

          <div className="mb-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
            {selectedClusterList ? (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700">Cluster summary</p>
                  <h3 className="mt-1 text-lg font-bold text-slate-900">{selectedClusterList.region}</h3>
                </div>
                <div className="flex flex-wrap gap-2 text-sm text-slate-700">
                  <span className="rounded-full bg-white px-2.5 py-1 ring-1 ring-emerald-200">{selectedClusterList.totalTonnes || 0} t total</span>
                  <span className="rounded-full bg-white px-2.5 py-1 ring-1 ring-emerald-200">{selectedClusterList.farmerCount || 0} farmers</span>
                  <span className="rounded-full bg-white px-2.5 py-1 ring-1 ring-emerald-200">{selectedClusterList.avgMoisture || 0}% avg moisture</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-600">Select a cluster to view the live summary.</p>
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

        <aside className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <ClusterDetailPanel
            cluster={selectedClusterList}
            listings={listings}
            selectedListingIds={selectedClusterList ? selectedListingIds[selectedClusterList.id] ?? [] : []}
            onToggleListing={toggleListingSelection}
            onSelectAll={selectAllFarmers}
            onClearSelection={clearSelection}
            onLockEscrow={(cluster, chosenIds) => {
              if (!chosenIds || chosenIds.length === 0) {
                setStatusMessage("Choose at least one farmer or select the full cluster.");
                return;
              }
              setIsModalOpen(true);
            }}
          />

          {statusMessage ? (
            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">
              {statusMessage}
            </div>
          ) : null}
        </aside>
      </div>

      <EscrowModal
        isOpen={isModalOpen}
        cluster={selectedClusterList}
        selectedIds={selectedClusterList ? selectedListingIds[selectedClusterList.id] ?? [] : []}
        totalFarmers={selectedClusterList ? (selectedClusterList.listingIds || []).length : 0}
        onClose={() => setIsModalOpen(false)}
        onConfirm={() => handleLockEscrow(selectedClusterList, selectedClusterList ? selectedListingIds[selectedClusterList.id] ?? [] : [])}
      />
    </main>
  );
}
