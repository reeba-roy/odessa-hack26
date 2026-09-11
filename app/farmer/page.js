"use client";

import { useEffect, useState } from "react";
import ListingCard from "@/components/farmer/ListingCard";
import ListingForm from "@/components/farmer/ListingForm";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/components/auth/AuthProvider";
import { subscribeListingsByFarmer } from "@/lib/firestore";

const fallbackListings = [];

export default function FarmerPage() {
  const { currentUser } = useAuth();
  const [listings, setListings] = useState(fallbackListings);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!currentUser?.uid) {
      setListings([]);
      setIsReady(false);
      return () => {};
    }

    const unsubscribe = subscribeListingsByFarmer(currentUser.uid, (items) => {
      setListings(items);
      setIsReady(true);
    });

    return () => unsubscribe();
  }, [currentUser?.uid]);

  return (
    <ProtectedRoute role="farmer" requireAuth={true}>
      <main className="agri-market-shell">
        <section className="agri-market-head">
          <span className="agri-section-label">Farmer view</span>
          <h1>AgriNode dashboard</h1>
          <p className="agri-market-subhead">Connect regional surplus to buyer demand.</p>
        </section>

        <section className="agri-dashboard-layout">
          <ListingForm />

          <section className="agri-listing-panel">
            <div className="agri-listing-panel-top">
              <div>
                <span className="agri-section-label">Listings</span>
                <h2>Your active waste offers</h2>
              </div>
              <span className="agri-listings-total">{listings.length} total</span>
            </div>

            {!isReady ? (
              <div className="agri-empty-state">Loading listings from Firestore...</div>
            ) : listings.length === 0 ? (
              <div className="agri-empty-state">No listings yet. Add your first agri-waste offer to begin the demo.</div>
            ) : (
              <div className="agri-listing-card-stack">
                {listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            )}
          </section>
        </section>
      </main>
    </ProtectedRoute>
  );
}
