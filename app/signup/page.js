import { Suspense } from "react";
import AuthForm from "@/components/auth/AuthForm";

export default function SignupPage() {
  return (
    <main className="agri-auth-page">
      <Suspense fallback={<div className="agri-auth-loading">Loading…</div>}>
        <AuthForm mode="signup" />
      </Suspense>
    </main>
  );
}
