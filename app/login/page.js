import { Suspense } from "react";
import AuthForm from "@/components/auth/AuthForm";

export default function LoginPage() {
  return (
    <main className="agri-auth-page">
      <Suspense fallback={<div className="agri-auth-loading">Loading…</div>}>
        <AuthForm mode="login" />
      </Suspense>
    </main>
  );
}
