export function getMapPoints({ clusters = [], listings = [], mode = 'clusters' }) {
  const validNumber = (value) => Number.isFinite(Number(value));

  if (mode === 'farmers') {
    return listings
      .filter((listing) => validNumber(listing.lat) && validNumber(listing.lng))
      .map((listing) => ({
        id: listing.id,
        type: 'farmer',
        farmerName: listing.farmerName,
        region: listing.region ?? listing.clusterId ?? 'Farmer location',
        lat: Number(listing.lat),
        lng: Number(listing.lng),
        cropType: listing.wasteCategory || listing.cropType,
        quantityTonnes: listing.quantityTonnes,
        status: listing.status,
        clusterId: listing.clusterId,
      }));
  }

  return clusters
    .filter((cluster) => validNumber(cluster.lat) && validNumber(cluster.lng))
    .map((cluster) => ({
      id: cluster.id,
      type: 'cluster',
      region: cluster.region,
      lat: Number(cluster.lat),
      lng: Number(cluster.lng),
      totalTonnes: cluster.totalTonnes,
      status: cluster.status,
      listingIds: Array.isArray(cluster.listingIds) ? cluster.listingIds : [],
    }));
}
