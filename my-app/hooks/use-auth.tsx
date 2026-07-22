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
  department?: string;
  level?: string;
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

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = async () => {
    setIsLoggingOut(true);
    try {
      await new Promise((res) => setTimeout(res, 700));
      await signOut(auth);
      window.location.href = "/auth?mode=login";
    } catch (err) {
      console.error("Sign out error:", err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, logout }}>
      {children}
      {isLoggingOut && (
        <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#0f1d2e] text-white animate-in fade-in duration-200">
          <div className="flex flex-col items-center space-y-5 p-8 rounded-3xl bg-[#162535] border border-white/10 shadow-2xl text-center max-w-xs w-full mx-4">
            <div className="w-16 h-16 flex items-center justify-center animate-bounce">
              <img src="/image/Campus-Hub2.png" alt="CampusHub Logo" className="w-full h-full object-contain" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-extrabold tracking-tight text-white">
                Campus<span className="text-[#C9952A]">Hub</span>
              </h3>
              <div className="flex items-center justify-center gap-2 text-xs font-semibold text-gray-300">
                <div className="w-4 h-4 border-2 border-[#C9952A] border-t-transparent rounded-full animate-spin" />
                <span>Logging out...</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}


export function useAuth() {
  return useContext(AuthContext);
}
