import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

const MAX_CLUSTER_RADIUS_KM = 10;

function validNumber(value) {
  return Number.isFinite(Number(value));
}

function haversineKm(a, b) {
  const radius = 6371;
  const lat1 = Number(a.lat);
  const lng1 = Number(a.lng);
  const lat2 = Number(b.lat);
  const lng2 = Number(b.lng);
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const radLat1 = (lat1 * Math.PI) / 180;
  const radLat2 = (lat2 * Math.PI) / 180;

  const h = Math.sin(dLat / 2) ** 2 + Math.cos(radLat1) * Math.cos(radLat2) * Math.sin(dLng / 2) ** 2;
  return 2 * radius * Math.asin(Math.sqrt(h));
}

function sanitizeCropId(cropType) {
  return String(cropType || "unknown")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function getWasteCategory(listing) {
  return listing.wasteCategory || listing.cropType || "Other";
}

function buildClustersFromListings(listings) {
  const validListings = listings.filter((listing) => {
    const wasteCategory = getWasteCategory(listing);
    return validNumber(listing.lat) && validNumber(listing.lng) && wasteCategory && listing.quantityTonnes !== undefined;
  });
  if (!validListings.length) {
    return [];
  }

  const clusters = [];
  const byCrop = validListings.reduce((acc, listing) => {
    const wasteCategory = getWasteCategory(listing);
    acc[wasteCategory] ||= [];
    acc[wasteCategory].push(listing);
    return acc;
  }, {});

  Object.entries(byCrop).forEach(([cropType, cropListings]) => {
    const remaining = [...cropListings];
    let clusterIndex = 1;

    while (remaining.length) {
      const seed = remaining.shift();
      const clusterListings = [seed];

      for (let i = remaining.length - 1; i >= 0; i -= 1) {
        const listing = remaining[i];
        if (haversineKm(seed, listing) <= MAX_CLUSTER_RADIUS_KM) {
          clusterListings.push(listing);
          remaining.splice(i, 1);
        }
      }

      const clusterLat = clusterListings.reduce((sum, listing) => sum + Number(listing.lat), 0) / clusterListings.length;
      const clusterLng = clusterListings.reduce((sum, listing) => sum + Number(listing.lng), 0) / clusterListings.length;
      const totalTonnes = clusterListings.reduce((sum, listing) => sum + Number(listing.quantityTonnes || 0), 0);

      clusters.push({
        id: `cluster-${sanitizeCropId(cropType)}-${clusterIndex}-${Math.round(clusterLat * 1000)}`,
        region: `${cropType} cluster`,
        totalTonnes,
        listingIds: clusterListings.map((listing) => listing.id),
        status: "Available",
        lat: clusterLat,
        lng: clusterLng,
      });
      clusterIndex += 1;
    }
  });

  return clusters;
}

export async function getListings() {
  const snapshot = await getDocs(collection(db, "listings"));
  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));
}

export async function getListingsByFarmer(farmerId) {
  if (!farmerId) {
    return [];
  }

  const q = query(collection(db, "listings"), where("farmerId", "==", farmerId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));
}

export async function getClusters() {
  const listings = await getListings();
  return buildClustersFromListings(listings);
}

export function subscribeListings(callback) {
  return onSnapshot(collection(db, "listings"), (snapshot) => {
    const listings = snapshot.docs.map((item) => ({
      id: item.id,
      ...item.data(),
    }));
    callback(listings);
  });
}

export function subscribeListingsByFarmer(farmerId, callback) {
  if (!farmerId) {
    callback([]);
    return () => {};
  }

  const q = query(collection(db, "listings"), where("farmerId", "==", farmerId));
  return onSnapshot(q, (snapshot) => {
    const listings = snapshot.docs.map((item) => ({
      id: item.id,
      ...item.data(),
    }));
    callback(listings);
  });
}

export function subscribeClusters(callback) {
  return subscribeListings((listings) => {
    callback(buildClustersFromListings(listings));
  });
}

export async function addListing(data) {
  const payload = {
    ...data,
    status: "available",
    clusterId: data.clusterId ?? null,
    farmerId: data.farmerId ?? null,
    createdAt: serverTimestamp(),
  };

  const ref = await addDoc(collection(db, "listings"), payload);
  return {
    id: ref.id,
    ...payload,
  };
}

export async function lockListingSelection(clusterId, selectedListingIds, buyerId) {
  const listingIds = Array.isArray(selectedListingIds) && selectedListingIds.length ? selectedListingIds : [];
  if (!listingIds.length) {
    throw new Error("Choose at least one listing to lock.");
  }

  if (!buyerId) {
    throw new Error("You must be signed in to lock a listing.");
  }

  const listingRefs = listingIds.map((listingId) => doc(db, "listings", listingId));

  try {
    await runTransaction(db, async (transaction) => {
      for (const listingRef of listingRefs) {
        const snapshot = await transaction.get(listingRef);
        if (!snapshot.exists()) {
          throw new Error("One of the selected listings could not be found.");
        }

        const listing = snapshot.data();
        const currentStatus = String(listing.status || "available").toLowerCase();
        if (currentStatus !== "available" && currentStatus !== "listed") {
          throw new Error("This listing has already been locked by another buyer.");
        }
      }

      for (const listingRef of listingRefs) {
        transaction.update(listingRef, {
          buyerId,
          status: "locked",
          lockedAt: serverTimestamp(),
        });
      }
    });
  } catch (error) {
    if (error?.message?.includes("already been locked")) {
      throw new Error("This listing has already been locked by another buyer.");
    }
    throw error;
  }

  return {
    id: clusterId,
    status: "locked",
    buyerId,
    listingIds,
  };
}

export async function lockClusterEscrow(clusterId, buyerId) {
  const clusters = await getClusters();
  const cluster = clusters.find((item) => item.id === clusterId);

  if (!cluster) {
    throw new Error("Cluster not found");
  }

  return lockListingSelection(cluster.id, cluster.listingIds || [], buyerId);
}

export async function updateListingStatus(listingId, status) {
  const ref = doc(db, "listings", listingId);
  await updateDoc(ref, { status });
}
