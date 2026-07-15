"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  phone: string;
  role: "student" | "agent" | "admin";
  emailVerified: boolean;
  phoneVerified: boolean;
  ninUploaded: boolean;
  approved: boolean;
  verified: boolean;
  createdAt: string;
  gender?: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Use a real-time listener for the user profile document so that 
        // changes (like admin vetting approval) sync instantly across layouts.
        const docRef = doc(db, "users", currentUser.uid);
        const unsubscribeDoc = onSnapshot(
          docRef,
          (docSnap) => {
            if (docSnap.exists()) {
              setProfile(docSnap.data() as UserProfile);
            } else {
              setProfile(null);
            }
            setLoading(false);
          },
          (err) => {
            console.error("Firestore user profile sync error:", err);
            setLoading(false);
          }
        );

        return () => unsubscribeDoc();
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      // ── Clear all role session keys ──
      localStorage.removeItem("agent_logged_in");
      localStorage.removeItem("agent_data");
      localStorage.removeItem("student_logged_in");
      localStorage.removeItem("student_data");
      localStorage.removeItem("user_role");
      localStorage.removeItem("admin_logged_in");
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
