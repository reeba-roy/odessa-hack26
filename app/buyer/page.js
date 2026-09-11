"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import ClusterDetailPanel from "@/components/buyer/ClusterDetailPanel";
import ClusterList from "@/components/buyer/ClusterList";
import EscrowModal from "@/components/buyer/EscrowModal";
import { lockListingSelection, subscribeClusters, subscribeListings } from "@/lib/firestore";

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

  useEffect(() => {
    const unsubscribeListings = subscribeListings((items) => setListings(items));
    const unsubscribeClusters = subscribeClusters((items) => {
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

  const selectedClusterList = useMemo(() => {
    return clusters.find((cluster) => cluster.id === selectedCluster?.id) ?? clusters[0] ?? null;
  }, [clusters, selectedCluster]);

  useEffect(() => {
    if (!selectedClusterList) {
      return;
    }

    const clusterListings = listings.filter((listing) => listing.clusterId === selectedClusterList.id);
    const clusterListingIds = clusterListings.map((listing) => listing.id);

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

    const clusterListingIds = listings
      .filter((listing) => listing.clusterId === selectedClusterList.id)
      .map((listing) => listing.id);

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

          <ClusterList
            clusters={clusters}
            selectedClusterId={selectedClusterList?.id ?? null}
            onSelectCluster={setSelectedCluster}
          />
        </aside>

        <section className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
          <MapView
            clusters={clusters}
            selectedCluster={selectedClusterList}
            onSelectCluster={setSelectedCluster}
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
        totalFarmers={selectedClusterList ? listings.filter((listing) => listing.clusterId === selectedClusterList.id).length : 0}
        onClose={() => setIsModalOpen(false)}
        onConfirm={() => handleLockEscrow(selectedClusterList, selectedClusterList ? selectedListingIds[selectedClusterList.id] ?? [] : [])}
      />
    </main>
  );
}
