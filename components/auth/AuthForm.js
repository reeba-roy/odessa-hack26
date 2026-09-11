"use client";

import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { auth, db, isFirebaseConfigured } from "@/lib/firebase";

const roleOptions = [
  { value: "farmer", label: "Farmer" },
  { value: "buyer", label: "Buyer" },
];

export default function AuthForm({ mode = "login" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = useMemo(() => searchParams.get("role") || "farmer", [searchParams]);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    role: defaultRole,
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (!isFirebaseConfigured) {
        throw new Error("Firebase is not configured yet. Add your project credentials in .env.local to enable signup and login.");
      }

      const trimmedEmail = form.email.trim();
      const trimmedName = form.fullName.trim();

      if (!trimmedEmail || !form.password.trim()) {
        throw new Error("Email and password are required.");
      }

      if (mode === "signup" && !trimmedName) {
        throw new Error("Please enter your full name.");
      }

      if (mode === "signup") {
        const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, form.password);
        await setDoc(doc(db, "users", userCredential.user.uid), {
          fullName: trimmedName,
          email: trimmedEmail,
          role: form.role,
          createdAt: Date.now(),
        });
        localStorage.setItem("agri-role", form.role);
        router.push(`/${form.role}`);
        return;
      }

      const userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, form.password);
      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
      const savedRole = userDoc?.data()?.role || localStorage.getItem("agri-role") || form.role;
      localStorage.setItem("agri-role", savedRole);
      router.push(`/${savedRole}`);
    } catch (submitError) {
      setError(submitError.message || "Authentication failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] sm:p-8">
      <div className="mb-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-600">
          {mode === "signup" ? "Create account" : "Welcome back"}
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          {mode === "signup" ? "Sign up to AgriNode" : "Login to AgriNode"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "signup" ? (
          <div>
            <label htmlFor="fullName" className="mb-1 block text-sm font-medium text-slate-700">
              Full name
            </label>
            <input
              id="fullName"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="Your name"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 focus:border-emerald-500 focus:outline-none"
            />
          </div>
        ) : null}

        <div>
          <label htmlFor="role" className="mb-1 block text-sm font-medium text-slate-700">
            I am a
          </label>
          <select
            id="role"
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 focus:border-emerald-500 focus:outline-none"
          >
            {roleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="name@example.com"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="At least 6 characters"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-base font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Please wait..." : mode === "signup" ? "Create account" : "Login"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-slate-600">
        {mode === "signup" ? "Already have an account?" : "Need an account?"}{" "}
        <Link href={mode === "signup" ? "/login" : "/signup"} className="font-semibold text-emerald-700 hover:text-emerald-800">
          {mode === "signup" ? "Log in" : "Sign up"}
        </Link>
      </p>
    </div>
  );
}
