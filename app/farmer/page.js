"use client";

import { useEffect, useState } from "react";
import ListingCard from "@/components/farmer/ListingCard";
import ListingForm from "@/components/farmer/ListingForm";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/components/auth/AuthProvider";
import { useLanguage } from "@/components/common/LanguageContext";
import { subscribeListingsByFarmer } from "@/lib/firestore";

const fallbackListings = [];

export default function FarmerPage() {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
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
          <span className="agri-section-label">{t.farmerView}</span>
          <h1>{t.agriNodeDashboard}</h1>
          <p className="agri-market-subhead">{t.marketPitch}</p>
        </section>

        <section className="agri-dashboard-layout">
          <ListingForm />

          <section className="agri-listing-panel">
            <div className="agri-listing-panel-top">
              <div>
                <span className="agri-section-label">{t.listings}</span>
                <h2>{t.yourActiveWasteOffers}</h2>
              </div>
              <span className="agri-listings-total">
                {listings.length} {t.total}
              </span>
            </div>

            {!isReady ? (
              <div className="agri-empty-state">{t.loadingListings}</div>
            ) : listings.length === 0 ? (
              <div className="agri-empty-state">{t.noListings}</div>
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
