import "dotenv/config";
import { initializeApp } from "firebase/app";
import { doc, getFirestore, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const requiredConfigKeys = [
  "apiKey",
  "authDomain",
  "projectId",
  "storageBucket",
  "messagingSenderId",
  "appId",
];

const hasFirebaseConfig = requiredConfigKeys.every((key) => Boolean(firebaseConfig[key]));

if (!hasFirebaseConfig) {
  console.warn("Firebase environment variables are not set. Add them to .env.local before running the seed script.");
  process.exit(0);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const listings = [
  {
    id: "listing-kottayam-1",
    farmerName: "Anil Nair",
    cropType: "Paddy Stubble",
    quantityTonnes: 4,
    lat: 9.5916,
    lng: 76.5222,
    status: "Listed",
    clusterId: "cluster-kottayam-1",
    moisturePct: 18,
    photoUrl: "https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "listing-kottayam-2",
    farmerName: "Sreeja Kumar",
    cropType: "Paddy Stubble",
    quantityTonnes: 3,
    lat: 9.6008,
    lng: 76.5317,
    status: "Listed",
    clusterId: "cluster-kottayam-1",
    moisturePct: 17,
    photoUrl: "https://images.unsplash.com/photo-1464226184884-fa52ac9fcf8d?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "listing-kottayam-3",
    farmerName: "Biju Varghese",
    cropType: "Paddy Stubble",
    quantityTonnes: 3,
    lat: 9.5827,
    lng: 76.5154,
    status: "Listed",
    clusterId: "cluster-kottayam-1",
    moisturePct: 19,
    photoUrl: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "listing-palakkad-1",
    farmerName: "Rahul Menon",
    cropType: "Sugarcane Bagasse",
    quantityTonnes: 3,
    lat: 10.7857,
    lng: 76.6548,
    status: "Listed",
    clusterId: "cluster-palakkad-1",
    moisturePct: 16,
    photoUrl: "https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "listing-palakkad-2",
    farmerName: "Nisha Rajan",
    cropType: "Sugarcane Bagasse",
    quantityTonnes: 3,
    lat: 10.7942,
    lng: 76.6701,
    status: "Listed",
    clusterId: "cluster-palakkad-1",
    moisturePct: 17,
    photoUrl: "https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "listing-palakkad-3",
    farmerName: "Arjun Iyer",
    cropType: "Sugarcane Bagasse",
    quantityTonnes: 2,
    lat: 10.7724,
    lng: 76.6479,
    status: "Listed",
    clusterId: "cluster-palakkad-1",
    moisturePct: 18,
    photoUrl: "https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "listing-kottayam-4",
    farmerName: "Meera Joseph",
    cropType: "Banana Stem",
    quantityTonnes: 2,
    lat: 9.5981,
    lng: 76.5365,
    status: "Listed",
    clusterId: "cluster-kottayam-1",
    moisturePct: 22,
    photoUrl: "https://images.unsplash.com/photo-1464226184884-fa52ac9fcf8d?auto=format&fit=crop&w=800&q=80",
  },
];

const clusters = [
  {
    id: "cluster-kottayam-1",
    region: "Kottayam",
    totalTonnes: 12,
    listingIds: [
      "listing-kottayam-1",
      "listing-kottayam-2",
      "listing-kottayam-3",
      "listing-kottayam-4",
    ],
    status: "Available",
    lat: 9.5924,
    lng: 76.5254,
  },
  {
    id: "cluster-palakkad-1",
    region: "Palakkad",
    totalTonnes: 8,
    listingIds: ["listing-palakkad-1", "listing-palakkad-2", "listing-palakkad-3"],
    status: "Available",
    lat: 10.7842,
    lng: 76.6555,
  },
];

async function seedDemoData() {
  for (const listing of listings) {
    await setDoc(doc(db, "listings", listing.id), listing);
  }

  for (const cluster of clusters) {
    await setDoc(doc(db, "clusters", cluster.id), cluster);
  }

  console.log(`Seeded ${listings.length} listings and ${clusters.length} clusters.`);
}

seedDemoData()
  .then(() => {
    console.log("Demo seed complete.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed to seed Firestore data:", error);
    process.exit(1);
  });
