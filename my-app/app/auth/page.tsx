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
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Placeholder for actual logic
    setTimeout(() => {
      if (email === "error@test.com") {
        setError("Invalid email or password.");
        setIsLoading(false);
      } else {
        console.log("Logged in:", { email, password });
        setIsLoading(false);
        if (role === "agent") {
          localStorage.setItem("agent_logged_in", "true");
          router.push("/dashboard/agent");
        } else {
          router.push("/dashboard/student");
        }
      }
    }, 1500);
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

    // Placeholder for actual logic
    setTimeout(() => {
      if (email === "exists@test.com") {
        setError("An account with this email already exists.");
        setIsLoading(false);
      } else {
        console.log("Signed up:", { fullName, email, phone, password, role });
        setIsSuccess(true);
        setIsLoading(false);
      }
    }, 1500);
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
      {/* --- Left Brand Panel (Desktop Only) --- */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0f1e2d] items-center justify-center p-12">
        <div className="text-center max-w-md">
          <Link href="/" className="flex flex-col items-center mb-8 group hover:opacity-90 transition-opacity">
            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-xl text-[#0f1e2d] group-hover:scale-105 transition-transform duration-200">
              <Building className="h-10 w-10" />
            </div>
            <h1 className="text-4xl font-bold text-white tracking-tight mb-2">
              Campus<span className="text-[#C9952A]">Hub</span>
            </h1>
            <p className="text-[#C9952A] text-lg font-medium">
              Find your perfect lodge near FUTO
            </p>
          </Link>
          
          <div className="relative h-48 w-full opacity-20 flex items-center justify-center">
             <div className="absolute inset-0 border-2 border-dashed border-white/30 rounded-[3rem]"></div>
             <Building className="h-24 w-24 text-white" />
          </div>
        </div>
      </div>

      {/* --- Mobile Top Banner --- */}
      <div className="lg:hidden bg-[#0f1e2d] p-6 text-center border-b border-white/10">
        <Link href="/" className="inline-flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
          <Building className="h-6 w-6 text-[#C9952A]" />
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
                  className={`flex-1 py-4 text-center font-semibold transition-all relative ${
                    activeTab === "login" ? "text-[#0f1e2d]" : "text-gray-400"
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
                  className={`flex-1 py-4 text-center font-semibold transition-all relative ${
                    activeTab === "signup" ? "text-[#0f1e2d]" : "text-gray-400"
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
                        Don’t have an account?{" "}
                        <button
                          type="button"
                          onClick={() => toggleTab("signup")}
                          className="text-[#C9952A] font-bold hover:underline"
                        >
                          Sign Up
                        </button>
                      </p>
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
                          className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition ${
                            role === "student"
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
                          className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition ${
                            role === "agent"
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
