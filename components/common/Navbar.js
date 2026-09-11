"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { useLanguage } from "@/components/common/LanguageContext";

export default function Navbar() {
  const router = useRouter();
  const { currentUser, logout, userProfile } = useAuth();
  const { t } = useLanguage();

  const roleText = userProfile?.role === "buyer" ? t.buyer : userProfile?.role === "farmer" ? t.farmer : t.guest;

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.warn("Logout failed", error);
    }
  };

  return (
    <header className="agri-node-navbar">
      <div className="agri-node-navbar-inner">
        <Link href="/" className="agri-brand">
          <span className="agri-brand-mark" aria-hidden="true">
            ✦
          </span>
          <span className="agri-brand-copy">
            <span className="agri-brand-title">{t.agriNode}</span>
            <span className="agri-brand-subtitle">{t.agriWasteMarketplace}</span>
          </span>
        </Link>

        <nav className="agri-navbar-links">
          <Link href="/farmer" className="agri-navbar-link active">{t.dashboard}</Link>
          <Link href="/farmer" className="agri-navbar-link">{t.myListings}</Link>
          <Link href="/buyer" className="agri-navbar-link">{t.messages}</Link>
          <Link href="/buyer" className="agri-navbar-link">{t.impact}</Link>
        </nav>

        <div className="agri-user-toggle">
          <Link href="/farmer" className="agri-toggle-link active">{t.farmer}</Link>
          <Link href="/buyer" className="agri-toggle-link">{t.buyer}</Link>
          <span className="agri-role-label">{roleText}</span>
          {currentUser ? (
            <button type="button" className="agri-logout-button" onClick={handleLogout}>{t.logout}</button>
          ) : (
            <Link href="/login" className="agri-login-link">{t.login}</Link>
          )}
        </div>
      </div>
    </header>
  );
}
