"use client";

import { useEffect, useState } from "react";
import ListingCard from "@/components/farmer/ListingCard";
import ListingForm from "@/components/farmer/ListingForm";
import { subscribeListings } from "@/lib/firestore";

const fallbackListings = [];

export default function FarmerPage() {
  const [listings, setListings] = useState(fallbackListings);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeListings((items) => {
      setListings(items);
      setIsReady(true);
    });

    return () => unsubscribe();
  }, []);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 rounded-3xl border border-emerald-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
          Farmer view
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          AgriNode dashboard
        </h1>
      </header>

      <div className="grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
        <ListingForm />

        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                Listings
              </p>
              <h2 className="mt-1 text-2xl font-bold text-slate-900">Your active waste offers</h2>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700">
              {listings.length} total
            </span>
          </div>

          {!isReady ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
              Loading listings from Firestore...
            </div>
          ) : listings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
              No listings yet. Add your first agri-waste offer to begin the demo.
            </div>
          ) : (
            <div className="space-y-4">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
