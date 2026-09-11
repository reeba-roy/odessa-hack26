"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useLanguage } from "@/components/common/LanguageContext";

const roleOptions = [
  { value: "farmer", label: "Farmer" },
  { value: "buyer", label: "Buyer" },
];

function friendlyError(message, t) {
  const normalized = String(message || "");
  if (normalized.includes("already in use") || normalized.includes("EMAIL_EXISTS")) {
    return t.accountExists;
  }
  if (normalized.includes("password") || normalized.includes("weak")) {
    return t.useStrongerPassword;
  }
  if (normalized.includes("invalid-email") || normalized.includes("email")) {
    return t.enterValidEmail;
  }
  if (normalized.includes("wrong-password") || normalized.includes("user-not-found") || normalized.includes("invalid") || normalized.includes("credential")) {
    return t.incorrectCredentials;
  }
  if (normalized.includes("network")) {
    return t.networkError;
  }
  return t.authFailed;
}

export default function AuthForm({ mode = "login" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
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
        throw new Error(t.firebaseNotConfigured);
      }

      const trimmedEmail = form.email.trim().toLowerCase();
      const trimmedName = form.fullName.trim();

      if (!trimmedEmail || !form.password.trim()) {
        throw new Error(t.emailPasswordRequired);
      }

      if (mode === "signup") {
        if (!trimmedName) {
          throw new Error(t.enterFullName);
        }
        if (!form.confirmPassword || form.confirmPassword !== form.password) {
          throw new Error(t.passwordsDoNotMatch);
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
      setError(friendlyError(submitError?.message || submitError?.toString(), t));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="agri-auth-card">
      <div className="agri-auth-head">
        <span className="agri-section-label">{mode === "signup" ? t.createAccount : t.welcomeBack}</span>
        <h1>{mode === "signup" ? t.signUpToAgriNode : t.loginToAgriNode}</h1>
      </div>

      <form onSubmit={handleSubmit} className="agri-auth-form">
        {mode === "signup" ? (
          <div className="agri-auth-field">
            <label htmlFor="fullName">{t.fullName}</label>
            <input id="fullName" name="fullName" value={form.fullName} onChange={handleChange} placeholder={t.fullName} />
          </div>
        ) : null}

        <div className="agri-auth-field">
          <label htmlFor="role">{t.iAmA}</label>
          <select id="role" name="role" value={form.role} onChange={handleChange}>
            {roleOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.value === "farmer" ? t.farmer : t.buyer}</option>
            ))}
          </select>
        </div>

        <div className="agri-auth-field">
          <label htmlFor="email">{t.email}</label>
          <input id="email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="name@example.com" />
        </div>

        <div className="agri-auth-field">
          <label htmlFor="password">{t.password}</label>
          <input id="password" name="password" type="password" value={form.password} onChange={handleChange} placeholder="At least 6 characters" />
        </div>

        {mode === "signup" ? (
          <div className="agri-auth-field">
            <label htmlFor="confirmPassword">{t.confirmPassword}</label>
            <input id="confirmPassword" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} placeholder={t.confirmPassword} />
          </div>
        ) : null}

        {error ? <div className="agri-auth-error">{error}</div> : null}

        <button type="submit" disabled={isSubmitting} className="agri-auth-submit">
          {isSubmitting ? t.pleaseWait : mode === "signup" ? t.createAccountButton : t.loginButton}
        </button>
      </form>

      <p className="agri-auth-footer">
        {mode === "signup" ? t.alreadyHaveAccount : t.needAnAccount}{" "}
        <Link href={mode === "signup" ? "/login" : "/signup"}>{mode === "signup" ? t.logIn : t.signUp}</Link>
      </p>
    </div>
  );
}
