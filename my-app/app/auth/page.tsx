"use client";

import React, { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  EyeOff,
  GraduationCap,
  Briefcase,
  Mail,
  AlertCircle,
  Building,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Users,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { auth, db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";


function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  const initialRole = searchParams.get("role") === "agent" ? "agent" : "student";

  const [activeTab, setActiveTab] = useState<"login" | "signup">(
    mode === "signup" ? "signup" : "login"
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState<"student" | "agent">(initialRole);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  // Google sign-in: when a new user authenticates we store their credential
  // here and show a role selection modal before writing the Firestore profile.
  const [googlePendingUser, setGooglePendingUser] = useState<any>(null);
  const [showGoogleRoleModal, setShowGoogleRoleModal] = useState(false);
  const [googleRole, setGoogleRole] = useState<"student" | "agent">("student");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { user, profile, loading: authLoading } = useAuth();


  // ── Redirect already-logged-in users to their correct dashboard ──
  useEffect(() => {
    if (authLoading) return;
    if (!user || !profile) return;
    if (profile.role === "agent") {
      router.replace("/dashboard/agent");
    } else if (profile.role === "admin") {
      router.replace("/admin");
    } else {
      router.replace("/dashboard/student");
    }
  }, [user, profile, authLoading, router]);

  // Set initial tab and role based on query param
  useEffect(() => {
    if (mode === "signup" || mode === "login") {
      // Use setTimeout to ensure the update happens in the next tick, 
      // resolving the 'setState in effect' lint error.
      const timer = setTimeout(() => {
        setActiveTab(mode as "login" | "signup");
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [mode]);

  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam === "agent" || roleParam === "student") {
      const timer = setTimeout(() => {
        setRole(roleParam as "student" | "agent");
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("");
  const [level, setLevel] = useState("100");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        setError("Please verify your email address before logging in. We sent a verification link to your email (check spam).");
        await signOut(auth);
        setIsLoading(false);
        return;
      }

      // ── Fetch role from Firestore (single source of truth) ──
      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (!userDoc.exists()) {
        setError("Account profile not found. Please sign up first.");
        await signOut(auth);
        setIsLoading(false);
        return;
      }

      const userData = userDoc.data();

      // Sync emailVerified flag to Firestore if not yet done
      if (!userData.emailVerified && user.emailVerified) {
        await updateDoc(doc(db, "users", user.uid), { emailVerified: true });
      }

      // ── Redirect based on Firestore role — no localStorage writes ──
      const userRole = userData.role;
      if (userRole === "agent") {
        router.push("/dashboard/agent");
      } else if (userRole === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard/student");
      }
    } catch (err: any) {
      console.error("Firebase Login Error:", err);
      setError(err.message || "Invalid email or password.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Google Sign-In ──────────────────────────────────────────────────────────
  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const gUser = result.user;

      // Check if this Google user already has a Firestore profile
      let profileSnap = await getDoc(doc(db, "users", gUser.uid));
      if (!profileSnap.exists()) {
        profileSnap = await getDoc(doc(db, "profiles", gUser.uid));
      }

      if (profileSnap.exists()) {
        // Returning user — just redirect based on their stored role
        const userData = profileSnap.data();
        const userRole = userData.role;
        if (userRole === "agent") router.push("/dashboard/agent");
        else if (userRole === "admin") router.push("/admin");
        else router.push("/dashboard/student");
      } else {
        // New Google user — hold their credential and show role picker
        setGooglePendingUser(gUser);
        setGoogleRole("student");
        setShowGoogleRoleModal(true);
      }
    } catch (err: any) {
      console.error("Google Sign-In Error:", err);
      setError(err.message || "Google sign-in failed. Please try again.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Called when user confirms their role in the Google role selection modal
  const handleGoogleRoleConfirm = async () => {
    if (!googlePendingUser) return;
    setIsGoogleLoading(true);
    try {
      const gUser = googlePendingUser;
      const defaultPhoto = gUser.photoURL || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";

      const gProfileData = {
        uid: gUser.uid,
        fullName: gUser.displayName || "",
        email: gUser.email || "",
        phone: "",
        role: googleRole,
        department: "",
        level: "100",
        emailVerified: true, // Google accounts are pre-verified
        phoneVerified: false,
        ninUploaded: false,
        approved: false,
        verified: false,
        photoURL: defaultPhoto,
        photo: defaultPhoto,
        createdAt: new Date().toISOString(),
      };

      // Write profile document to both users and profiles collections
      await setDoc(doc(db, "users", gUser.uid), gProfileData);
      await setDoc(doc(db, "profiles", gUser.uid), gProfileData);

      // If agent, also create agents/{uid} document
      if (googleRole === "agent") {
        await setDoc(doc(db, "agents", gUser.uid), {
          approved: false,
          verified: false,
          phoneVerified: false,
          agentType: "individual",
          nin: "",
        });
      }

      setShowGoogleRoleModal(false);
      setGooglePendingUser(null);

      // Redirect to the correct dashboard
      if (googleRole === "agent") router.push("/dashboard/agent");
      else router.push("/dashboard/student");
    } catch (err: any) {
      console.error("Google profile creation error:", err);
      setError(err.message || "Failed to create your profile. Please try again.");
    } finally {
      setIsGoogleLoading(false);
    }
  };


  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Send email verification
      await sendEmailVerification(user);

      const defaultPhoto = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";
      await updateProfile(user, { photoURL: defaultPhoto });

      const userProfileData = {
        uid: user.uid,
        fullName,
        email,
        phone,
        role,
        department: role === "student" ? department : "",
        level: role === "student" ? level : "",
        emailVerified: false,
        phoneVerified: false,
        ninUploaded: false,
        approved: false,
        verified: false,
        photoURL: defaultPhoto,
        photo: defaultPhoto,
        createdAt: new Date().toISOString(),
      };

      // Create profile document in Firestore (both users and profiles collections)
      await setDoc(doc(db, "users", user.uid), userProfileData);
      await setDoc(doc(db, "profiles", user.uid), userProfileData);

      // If role is agent, also create separate agents/{uid} document
      if (role === "agent") {
        await setDoc(doc(db, "agents", user.uid), {
          approved: false,
          verified: false,
          phoneVerified: false,
          agentType: "individual",
          nin: "",
        });
      }

      setIsSuccess(true);
    } catch (err: any) {
      console.error("Firebase Signup Error:", err);
      setError(err.message || "An error occurred during sign up.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTab = (tab: "login" | "signup") => {
    setActiveTab(tab);
    setError(null);
    setIsSuccess(false);
    // Update URL without refreshing to keep tab in sync if user refreshes
    const params = new URLSearchParams(searchParams.toString());
    params.set("mode", tab);
    router.replace(`/auth?${params.toString()}`);
  };

  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-white font-sans text-[#0f1e2d]">
      {/* ── Google Role Selection Modal ──────────────────────────────────────── */}
      {showGoogleRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm text-center"
          >
            <div className="w-20 h-20 flex items-center justify-center mx-auto mb-3">
              <img src="/image/Campus-Hub2.png" alt="CampusHub Logo" className="w-full h-full object-contain" />
            </div>
            <h2 className="text-2xl font-bold text-[#0f1e2d] mb-2">One last step!</h2>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              Welcome, <span className="font-semibold text-[#0f1e2d]">{googlePendingUser?.displayName?.split(' ')[0]}</span>! How will you be using CampusHub?
            </p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => setGoogleRole("student")}
                className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition ${
                  googleRole === "student"
                    ? "border-[#C9952A] bg-[#C9952A]/10"
                    : "border-gray-200 text-gray-400 hover:border-[#C9952A]/50"
                }`}
              >
                <GraduationCap className={`h-8 w-8 ${googleRole === "student" ? "text-[#C9952A]" : "text-gray-300"}`} />
                <span className="text-sm font-bold text-[#0f1e2d]">I'm a Student</span>
              </button>
              <button
                onClick={() => setGoogleRole("agent")}
                className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition ${
                  googleRole === "agent"
                    ? "border-[#C9952A] bg-[#C9952A]/10"
                    : "border-gray-200 text-gray-400 hover:border-[#C9952A]/50"
                }`}
              >
                <Briefcase className={`h-8 w-8 ${googleRole === "agent" ? "text-[#C9952A]" : "text-gray-300"}`} />
                <span className="text-sm font-bold text-[#0f1e2d]">I'm an Agent</span>
              </button>
            </div>
            <button
              onClick={handleGoogleRoleConfirm}
              disabled={isGoogleLoading}
              className="w-full bg-[#C9952A] text-[#0f1e2d] rounded-full py-4 font-bold text-base hover:bg-[#C9952A]/90 transition shadow-lg shadow-[#C9952A]/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isGoogleLoading ? (
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <>
                  Continue as {googleRole === "student" ? "Student" : "Agent"} <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </motion.div>
        </div>
      )}

      {/* --- Left Brand Panel (Desktop Only) --- */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0c1622] via-[#0f1e2d] to-[#1b2a3a] items-center justify-center p-12 relative overflow-hidden">
        {/* Decorative Glowing Mesh Orbs */}
        <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full bg-[#C9952A]/10 blur-[120px] pointer-events-none" />
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />

        <div className="text-center max-w-lg z-10 w-full flex flex-col items-center">
          <Link href="/" className="flex flex-col items-center mb-10 group hover:opacity-95 transition-all">
            <div className="relative mb-0.5">
              <div className="relative w-32 h-32 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <img src="/image/Campus-Hub2.png" alt="CampusHub Logo" className="w-full h-full object-contain" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-3">
              Campus<span className="text-[#C9952A]">Hub</span>
            </h1>
            <p className="text-gray-300 text-base md:text-lg max-w-sm leading-relaxed">
              Find verified lodges, perfect roommates, and student services around FUTO.
            </p>
          </Link>

          {/* Premium Glass Feature List */}
          <div className="w-full space-y-4 max-w-md">
            {[
              {
                icon: ShieldCheck,
                title: "100% Verified Lodges",
                desc: "Every room is personally inspected to protect you from fake agents and scams.",
                color: "text-[#C9952A]",
                bg: "bg-[#C9952A]/10"
              },
              {
                icon: Users,
                title: "Smart Roommate Matching",
                desc: "Connect with FUTO students sharing similar departments, levels, habits, and preferences.",
                color: "text-blue-400",
                bg: "bg-blue-500/10"
              },
              {
                icon: ShoppingBag,
                title: "P2P Peer Marketplace",
                desc: "Buy and sell books, bed frames, and electronics from fellow FUTO students safely.",
                color: "text-emerald-400",
                bg: "bg-emerald-500/10"
              }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.15, duration: 0.4 }}
                whileHover={{ y: -2, scale: 1.01 }}
                className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-left transition hover:bg-white/10"
              >
                <div className={`p-2.5 rounded-xl ${item.bg} ${item.color} shrink-0`}>
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm sm:text-base leading-snug">{item.title}</h3>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* --- Mobile Top Banner --- */}
      <div className="lg:hidden bg-[#0f1e2d] p-6 text-center border-b border-white/10">
        <Link href="/" className="inline-flex items-center justify-center gap-1 hover:opacity-90 transition-opacity">
          <div className="w-12 h-12 flex items-center justify-center">
            <img src="/image/Campus-Hub2.png" alt="CampusHub Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Campus<span className="text-[#C9952A]">Hub</span>
          </h1>
        </Link>
      </div>

      {/* --- Right Form Panel --- */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-[440px]">
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-[#C9952A] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </Link>
          </div>

          {isSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="w-20 h-20 bg-[#C9952A]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="h-10 w-10 text-[#C9952A]" />
              </div>
              <h2 className="text-3xl font-bold text-[#0f1e2d] mb-4 tracking-tight">Check your email</h2>
              <p className="text-gray-500 mb-8 leading-relaxed">
                We sent a verification link to <span className="font-semibold text-[#0f1e2d]">{email}</span>.
                Please verify your account, then return to log in.
              </p>
              <button
                onClick={() => toggleTab("login")}
                className="w-full bg-[#C9952A] text-[#0f1e2d] rounded-full py-4 font-bold text-lg hover:bg-[#C9952A]/90 transition shadow-lg shadow-[#C9952A]/20 flex items-center justify-center gap-2"
              >
                Go to Login <ArrowRight className="h-5 w-5" />
              </button>
            </motion.div>
          ) : (
            <>
              {/* Tabs */}
              <div className="flex border-b border-gray-100 mb-8">
                <button
                  onClick={() => toggleTab("login")}
                  className={`flex-1 py-4 text-center font-semibold transition-all relative ${activeTab === "login" ? "text-[#0f1e2d]" : "text-gray-400"
                    }`}
                >
                  Login
                  {activeTab === "login" && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#C9952A]"
                    />
                  )}
                </button>
                <button
                  onClick={() => toggleTab("signup")}
                  className={`flex-1 py-4 text-center font-semibold transition-all relative ${activeTab === "signup" ? "text-[#0f1e2d]" : "text-gray-400"
                    }`}
                >
                  Sign Up
                  {activeTab === "signup" && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#C9952A]"
                    />
                  )}
                </button>
              </div>

              {/* Form Content */}
              <AnimatePresence mode="wait">
                {activeTab === "login" ? (
                  <motion.div
                    key="login"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="mb-8">
                      <h2 className="text-3xl font-bold text-[#0f1e2d] mb-2 tracking-tight">Welcome back</h2>
                      <p className="text-gray-500">Enter your details to access your account.</p>
                    </div>

                    {error && (
                      <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm">
                        <AlertCircle className="h-5 w-5 shrink-0" />
                        {error}
                      </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                      <div>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Email address"
                          className="w-full p-4 border border-gray-300 rounded-xl outline-none transition focus:ring-2 focus:ring-[#C9952A] bg-white"
                        />
                      </div>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Password"
                          className="w-full p-4 border border-gray-300 rounded-xl outline-none transition focus:ring-2 focus:ring-[#C9952A] bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0f1e2d]"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>

                      <div className="text-right">
                        <button type="button" className="text-sm font-semibold text-[#C9952A] hover:underline">
                          Forgot password?
                        </button>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-[#C9952A] text-[#0f1e2d] rounded-full py-4 font-bold text-lg hover:bg-[#C9952A]/90 transition shadow-lg shadow-[#C9952A]/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        {isLoading ? (
                          <span className="flex items-center gap-2">
                            <svg className="animate-spin h-5 w-5 text-[#0f1e2d]" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Logging in...
                          </span>
                        ) : (
                          "Login"
                        )}
                      </button>

                      <p className="text-center text-sm text-gray-500 mt-8">
                        Don't have an account?{" "}
                        <button
                          type="button"
                          onClick={() => toggleTab("signup")}
                          className="text-[#C9952A] font-bold hover:underline"
                        >
                          Sign Up
                        </button>
                      </p>

                      {/* ── Google divider ── */}
                      <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center">
                          <span className="bg-white px-3 text-xs text-gray-400 font-medium">or continue with</span>
                        </div>
                      </div>

                      {/* ── Google Sign-In button ── */}
                      <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={isGoogleLoading}
                        className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-full py-3.5 font-semibold text-sm text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {isGoogleLoading ? (
                          <svg className="animate-spin h-5 w-5 text-gray-500" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                          </svg>
                        )}
                        {isGoogleLoading ? "Connecting..." : "Continue with Google"}
                      </button>
                    </form>

                  </motion.div>
                ) : (
                  <motion.div
                    key="signup"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="mb-8">
                      <h2 className="text-3xl font-bold text-[#0f1e2d] mb-2 tracking-tight">Create an account</h2>
                      <p className="text-gray-500">
                        {role === "agent" ? "Join CampusHub and list your apartments" : "Join CampusHub and find your perfect lodge."}
                      </p>
                    </div>

                    {error && (
                      <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm">
                        <AlertCircle className="h-5 w-5 shrink-0" />
                        {error}
                      </div>
                    )}

                    <form onSubmit={handleSignUp} className="space-y-5">
                      <div className="space-y-4">
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Full name"
                          className="w-full p-4 border border-gray-300 rounded-xl outline-none transition focus:ring-2 focus:ring-[#C9952A] bg-white"
                        />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Email address"
                          className="w-full p-4 border border-gray-300 rounded-xl outline-none transition focus:ring-2 focus:ring-[#C9952A] bg-white"
                        />
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Phone number"
                          className="w-full p-4 border border-gray-300 rounded-xl outline-none transition focus:ring-2 focus:ring-[#C9952A] bg-white"
                        />
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            className="w-full p-4 border border-gray-300 rounded-xl outline-none transition focus:ring-2 focus:ring-[#C9952A] bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0f1e2d]"
                          >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                        {password.length > 0 && (
                          <div className={`text-xs font-bold transition-colors text-left pl-2 ${password.length >= 6 ? "text-emerald-600" : "text-rose-500"}`}>
                            Password should be at least 6 characters
                          </div>
                        )}
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm password"
                            className="w-full p-4 border border-gray-300 rounded-xl outline-none transition focus:ring-2 focus:ring-[#C9952A] bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0f1e2d]"
                          >
                            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                        {role === "agent" && (
                          <div className="pt-2">
                            <label className="flex items-start gap-3 rounded-xl border border-gray-100 bg-[#fcfcfc] p-4 text-sm text-gray-600 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={agreedToTerms}
                                onChange={(e) => setAgreedToTerms(e.target.checked)}
                                className="mt-1 h-4 w-4 rounded border-gray-300 text-[#C9952A] focus:ring-[#C9952A]"
                              />
                              <span className="leading-relaxed">
                                I have read and agree to the{" "}
                                <Link href="/terms" className="text-[#C9952A] font-semibold hover:underline">
                                  Terms and Conditions
                                </Link>{" "}
                                and{" "}
                                <Link href="/privacy" className="text-[#C9952A] font-semibold hover:underline">
                                  Privacy Policy
                                </Link>
                                .
                              </span>
                            </label>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => setRole("student")}
                          className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition ${role === "student"
                            ? "border-[#C9952A] bg-[#C9952A]/10 text-[#0f1e2d]"
                            : "border-gray-200 text-gray-400 hover:border-[#C9952A]/50"
                            }`}
                        >
                          <GraduationCap className={`h-8 w-8 ${role === "student" ? "text-[#C9952A]" : "text-gray-300"}`} />
                          <span className="text-sm font-bold">I’m a Student</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setRole("agent")}
                          className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition ${role === "agent"
                            ? "border-[#C9952A] bg-[#C9952A]/10 text-[#0f1e2d]"
                            : "border-gray-200 text-gray-400 hover:border-[#C9952A]/50"
                            }`}
                        >
                          <Briefcase className={`h-8 w-8 ${role === "agent" ? "text-[#C9952A]" : "text-gray-300"}`} />
                          <span className="text-sm font-bold">I’m an Agent</span>
                        </button>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading || (role === "agent" && !agreedToTerms)}
                        className="w-full bg-[#C9952A] text-[#0f1e2d] rounded-full py-4 font-bold text-lg hover:bg-[#C9952A]/90 transition shadow-lg shadow-[#C9952A]/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center mt-4"
                      >
                        {isLoading ? (
                          <span className="flex items-center gap-2 text-[#0f1e2d]">
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Creating account...
                          </span>
                        ) : (
                          "Create Account"
                        )}
                      </button>

                      <p className="text-center text-sm text-gray-500 mt-8">
                        Already have an account?{" "}
                        <button
                          type="button"
                          onClick={() => toggleTab("login")}
                          className="text-[#C9952A] font-bold hover:underline"
                        >
                          Login
                        </button>
                      </p>

                      {/* ── Google divider ── */}
                      <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center">
                          <span className="bg-white px-3 text-xs text-gray-400 font-medium">or sign up with</span>
                        </div>
                      </div>

                      {/* ── Google Sign-Up button ── */}
                      <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={isGoogleLoading}
                        className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-full py-3.5 font-semibold text-sm text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {isGoogleLoading ? (
                          <svg className="animate-spin h-5 w-5 text-gray-500" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                          </svg>
                        )}
                        {isGoogleLoading ? "Connecting..." : "Continue with Google"}
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#0f1e2d]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#C9952A]"></div>
      </div>
    }>
      <AuthContent />
    </Suspense>
  );
}
