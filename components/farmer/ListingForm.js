"use client";

import dynamic from "next/dynamic";
import L from "leaflet";
import { useState } from "react";
import "leaflet/dist/leaflet.css";
import { useAuth } from "@/components/auth/AuthProvider";
import { useLanguage } from "@/components/common/LanguageContext";
import { addListing } from "@/lib/firestore";
import { resolveWasteCategory } from "@/lib/wasteCategory";

const redPushpinIcon = L.icon({
  iconUrl:
    "data:image/svg+xml;charset=UTF-8," +
    encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 80" width="64" height="80">
        <defs>
          <linearGradient id="pinGlow" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stop-color="#ff4d4d"/>
            <stop offset="100%" stop-color="#d81f2f"/>
          </linearGradient>
        </defs>
        <path d="M32 4C17.6 4 6 15.7 6 30.1c0 18.9 26 42.5 26 42.5s26-23.6 26-42.5C58 15.7 46.4 4 32 4Z" fill="url(#pinGlow)"/>
        <path d="M32 10c-11.3 0-20.5 9.1-20.5 20.4C11.5 37.5 32 56.6 32 56.6S52.5 37.5 52.5 30.4C52.5 19.1 43.3 10 32 10Z" fill="rgba(255,255,255,0.12)"/>
        <circle cx="32" cy="30" r="12" fill="#ffcfcc" opacity="0.9"/>
        <circle cx="32" cy="30" r="8" fill="#f4f7ff" opacity="0.35"/>
        <circle cx="32" cy="30" r="5.5" fill="#fff" opacity="0.9"/>
      </svg>
    `),
  iconSize: [38, 52],
  iconAnchor: [19, 49],
  popupAnchor: [0, -42],
  shadowUrl: "",
});

const IndiaMapPicker = dynamic(
  async () => {
    const { MapContainer, Marker, TileLayer, useMapEvents } = await import("react-leaflet");

function MapLocationPicker({ onPick, defaultCenter, currentLocation }) {
      const [location, setLocation] = useState(currentLocation || defaultCenter);

      function MapClickHandler() {
        useMapEvents({
          click(event) {
            const nextLocation = [event.latlng.lat, event.latlng.lng];
            setLocation(nextLocation);
            onPick({ lat: nextLocation[0], lng: nextLocation[1] });
          },
        });

        return null;
      }

      return (
        <div className="mt-3 overflow-hidden rounded-2xl border border-slate-700">
          <MapContainer center={location} zoom={5} scrollWheelZoom className="h-64 w-full">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapClickHandler />
            <Marker position={location} icon={redPushpinIcon} />
          </MapContainer>
        </div>
      );
    }

    return MapLocationPicker;
  },
  { ssr: false }
);

const wasteOptions = [
  "Paddy Stubble",
  "Coconut Husk",
  "Sugarcane Bagasse",
  "Banana Stem",
  "Other",
];

const defaultLatLng = {
  lat: 9.5916,
  lng: 76.5222,
};

const initialForm = {
  farmerName: "",
  wasteCategory: wasteOptions[0],
  customWasteCategory: "",
  quantityTonnes: "",
  moisturePct: "",
  lat: String(defaultLatLng.lat),
  lng: String(defaultLatLng.lng),
};

export default function ListingForm() {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [showMapPicker, setShowMapPicker] = useState(false);

  const validateForm = () => {
    const wasteCategory = resolveWasteCategory({
      wasteCategory: form.wasteCategory,
      customWasteCategory: form.customWasteCategory,
    });

    if (!form.farmerName.trim()) {
      return "Farmer name is required.";
    }

    if (!wasteCategory || wasteCategory === "Other") {
      return "Please select or add a valid waste category.";
    }

    if (!form.quantityTonnes || Number(form.quantityTonnes) <= 0) {
      return "Quantity must be greater than zero.";
    }

    if (Number(form.moisturePct) < 0 || Number(form.moisturePct) > 100) {
      return "Moisture percentage must be between 0 and 100.";
    }

    if (!form.lat || !form.lng) {
      return "Please choose a farm location using the map or your current location.";
    }

    return "";
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setMessage("Geolocation is not supported in this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((current) => ({
          ...current,
          lat: String(position.coords.latitude),
          lng: String(position.coords.longitude),
        }));
        setShowMapPicker(false);
        setMessage("Current location captured successfully.");
      },
      (error) => {
        console.error("Geolocation errored:", error);
        setMessage("Unable to read your current location. Please allow location access in the browser or place a pin on the India map instead.");
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 60000 }
    );
  };

  const handleLocationPick = (coordinates) => {
    setForm((current) => ({
      ...current,
      lat: String(coordinates.lat),
      lng: String(coordinates.lng),
    }));
    setShowMapPicker(true);
    setMessage("Location pinned on the India map. You can click again to adjust it.");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    const validationMessage = validateForm();
    if (validationMessage) {
      setMessage(validationMessage);
      setIsSubmitting(false);
      return;
    }

    const wasteCategory = resolveWasteCategory({
      wasteCategory: form.wasteCategory,
      customWasteCategory: form.customWasteCategory,
    });

    try {
      if (!currentUser?.uid) {
        setMessage("Please sign in before creating a listing.");
        return;
      }

      await addListing({
        farmerName: form.farmerName.trim(),
        farmerId: currentUser.uid,
        wasteCategory,
        quantityTonnes: Number(form.quantityTonnes),
        moisturePct: Number(form.moisturePct),
        lat: Number(form.lat || defaultLatLng.lat),
        lng: Number(form.lng || defaultLatLng.lng),
        photoUrl:
          "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=800&q=80",
      });

      setForm(initialForm);
      setMessage("Your waste listing is live. It is now visible to buyers in your cluster.");
    } catch (error) {
      console.error(error);
      setMessage("There was an issue saving the listing. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <aside className="rounded-3xl border border-emerald-900/60 bg-[#0f2f28] p-5 text-white shadow-sm sm:p-6">
      <div className="mb-5">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">{t.addListing}</p>
        <h2 className="mt-2 text-2xl font-bold" style={{ color: "#31543E" }}>{t.createNewOffer}</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="farmerName" className="mb-1 block text-sm font-medium" style={{ color: "#31543E" }}>
            {t.farmerName}
          </label>
          <input
            id="farmerName"
            name="farmerName"
            value={form.farmerName}
            onChange={handleChange}
            placeholder={t.farmerNamePlaceholder}
            className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-white placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="wasteCategory" className="mb-1 block text-sm font-medium" style={{ color: "#31543E" }}>
            {t.wasteCategory}
          </label>
          <select
            id="wasteCategory"
            name="wasteCategory"
            value={form.wasteCategory}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-white focus:border-emerald-400 focus:outline-none"
          >
            {wasteOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {form.wasteCategory === "Other" ? (
          <div>
            <label htmlFor="customWasteCategory" className="mb-1 block text-sm font-medium" style={{ color: "#31543E" }}>
              {t.customWasteCategory}
            </label>
            <input
              id="customWasteCategory"
              name="customWasteCategory"
              value={form.customWasteCategory}
              onChange={handleChange}
              placeholder={t.customWasteCategoryPlaceholder}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-white placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none"
            />
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="quantityTonnes" className="mb-1 block text-sm font-medium" style={{ color: "#31543E" }}>
              {t.quantityTonnes}
            </label>
            <input
              id="quantityTonnes"
              name="quantityTonnes"
              type="number"
              min="0.5"
              step="0.5"
              value={form.quantityTonnes}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-white focus:border-emerald-400 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="moisturePct" className="mb-1 block text-sm font-medium" style={{ color: "#31543E" }}>
              {t.moisturePercent}
            </label>
            <input
              id="moisturePct"
              name="moisturePct"
              type="number"
              min="0"
              max="100"
              value={form.moisturePct}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-white focus:border-emerald-400 focus:outline-none"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-700/70 bg-[#173d33] p-3">
          <div className="mb-2">
            <p className="text-sm font-medium text-slate-200">{t.farmLocation}</p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              className="rounded-xl border border-emerald-400 bg-emerald-500/10 px-3 py-2.5 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/20"
            >
              {t.useMyLocation}
            </button>

            <button
              type="button"
              onClick={() => setShowMapPicker((current) => !current)}
              className="rounded-xl border border-emerald-600 bg-[#0d2a24] px-3 py-2.5 text-sm font-semibold text-slate-100 transition hover:border-emerald-500"
            >
              {showMapPicker ? t.hideIndiaMap : t.placePinOnIndiaMap}
            </button>
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <div>
              <label htmlFor="lat" className="mb-1 block text-xs uppercase tracking-[0.12em] text-slate-400">
                {t.latitude}
              </label>
              <input
                id="lat"
                name="lat"
                type="number"
                step="0.0001"
                value={form.lat}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-emerald-400 focus:outline-none"
                readOnly
              />
            </div>

            <div>
              <label htmlFor="lng" className="mb-1 block text-xs uppercase tracking-[0.12em] text-slate-400">
                {t.longitude}
              </label>
              <input
                id="lng"
                name="lng"
                type="number"
                step="0.0001"
                value={form.lng}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-emerald-400 focus:outline-none"
                readOnly
              />
            </div>
          </div>

          {showMapPicker ? (
            <IndiaMapPicker
              onPick={handleLocationPick}
              defaultCenter={[defaultLatLng.lat, defaultLatLng.lng]}
              currentLocation={[Number(form.lat || defaultLatLng.lat), Number(form.lng || defaultLatLng.lng)]}
            />
          ) : null}
        </div>

        <div className="rounded-2xl border border-emerald-700/70 bg-[#173d33] p-3 text-sm text-slate-200">
          <p className="font-semibold text-emerald-300">{t.whatHappensNext}</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-slate-300">
            <li>{t.nextStep1}</li>
            <li>{t.nextStep2}</li>
            <li>{t.nextStep3}</li>
          </ol>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-emerald-500 px-4 py-3 text-base font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? t.saving : t.addListingButton}
        </button>

        {message ? (
          <p className={`rounded-xl border px-3 py-2 text-sm ${message.includes("live") ? "border-emerald-200 bg-emerald-500/10 text-emerald-100" : "border-emerald-700/70 bg-[#173d33] text-slate-200"}`}>
            {message}
          </p>
        ) : null}
      </form>
    </aside>
  );
}

