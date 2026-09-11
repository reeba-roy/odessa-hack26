"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db, isFirebaseConfigured } from "@/lib/firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async (uid) => {
    if (!uid) {
      setUserProfile(null);
      return null;
    }

    try {
      const profileRef = doc(db, "users", uid);
      const snapshot = await getDoc(profileRef);
      if (snapshot.exists()) {
        const profile = { uid: snapshot.id, ...snapshot.data() };
        setUserProfile(profile);
        return profile;
      }

      setUserProfile(null);
      return null;
    } catch (error) {
      console.warn("Unable to load user profile.", error);
      setUserProfile(null);
      return null;
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user ?? null);
      if (user) {
        await refreshProfile(user.uid);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [refreshProfile]);

  const login = useCallback(async (email, password) => {
    if (!isFirebaseConfigured) {
      throw new Error("Firebase is not configured. Add credentials in .env.local.");
    }

    const credential = await signInWithEmailAndPassword(auth, email, password);
    const profile = await refreshProfile(credential.user.uid);
    return { user: credential.user, profile };
  }, [refreshProfile]);

  const register = useCallback(async ({ name, email, password, role }) => {
    if (!isFirebaseConfigured) {
      throw new Error("Firebase is not configured. Add credentials in .env.local.");
    }

    const emailLower = String(email || "").trim().toLowerCase();
    const roleValue = role === "buyer" ? "buyer" : "farmer";

    const credential = await createUserWithEmailAndPassword(auth, emailLower, password);
    const userRef = doc(db, "users", credential.user.uid);

    const profile = {
      uid: credential.user.uid,
      name: String(name || "").trim(),
      fullName: String(name || "").trim(),
      email: emailLower,
      role: roleValue,
      createdAt: serverTimestamp(),
    };

    await setDoc(userRef, profile);
    await refreshProfile(credential.user.uid);
    return credential.user;
  }, [refreshProfile]);

  const logout = useCallback(async () => {
    await signOut(auth);
    setCurrentUser(null);
    setUserProfile(null);
  }, []);

  const value = useMemo(() => ({
    currentUser,
    userProfile,
    loading,
    isFirebaseConfigured,
    login,
    register,
    logout,
    refreshProfile,
  }), [currentUser, userProfile, loading, login, register, logout, refreshProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }
  return context;
}
