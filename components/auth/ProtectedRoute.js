"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { useLanguage } from "@/components/common/LanguageContext";

export default function ProtectedRoute({ children, role, requireAuth = true }) {
  const { currentUser, userProfile, loading } = useAuth();
  const { t } = useLanguage();

  if (loading) {
    return (
      <main className="agri-node-home">
        <section className="agri-home-card">
          <div className="agri-home-content">
            <div className="agri-kicker">{t.agriNode}</div>
            <h1 className="agri-home-title">{t.loadingWorkspace}</h1>
            <p className="agri-home-copy">{t.loadingWorkspaceCopy}</p>
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
            <div className="agri-kicker">{t.agriNode}</div>
            <h1 className="agri-home-title">{t.pleaseSignIn}</h1>
            <p className="agri-home-copy">{t.pleaseSignInCopy}</p>
            <div className="agri-home-cta">
              <Link className="agri-primary-button" href="/login">
                {t.goToLogin}
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
            <div className="agri-kicker">{t.agriNode}</div>
            <h1 className="agri-home-title">{t.accessRedirected}</h1>
            <p className="agri-home-copy">
              {t.pageReservedFor} {role} {t.workspace}
            </p>
            <div className="agri-home-cta">
              <Link className="agri-primary-button" href={redirectRoute}>
                {t.returnTo} {userProfile.role}
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return children;
}
