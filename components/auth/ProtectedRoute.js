"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";

export default function ProtectedRoute({ children, role, requireAuth = true }) {
  const { currentUser, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <main className="agri-node-home">
        <section className="agri-home-card">
          <div className="agri-home-content">
            <div className="agri-kicker">AgriNode</div>
            <h1 className="agri-home-title">Loading your workspace</h1>
            <p className="agri-home-copy">Checking your secure marketplace access…</p>
          </div>
        </section>
      </main>
    );
  }

  if (requireAuth && !currentUser) {
    return (
      <main className="agri-node-home">
        <section className="agri-home-card">
          <div className="agri-home-content">
            <div className="agri-kicker">AgriNode</div>
            <h1 className="agri-home-title">Please sign in</h1>
            <p className="agri-home-copy">You need an active account to access this marketplace.</p>
            <div className="agri-home-cta">
              <Link className="agri-primary-button" href="/login">
                Go to login
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (role && userProfile && userProfile.role !== role) {
    const redirectRoute = userProfile.role === "farmer" ? "/farmer" : "/buyer";
    return (
      <main className="agri-node-home">
        <section className="agri-home-card">
          <div className="agri-home-content">
            <div className="agri-kicker">AgriNode</div>
            <h1 className="agri-home-title">Access redirected</h1>
            <p className="agri-home-copy">This page is reserved for the {role} workspace.</p>
            <div className="agri-home-cta">
              <Link className="agri-primary-button" href={redirectRoute}>
                Return to {userProfile.role}
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return children;
}
