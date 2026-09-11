import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function getListings() {
  const snapshot = await getDocs(collection(db, "listings"));
  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));
}

export async function getClusters() {
  const snapshot = await getDocs(collection(db, "clusters"));
  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));
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

export function subscribeClusters(callback) {
  return onSnapshot(collection(db, "clusters"), (snapshot) => {
    const clusters = snapshot.docs.map((item) => ({
      id: item.id,
      ...item.data(),
    }));
    callback(clusters);
  });
}

export async function addListing(data) {
  const payload = {
    ...data,
    status: "Listed",
    clusterId: null,
  };

  const ref = await addDoc(collection(db, "listings"), payload);
  return {
    id: ref.id,
    ...payload,
  };
}

export async function lockListingSelection(clusterId, selectedListingIds) {
  const clusterRef = doc(db, "clusters", clusterId);
  const clusterSnap = await getDoc(clusterRef);

  if (!clusterSnap.exists()) {
    throw new Error("Cluster not found");
  }

  const clusterData = clusterSnap.data();
  const allListingIds = Array.isArray(clusterData.listingIds) ? clusterData.listingIds : [];
  const listingIds = selectedListingIds && selectedListingIds.length ? selectedListingIds : allListingIds;
  const batch = writeBatch(db);

  batch.update(clusterRef, { status: "EscrowLocked" });

  listingIds.forEach((listingId) => {
    const listingRef = doc(db, "listings", listingId);
    batch.update(listingRef, { status: "EscrowLocked" });
  });

  await batch.commit();
  return {
    id: clusterId,
    status: "EscrowLocked",
    listingIds,
  };
}

export async function lockClusterEscrow(clusterId) {
  const clusterRef = doc(db, "clusters", clusterId);
  const clusterSnap = await getDoc(clusterRef);

  if (!clusterSnap.exists()) {
    throw new Error("Cluster not found");
  }

  const clusterData = clusterSnap.data();
  const listingIds = Array.isArray(clusterData.listingIds) ? clusterData.listingIds : [];
  return lockListingSelection(clusterId, listingIds);
}

export async function updateListingStatus(listingId, status) {
  const ref = doc(db, "listings", listingId);
  await updateDoc(ref, { status });
}
