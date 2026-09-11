"use client";

import { useEffect, useState } from "react";
import { deleteListing } from "@/lib/firestore";

const STATUS_STYLES = {
  Listed: "bg-slate-100 text-slate-700 ring-slate-200",
  Clustered: "bg-blue-100 text-blue-700 ring-blue-200",
  EscrowLocked: "bg-amber-100 text-amber-700 ring-amber-200",
  Paid: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  locked: "bg-amber-100 text-amber-700 ring-amber-200",
  available: "bg-emerald-100 text-emerald-700 ring-emerald-200",
};

function getReadableLocation(lat, lng) {
  if (!Number.isFinite(Number(lat)) || !Number.isFinite(Number(lng))) {
    return "Location unavailable";
  }

  return `${Number(lat).toFixed(4)}, ${Number(lng).toFixed(4)}`;
}

export default function ListingCard({ listing }) {
  const [locality, setLocality] = useState("Loading locality...");
  const rawStatus = String(listing.status || "listed").toLowerCase();
  const uiStatus = rawStatus === "locked" ? "EscrowLocked" : rawStatus === "available" ? "Listed" : rawStatus;

  useEffect(() => {
    let isMounted = true;

    async function fetchLocality() {
      const latitude = Number(listing.lat);
      const longitude = Number(listing.lng);

      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        if (isMounted) {
          setLocality("Location unavailable");
        }
        return;
      }

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
          {
            headers: {
              "Accept-Language": "en",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Reverse geocode request failed");
        }

        const data = await response.json();
        const candidate = [
          data?.address?.village,
          data?.address?.town,
          data?.address?.city,
          data?.address?.state,
          data?.address?.country,
        ].filter(Boolean);

        const display = candidate.length ? candidate.slice(0, 3).join(", ") : data?.display_name?.split(",").slice(0, 3).join(", ");

        if (isMounted) {
          setLocality(display || getReadableLocation(latitude, longitude));
        }
      } catch (error) {
        console.warn("Location lookup failed:", error);
        if (isMounted) {
          setLocality(getReadableLocation(latitude, longitude));
        }
      }
    }

    fetchLocality();

    return () => {
      isMounted = false;
    };
  }, [listing.lat, listing.lng]);

  const handleRemove = async () => {
    if (!listing.id) {
      return;
    }

    const shouldDelete = window.confirm("Remove this listing from the market?");
    if (!shouldDelete) {
      return;
    }

    try {
      await deleteListing(listing.id);
    } catch (error) {
      console.error("Failed to remove listing", error);
      window.alert("Unable to remove this listing right now.");
    }
  };

  return (
    <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
            {listing.wasteCategory || listing.cropType || "Waste"}
          </p>
          <h3 className="mt-2 text-xl font-bold text-slate-900">{listing.farmerName}</h3>
        </div>
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${STATUS_STYLES[uiStatus] || STATUS_STYLES.Listed}`}
        >
          {rawStatus === "locked" ? "Escrow Locked" : String(listing.status || "Listed")}
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-white p-3">
          <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Quantity</p>
          <p className="mt-1 text-lg font-bold text-slate-900">{listing.quantityTonnes} t</p>
        </div>
        <div className="rounded-xl bg-white p-3">
          <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Moisture</p>
          <p className="mt-1 text-lg font-bold text-slate-900">{listing.moisturePct}%</p>
        </div>
        <div className="rounded-xl bg-white p-3">
          <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Location</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">{locality}</p>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={handleRemove}
          className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
        >
          Remove listing
        </button>
      </div>
    </article>
  );
}
