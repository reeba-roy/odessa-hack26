export function summarizeClusterData(cluster = {}, listings = []) {
  const clusterListingIds = new Set((cluster.listingIds || []).filter(Boolean));
  const matchingListings = listings.filter((listing) => clusterListingIds.has(listing.id));
  const totalTonnes = matchingListings.reduce((sum, listing) => sum + Number(listing.quantityTonnes || 0), 0);
  const avgMoisture = matchingListings.length
    ? Math.round(
        matchingListings.reduce((sum, listing) => sum + Number(listing.moisturePct || 0), 0) / matchingListings.length
      )
    : Number(cluster.averageMoisture || 0);
  const wasteCategories = [...new Set(
    matchingListings
      .map((listing) => listing.wasteCategory || listing.cropType || "Other")
      .filter(Boolean)
  )];

  return {
    totalTonnes: Number(cluster.totalTonnes || totalTonnes || 0),
    farmerCount: matchingListings.length || Number(cluster.farmerCount || 0),
    avgMoisture: Number(avgMoisture || 0),
    wasteCategories,
  };
}

export function sortClustersForDisplay(clusters = [], sortBy = "quantity", listings = []) {
  const normalized = clusters.map((cluster) => {
    const summary = summarizeClusterData(cluster, listings);
    const averageMoisture = Number(cluster.averageMoisture ?? summary.avgMoisture ?? 0);
    const totalTonnes = Number(cluster.totalTonnes ?? summary.totalTonnes ?? 0);

    return {
      ...cluster,
      ...summary,
      totalTonnes,
      averageMoisture,
      farmerCount: Number(cluster.farmerCount ?? summary.farmerCount ?? (Array.isArray(cluster.listingIds) ? cluster.listingIds.length : 0)),
    };
  });

  const sorters = {
    quantity: (a, b) => (Number(b.totalTonnes) || 0) - (Number(a.totalTonnes) || 0),
    urgency: (a, b) => (Number(b.averageMoisture) || 0) - (Number(a.averageMoisture) || 0),
    distance: (a, b) => (Number(a.distanceKm) || 0) - (Number(b.distanceKm) || 0),
  };

  const comparator = sorters[sortBy] || sorters.quantity;
  return [...normalized].sort(comparator);
}
