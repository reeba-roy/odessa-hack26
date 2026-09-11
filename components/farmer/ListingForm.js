"use client";

import { useState } from "react";
import { addListing } from "@/lib/firestore";

const cropOptions = [
  "Paddy Stubble",
  "Coconut Husk",
  "Sugarcane Bagasse",
  "Banana Stem",
];

const initialForm = {
  farmerName: "",
  cropType: cropOptions[0],
  quantityTonnes: "",
  moisturePct: "",
  lat: "",
  lng: "",
};

export default function ListingForm() {
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleUseLocation = () => {
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
        setMessage("Location captured successfully.");
      },
      () => {
        setMessage("Unable to read your location. Please type coordinates manually.");
      }
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    try {
      await addListing({
        farmerName: form.farmerName || "Demo Farmer",
        cropType: form.cropType,
        quantityTonnes: Number(form.quantityTonnes),
        moisturePct: Number(form.moisturePct),
        lat: Number(form.lat || 9.5916),
        lng: Number(form.lng || 76.5222),
        photoUrl:
          "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=800&q=80",
      });

      setForm(initialForm);
      setMessage("Listing added to Firestore successfully.");
    } catch (error) {
      console.error(error);
      setMessage("There was an issue saving the listing.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <aside className="rounded-3xl border border-slate-200 bg-slate-900 p-5 text-white shadow-sm sm:p-6">
      <div className="mb-5">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">Add listing</p>
        <h2 className="mt-2 text-2xl font-bold">Create a new crop residue offer</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="farmerName" className="mb-1 block text-sm font-medium text-slate-200">
            Farmer name
          </label>
          <input
            id="farmerName"
            name="farmerName"
            value={form.farmerName}
            onChange={handleChange}
            placeholder="Farmer or co-op name"
            className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-white placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="cropType" className="mb-1 block text-sm font-medium text-slate-200">
            Crop type
          </label>
          <select
            id="cropType"
            name="cropType"
            value={form.cropType}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-white focus:border-emerald-400 focus:outline-none"
          >
            {cropOptions.map((crop) => (
              <option key={crop} value={crop}>
                {crop}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="quantityTonnes" className="mb-1 block text-sm font-medium text-slate-200">
              Quantity (tonnes)
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
            <label htmlFor="moisturePct" className="mb-1 block text-sm font-medium text-slate-200">
              Moisture %
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

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="lat" className="mb-1 block text-sm font-medium text-slate-200">
              Latitude
            </label>
            <input
              id="lat"
              name="lat"
              type="number"
              step="0.0001"
              value={form.lat}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-white focus:border-emerald-400 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="lng" className="mb-1 block text-sm font-medium text-slate-200">
              Longitude
            </label>
            <input
              id="lng"
              name="lng"
              type="number"
              step="0.0001"
              value={form.lng}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-white focus:border-emerald-400 focus:outline-none"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleUseLocation}
          className="w-full rounded-xl border border-emerald-400 bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/20"
        >
          Use my location
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-emerald-500 px-4 py-3 text-base font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Saving..." : "Add listing"}
        </button>

        {message ? (
          <p className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200">
            {message}
          </p>
        ) : null}
      </form>
    </aside>
  );
}
