"use client";

import Link from "next/link";
import { useLanguage } from "@/components/common/LanguageContext";

export default function Home() {
  const { language, setLanguage, t, languages } = useLanguage();

  return (
    <main className="agri-node-home">
      <section className="agri-home-card">
        <div className="agri-home-content">
          <div className="agri-kicker">{t.agriNode}</div>

          <div className="mb-6 flex flex-col gap-2">
            <label className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
              {t.languageLabel}
            </label>
            <div className="flex flex-wrap gap-3">
              {languages.map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setLanguage(option.value)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                    language === option.value
                      ? "border-emerald-500 bg-emerald-500 text-white shadow-sm"
                      : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:text-emerald-700"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <p className="text-sm text-slate-500">{t.languageHelper}</p>
          </div>

          <h1 className="agri-home-title">{t.welcome}</h1>
          <h2 className="agri-home-subtitle">{t.tagline}</h2>
          <p className="agri-home-copy">{t.description}</p>

          <div className="agri-home-cta">
            <Link href="/farmer" className="agri-primary-button">
              {t.continueAsFarmer}
            </Link>
            <Link href="/buyer" className="agri-secondary-button">
              {t.continueAsBuyer}
            </Link>
          </div>
        </div>

        <div className="agri-home-image">
          <div className="agri-image-card">
            <span className="agri-image-card-tag">Regenerative marketplace</span>
            <span className="agri-image-card-text">Field networks · Circular sourcing</span>
          </div>
        </div>
      </section>
    </main>
  );
}
