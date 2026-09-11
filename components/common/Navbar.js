"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";

export default function Navbar() {
  const router = useRouter();
  const { currentUser, logout, userProfile } = useAuth();

  const roleText = userProfile?.role === "buyer" ? "Buyer" : userProfile?.role === "farmer" ? "Farmer" : "Guest";

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
            <span className="agri-brand-title">AgriNode</span>
            <span className="agri-brand-subtitle">Agri Waste Marketplace</span>
          </span>
        </Link>

        <nav className="agri-navbar-links">
          <Link href="/farmer" className="agri-navbar-link active">Dashboard</Link>
          <Link href="/farmer" className="agri-navbar-link">My Listings</Link>
          <Link href="/buyer" className="agri-navbar-link">Messages</Link>
          <Link href="/buyer" className="agri-navbar-link">Impact</Link>
        </nav>

        <div className="agri-user-toggle">
          <Link href="/farmer" className="agri-toggle-link active">Farmer</Link>
          <Link href="/buyer" className="agri-toggle-link">Buyer</Link>
          <span className="agri-role-label">{roleText}</span>
          {currentUser ? (
            <button type="button" className="agri-logout-button" onClick={handleLogout}>Logout</button>
          ) : (
            <Link href="/login" className="agri-login-link">Login</Link>
          )}
        </div>
      </div>
    </header>
  );
}
