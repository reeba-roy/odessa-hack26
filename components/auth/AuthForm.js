"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";

const roleOptions = [
  { value: "farmer", label: "Farmer" },
  { value: "buyer", label: "Buyer" },
];

function friendlyError(message) {
  const normalized = String(message || "");
  if (normalized.includes("already in use") || normalized.includes("EMAIL_EXISTS")) {
    return "An account already exists for this email.";
  }
  if (normalized.includes("password") || normalized.includes("weak")) {
    return "Use a stronger password with at least 6 characters.";
  }
  if (normalized.includes("invalid-email") || normalized.includes("email")) {
    return "Enter a valid email address.";
  }
  if (normalized.includes("wrong-password") || normalized.includes("user-not-found") || normalized.includes("invalid") || normalized.includes("credential")) {
    return "Incorrect email or password.";
  }
  if (normalized.includes("network")) {
    return "Network error. Please try again.";
  }
  return "Authentication failed. Please try again.";
}

export default function AuthForm({ mode = "login" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = useMemo(() => searchParams.get("role") || "farmer", [searchParams]);
  const { login, register, isFirebaseConfigured, userProfile } = useAuth();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
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
        throw new Error("Firebase is not configured. Add your project credentials in .env.local.");
      }

      const trimmedEmail = form.email.trim().toLowerCase();
      const trimmedName = form.fullName.trim();

      if (!trimmedEmail || !form.password.trim()) {
        throw new Error("Email and password are required.");
      }

      if (mode === "signup") {
        if (!trimmedName) {
          throw new Error("Please enter your full name.");
        }
        if (!form.confirmPassword || form.confirmPassword !== form.password) {
          throw new Error("Passwords do not match.");
        }

        await register({
          name: trimmedName,
          email: trimmedEmail,
          password: form.password,
          role: form.role,
        });

        router.push(`/${form.role}`);
        return;
      }

      const result = await login(trimmedEmail, form.password);
      const role = result?.profile?.role || userProfile?.role || form.role;
      router.push(role === "buyer" ? "/buyer" : "/farmer");
    } catch (submitError) {
      setError(friendlyError(submitError?.message || submitError?.toString()));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="agri-auth-card">
      <div className="agri-auth-head">
        <span className="agri-section-label">{mode === "signup" ? "Create account" : "Welcome back"}</span>
        <h1>{mode === "signup" ? "Sign up to AgriNode" : "Login to AgriNode"}</h1>
      </div>

      <form onSubmit={handleSubmit} className="agri-auth-form">
        {mode === "signup" ? (
          <div className="agri-auth-field">
            <label htmlFor="fullName">Full name</label>
            <input id="fullName" name="fullName" value={form.fullName} onChange={handleChange} placeholder="Your name" />
          </div>
        ) : null}

        <div className="agri-auth-field">
          <label htmlFor="role">I am a</label>
          <select id="role" name="role" value={form.role} onChange={handleChange}>
            {roleOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        <div className="agri-auth-field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="name@example.com" />
        </div>

        <div className="agri-auth-field">
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" value={form.password} onChange={handleChange} placeholder="At least 6 characters" />
        </div>

        {mode === "signup" ? (
          <div className="agri-auth-field">
            <label htmlFor="confirmPassword">Confirm password</label>
            <input id="confirmPassword" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} placeholder="Confirm password" />
          </div>
        ) : null}

        {error ? <div className="agri-auth-error">{error}</div> : null}

        <button type="submit" disabled={isSubmitting} className="agri-auth-submit">
          {isSubmitting ? "Please wait..." : mode === "signup" ? "Create account" : "Login"}
        </button>
      </form>

      <p className="agri-auth-footer">
        {mode === "signup" ? "Already have an account?" : "Need an account?"}{" "}
        <Link href={mode === "signup" ? "/login" : "/signup"}>{mode === "signup" ? "Log in" : "Sign up"}</Link>
      </p>
    </div>
  );
}
