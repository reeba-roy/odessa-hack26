import { Suspense } from "react";
import AuthForm from "@/components/auth/AuthForm";

export default function SignupPage() {
  return (
    <main className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-slate-100 px-4 py-10">
      <Suspense fallback={<div className="text-slate-500">Loading…</div>}>
        <AuthForm mode="signup" />
      </Suspense>
    </main>
  );
}
