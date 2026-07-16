"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { auth, db, storage } from "@/lib/firebase";
import { doc, setDoc, updateDoc, deleteDoc, collection, addDoc, getDocs, query, where, onSnapshot } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult, verifyBeforeUpdateEmail, reauthenticateWithCredential, EmailAuthProvider, updatePassword, updateProfile } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  List,
  Plus,
  Bell,
  Home,
  TrendingUp,
  MessageSquare,
  Star,
  Edit,
  Trash2,
  MapPin,
  Building2,
  Check,
  ChevronRight,
  X,
  Clock,
  LogOut,
  Info,
  Menu,
  Sun,
  Moon,
  User,
  ShieldCheck,
  Share2,
  Settings,
  ArrowLeft,
  ChevronLeft,
  Image as ImageIcon,
  AlertTriangle,
  Search,
  Eye,
  Shield,
  Palette,
  Monitor,
  PlusCircle,
  Save,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { formatNaira } from "@/lib/lodge-data";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AgentSidebar } from "@/components/agent/AgentSidebar";
import { useSidebar } from "@/components/ui/sidebar";
import LodgeCard from "@/components/LodgeCard";

// --- Types ---

type Availability = "available" | "pending" | "rented";

interface Listing {
  id: string;
  room_type: string;
  price: number;
  area: string;
  landmark: string;
  building_name: string;
  amenities: string[];
  photos: string[];
  availability: Availability;
  description: string;
  created_at: string;
  entryPrice?: number;
  viewsCount?: number;
}

// --- Mock Data ---

const SETTINGS_TAB_INFO = {
  profile: {
    title: "Profile Settings",
    description: "Manage your public agent card details"
  },
  account: {
    title: "Account Settings",
    description: "Manage your account email and access details"
  },
  security: {
    title: "Security Settings",
    description: "Manage your account credentials and login sessions"
  },
  appearance: {
    title: "Appearance Settings",
    description: "Customize the user interface look and theme mode"
  },
  notifications: {
    title: "Notification Settings",
    description: "Configure channels for inquiry and review updates"
  },
  danger: {
    title: "Danger Zone",
    description: "Irreversible account deactivation and deletion options"
  }
} as const;

const INITIAL_AGENT_DATA = {
  id: 'agent1',
  full_name: 'Johnson Okonkwo',
  phone: '08012345678',
  whatsapp: '08012345678',
  agent_type: 'individual',
  verified: false,
  approved: false,
  emailVerified: true,
  phoneVerified: false,
  ninUploaded: false,
  suspended: false,
  ninImage: null as string | null,
  ninImageName: null as string | null,
  email: 'johnson@campushub.com',
  responseTime: 'Replies within 5 mins',
  photo: 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y',
  joinedDate: 'Oct 2025',
  stats: {
    total_listings: 4,
    total_views: 340,
    inquiries: 0,
    avg_rating: 4.5
  },
  listings: [
    {
      id: 'l1',
      room_type: 'Self-contain',
      price: 250000,
      entryPrice: 100000,
      viewsCount: 142,
      area: 'Eziobodo',
      landmark: 'Near FUTO gate',
      building_name: 'Eziobodo Student Haven',
      amenities: ['Solar power', 'Borehole water', 'WiFi'],
      photos: ['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=400&q=80'],
      availability: 'available' as Availability,
      description: 'Spacious room with good lighting and ventilation.',
      created_at: '2025-06-01'
    },
    {
      id: 'l2',
      room_type: 'Mini-flat',
      price: 450000,
      entryPrice: 180000,
      viewsCount: 89,
      area: 'Ihiagwa',
      landmark: 'Behind Student Gate',
      building_name: 'Ihiagwa Gardens',
      amenities: ['Security', 'POP Ceiling', 'Tiled floor'],
      photos: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=400&q=80'],
      availability: 'pending' as Availability,
      description: 'Modern mini-flat with separate kitchen and bathroom.',
      created_at: '2025-06-05'
    },
    {
      id: 'l3',
      room_type: 'Self-contain',
      price: 220000,
      entryPrice: 90000,
      viewsCount: 65,
      area: 'Umuchima',
      landmark: 'Near the market',
      building_name: 'Umuchima Heights',
      amenities: ['Borehole water', 'Fenced'],
      photos: ['https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80'],
      availability: 'rented' as Availability,
      description: 'Affordable self-contain for students.',
      created_at: '2025-05-20'
    },
    {
      id: 'l4',
      room_type: 'Single room',
      price: 120000,
      entryPrice: 50000,
      viewsCount: 24,
      area: 'Eziobodo',
      landmark: 'Close to the tarred road',
      building_name: 'Legacy Lodge',
      amenities: ['Water', 'Security'],
      photos: ['https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=400&q=80'],
      availability: 'available' as Availability,
      description: 'Quiet environment, perfect for studying.',
      created_at: '2025-06-08'
    }
  ] as Listing[]
};

const ROOM_TYPES = ["Self-contain", "Mini-flat", "Single room", "One-bedroom"];
const AMENITY_OPTIONS = ["Solar power", "Borehole water", "WiFi", "Security", "POP Ceiling", "Tiled floor", "Fenced", "Kitchen cabinet"];
const AREAS = ["Ihiagwa", "Eziobodo", "FUTO", "Umuchima"];

export default function AgentDashboard() {
  const router = useRouter();
  const { user, profile, loading: authLoading, logout: handleFirebaseLogout } = useAuth();
  const { toggleSidebar } = useSidebar();
  const [activeTab, setActiveTab] = useState<"profile" | "overview" | "listings" | "notifications" | "settings" | "edit-listing" | "add-listing" | "view-listing">("profile");
  const [agentData, setAgentData] = useState(INITIAL_AGENT_DATA);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);

  // Sync profile document updates from Firestore in real-time
  useEffect(() => {
    if (profile) {
      setAgentData(prev => ({
        ...prev,
        id: profile.uid,
        full_name: profile.fullName || prev.full_name,
        phone: profile.phone || prev.phone,
        email: profile.email || prev.email,
        phoneVerified: profile.phoneVerified,
        emailVerified: profile.emailVerified,
        ninUploaded: profile.ninUploaded,
        approved: profile.approved,
        verified: profile.verified,
      }));
    }
  }, [profile]);

  // ── Route Guard: must be logged in AND be an agent ──
  useEffect(() => {
    if (authLoading) return; // wait until Firebase resolves
    if (!user) {
      router.push("/auth?mode=login");
      return;
    }
    if (profile) {
      if (profile.role !== "agent") {
        // Logged in but wrong role — redirect them to their correct dashboard
        if (profile.role === "student") router.push("/dashboard/student");
        else if (profile.role === "admin") router.push("/admin");
        else router.push("/auth?mode=login");
      }
    } else {
      // User is logged in but has no profile document in Firestore, bounce to login
      router.push("/auth?mode=login");
    }
  }, [user, profile, authLoading, router]);

  const [listingsLoading, setListingsLoading] = useState(true);

  // Sync rooms listings and stats from Firestore Database
  useEffect(() => {
    if (!user) return;
    const fetchAgentListings = async () => {
      setListingsLoading(true);
      try {
        const roomsSnap = await getDocs(
          query(collection(db, "rooms"), where("agentId", "==", user.uid))
        );
        const fetchedListings: Listing[] = [];
        let totalViews = 0;

        roomsSnap.forEach((docSnap) => {
          const data = docSnap.data();
          const listingItem: Listing = {
            id: docSnap.id,
            room_type: data.roomType,
            price: Number(data.price),
            entryPrice: Number(data.entryPrice),
            area: data.area,
            landmark: data.landmark,
            building_name: data.building_name,
            amenities: data.amenities || [],
            photos: data.photos || [],
            availability: data.availability as Availability,
            description: data.description || "",
            created_at: data.created_at || new Date().toISOString().split("T")[0],
            viewsCount: Number(data.viewsCount || 0)
          };
          fetchedListings.push(listingItem);
          totalViews += listingItem.viewsCount || 0;
        });

        fetchedListings.sort((a, b) => b.created_at.localeCompare(a.created_at));

        setAgentData(prev => ({
          ...prev,
          listings: fetchedListings,
          stats: {
            total_listings: fetchedListings.length,
            total_views: totalViews,
            inquiries: prev.stats?.inquiries || 0,
            avg_rating: prev.stats?.avg_rating || 4.5
          }
        }));
      } catch (err) {
        console.error("Error fetching agent listings:", err);
      } finally {
        setListingsLoading(false);
      }
    };

    fetchAgentListings();
  }, [user]);

  // OTP Verification States
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(6).fill(""));
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [resendCountdown, setResendCountdown] = useState(0);

  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setInterval(() => {
        setResendCountdown(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [resendCountdown]);

  // Add Listing Form state
  const [newListingForm, setNewListingForm] = useState({
    building_name: "",
    room_type: "Self-contain",
    price: "",
    entryPrice: "",
    area: "Eziobodo",
    landmark: "",
    description: "",
  });
  const [newListingAmenities, setNewListingAmenities] = useState<string[]>([]);
  const [newListingPhotos, setNewListingPhotos] = useState<string[]>([]);
  const [newListingLoading, setNewListingLoading] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const mainRef = useRef<HTMLElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [ninUploading, setNinUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedDpFile, setSelectedDpFile] = useState<File | null>(null);
  const [settingsTab, setSettingsTab] = useState<'profile' | 'account' | 'security' | 'appearance' | 'notifications' | 'danger'>('profile');
  const [whatsAppSameAsPhone, setWhatsAppSameAsPhone] = useState(true);
  const [changeEmailForm, setChangeEmailForm] = useState({ newEmail: '', password: '' });
  const [emailChangePending, setEmailChangePending] = useState<string | null>(null);
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [emailChangeError, setEmailChangeError] = useState<string | null>(null);
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [notifyInquiries, setNotifyInquiries] = useState(true);
  const [notifyBookingRequests, setNotifyBookingRequests] = useState(true);
  const [notifyReviews, setNotifyReviews] = useState(true);
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyPush, setNotifyPush] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (activeTab === 'overview') {
      setOverviewLoading(true);
      const timer = setTimeout(() => setOverviewLoading(false), 500);
      return () => clearTimeout(timer);
    }
  }, [activeTab]);

  // Scroll main container to top when switching active tabs
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
  }, [activeTab]);
  const [tempPhoto, setTempPhoto] = useState<string | null>(null);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  // New onboarding states
  const [selectedRoomForDetail, setSelectedRoomForDetail] = useState<Listing | null>(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent, photosLength: number) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (diff > 50) {
      // Swipe left -> Next photo
      setActivePhotoIndex((prev) => (prev === photosLength - 1 ? 0 : prev + 1));
    } else if (diff < -50) {
      // Swipe right -> Previous photo
      setActivePhotoIndex((prev) => (prev === 0 ? photosLength - 1 : prev - 1));
    }
    setTouchStartX(null);
  };

  useEffect(() => {
    setActivePhotoIndex(0);
  }, [selectedRoomForDetail?.id]);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<{ id: string; text: string; date: string; read: boolean }[]>([]);

  // Profile Form state
  const [profileForm, setProfileForm] = useState({
    full_name: INITIAL_AGENT_DATA.full_name,
    phone: INITIAL_AGENT_DATA.phone,
    whatsapp: INITIAL_AGENT_DATA.phone,
    email: INITIAL_AGENT_DATA.email,
    agent_type: INITIAL_AGENT_DATA.agent_type,
    responseTime: INITIAL_AGENT_DATA.responseTime,
    photo: INITIAL_AGENT_DATA.photo
  });

  // Sync theme and local storage data on mount and focus changes
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    } else if (savedTheme === "light") {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    } else {
      const isDarkTheme = document.documentElement.classList.contains("dark");
      setIsDark(isDarkTheme);
    }

    const handleSync = () => {
      const saved = localStorage.getItem("agent_data");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setAgentData(parsed);
          setProfileForm({
            full_name: parsed.full_name || INITIAL_AGENT_DATA.full_name,
            phone: parsed.phone || INITIAL_AGENT_DATA.phone,
            whatsapp: parsed.whatsapp || parsed.phone || INITIAL_AGENT_DATA.phone,
            email: parsed.email || INITIAL_AGENT_DATA.email,
            agent_type: parsed.agent_type || INITIAL_AGENT_DATA.agent_type,
            responseTime: parsed.responseTime || INITIAL_AGENT_DATA.responseTime,
            photo: parsed.photo || INITIAL_AGENT_DATA.photo,
          });
          if (parsed.whatsapp && parsed.whatsapp !== parsed.phone) {
            setWhatsAppSameAsPhone(false);
          } else {
            setWhatsAppSameAsPhone(true);
          }
        } catch (e) {
          console.error(e);
        }
      } else {
        localStorage.setItem("agent_data", JSON.stringify(INITIAL_AGENT_DATA));
      }
    };

    handleSync();

    window.addEventListener("focus", handleSync);
    window.addEventListener("storage", handleSync);
    window.addEventListener("agent-data-updated", handleSync);
    return () => {
      window.removeEventListener("focus", handleSync);
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("agent-data-updated", handleSync);
    };
  }, []);

  // Real-time Firestore user document synchronization
  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setAgentData(prev => {
          const updated = {
            ...prev,
            full_name: data.fullName || data.name || prev.full_name,
            phone: data.phone || prev.phone,
            whatsapp: data.whatsapp || data.phone || prev.whatsapp,
            email: data.email || prev.email,
            agent_type: data.agentType || prev.agent_type,
            verified: data.verified !== undefined ? data.verified : prev.verified,
            approved: data.approved !== undefined ? data.approved : prev.approved,
            emailVerified: data.emailVerified !== undefined ? data.emailVerified : prev.emailVerified,
            phoneVerified: data.phoneVerified !== undefined ? data.phoneVerified : prev.phoneVerified,
            ninUploaded: data.ninUploaded !== undefined ? data.ninUploaded : prev.ninUploaded,
            photo: data.photoURL || data.photo || prev.photo,
          };
          // No localStorage write — AuthContext is the source of truth
          return updated;
        });
        setProfileForm(prev => ({
          ...prev,
          full_name: data.fullName || data.name || prev.full_name,
          phone: data.phone || prev.phone,
          whatsapp: data.whatsapp || data.phone || prev.whatsapp,
          email: data.email || prev.email,
          agent_type: data.agentType || prev.agent_type,
          responseTime: data.responseTime || prev.responseTime,
          photo: data.photoURL || data.photo || prev.photo,
        }));
      }
    });
    return () => unsub();
  }, [user]);

  // Update notification list on verification status change
  useEffect(() => {
    if (agentData.approved && agentData.verified) {
      setNotifications([
        {
          id: "verify-notif",
          text: "your account has been verified start listing your apartments",
          date: "Just now",
          read: false
        }
      ]);
    } else {
      setNotifications([]);
    }
  }, [agentData.approved, agentData.verified]);

  // Manage browser history for seamless back/forward navigation of dashboard tabs/pages
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handlePopState = (e: PopStateEvent) => {
      if (e.state && e.state.tab) {
        setActiveTab(e.state.tab);
      } else {
        const urlParams = new URLSearchParams(window.location.search);
        const tabParam = urlParams.get("tab");
        setActiveTab((tabParam as any) || "profile");
      }
    };

    window.addEventListener("popstate", handlePopState);

    // Initial load: parse the URL query tab parameter and set initial history state
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get("tab") as any;
    const initialTab = tabParam || "profile";
    setActiveTab(initialTab);

    const url = new URL(window.location.href);
    url.searchParams.set("tab", initialTab);
    window.history.replaceState({ tab: initialTab }, "", url.pathname + url.search);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  // Scroll to top on tab changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [activeTab]);

  // Sync state changes to browser history
  useEffect(() => {
    if (typeof window === "undefined") return;

    const currentState = window.history.state;
    if (!currentState || currentState.tab !== activeTab) {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", activeTab);
      window.history.pushState({ tab: activeTab }, "", url.pathname + url.search);
    }
  }, [activeTab]);

  const handleGoBackToListings = () => {
    if (typeof window !== "undefined" && window.history.state?.tab === activeTab) {
      window.history.back();
    } else {
      setActiveTab("listings");
    }
  };

  const handleGoBackFromRoomDetail = () => {
    setSelectedRoomForDetail(null);
    if (typeof window !== "undefined" && window.history.state?.tab === "view-listing") {
      window.history.back();
    } else {
      setActiveTab("profile");
    }
  };

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    if (newDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const changeTheme = (mode: 'light' | 'dark' | 'system') => {
    if (mode === 'system') {
      localStorage.removeItem('theme');
      const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(isSystemDark);
      if (isSystemDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else {
      localStorage.setItem('theme', mode);
      setIsDark(mode === 'dark');
      if (mode === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const handleSendOtp = async () => {
    setIsSendingOtp(true);
    setOtpError(null);
    setOtpDigits(Array(6).fill(""));
    setOtpCode("");

    // Format phone
    let formattedPhone = agentData.phone.trim();
    if (formattedPhone.startsWith("0") && formattedPhone.length === 11) {
      formattedPhone = "+234" + formattedPhone.slice(1);
    } else if (!formattedPhone.startsWith("+")) {
      formattedPhone = "+234" + formattedPhone;
    }

    try {
      // Generate a random 6-digit OTP code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(code);

      // Simulate network delay for verification OTP delivery
      setTimeout(() => {
        setIsSendingOtp(false);
        setShowOtpModal(true);
        setResendCountdown(60);
        toast.success(`Verification OTP code generated successfully!`, {
          icon: "💬"
        });
      }, 700);
    } catch (err: any) {
      console.error("OTP send error:", err);
      toast.error("Failed to send OTP code. Please check your network connection.");
      setIsSendingOtp(false);
    }
  };

  const handleConfirmOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length !== 6) {
      setOtpError("Please enter a valid 6-digit code.");
      return;
    }

    if (otpCode !== generatedOtp) {
      setOtpError("Incorrect OTP verification code. Please try again.");
      return;
    }

    setIsVerifyingOtp(true);
    setOtpError(null);

    try {
      // Update phone verification flag in Firestore
      if (user) {
        await updateDoc(doc(db, "users", user.uid), {
          phoneVerified: true,
          phone: agentData.phone
        });
      }

      setAgentData(prev => {
        const updated = {
          ...prev,
          phoneVerified: true
        };
        localStorage.setItem("agent_data", JSON.stringify(updated));
        window.dispatchEvent(new Event("agent-data-updated"));
        return updated;
      });
      setShowOtpModal(false);
      toast.success("Phone verified successfully!");
    } catch (err: any) {
      console.error("OTP confirm error:", err);
      setOtpError(err.message || "Failed to update verified state in database.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleNINSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewImage) {
      toast.error("Please choose or upload a valid image file.");
      return;
    }

    setNinUploading(true);
    setUploadError(null);

    try {
      let finalImageUrl = previewImage;

      // Real Firebase Storage upload if a binary file was selected
      if (user && selectedFile) {
        const fileRef = ref(storage, `agents/${user.uid}/${Date.now()}_${selectedFile.name}`);
        const uploadResult = await uploadBytes(fileRef, selectedFile);
        finalImageUrl = await getDownloadURL(uploadResult.ref);
      }

      // Save to Firestore users document
      if (user) {
        await updateDoc(doc(db, "users", user.uid), {
          ninUploaded: true,
          ninImage: finalImageUrl,
          ninImageName: selectedFile?.name || "NIN_document.jpg"
        });
      }

      setAgentData(prev => {
        const updated = {
          ...prev,
          ninUploaded: true,
          ninImage: finalImageUrl,
          ninImageName: selectedFile?.name || "NIN_document.jpg"
        };
        localStorage.setItem("agent_data", JSON.stringify(updated));
        window.dispatchEvent(new Event("agent-data-updated"));
        return updated;
      });
      toast.success("NIN document uploaded successfully! Pending verification.");
    } catch (err: any) {
      console.error("Firestore/Storage upload error:", err);
      const errMsg = err.message || "Failed to submit verification request. Please check your internet connection.";
      setUploadError(errMsg);
      toast.error("Upload failed. Please see the error details.");
    } finally {
      setNinUploading(false);
    }
  };

  const PendingTabAlert = () => (
    <div className="space-y-8 px-6 sm:px-0">
      <div className="bg-white dark:bg-[#0f1d2e] rounded-none sm:rounded-[2rem] border border-dashed border-black/10 dark:border-white/10 py-24 text-center border-x-0 sm:border">
        <div className="w-16 h-16 bg-amber-50 dark:bg-amber-500/5 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-500 animate-pulse">
          <Clock className="h-8 w-8" />
        </div>
        <p className="text-navy dark:text-white font-bold text-lg">Account Verification Pending</p>
        <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
          your account is pending we`ll notify you ones youre verified
        </p>
      </div>
    </div>
  );

  // --- Handlers ---

  const handleUpdateAgentProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    let finalWhatsApp = profileForm.whatsapp;
    if (whatsAppSameAsPhone) {
      finalWhatsApp = profileForm.phone;
    }

    try {
      if (user) {
        await updateDoc(doc(db, "users", user.uid), {
          fullName: profileForm.full_name,
          phone: profileForm.phone,
          whatsapp: finalWhatsApp,
          agentType: profileForm.agent_type,
          responseTime: profileForm.responseTime,
          photo: profileForm.photo
        });
      }

      setAgentData(prev => {
        const updated = {
          ...prev,
          full_name: profileForm.full_name,
          phone: profileForm.phone,
          whatsapp: finalWhatsApp,
          agent_type: profileForm.agent_type,
          responseTime: profileForm.responseTime,
          photo: profileForm.photo
        };
        localStorage.setItem("agent_data", JSON.stringify(updated));
        window.dispatchEvent(new Event("agent-data-updated"));
        return updated;
      });

      toast.success("Profile updated successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to update profile details.");
    }
  };

  const handleChangeEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.email) return;

    setIsChangingEmail(true);
    setEmailChangeError(null);

    try {
      // Reauthenticate first
      const credential = EmailAuthProvider.credential(user.email, changeEmailForm.password);
      await reauthenticateWithCredential(user, credential);

      // Verify and update email
      await verifyBeforeUpdateEmail(user, changeEmailForm.newEmail);

      // Save to Firestore as pending
      await updateDoc(doc(db, "users", user.uid), {
        pendingEmail: changeEmailForm.newEmail
      });

      setEmailChangePending(changeEmailForm.newEmail);
      toast.success("Verification link sent!");
      setChangeEmailForm({ newEmail: "", password: "" });
    } catch (err: any) {
      console.error("Email change error:", err);
      if (err.code === 'auth/email-already-in-use') {
        setEmailChangeError("This email is already associated with another account. Please use a different email address.");
      } else if (err.code === 'auth/wrong-password') {
        setEmailChangeError("Incorrect current password. Please try again.");
      } else {
        setEmailChangeError(err.message || "Failed to update email. Please try again.");
      }
    } finally {
      setIsChangingEmail(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.email) return;

    if (passwordForm.new !== passwordForm.confirm) {
      toast.error("New passwords do not match!");
      return;
    }

    if (passwordForm.new.length < 6) {
      toast.error("New password should be at least 6 characters long.");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, passwordForm.current);
      await reauthenticateWithCredential(user, credential);

      await updatePassword(user, passwordForm.new);
      toast.success("Password updated successfully!");
      setPasswordForm({ current: "", new: "", confirm: "" });
    } catch (err: any) {
      console.error("Password update error:", err);
      if (err.code === 'auth/wrong-password') {
        toast.error("Incorrect current password.");
      } else {
        toast.error(err.message || "Failed to update password.");
      }
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleDeleteListing = async (id: string) => {
    try {
      await deleteDoc(doc(db, "rooms", id));
      setAgentData(prev => ({
        ...prev,
        listings: prev.listings.filter(l => l.id !== id)
      }));
      toast.success("Listing deleted successfully");
    } catch (err) {
      console.error("Delete room error:", err);
      toast.error("Failed to delete room listing.");
    }
  };

  const handleUpdateAvailability = async (id: string, availability: Availability) => {
    try {
      await updateDoc(doc(db, "rooms", id), { availability });
      setAgentData(prev => ({
        ...prev,
        listings: prev.listings.map(l => l.id === id ? { ...l, availability } : l)
      }));
      toast.success(`Marked as ${availability}`);
    } catch (err) {
      console.error("Update availability error:", err);
      toast.error("Failed to update availability status.");
    }
  };

  const handleEditClick = (listing: Listing) => {
    setEditingListing({ ...listing });
    setActiveTab("edit-listing");
    if (typeof window !== "undefined") {
      window.history.pushState({ tab: "edit-listing" }, "");
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingListing) return;

    try {
      const slug = editingListing.building_name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");

      // Update parent lodge details
      await setDoc(doc(db, "lodges", slug), {
        slug,
        name: editingListing.building_name,
        area: editingListing.area,
        landmark: editingListing.landmark,
        agentPhone: profile?.phone || "+2348000000000"
      }, { merge: true });

      // Update room details
      await updateDoc(doc(db, "rooms", editingListing.id), {
        lodgeSlug: slug,
        roomType: editingListing.room_type,
        price: Number(editingListing.price),
        entryPrice: Number(editingListing.entryPrice),
        description: editingListing.description,
        photos: editingListing.photos,
        amenities: editingListing.amenities,
        area: editingListing.area,
        landmark: editingListing.landmark,
        building_name: editingListing.building_name,
      });

      setAgentData(prev => ({
        ...prev,
        listings: prev.listings.map(l => l.id === editingListing.id ? editingListing : l)
      }));

      handleGoBackToListings();
      toast.success("Listing updated successfully");
    } catch (err) {
      console.error("Save edit listing error:", err);
      toast.error("Failed to update listing in database.");
    }
  };

  const toggleAmenity = (amenity: string) => {
    if (!editingListing) return;

    setEditingListing(prev => {
      if (!prev) return null;
      const amenities = prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity];
      return { ...prev, amenities };
    });
  };

  const handleNewListingPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image file.`);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setNewListingPhotos((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleNewListingRemovePhoto = (index: number) => {
    setNewListingPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleNewListingAmenityToggle = (amenity: string) => {
    setNewListingAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    );
  };

  const handleCreateListingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newListingForm.building_name.trim()) {
      toast.error("Please enter a lodge/building name.");
      return;
    }
    if (!newListingForm.price || isNaN(Number(newListingForm.price))) {
      toast.error("Please enter a valid first payment.");
      return;
    }
    if (!newListingForm.entryPrice || isNaN(Number(newListingForm.entryPrice))) {
      toast.error("Please enter a valid to pay price.");
      return;
    }
    if (!newListingForm.landmark.trim()) {
      toast.error("Please enter a landmark description.");
      return;
    }
    if (!user) {
      toast.error("Please log in to add a room listing.");
      return;
    }

    setNewListingLoading(true);

    try {
      const DEFAULT_PHOTOS: Record<string, string> = {
        "Self-contain": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80",
        "Mini-flat": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80",
        "Single room": "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=600&q=80",
        "One-bedroom": "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80",
      };

      const finalPhotos = newListingPhotos.length > 0
        ? newListingPhotos
        : [DEFAULT_PHOTOS[newListingForm.room_type] || DEFAULT_PHOTOS["Self-contain"]];

      const slug = newListingForm.building_name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const roomId = `room-${Date.now()}`;

      // Create/update lodge details in database
      await setDoc(doc(db, "lodges", slug), {
        slug,
        name: newListingForm.building_name,
        area: newListingForm.area,
        landmark: newListingForm.landmark,
        rating: 4.5,
        reviewsCount: 0,
        isOfficial: false,
        agentPhone: profile?.phone || "+2348000000000"
      }, { merge: true });

      // Create room document in database
      const newListing: Listing = {
        id: roomId,
        room_type: newListingForm.room_type,
        price: Number(newListingForm.price),
        entryPrice: Number(newListingForm.entryPrice),
        area: newListingForm.area,
        landmark: newListingForm.landmark,
        building_name: newListingForm.building_name,
        amenities: newListingAmenities,
        photos: finalPhotos,
        availability: "available",
        description: newListingForm.description,
        created_at: new Date().toISOString().split("T")[0],
        viewsCount: 0,
      };

      await setDoc(doc(db, "rooms", roomId), {
        id: roomId,
        lodgeSlug: slug,
        agentId: user.uid,
        roomType: newListingForm.room_type,
        price: Number(newListingForm.price),
        entryPrice: Number(newListingForm.entryPrice),
        description: newListingForm.description,
        photos: finalPhotos,
        amenities: newListingAmenities,
        availability: "available",
        created_at: newListing.created_at,
        viewsCount: 0,
        area: newListingForm.area,
        landmark: newListingForm.landmark,
        building_name: newListingForm.building_name,
      });

      // Refresh agent listings from Firestore (source of truth)
      setAgentData(prev => ({ ...prev, listings: [newListing, ...(prev.listings || [])] }));

      toast.success("New listing added successfully!");

      setNewListingForm({
        building_name: "",
        room_type: "Self-contain",
        price: "",
        entryPrice: "",
        area: "Eziobodo",
        landmark: "",
        description: "",
      });
      setNewListingAmenities([]);
      setNewListingPhotos([]);

      handleGoBackToListings();
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while creating the listing.");
    } finally {
      setNewListingLoading(false);
    }
  };

  // --- UI Sub-components ---

  const StatCard = ({ icon: Icon, label, value, subtext }: { icon: any, label: string, value: string | number, subtext: string }) => (
    <Card className="border-none shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-[#0f1d2e]">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2.5 rounded-xl bg-navy/5 dark:bg-white/5 text-navy dark:text-gold">
            <Icon className="h-5 w-5" />
          </div>
          <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider bg-gold/5 text-gold border-gold/10">
            Real-time
          </Badge>
        </div>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <div className="mt-2 flex items-baseline gap-2">
          <h3 className="text-3xl font-bold text-navy dark:text-white">{value}</h3>
          <p className="text-xs text-muted-foreground">{subtext}</p>
        </div>
      </CardContent>
    </Card>
  );

  const AvailabilityBadge = ({ status, onClick }: { status: Availability, onClick?: () => void }) => {
    const config = {
      available: { label: "Available", color: "bg-emerald-500" },
      pending: { label: "Pending", color: "bg-amber-500" },
      rented: { label: "Rented", color: "bg-rose-500" }
    }[status];

    return (
      <Badge
        className={cn(
          "cursor-pointer hover:opacity-90 transition-opacity gap-1.5 px-3 py-1 text-white font-medium rounded-full",
          status === "available" ? "bg-emerald-500" :
            status === "pending" ? "bg-amber-500" :
              "bg-rose-500"
        )}
        onClick={onClick}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-white" />
        {config.label}
      </Badge>
    );
  };

  const TAB_TITLES = {
    profile: "My Agent Profile",
    overview: "Dashboard Overview",
    listings: "Manage Listings",
    notifications: "Notifications & Inquiries",
    settings: "Account Settings",
    "edit-listing": "Edit Room Listing",
    "add-listing": "Add New Room Listing",
    "view-listing": "Room Details",
  };

  const isApproved = agentData.approved && agentData.verified;

  if (!mounted || authLoading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white dark:bg-[#08131e] transition-colors duration-300">
        <div className="relative flex flex-col items-center space-y-4">
          <div className="relative h-32 w-32 flex items-center justify-center animate-pulse">
            <Image
              src="/image/Campus-Hub2.png"
              alt="CampusHub Logo"
              width={120}
              height={120}
              className="object-contain"
            />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-lg font-bold tracking-tight text-navy dark:text-white animate-pulse">
              Campus<span className="text-gold">Hub</span>
            </h2>
            <div className="flex items-center justify-center gap-1.5 text-[10px] uppercase font-bold tracking-widest text-muted-foreground animate-pulse">
              <span className="h-1.5 w-1.5 rounded-full bg-gold animate-bounce animate-duration-500" style={{ animationDelay: '0ms' }} />
              <span className="h-1.5 w-1.5 rounded-full bg-gold animate-bounce animate-duration-500" style={{ animationDelay: '150ms' }} />
              <span className="h-1.5 w-1.5 rounded-full bg-gold animate-bounce animate-duration-500" style={{ animationDelay: '300ms' }} />
              <span>Loading Agent Dashboard...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* 1. Left Sidebar Navigation */}
      <AgentSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        agentName={agentData.full_name}
        agentPhoto={agentData.photo}
        isApproved={isApproved}
        onLogout={handleFirebaseLogout}
      />

      {/* 2. Main content wrap */}
      <div className="flex-grow flex flex-col h-[100dvh] overflow-hidden bg-gray-50/50 dark:bg-navy/5">

        {/* Mobile Navbar (Matches Admin Layout) */}
        <div className="flex lg:hidden items-center justify-between bg-white dark:bg-[#0f1d2e] text-navy dark:text-white px-6 py-4 border-b border-black/5 dark:border-white/10 shadow-sm z-40">
          <div className="flex items-center gap-1">
            <Image
              src="/image/Campus-Hub.png"
              alt="Campus-Hub Logo"
              width={32}
              height={32}
              className="object-contain"
            />
            <span className="text-lg font-bold tracking-tight text-navy dark:text-white">
              Campus<span className="text-gold">Hub</span>
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-navy dark:text-white hover:bg-navy/5 dark:hover:bg-white/10 h-9 w-9 p-0 rounded-full flex items-center justify-center"
              aria-label="Toggle dark mode"
            >
              {isDark ? <Sun className="h-4.5 w-4.5 text-gold" /> : <Moon className="h-4.5 w-4.5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setActiveTab("notifications")}
              className="text-navy dark:text-white hover:bg-navy/5 dark:hover:bg-white/10 h-9 w-9 p-0 rounded-full relative flex items-center justify-center"
              aria-label="Notifications"
            >
              <Bell className="h-4.5 w-4.5" />
              {notifications.length > 0 && (
                <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
              )}
            </Button>
            <button
              onClick={() => setActiveTab("settings")}
              className="focus:outline-none shrink-0 h-9 w-9 flex items-center justify-center"
              aria-label="Profile settings"
            >
              <img
                src={agentData.photo}
                alt={agentData.full_name}
                className="w-7 h-7 rounded-full object-cover border border-gold"
              />
            </button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="text-navy dark:text-white hover:bg-navy/5 dark:hover:bg-white/10 h-9 w-9 p-0 rounded-full flex items-center justify-center"
              aria-label="Toggle navigation menu"
            >
              <Menu className="h-5.5 w-5.5" />
            </Button>
          </div>
        </div>

        {/* LG Screen Top Bar (Search + Right Items) - Unified and shown regardless of active tab */}
        <div className="hidden lg:flex items-center justify-between gap-4 border-b border-navy/5 dark:border-white/5 px-6 md:px-8 bg-white dark:bg-[#0f1d2e] z-30 h-[80px]">
          {/* Left: Fancy Search */}
          <div className="relative w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              disabled
              placeholder="Search..."
              className="w-full bg-white dark:bg-[#162535] text-navy dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-full pl-10 pr-4 py-2 text-sm border border-navy/10 dark:border-white/10 outline-none cursor-not-allowed shadow-sm"
            />
          </div>
          {/* Right: Theme, Bell, Profile */}
          <div className="flex items-center gap-6">
            <button
              onClick={toggleTheme}
              className="text-navy/60 dark:text-white/60 hover:text-navy dark:hover:text-white p-2 rounded-full hover:bg-navy/5 dark:hover:bg-white/5 transition"
            >
              {isDark ? <Sun size={20} className="text-gold" /> : <Moon size={20} />}
            </button>

            <button
              onClick={() => setActiveTab("notifications")}
              className="relative text-navy/60 dark:text-white/60 hover:text-navy dark:hover:text-white p-2 rounded-full hover:bg-navy/5 dark:hover:bg-white/5 transition"
            >
              <Bell className="h-5 w-5" />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-extrabold text-white animate-pulse">
                  {notifications.length}
                </span>
              )}
            </button>

            <div
              onClick={() => setActiveTab("settings")}
              className="flex items-center gap-3 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full border border-gold bg-navy overflow-hidden flex items-center justify-center font-bold text-xs text-gold flex-shrink-0">
                <img
                  src={agentData.photo}
                  alt={agentData.full_name}
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="text-sm font-semibold text-navy dark:text-white">
                {agentData.full_name.split(" ")[0]}
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable Dashboard Body */}
        <main ref={mainRef} className="flex-1 overflow-y-auto relative overscroll-y-contain">

          {/* Main Dashboard Body Container */}
          <div className={cn(
            "px-0 pb-6 sm:p-6 md:p-8 flex-1 flex flex-col",
            activeTab === "profile" ? "pt-0 sm:pt-6" : "pt-6"
          )}>

            {/* Section Title (placed below top bar nav) */}
            {activeTab !== "profile" && activeTab !== "view-listing" && activeTab !== "settings" && (
              <div className="flex flex-col gap-4 mb-8 px-6 sm:px-0">
                <div className="text-left">
                  <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-navy dark:text-white">
                    {TAB_TITLES[activeTab]}
                  </h1>
                  <p className="text-muted-foreground text-xs md:text-sm mt-1">
                    {agentData.full_name} · {isApproved ? "CampusHub Approved Partner" : "Pending Onboarding"}
                  </p>
                </div>
              </div>
            )}

            {/* Interactive Views */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {agentData.suspended ? (
                  <div className="max-w-xl mx-auto text-left px-6 sm:px-0 mt-8">
                    <Card className="border-none shadow-lg bg-rose-950/5 text-navy dark:text-white rounded-[2rem] overflow-hidden relative border border-rose-500/20">
                      <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500 opacity-5 blur-[80px] rounded-full -mr-24 -mt-24"></div>
                      <CardContent className="p-8 relative z-10 flex flex-col items-center text-center">
                        <div className="p-4 bg-rose-500/10 rounded-full text-rose-500 mb-6 animate-bounce">
                          <AlertTriangle className="h-10 w-10" />
                        </div>
                        <h3 className="text-xl font-bold text-navy dark:text-white leading-tight mb-3">Account Suspended</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mb-4">
                          Your agent account has been suspended by the administrators due to reported issues or violation of our guidelines.
                        </p>
                        <div className="w-full bg-navy/5 dark:bg-white/5 border border-navy/10 dark:border-white/10 rounded-2xl p-4 mt-2">
                          <span className="text-xs text-rose-500 font-semibold uppercase tracking-wider block font-sans">Appeal Suspension</span>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                            Please contact our support team at <a href="mailto:support@campushub.com" className="underline font-bold text-gold">support@campushub.com</a> referencing your Agent ID: <code className="bg-black/10 dark:bg-black/40 px-1 py-0.5 rounded text-navy dark:text-gold">{agentData.id}</code>.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <>
                    {/* Tab 1: Profile Tab */}
                    {activeTab === "profile" && (
                      <div className="space-y-8 max-w-xl lg:max-w-4xl mx-auto text-left">
                        {/* ALWAYS RENDER PROFILE PREVIEW CARD AT THE TOP */}
                        <Card className="border-none shadow-lg bg-white dark:bg-[#0f1e2d] text-navy dark:text-white rounded-none sm:rounded-3xl overflow-hidden relative text-left border-x-0 sm:border border-black/5 dark:border-white/10">
                          <div className="absolute top-0 right-0 w-48 h-48 bg-[#C9952A] opacity-5 blur-[80px] rounded-full -mr-24 -mt-24"></div>
                          <CardContent className="p-6 md:p-8 relative z-10">
                            <div className="flex items-center gap-5">
                              <div className="relative shrink-0">
                                <img
                                  src={profileForm.photo}
                                  alt={profileForm.full_name}
                                  className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-gold object-cover bg-white/10"
                                />
                                {isApproved && (
                                  <div className="absolute -bottom-1 -right-1 bg-gold rounded-full p-1 border-2 border-white dark:border-[#0f1e2d]">
                                    <ShieldCheck className="h-3.5 w-3.5 text-[#0f1e2d] fill-[#0f1e2d]" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <h4 className="text-xl font-bold text-navy dark:text-white leading-tight">{profileForm.full_name || "Agent Name"}</h4>
                                <div className="flex flex-col gap-1 mt-2">
                                  {isApproved ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400 text-[10px] font-bold border border-green-500/20 dark:border-green-500/30 w-fit uppercase tracking-wider">
                                      Verified Agent
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 text-[10px] font-bold border border-amber-500/20 dark:border-amber-500/30 w-fit uppercase tracking-wider">
                                      Vetting Pending
                                    </span>
                                  )}
                                  <span className="text-navy/60 dark:text-gray-400 text-[10px] flex items-center gap-1.5 mt-0.5">
                                    <span>{profileForm.responseTime}</span>
                                    <span className="text-gray-300 dark:text-gray-600">•</span>
                                    <span>Joined {agentData.joinedDate || "Oct 2025"}</span>
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-4 gap-2 mt-6 pt-6 border-t border-black/5 dark:border-white/10 text-center">
                              <div>
                                <p className="text-navy dark:text-white font-extrabold text-base">{isApproved ? (agentData.listings || []).length : "—"}</p>
                                <p className="text-navy/40 dark:text-gray-400 text-[9px] uppercase tracking-wider mt-0.5">Rooms</p>
                              </div>
                              <div>
                                <p className="text-navy dark:text-white font-extrabold text-base">{isApproved ? (agentData.stats?.avg_rating || "0.0") : "—"}</p>
                                <p className="text-navy/40 dark:text-gray-400 text-[9px] uppercase tracking-wider mt-0.5">Rating</p>
                              </div>
                              <div>
                                <p className="text-navy dark:text-white font-extrabold text-base">{isApproved ? "12" : "—"}</p>
                                <p className="text-navy/40 dark:text-gray-400 text-[9px] uppercase tracking-wider mt-0.5">Reviews</p>
                              </div>
                              <div>
                                <p className="text-navy dark:text-white font-extrabold text-base">{isApproved ? (agentData.stats?.total_views || 0) : "—"}</p>
                                <p className="text-navy/40 dark:text-gray-400 text-[9px] uppercase tracking-wider mt-0.5">Views</p>
                              </div>
                            </div>

                            {isApproved && (
                              <div className="mt-6 flex justify-between items-center gap-4">
                                <span className="text-[11px] text-navy/50 dark:text-gray-400 flex items-center gap-1.5">
                                  <Info className="h-3.5 w-3.5 text-gold" />
                                  Live view representation
                                </span>
                                <button
                                  onClick={async () => {
                                    const url = `${window.location.origin}/agents/${agentData.id || "agent1"}`;
                                    try {
                                      if (navigator.share) {
                                        await navigator.share({
                                          title: `${profileForm.full_name || "Agent"} - Agent Profile`,
                                          text: `Check out ${profileForm.full_name || "Agent"}'s properties on CampusHub!`,
                                          url,
                                        });
                                      } else {
                                        await navigator.clipboard.writeText(url);
                                        toast.success("Profile link copied to clipboard!");
                                      }
                                    } catch {
                                      await navigator.clipboard.writeText(url);
                                      toast.success("Profile link copied to clipboard!");
                                    }
                                  }}
                                  className="bg-navy/5 border border-navy/10 hover:bg-navy/10 text-navy dark:bg-white/10 dark:border-white/20 dark:hover:bg-white/20 dark:text-white h-10 px-4 rounded-full flex items-center justify-center gap-2 shadow-lg transition cursor-pointer text-xs font-bold"
                                  title="Share Profile"
                                >
                                  <Share2 className="h-4 w-4 text-gold" />
                                  <span>Share Profile</span>
                                </button>
                              </div>
                            )}
                          </CardContent>
                        </Card>

                        {/* CONDITIONAL SECTIONS RENDERED BELOW THE CARD */}
                        {!isApproved ? (
                          !agentData.ninUploaded ? (
                            <div className="text-left animate-in fade-in slide-in-from-bottom-4 duration-300">
                              <Card className="border-none shadow-lg bg-white dark:bg-[#0f1d2e] rounded-3xl p-6 sm:p-8">
                                <CardHeader className="p-0 pb-6 border-b border-gray-100 dark:border-white/10 mb-6">
                                  <CardTitle className="text-xl font-bold text-navy dark:text-white">Verify Your Account</CardTitle>
                                  <CardDescription className="text-muted-foreground mt-1">
                                    Complete the remaining onboarding tasks to submit your agent profile for admin review.
                                  </CardDescription>
                                </CardHeader>
                                <CardContent className="p-0 space-y-6">
                                  {/* Task List */}
                                  <div className="space-y-4">
                                    {/* Task 1: Email Verified */}
                                    <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-500/5 border border-emerald-500/10">
                                      <div className="flex items-center gap-3">
                                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white">
                                          <Check className="h-3 w-3" />
                                        </div>
                                        <span className="text-sm font-semibold text-navy dark:text-white">Email verified</span>
                                      </div>
                                      <Badge className="bg-emerald-500 text-white border-0 text-[10px] font-bold uppercase tracking-wider">Completed</Badge>
                                    </div>

                                    {/* Task 2: Phone Verification */}
                                    <div className={cn(
                                      "flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border transition-all gap-3",
                                      agentData.phoneVerified
                                        ? "bg-emerald-50/50 dark:bg-emerald-500/5 border-emerald-500/10"
                                        : "bg-gray-50/50 dark:bg-white/5 border-black/5 dark:border-white/5"
                                    )}>
                                      <div className="flex items-center gap-3">
                                        {agentData.phoneVerified ? (
                                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white">
                                            <Check className="h-3 w-3" />
                                          </div>
                                        ) : (
                                          <div className="h-5 w-5 rounded-full border-2 border-gray-300 dark:border-white/20" />
                                        )}
                                        <div className="text-left">
                                          <span className="text-sm font-semibold text-navy dark:text-white">Verify phone number</span>
                                          <p className="text-[10px] text-muted-foreground mt-0.5">{agentData.phone}</p>
                                        </div>
                                      </div>
                                      {!agentData.phoneVerified ? (
                                        <Button
                                          onClick={handleSendOtp}
                                          disabled={isSendingOtp}
                                          className="rounded-xl bg-gold hover:bg-gold/90 text-navy font-bold text-xs px-4 py-2 border-0 shadow-sm cursor-pointer"
                                        >
                                          {isSendingOtp ? "Sending..." : "Verify Now"}
                                        </Button>
                                      ) : (
                                        <Badge className="bg-emerald-500 text-white border-0 text-[10px] font-bold uppercase tracking-wider">Completed</Badge>
                                      )}
                                    </div>

                                    {/* Task 3: Image ID Upload */}
                                    <div className={cn(
                                      "flex flex-col p-4 rounded-2xl border transition-all space-y-4",
                                      previewImage
                                        ? "bg-emerald-50/50 dark:bg-emerald-500/5 border-emerald-500/10"
                                        : "bg-gray-50/50 dark:bg-white/5 border-black/5 dark:border-white/5"
                                    )}>
                                      <div className="flex items-center gap-3">
                                        {previewImage ? (
                                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white">
                                            <Check className="h-3 w-3" />
                                          </div>
                                        ) : (
                                          <div className="h-5 w-5 rounded-full border-2 border-gray-300 dark:border-white/20" />
                                        )}
                                        <span className="text-sm font-semibold text-navy dark:text-white">Upload image ID</span>
                                      </div>

                                      {/* Upload Area */}
                                      <div className="border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl p-6 flex flex-col items-center justify-center bg-gray-50 dark:bg-navy/10 relative overflow-hidden min-h-[160px]">
                                        {previewImage ? (
                                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white p-4">
                                            <img src={previewImage} alt="ID Preview" className="h-full w-full object-contain rounded-lg" />
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setPreviewImage(null);
                                                setSelectedFile(null);
                                              }}
                                              className="absolute top-2 right-2 bg-rose-500 hover:bg-rose-600 text-white rounded-full p-2 cursor-pointer border-0"
                                              disabled={ninUploading}
                                            >
                                              <X className="h-3 w-3" />
                                            </button>
                                          </div>
                                        ) : (
                                          <div className="flex flex-col items-center text-center">
                                            <Building2 className="h-6 w-6 text-muted-foreground mb-2" />
                                            <p className="font-bold text-xs text-navy dark:text-white">Upload your ID image (e.g. Driver License, Voter Card)</p>
                                            <p className="text-[10px] text-muted-foreground mt-0.5">Supports PNG, JPG up to 5MB</p>
                                            <label
                                              htmlFor="id-file-input"
                                              className="mt-3 px-3 py-1.5 rounded-lg bg-gold text-[#0f1e2d] font-bold text-[10px] hover:scale-105 transition cursor-pointer shadow-sm"
                                            >
                                              Select File
                                            </label>
                                            <input
                                              type="file"
                                              accept="image/*"
                                              onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                  setSelectedFile(file);
                                                  const reader = new FileReader();
                                                  reader.onloadend = () => {
                                                    setPreviewImage(reader.result as string);
                                                  };
                                                  reader.readAsDataURL(file);
                                                }
                                              }}
                                              className="hidden"
                                              id="id-file-input"
                                            />
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {uploadError && (
                                    <div className="p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-2xl text-xs space-y-2 leading-relaxed text-left">
                                      <span className="font-bold block uppercase tracking-wider text-[10px]">Upload Details Error</span>
                                      <p>{uploadError}</p>
                                      <p className="text-[10px] text-rose-500/80">Make sure your Firebase Storage rules permit open writes in test mode.</p>
                                    </div>
                                  )}

                                  <form onSubmit={handleNINSubmit} className="pt-2">
                                    <Button
                                      type="submit"
                                      disabled={!agentData.phoneVerified || !previewImage || ninUploading}
                                      className="w-full rounded-xl bg-gold hover:bg-gold/90 text-navy font-bold py-6 text-sm cursor-pointer flex items-center justify-center gap-2"
                                    >
                                      {ninUploading ? (
                                        <>
                                          <svg className="animate-spin h-5 w-5 text-navy" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                          </svg>
                                          Submitting ID to Firebase...
                                        </>
                                      ) : (
                                        "Submit for Verification"
                                      )}
                                    </Button>
                                  </form>
                                </CardContent>
                              </Card>
                            </div>
                          ) : (
                            /* Verification Pending State Card */
                            <div className="text-left animate-in fade-in slide-in-from-bottom-4 duration-300">
                              <Card className="border-none shadow-lg bg-[#0f1d2e] dark:bg-[#0f1d2e] border border-white/5 rounded-3xl overflow-hidden relative">
                                <CardContent className="p-8 relative z-10 flex flex-col items-center text-center text-white">
                                  <div className="p-4 bg-white/10 rounded-full text-gold mb-6 animate-pulse">
                                    <Clock className="h-10 w-10" />
                                  </div>
                                  <h3 className="text-xl font-bold text-white leading-tight mb-3">Verification Underway</h3>
                                  <p className="text-sm text-gray-300 leading-relaxed max-w-sm mb-4">
                                    We’re verifying your details. You’ll be able to list rooms as soon as an admin approves your account. This usually takes a few hours.
                                  </p>
                                  <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 mt-2">
                                    <span className="text-xs text-gold font-semibold uppercase tracking-wider block">Important Note</span>
                                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                                      You’ll receive an email when you’ve been approved.
                                    </p>
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          )
                        ) : (
                          /* Verified Agent Properties List (renders below card when verified) */
                          (!agentData.listings || agentData.listings.length === 0) ? (
                            <div className="text-left animate-in fade-in slide-in-from-bottom-4 duration-300 px-4 sm:px-0">
                              <Card className="border-none shadow-lg bg-white dark:bg-[#0f1d2e] border border-black/5 dark:border-white/10 rounded-3xl p-8 flex flex-col items-center text-center">
                                <div className="p-4 bg-gold/10 rounded-full text-gold mb-4 flex items-center justify-center">
                                  <PlusCircle className="h-10 w-10 stroke-[1.5]" />
                                </div>
                                <h3 className="text-lg font-bold text-navy dark:text-white leading-tight">You haven’t added any rooms yet.</h3>
                                <p className="text-xs text-muted-foreground mt-2 leading-relaxed max-w-sm">
                                  Start listing your available rooms to reach thousands of FUTO students.
                                </p>
                                <Button
                                  onClick={() => setActiveTab("add-listing")}
                                  className="mt-6 rounded-xl bg-gold hover:bg-gold/90 text-navy font-bold text-sm px-6 py-3.5 border-0 shadow-md cursor-pointer transition-all hover:scale-[1.02]"
                                >
                                  Add New Listing
                                </Button>
                              </Card>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div className="flex items-center justify-between px-4 sm:px-0">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-navy/40 dark:text-white/40">My Active Properties</h3>
                                <Badge variant="outline" className="bg-[#f7efe0] dark:bg-white/5 border-gold/20 text-gold">{(agentData.listings || []).length} Listed</Badge>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 px-4 sm:px-0">
                                {(agentData.listings || []).map((listing) => (
                                  <div key={listing.id} className="h-full cursor-pointer text-left" onClick={() => {
                                    setSelectedRoomForDetail(listing);
                                    setActiveTab("view-listing");
                                  }}>
                                    <LodgeCard
                                      name={listing.building_name}
                                      area={`${listing.area} · ${listing.landmark}`}
                                      price={formatNaira(listing.price)}
                                      badge={listing.availability === "available" ? "Available now" : listing.availability === "pending" ? "Pending" : "Rented"}
                                      photo={listing.photos[0]}
                                      href="#"
                                      availability={listing.availability === "available" ? "Available now" : listing.availability === "pending" ? "Pending" : "Rented"}
                                      roomType={listing.room_type}
                                      hideHeart={true}
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    )}

                    {/* Tab 2: Dashboard Overview */}
                    {activeTab === "overview" && (
                      !isApproved ? (
                        <PendingTabAlert />
                      ) : (
                        overviewLoading ? (
                          <div className="space-y-8 animate-pulse text-left">
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 px-6 sm:px-0">
                              {[1, 2, 3, 4].map(i => (
                                <div key={i} className="bg-white dark:bg-[#0f1d2e] rounded-3xl border border-black/5 dark:border-white/5 p-6 space-y-3">
                                  <div className="h-10 w-10 rounded-2xl bg-gray-200 dark:bg-white/5" />
                                  <div className="h-4 w-2/3 bg-gray-200 dark:bg-white/5 rounded" />
                                  <div className="h-6 w-1/2 bg-gray-200 dark:bg-white/5 rounded" />
                                </div>
                              ))}
                            </div>
                            <div className="space-y-4">
                              <div className="h-6 w-48 bg-gray-200 dark:bg-white/5 rounded px-6 sm:px-0" />
                              <div className="bg-white dark:bg-[#0f1d2e] rounded-[2rem] border border-black/5 dark:border-white/5 p-6 space-y-4">
                                {[1, 2, 3].map(i => (
                                  <div key={i} className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                      <div className="h-16 w-16 bg-gray-200 dark:bg-white/5 rounded-2xl animate-pulse" />
                                      <div className="space-y-2">
                                        <div className="h-4 w-40 bg-gray-200 dark:bg-white/5 rounded" />
                                        <div className="h-3 w-24 bg-gray-200 dark:bg-white/5 rounded" />
                                      </div>
                                    </div>
                                    <div className="h-6 w-16 bg-gray-200 dark:bg-white/5 rounded-full" />
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-8">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 px-6 sm:px-0">
                              <StatCard icon={Home} label="Total Listings" value={(agentData.listings || []).length} subtext="Active rooms" />
                              <StatCard icon={TrendingUp} label="Total Views" value={agentData.stats?.total_views || 0} subtext="Profile reach" />
                              <StatCard icon={MessageSquare} label="Inquiries" value="0" subtext="WhatsApp leads" />
                              <StatCard icon={Star} label="Avg. Rating" value={agentData.stats?.avg_rating || "0.0"} subtext="From students" />
                            </div>

                            {/* Recent Activity */}
                            <div className="space-y-4">
                              <div className="flex items-center justify-between px-6 sm:px-0">
                                <h2 className="text-xl font-bold text-navy dark:text-white">Recent Listings</h2>
                                <button onClick={() => setActiveTab("listings")} className="text-sm font-bold text-gold hover:underline">View all</button>
                              </div>

                              <div className="bg-white dark:bg-[#0f1d2e] rounded-none sm:rounded-[2rem] border-x-0 sm:border border-black/5 dark:border-white/5 shadow-sm overflow-hidden">
                                {((agentData.listings || []).length > 0) ? (
                                  <div className="divide-y divide-gray-50 dark:divide-white/5">
                                    {(agentData.listings || []).slice(0, 3).map((listing) => (
                                      <div key={listing.id} className="p-4 sm:p-6 flex flex-row items-center justify-between gap-4 hover:bg-gray-50 dark:hover:bg-white/5 transition">
                                        <div className="flex items-center gap-3 sm:gap-5 min-w-0">
                                          <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-xl sm:rounded-2xl bg-gray-100 dark:bg-white/5 overflow-hidden relative shrink-0">
                                            <img src={listing.photos[0]} alt="" className="h-full w-full object-cover" />
                                          </div>
                                          <div className="text-left min-w-0">
                                            <h3 className="font-bold text-navy dark:text-white text-sm sm:text-base truncate">{listing.building_name}</h3>
                                            <div className="flex items-center gap-2 sm:gap-3 mt-0.5 sm:mt-1 text-xs sm:text-sm text-muted-foreground">
                                              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {listing.area}</span>
                                              <span>•</span>
                                              <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {listing.created_at}</span>
                                            </div>
                                          </div>
                                        </div>
                                        <AvailabilityBadge status={listing.availability} />
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="py-20 text-center px-6">
                                    <p className="text-muted-foreground">You haven&apos;t added any rooms yet.</p>
                                    <button onClick={() => setActiveTab("add-listing")} className="mt-4 inline-flex text-gold font-bold hover:underline cursor-pointer">Add your first listing</button>
                                  </div>
                                )
                                }
                              </div>
                            </div>
                          </div>
                        )
                      )
                    )}

                    {/* Tab 3: Listings Tab */}
                    {activeTab === "listings" && (
                      !isApproved ? (
                        <PendingTabAlert />
                      ) : (
                        <div className="space-y-8 text-left">
                          <div className="flex items-center justify-between px-6 sm:px-0">
                            <div>
                              <p className="text-muted-foreground text-sm">Edit, update status, or remove your property listings.</p>
                            </div>
                            <Button onClick={() => setActiveTab("add-listing")} className="h-12 px-6 rounded-xl bg-gold hover:bg-gold/90 text-navy font-extrabold shadow-md flex items-center justify-center gap-2 border-0 cursor-pointer">
                              <Plus className="h-4.5 w-4.5 stroke-[3]" /> Add New Room
                            </Button>
                          </div>
                          {listingsLoading ? (
                            <div className="space-y-6 animate-pulse text-left">
                              {/* Desktop Table Skeleton */}
                              <div className="hidden md:block bg-white dark:bg-[#0f1d2e] rounded-[2rem] border border-black/5 dark:border-white/5 shadow-sm overflow-hidden p-6 space-y-4">
                                {[1, 2, 3, 4, 5].map(i => (
                                  <div key={i} className="flex items-center justify-between py-4 border-b border-black/5 dark:border-white/5 last:border-0">
                                    <div className="flex items-center gap-3">
                                      <div className="h-12 w-12 bg-gray-200 dark:bg-white/5 rounded-xl shrink-0" />
                                      <div className="space-y-2">
                                        <div className="h-4 w-44 bg-gray-200 dark:bg-white/5 rounded" />
                                        <div className="h-3 w-28 bg-gray-200 dark:bg-white/5 rounded" />
                                      </div>
                                    </div>
                                    <div className="h-4 w-20 bg-gray-200 dark:bg-white/5 rounded" />
                                    <div className="h-4 w-24 bg-gray-200 dark:bg-white/5 rounded" />
                                    <div className="h-4 w-24 bg-gray-200 dark:bg-white/5 rounded" />
                                    <div className="h-6 w-16 bg-gray-200 dark:bg-white/5 rounded-full" />
                                    <div className="h-8 w-16 bg-gray-200 dark:bg-white/5 rounded-lg" />
                                  </div>
                                ))}
                              </div>
                              {/* Mobile Cards Skeleton */}
                              <div className="md:hidden space-y-4">
                                {[1, 2, 3].map(i => (
                                  <div key={i} className="bg-white dark:bg-[#0f1d2e] rounded-2xl border border-black/5 dark:border-white/5 p-4 space-y-4">
                                    <div className="flex items-center gap-3">
                                      <div className="h-24 w-24 bg-gray-200 dark:bg-white/5 rounded-2xl shrink-0" />
                                      <div className="flex-1 space-y-2 text-left">
                                        <div className="h-4 w-2/3 bg-gray-200 dark:bg-white/5 rounded" />
                                        <div className="h-3 w-1/2 bg-gray-200 dark:bg-white/5 rounded" />
                                        <div className="h-3 w-3/4 bg-gray-200 dark:bg-white/5 rounded" />
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            (!agentData.listings || agentData.listings.length === 0) ? (
                              <div className="text-left animate-in fade-in slide-in-from-bottom-4 duration-300">
                                <Card className="border-none shadow-lg bg-white dark:bg-[#0f1d2e] border border-black/5 dark:border-white/10 rounded-3xl p-12 flex flex-col items-center text-center">
                                  <div className="p-4 bg-gold/10 rounded-full text-gold mb-4 flex items-center justify-center">
                                    <PlusCircle className="h-12 w-12 stroke-[1.5]" />
                                  </div>
                                  <h3 className="text-lg font-bold text-navy dark:text-white leading-tight">You haven’t added any rooms yet.</h3>
                                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed max-w-sm">
                                    Start listing your available rooms to reach thousands of FUTO students.
                                  </p>
                                  <Button
                                    onClick={() => setActiveTab("add-listing")}
                                    className="mt-6 h-12 px-6 rounded-xl bg-gold hover:bg-gold/90 text-navy font-extrabold text-sm border-0 shadow-md cursor-pointer transition-all hover:scale-[1.02]"
                                  >
                                    Add New Listing
                                  </Button>
                                </Card>
                              </div>
                            ) : (
                              <>
                                {/* Desktop Table View */}
                                <div className="hidden md:block bg-white dark:bg-[#0f1d2e] rounded-[2rem] border border-black/5 dark:border-white/5 shadow-sm overflow-hidden">
                                  <table className="w-full text-left">
                                    <thead>
                                      <tr className="border-b border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/5">
                                        <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-navy/40 dark:text-white/40">Listing Info</th>
                                        <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-navy/40 dark:text-white/40">Area</th>
                                        <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-navy/40 dark:text-white/40">First Payment</th>
                                        <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-navy/40 dark:text-white/40">To Pay</th>
                                        <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-navy/40 dark:text-white/40">Availability</th>
                                        <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-navy/40 dark:text-white/40 text-right">Actions</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                                      {(agentData.listings || []).map((listing) => (
                                        <tr
                                          key={listing.id}
                                          className="hover:bg-gray-50/80 dark:hover:bg-white/5 transition group"
                                        >
                                          <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                              <div className="h-12 w-12 rounded-xl bg-gray-100 dark:bg-white/5 overflow-hidden">
                                                <img src={listing.photos[0]} alt="" className="h-full w-full object-cover" />
                                              </div>
                                              <div className="text-left">
                                                <h4 className="font-bold text-navy dark:text-white text-sm">{listing.building_name}</h4>
                                                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mt-0.5">{listing.room_type}</p>
                                              </div>
                                            </div>
                                          </td>
                                          <td className="px-6 py-5 text-navy dark:text-gray-200 text-sm font-semibold">{listing.area}</td>
                                          <td className="px-6 py-5 text-navy dark:text-white font-bold text-sm">₦{listing.price.toLocaleString()}</td>
                                          <td className="px-6 py-5 text-navy/70 dark:text-gray-300 font-semibold text-sm">₦{listing.entryPrice?.toLocaleString()}/yr</td>
                                          <td className="px-6 py-5">
                                            <Select
                                              defaultValue={listing.availability}
                                              onValueChange={(val) => handleUpdateAvailability(listing.id, val as Availability)}
                                            >
                                              <SelectTrigger className="h-8 border-none bg-transparent p-0 focus:ring-0 w-fit">
                                                <AvailabilityBadge status={listing.availability} />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="available">Available</SelectItem>
                                                <SelectItem value="pending">Pending</SelectItem>
                                                <SelectItem value="rented">Rented</SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </td>
                                          <td className="px-6 py-5">
                                            <div className="flex gap-2 justify-end">
                                              <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => handleEditClick(listing)}
                                                className="h-8 w-8 rounded-lg border-navy/10 dark:border-white/10 hover:bg-navy/5 dark:hover:bg-white/5"
                                              >
                                                <Edit size={14} className="text-gray-500 dark:text-gray-400" />
                                              </Button>
                                              <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => handleDeleteListing(listing.id)}
                                                className="h-8 w-8 rounded-lg border-rose-100 hover:bg-rose-50 dark:border-rose-950/30"
                                              >
                                                <Trash2 size={14} className="text-rose-500" />
                                              </Button>
                                            </div>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>

                                {/* Mobile Card View */}
                                <div className="md:hidden space-y-4 px-0">
                                  {(agentData.listings || []).map((listing) => (
                                    <Card key={listing.id} className="border-none shadow-sm overflow-hidden bg-white dark:bg-[#0f1d2e] rounded-none sm:rounded-2xl border-x-0 sm:border">
                                      <CardContent className="p-3">
                                        <div className="flex items-center gap-3">
                                          <div className="h-24 w-24 rounded-2xl overflow-hidden relative shrink-0">
                                            <img src={listing.photos[0]} alt="" className="h-full w-full object-cover" />
                                          </div>
                                          <div className="flex-grow min-w-0 flex flex-col justify-between h-24 text-left">
                                            <div>
                                              <div className="flex justify-between items-start gap-2">
                                                <h3 className="font-bold text-navy dark:text-white leading-tight text-sm truncate">{listing.room_type}</h3>
                                                <div className="text-right shrink-0">
                                                  <p className="text-xs font-bold text-navy dark:text-white">FP: ₦{(listing.price / 1000).toFixed(0)}k</p>
                                                  <p className="text-[10px] text-gold font-bold">To Pay: ₦{((listing.entryPrice || 0) / 1000).toFixed(0)}k/yr</p>
                                                </div>
                                              </div>
                                              <p className="text-xs text-muted-foreground mt-0.5 truncate">{listing.building_name}</p>
                                              <p className="text-[10px] text-muted-foreground/80 mt-0.5 truncate">{listing.area} · {listing.landmark}</p>
                                            </div>
                                            <div className="flex items-center justify-between mt-1">
                                              <Select
                                                defaultValue={listing.availability}
                                                onValueChange={(val) => handleUpdateAvailability(listing.id, val as Availability)}
                                              >
                                                <SelectTrigger className="h-7 border-none bg-transparent p-0 focus:ring-0 w-fit">
                                                  <AvailabilityBadge status={listing.availability} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                  <SelectItem value="available">Available</SelectItem>
                                                  <SelectItem value="pending">Pending</SelectItem>
                                                  <SelectItem value="rented">Rented</SelectItem>
                                                </SelectContent>
                                              </Select>
                                              <div className="flex gap-1 shrink-0">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-navy dark:text-white hover:bg-navy/5" onClick={() => handleEditClick(listing)}>
                                                  <Edit className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500 hover:bg-rose-50" onClick={() => handleDeleteListing(listing.id)}>
                                                  <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  ))}
                                </div>
                              </>
                            )
                          )}
                        </div>
                      )
                    )}

                    {activeTab === "edit-listing" && (
                      !isApproved ? (
                        <PendingTabAlert />
                      ) : (
                        <div className="space-y-6 text-left">
                          <div className="bg-white dark:bg-[#0f1d2e] rounded-none sm:rounded-[2rem] border border-black/5 dark:border-white/5 shadow-sm overflow-hidden">
                            <div className="p-6 sm:p-8 border-b border-gray-100 dark:border-white/10 bg-[#0f1e2d] text-white flex items-center gap-4">
                              <button
                                type="button"
                                onClick={handleGoBackToListings}
                                className="p-2 rounded-full hover:bg-white/10 text-white transition cursor-pointer"
                                aria-label="Go back to listings"
                              >
                                <ArrowLeft className="h-6 w-6 text-gold" />
                              </button>
                              <div>
                                <h2 className="text-xl sm:text-2xl font-bold">Edit Room Listing</h2>
                                <p className="text-white/60 text-xs sm:text-sm mt-1">
                                  Update your property details to attract more students.
                                </p>
                              </div>
                            </div>

                            {editingListing && (
                              <form onSubmit={handleSaveEdit} className="space-y-6 p-6 sm:p-8">
                                <div className="space-y-6">
                                  {/* Basic Info */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                      <Label className="text-xs font-extrabold uppercase tracking-wider text-navy/70 dark:text-white/70">Room Type</Label>
                                      <Select
                                        value={editingListing.room_type}
                                        onValueChange={(val) => setEditingListing({ ...editingListing, room_type: val ?? "" })}
                                      >
                                        <SelectTrigger className="h-12 px-4 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/30 dark:bg-white/5 text-navy dark:text-white font-semibold">
                                          <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {ROOM_TYPES.map(type => (
                                            <SelectItem key={type} value={type}>{type}</SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="space-y-2">
                                      <Label className="text-xs font-extrabold uppercase tracking-wider text-navy/70 dark:text-white/70">First Payment (₦)</Label>
                                      <Input
                                        type="number"
                                        value={editingListing.price}
                                        onChange={(e) => setEditingListing({ ...editingListing, price: parseInt(e.target.value) || 0 })}
                                        className="h-12 px-4 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/30 dark:bg-white/5 text-navy dark:text-white font-semibold"
                                      />
                                      <p className="text-[10px] text-muted-foreground">The initial amount a student pays (including security, caution fee, etc.)</p>
                                    </div>
                                    <div className="space-y-2">
                                      <Label className="text-xs font-extrabold uppercase tracking-wider text-navy/70 dark:text-white/70">To Pay (₦)</Label>
                                      <Input
                                        type="number"
                                        value={editingListing.entryPrice || ""}
                                        onChange={(e) => setEditingListing({ ...editingListing, entryPrice: parseInt(e.target.value) || 0 })}
                                        className="h-12 px-4 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/30 dark:bg-white/5 text-navy dark:text-white font-semibold"
                                        placeholder="e.g. 100000"
                                      />
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                      <Label className="text-xs font-extrabold uppercase tracking-wider text-navy/70 dark:text-white/70">Area</Label>
                                      <Input
                                        value={editingListing.area}
                                        onChange={(e) => setEditingListing({ ...editingListing, area: e.target.value })}
                                        className="h-12 px-4 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/30 dark:bg-white/5 text-navy dark:text-white font-semibold"
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label className="text-xs font-extrabold uppercase tracking-wider text-navy/70 dark:text-white/70">Lodge/Building Name</Label>
                                      <Input
                                        value={editingListing.building_name}
                                        onChange={(e) => setEditingListing({ ...editingListing, building_name: e.target.value })}
                                        className="h-12 px-4 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/30 dark:bg-white/5 text-navy dark:text-white font-semibold"
                                      />
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                    <Label className="text-xs font-extrabold uppercase tracking-wider text-navy/70 dark:text-white/70">Landmark</Label>
                                    <Input
                                      value={editingListing.landmark}
                                      onChange={(e) => setEditingListing({ ...editingListing, landmark: e.target.value })}
                                      className="h-12 px-4 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/30 dark:bg-white/5 text-navy dark:text-white font-semibold"
                                      placeholder="e.g. Near FUTO main gate"
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <Label className="text-xs font-extrabold uppercase tracking-wider text-navy/70 dark:text-white/70">Description</Label>
                                    <Textarea
                                      value={editingListing.description}
                                      onChange={(e) => setEditingListing({ ...editingListing, description: e.target.value })}
                                      className="py-3 px-4 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/30 dark:bg-white/5 text-navy dark:text-white font-semibold min-h-[100px]"
                                      placeholder="Tell students more about the room..."
                                    />
                                  </div>

                                  {/* Amenities */}
                                  <div className="space-y-3">
                                    <Label className="text-xs font-extrabold uppercase tracking-wider text-navy/70 dark:text-white/70">Amenities</Label>
                                    <div className="flex flex-wrap gap-2">
                                      {AMENITY_OPTIONS.map((amenity) => {
                                        const active = editingListing.amenities.includes(amenity);
                                        return (
                                          <button
                                            key={amenity}
                                            type="button"
                                            onClick={() => toggleAmenity(amenity)}
                                            className={cn(
                                              "px-4 py-2 rounded-full text-xs font-bold border transition-all cursor-pointer",
                                              active
                                                ? "bg-gold/10 border-gold text-gold"
                                                : "bg-transparent border-gray-200 dark:border-white/10 text-navy/40 dark:text-white/40 hover:border-navy/20"
                                            )}
                                          >
                                            {amenity}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>

                                  {/* Photos */}
                                  <div className="space-y-3">
                                    <Label className="text-xs font-extrabold uppercase tracking-wider text-navy/70 dark:text-white/70">Photos</Label>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                      {editingListing.photos.map((photo, i) => (
                                        <div key={i} className="aspect-square rounded-xl bg-gray-100 overflow-hidden relative group">
                                          <img src={photo} alt="" className="h-full w-full object-cover" />
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setEditingListing({
                                                ...editingListing,
                                                photos: editingListing.photos.filter((_, idx) => idx !== i)
                                              });
                                              toast.success("Photo removed");
                                            }}
                                            className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition cursor-pointer"
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </button>
                                        </div>
                                      ))}
                                      <button
                                        type="button"
                                        className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:border-gold hover:text-gold transition group cursor-pointer"
                                        onClick={() => {
                                          const newPhoto = `https://picsum.photos/400/300?random=${Date.now()}`;
                                          setEditingListing({ ...editingListing, photos: [...editingListing.photos, newPhoto] });
                                          toast.success("Photo added (simulated)");
                                        }}
                                      >
                                        <Plus className="h-5 w-5" />
                                        <span className="text-[10px] mt-1 font-bold uppercase">Add</span>
                                      </button>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                                      <Info className="h-3 w-3" /> Photo uploads are simulated in this version.
                                    </p>
                                  </div>
                                </div>

                                <div className="border-t border-gray-100 dark:border-white/10 pt-6 flex justify-end gap-3">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={handleGoBackToListings}
                                    className="h-12 px-6 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer border-0"
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    type="submit"
                                    className="h-12 px-8 rounded-xl bg-gold hover:bg-gold/90 text-navy font-extrabold shadow-md border-0 cursor-pointer"
                                  >
                                    Save Changes
                                  </Button>
                                </div>
                              </form>
                            )}
                          </div>
                        </div>
                      )
                    )}

                    {/* Tab: Add Listing Page */}
                    {activeTab === "add-listing" && (
                      !isApproved ? (
                        <PendingTabAlert />
                      ) : (
                        <div className="space-y-6 text-left">
                          <div className="bg-white dark:bg-[#0f1d2e] rounded-none sm:rounded-[2rem] border border-black/5 dark:border-white/5 shadow-sm overflow-hidden">
                            <div className="p-6 sm:p-8 border-b border-gray-100 dark:border-white/10 bg-[#0f1e2d] text-white flex items-center gap-4">
                              <button
                                type="button"
                                onClick={handleGoBackToListings}
                                className="p-2 rounded-full hover:bg-white/10 text-white transition cursor-pointer"
                                aria-label="Go back to listings"
                              >
                                <ArrowLeft className="h-6 w-6 text-gold" />
                              </button>
                              <div>
                                <h2 className="text-xl sm:text-2xl font-bold">Add New Lodge Listing</h2>
                                <p className="text-white/60 text-xs sm:text-sm mt-1">
                                  List a new property unit to thousands of students at FUTO.
                                </p>
                              </div>
                            </div>

                            <form onSubmit={handleCreateListingSubmit} className="space-y-8 p-6 sm:p-8">
                              {/* Lodge details block */}
                              <div className="space-y-6">
                                <h3 className="text-base font-bold text-navy dark:text-white border-b border-gray-100 dark:border-white/5 pb-2">Lodge Details</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="space-y-2">
                                    <Label htmlFor="new_building_name" className="text-xs font-extrabold uppercase tracking-wider text-navy/70 dark:text-white/70">Lodge/Building Name</Label>
                                    <Input
                                      id="new_building_name"
                                      placeholder="e.g. Eziobodo Student Haven"
                                      value={newListingForm.building_name}
                                      onChange={(e) => setNewListingForm({ ...newListingForm, building_name: e.target.value })}
                                      className="h-12 px-4 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/30 dark:bg-white/5 text-navy dark:text-white font-semibold focus:border-gold focus:ring-gold"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="new_room_type" className="text-xs font-extrabold uppercase tracking-wider text-navy/70 dark:text-white/70">Room Type</Label>
                                    <Select
                                      value={newListingForm.room_type}
                                      onValueChange={(val) => setNewListingForm({ ...newListingForm, room_type: val ?? "Self-contain" })}
                                    >
                                      <SelectTrigger id="new_room_type" className="h-12 px-4 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/30 dark:bg-white/5 text-navy dark:text-white font-semibold">
                                        <SelectValue placeholder="Select room type" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {ROOM_TYPES.map((type) => (
                                          <SelectItem key={type} value={type}>{type}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="space-y-2">
                                    <Label htmlFor="new_price" className="text-xs font-extrabold uppercase tracking-wider text-navy/70 dark:text-white/70">First Payment (₦)</Label>
                                    <Input
                                      id="new_price"
                                      type="number"
                                      placeholder="e.g. 250000"
                                      value={newListingForm.price}
                                      onChange={(e) => setNewListingForm({ ...newListingForm, price: e.target.value })}
                                      className="h-12 px-4 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/30 dark:bg-white/5 text-navy dark:text-white font-semibold focus:border-gold focus:ring-gold"
                                    />
                                    <p className="text-[10px] text-muted-foreground">The initial amount a student pays (including security, caution fee, etc.)</p>
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="new_entryPrice" className="text-xs font-extrabold uppercase tracking-wider text-navy/70 dark:text-white/70">To Pay (₦)</Label>
                                    <Input
                                      id="new_entryPrice"
                                      type="number"
                                      placeholder="e.g. 100000"
                                      value={newListingForm.entryPrice}
                                      onChange={(e) => setNewListingForm({ ...newListingForm, entryPrice: e.target.value })}
                                      className="h-12 px-4 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/30 dark:bg-white/5 text-navy dark:text-white font-semibold focus:border-gold focus:ring-gold"
                                    />
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="space-y-2">
                                    <Label htmlFor="new_area" className="text-xs font-extrabold uppercase tracking-wider text-navy/70 dark:text-white/70">Lodge Location / Area</Label>
                                    <Select
                                      value={newListingForm.area}
                                      onValueChange={(val) => setNewListingForm({ ...newListingForm, area: val ?? "Eziobodo" })}
                                    >
                                      <SelectTrigger id="new_area" className="h-12 px-4 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/30 dark:bg-white/5 text-navy dark:text-white font-semibold">
                                        <SelectValue placeholder="Select location" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {AREAS.map((area) => (
                                          <SelectItem key={area} value={area}>{area}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="new_landmark" className="text-xs font-extrabold uppercase tracking-wider text-navy/70 dark:text-white/70">Landmark Description</Label>
                                    <Input
                                      id="new_landmark"
                                      placeholder="e.g. Behind the Student Gate"
                                      value={newListingForm.landmark}
                                      onChange={(e) => setNewListingForm({ ...newListingForm, landmark: e.target.value })}
                                      className="h-12 px-4 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/30 dark:bg-white/5 text-navy dark:text-white font-semibold focus:border-gold focus:ring-gold"
                                    />
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="new_description" className="text-xs font-extrabold uppercase tracking-wider text-navy/70 dark:text-white/70">Listing Description</Label>
                                  <Textarea
                                    id="new_description"
                                    placeholder="Provide details about the lodge, security, electricity access, water, distance from road, flatmate guidelines, etc."
                                    value={newListingForm.description}
                                    onChange={(e) => setNewListingForm({ ...newListingForm, description: e.target.value })}
                                    className="py-3 px-4 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/30 dark:bg-white/5 text-navy dark:text-white font-semibold focus:border-gold focus:ring-gold min-h-[120px]"
                                  />
                                </div>
                              </div>

                              {/* Amenities block */}
                              <div className="space-y-4">
                                <h3 className="text-base font-bold text-navy dark:text-white border-b border-gray-100 dark:border-white/5 pb-2">Amenities</h3>
                                <Label className="text-xs text-navy/70 dark:text-white/70 font-extrabold uppercase tracking-wider block">Select all building highlights and amenities that apply to this lodge.</Label>
                                <div className="flex flex-wrap gap-2.5 pt-1">
                                  {AMENITY_OPTIONS.map((amenity) => {
                                    const active = newListingAmenities.includes(amenity);
                                    return (
                                      <button
                                        key={amenity}
                                        type="button"
                                        onClick={() => handleNewListingAmenityToggle(amenity)}
                                        className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all duration-200 cursor-pointer ${active
                                          ? "bg-gold/10 border-gold text-gold shadow-sm"
                                          : "bg-transparent border-gray-200 dark:border-white/10 text-navy/60 dark:text-white/60 hover:border-navy/30 dark:hover:border-white/30"
                                          }`}
                                      >
                                        {amenity}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Photos upload block */}
                              <div className="space-y-4">
                                <h3 className="text-base font-bold text-navy dark:text-white border-b border-gray-100 dark:border-white/5 pb-2">Photos</h3>
                                <Label className="text-xs text-navy/70 dark:text-white/70 font-extrabold uppercase tracking-wider block">Upload pictures of the room. First photo will be used as the main preview card.</Label>

                                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                                  {newListingPhotos.map((photo, index) => (
                                    <div key={index} className="aspect-square rounded-2xl overflow-hidden relative border border-gray-100 group shadow-sm bg-gray-50">
                                      <img src={photo} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                                      <button
                                        type="button"
                                        onClick={() => handleNewListingRemovePhoto(index)}
                                        className="absolute inset-0 bg-black/55 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                                        title="Remove photo"
                                      >
                                        <Trash2 className="h-5 w-5 hover:scale-110 transition-transform" />
                                      </button>
                                    </div>
                                  ))}

                                  <label className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/10 flex flex-col items-center justify-center text-gray-400 hover:border-gold hover:text-gold transition-all duration-200 group cursor-pointer bg-transparent hover:bg-gold/5">
                                    <Plus className="h-6 w-6 group-hover:scale-110 transition-transform" />
                                    <span className="text-[10px] mt-1.5 font-bold uppercase tracking-wider">Upload Image</span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      multiple
                                      onChange={handleNewListingPhotoUpload}
                                      className="hidden"
                                      id="new_listing_photo_input"
                                      aria-label="Upload listing photo"
                                    />
                                  </label>
                                </div>

                                {newListingPhotos.length === 0 && (
                                  <p className="text-[10px] text-muted-foreground flex items-center gap-1.5 bg-gold/5 dark:bg-gold/10 p-3 rounded-xl border border-gold/10 text-gold font-medium w-fit">
                                    <Info className="h-4.5 w-4.5" />
                                    No photos uploaded yet. We will automatically assign a premium room image based on the selected Room Type as a fallback.
                                  </p>
                                )}
                              </div>

                              {/* Form Action buttons */}
                              <div className="border-t border-gray-100 dark:border-white/5 pt-6 flex justify-end gap-3 font-sans">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  onClick={handleGoBackToListings}
                                  className="h-12 px-6 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer border-0"
                                  disabled={newListingLoading}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  type="submit"
                                  className="h-12 px-8 rounded-xl bg-gold hover:bg-gold/90 text-navy font-extrabold shadow-lg shadow-gold/20 flex items-center gap-2 cursor-pointer border-0"
                                  disabled={newListingLoading}
                                >
                                  {newListingLoading ? (
                                    <>
                                      <Plus className="h-4 w-4 animate-spin" />
                                      Saving Listing...
                                    </>
                                  ) : (
                                    "Publish Listing"
                                  )}
                                </Button>
                              </div>
                            </form>
                          </div>
                        </div>
                      )
                    )}

                    {/* Tab: View Listing details page inline */}
                    {activeTab === "view-listing" && (
                      !isApproved ? (
                        <PendingTabAlert />
                      ) : (
                        selectedRoomForDetail && (
                          <div className="space-y-6 text-left">
                            {/* Back button and title */}
                            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 px-4 sm:px-0">
                              <button
                                type="button"
                                onClick={handleGoBackFromRoomDetail}
                                className="inline-flex items-center gap-2 rounded-full border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0f1d2e] px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm transition hover:border-gold hover:text-gold cursor-pointer"
                              >
                                <ArrowLeft className="h-4 w-4" />
                                Back to profile
                              </button>
                              <div className="inline-flex items-center gap-2 rounded-full border border-[#C9952A]/15 bg-[#C9952A]/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#8f6d18]">
                                <ImageIcon className="h-4 w-4" />
                                Room detail
                              </div>
                            </div>

                            <div className="grid gap-8 lg:grid-cols-[100%] lg:items-start max-w-4xl mx-auto">
                              <div className="space-y-6 min-w-0">
                                <div className="rounded-4xl border border-black/5 dark:border-white/5 bg-white dark:bg-[#0f1d2e] p-4 shadow-sm sm:p-5">
                                  <div className="flex items-center justify-between gap-3 px-1 pb-4">
                                    <div>
                                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold">
                                        {selectedRoomForDetail.room_type}
                                      </p>
                                      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-navy dark:text-white sm:text-3xl">
                                        {selectedRoomForDetail.building_name}
                                      </h1>
                                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{selectedRoomForDetail.area} · {selectedRoomForDetail.landmark}</p>
                                    </div>
                                    <div className="hidden rounded-2xl bg-[#f7efe0] dark:bg-white/5 px-4 py-3 text-right sm:block">
                                      <p className="text-xs uppercase tracking-[0.24em] text-gray-500 dark:text-gray-400">First Payment</p>
                                      <p className="mt-1 text-lg font-semibold text-navy dark:text-gold">{formatNaira(selectedRoomForDetail.price)}</p>
                                    </div>
                                  </div>

                                  <div className="space-y-3">
                                    {/* Main Photo Display */}
                                    <div
                                      className="relative h-64 sm:h-105 w-full overflow-hidden rounded-3xl border border-black/5 dark:border-white/5 bg-gray-100 dark:bg-white/5 group cursor-pointer"
                                      onTouchStart={handleTouchStart}
                                      onTouchEnd={(e) => handleTouchEnd(e, selectedRoomForDetail.photos.length)}
                                    >
                                      <img
                                        src={selectedRoomForDetail.photos[activePhotoIndex]}
                                        alt={`${selectedRoomForDetail.building_name} photo ${activePhotoIndex + 1}`}
                                        className="h-full w-full object-cover transition-all duration-300"
                                      />

                                      {/* Overlay indicators */}
                                      <span className="absolute left-4 top-4 rounded-full bg-black/55 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                                        Photo {activePhotoIndex + 1} of {selectedRoomForDetail.photos.length}
                                      </span>

                                      {/* Left Arrow */}
                                      {selectedRoomForDetail.photos.length > 1 && (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setActivePhotoIndex((prev) =>
                                              prev === 0 ? selectedRoomForDetail.photos.length - 1 : prev - 1
                                            )
                                          }
                                          className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur transition hover:bg-black/60 opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                                          aria-label="Previous photo"
                                        >
                                          <ChevronLeft className="h-6 w-6" />
                                        </button>
                                      )}

                                      {/* Right Arrow */}
                                      {selectedRoomForDetail.photos.length > 1 && (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setActivePhotoIndex((prev) =>
                                              prev === selectedRoomForDetail.photos.length - 1 ? 0 : prev + 1
                                            )
                                          }
                                          className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur transition hover:bg-black/60 opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                                          aria-label="Next photo"
                                        >
                                          <ChevronRight className="h-6 w-6" />
                                        </button>
                                      )}
                                    </div>

                                    {/* Thumbnails */}
                                    <div className="flex gap-2 overflow-x-auto py-1 w-full max-w-full">
                                      {selectedRoomForDetail.photos.map((photo, index) => (
                                        <button
                                          key={photo}
                                          type="button"
                                          onClick={() => setActivePhotoIndex(index)}
                                          className={`h-16 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition cursor-pointer ${activePhotoIndex === index ? "border-gold shadow-md" : "border-gray-200 dark:border-white/10 opacity-60 hover:opacity-100"}`}
                                        >
                                          <img src={photo} alt="Thumbnail" className="h-full w-full object-cover" />
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                </div>

                                <div className="grid gap-6">
                                  <div className="rounded-2xl border border-black/5 dark:border-white/5 bg-white dark:bg-[#0f1d2e] p-6 lg:p-8 shadow-sm">
                                    <div className="flex flex-wrap items-center gap-3">
                                      <span className="rounded-full bg-[#f7efe0] dark:bg-white/5 px-4 py-2 text-sm font-semibold text-navy dark:text-white">
                                        {selectedRoomForDetail.room_type}
                                      </span>
                                      <span className={`rounded-full px-4 py-2 text-sm font-semibold ${selectedRoomForDetail.availability === "available" ? "bg-emerald-100 text-emerald-700" : selectedRoomForDetail.availability === "pending" ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"}`}>
                                        {selectedRoomForDetail.availability.charAt(0).toUpperCase() + selectedRoomForDetail.availability.slice(1)}
                                      </span>
                                      <span className="rounded-full bg-gray-100 dark:bg-white/10 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        First Payment {formatNaira(selectedRoomForDetail.price)}
                                      </span>
                                      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 dark:bg-blue-950/30 px-4 py-2 text-sm font-semibold text-blue-700 dark:text-blue-400">
                                        <Eye className="h-4 w-4" />
                                        {selectedRoomForDetail.viewsCount ?? 0} Views
                                      </span>
                                    </div>

                                    <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                      <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                                        <p className="mt-1 text-base font-medium text-gray-700 dark:text-white">{selectedRoomForDetail.area} · {selectedRoomForDetail.landmark}</p>
                                      </div>

                                      <div className="mt-3 lg:mt-0 text-right">
                                        <p className="text-sm text-gray-500 dark:text-gray-400">To pay</p>
                                        <p className="mt-1 text-3xl font-extrabold text-navy dark:text-white lg:text-4xl">{formatNaira(selectedRoomForDetail.entryPrice || 0)}/yr</p>
                                      </div>
                                    </div>

                                    <div className="mt-6">
                                      <h2 className="text-lg font-semibold text-navy dark:text-white">Highlights & amenities</h2>
                                      <div className="mt-3 grid auto-rows-auto grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                                        {selectedRoomForDetail.amenities.map((amenity) => (
                                          <span key={amenity} className="inline-flex items-center justify-center rounded-lg border border-gray-200 dark:border-white/10 bg-[#fcfcfc] dark:bg-white/5 px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
                                            {amenity}
                                          </span>
                                        ))}
                                      </div>
                                    </div>

                                    {/* About Section */}
                                    <div className="mt-6">
                                      <h2 className="text-lg font-semibold text-navy dark:text-white">About This Apartment</h2>
                                      <p className="mt-3 text-sm leading-relaxed text-navy/70 dark:text-gray-300 whitespace-pre-line bg-gray-50/50 dark:bg-navy/10 p-5 rounded-2xl border border-gray-100 dark:border-white/5">
                                        {selectedRoomForDetail.description || "No description provided for this room listing."}
                                      </p>
                                    </div>

                                    <div className="mt-6 rounded-2xl border border-black/5 dark:border-white/5 bg-[#fcfcfc] dark:bg-white/5 p-6 shadow-sm">
                                      <h3 className="text-base font-semibold text-navy dark:text-white mb-4">Lodge & Building Details</h3>
                                      <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Name</p>
                                          <p className="text-sm font-medium text-navy dark:text-white">{selectedRoomForDetail.building_name}</p>
                                        </div>
                                        <div className="space-y-2">
                                          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Location / Landmark</p>
                                          <p className="text-sm font-medium text-navy dark:text-white">{selectedRoomForDetail.area} · {selectedRoomForDetail.landmark}</p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      )
                    )}

                    {/* Tab 4: Notifications */}
                    {activeTab === "notifications" && (
                      !isApproved ? (
                        <PendingTabAlert />
                      ) : (
                        <div className="space-y-6 text-left">
                          <div className="bg-white dark:bg-[#0f1d2e] rounded-none sm:rounded-[2rem] border border-black/5 dark:border-white/5 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-100 dark:border-white/10">
                              <h2 className="text-lg font-bold text-navy dark:text-white">Recent Inquiries & Notifications</h2>
                            </div>
                            <div className="divide-y divide-gray-100 dark:divide-white/10">
                              {notifications.length > 0 ? (
                                notifications.map((notif) => (
                                  <div key={notif.id} className="p-6 flex items-start gap-4 hover:bg-gray-50 dark:hover:bg-white/5 transition">
                                    <div className="p-2 bg-green-500/10 text-green-500 rounded-xl">
                                      <Bell size={20} />
                                    </div>
                                    <div className="flex-grow">
                                      <p className="text-sm font-bold text-navy dark:text-white">{notif.text}</p>
                                      <p className="text-xs text-muted-foreground mt-1">{notif.date}</p>
                                    </div>
                                    {!notif.read && (
                                      <span className="h-2.5 w-2.5 rounded-full bg-[#C9952A]" />
                                    )}
                                  </div>
                                ))
                              ) : (
                                <div className="py-16 px-6 flex flex-col items-center justify-center text-center">
                                  <div className="p-4 bg-gold/10 rounded-full text-gold mb-4 flex items-center justify-center">
                                    <Bell size={40} className="stroke-[1.5]" />
                                  </div>
                                  <h3 className="text-lg font-bold text-navy dark:text-white leading-tight">All caught up!</h3>
                                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed max-w-xs">
                                    We’ll notify you here when FUTO students make inquiries or review your listings.
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    )}

                    {/* Tab 5: Settings Tab */}
                    {activeTab === "settings" && (
                      <div className="max-w-4xl mx-auto text-left space-y-6">
                        {/* Settings Title Header */}
                        <div className="mb-4 md:mb-8 text-left p-4">
                          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-navy dark:text-white">
                            Settings
                          </h1>
                          <p className="text-muted-foreground text-xs md:text-sm mt-1">
                            Manage your account settings and preferences
                          </p>
                        </div>

                        <div className="flex flex-col lg:flex-row gap-8 text-left">
                          {/* Left Sidebar categories panel */}
                          <div className="w-full lg:w-64 shrink-0">
                            <div className="rounded-3xl bg-white dark:bg-gradient-to-br dark:from-[#0f1d2e] dark:to-[#162535] p-4 border border-black/5 dark:border-white/5 space-y-1 shadow-sm">
                              {[
                                { id: 'profile', label: 'Profile', icon: User },
                                { id: 'account', label: 'Account', icon: Settings },
                                { id: 'security', label: 'Security', icon: Shield },
                                { id: 'appearance', label: 'Appearance', icon: Palette },
                                { id: 'notifications', label: 'Notifications', icon: Bell },
                                { id: 'danger', label: 'Danger Zone', icon: AlertTriangle }
                              ].map(cat => {
                                const isSubActive = settingsTab === cat.id;
                                return (
                                  <button
                                    key={cat.id}
                                    onClick={() => setSettingsTab(cat.id as any)}
                                    className={cn(
                                      "w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all duration-150 cursor-pointer border-0",
                                      isSubActive
                                        ? "bg-gold text-navy shadow-md shadow-gold/20"
                                        : "text-gray-550 dark:text-gray-400 hover:bg-gray-55/10 dark:hover:bg-white/5 hover:text-navy dark:hover:text-white"
                                    )}
                                  >
                                    <cat.icon className="w-4 h-4 shrink-0" />
                                    <span>{cat.label}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Right content panel */}
                          <div className="flex-grow">
                            <div className="rounded-3xl bg-white dark:bg-gradient-to-br dark:from-[#0f1d2e] dark:to-[#162535] p-6 md:p-8 border border-black/5 dark:border-white/5 shadow-sm min-h-[400px] overflow-hidden">
                              <AnimatePresence mode="wait">

                                {/* Sub-tab 1: Profile Settings */}
                                {settingsTab === 'profile' && (
                                  <motion.div
                                    key="profile"
                                    initial={{ opacity: 0, x: 16 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -16 }}
                                    transition={{ duration: 0.15 }}
                                  >
                                    <form onSubmit={handleUpdateAgentProfile} className="space-y-6">
                                      <div className="space-y-1 text-left">
                                        <h3 className="text-xl font-bold text-navy dark:text-white">Profile Settings</h3>
                                        <p className="text-xs text-gray-550 dark:text-gray-400">Manage your public agent card details</p>
                                      </div>

                                      {/* Profile Photo upload */}
                                      <div className="border-b border-black/5 dark:border-white/5 pb-6">
                                        <div className="flex items-center gap-4">
                                          <div className="relative">
                                            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-navy/5 dark:bg-white/5 text-2xl font-bold text-gold ring-4 ring-white dark:ring-[#0f1d2e] shadow-md overflow-hidden">
                                              {profileForm.photo ? (
                                                <img src={profileForm.photo} alt="Avatar" className="h-full w-full object-cover" />
                                              ) : (
                                                "AG"
                                              )}
                                            </div>
                                            <button
                                              type="button"
                                              onClick={() => document.getElementById("settings-avatar-upload")?.click()}
                                              className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-gold text-navy shadow-md ring-2 ring-white dark:ring-[#0f1d2e] hover:scale-105 transition cursor-pointer border-0"
                                            >
                                              <Edit className="h-3 w-3" />
                                            </button>
                                            <input
                                              id="settings-avatar-upload"
                                              type="file"
                                              accept="image/*"
                                              className="hidden"
                                              onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                  setSelectedDpFile(file);
                                                  const reader = new FileReader();
                                                  reader.onloadend = () => {
                                                    setTempPhoto(reader.result as string);
                                                    setIsPhotoModalOpen(true);
                                                  };
                                                  reader.readAsDataURL(file);
                                                }
                                              }}
                                            />
                                          </div>
                                          <div>
                                            <h4 className="text-sm font-bold text-navy dark:text-white">Profile Picture</h4>
                                            <p className="text-[11px] text-gray-550 dark:text-gray-400 mt-0.5">JPG or PNG. Max 2MB.</p>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="grid gap-4 sm:grid-cols-2">
                                        {/* Full Name */}
                                        <div className="space-y-1.5">
                                          <Label className="text-xs font-extrabold uppercase tracking-wider text-navy/70 dark:text-white/70">Full Name</Label>
                                          <Input
                                            value={profileForm.full_name}
                                            onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                                            className="h-12 rounded-xl py-3 px-4 border border-gray-200 dark:border-white/10 bg-gray-50/30 dark:bg-white/5 text-navy dark:text-white font-semibold"
                                          />
                                        </div>

                                        {/* Phone Number */}
                                        <div className="space-y-1.5">
                                          <Label className="text-xs font-extrabold uppercase tracking-wider text-navy/70 dark:text-white/70">Phone Number</Label>
                                          <Input
                                            value={profileForm.phone}
                                            onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                                            className="h-12 rounded-xl py-3 px-4 border border-gray-200 dark:border-white/10 bg-gray-50/30 dark:bg-white/5 text-navy dark:text-white font-semibold"
                                          />
                                        </div>

                                        {/* Checkbox: My WhatsApp number is same */}
                                        <div className="col-span-full py-2">
                                          <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-navy dark:text-white">
                                            <input
                                              type="checkbox"
                                              checked={whatsAppSameAsPhone}
                                              onChange={(e) => setWhatsAppSameAsPhone(e.target.checked)}
                                              className="h-4 w-4 rounded border-gray-350 accent-gold focus:ring-gold cursor-pointer"
                                            />
                                            <span>My WhatsApp number is the same as my phone number</span>
                                          </label>
                                        </div>

                                        {/* WhatsApp Number */}
                                        {!whatsAppSameAsPhone && (
                                          <div className="space-y-1.5 col-span-full animate-in fade-in duration-200">
                                            <Label className="text-xs font-extrabold uppercase tracking-wider text-navy/70 dark:text-white/70">WhatsApp Number</Label>
                                            <Input
                                              value={profileForm.whatsapp}
                                              onChange={(e) => setProfileForm({ ...profileForm, whatsapp: e.target.value })}
                                              className="h-12 rounded-xl py-3 px-4 border border-gray-200 dark:border-white/10 bg-gray-50/30 dark:bg-white/5 text-navy dark:text-white font-semibold"
                                              placeholder="Enter WhatsApp number"
                                            />
                                          </div>
                                        )}

                                        {/* Email address (Read-only) */}
                                        <div className="space-y-1.5 col-span-full">
                                          <Label className="text-xs font-extrabold uppercase tracking-wider text-navy/70 dark:text-white/70">Email Address (Read-only)</Label>
                                          <Input
                                            value={profileForm.email}
                                            disabled
                                            className="h-12 rounded-xl py-3 px-4 border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5 text-muted-foreground cursor-not-allowed font-semibold"
                                          />
                                        </div>

                                        {/* Agent Type */}
                                        <div className="space-y-1.5">
                                          <Label className="text-xs font-extrabold uppercase tracking-wider text-navy/70 dark:text-white/70">Agent Type</Label>
                                          <Select
                                            value={profileForm.agent_type}
                                            onValueChange={(val) => setProfileForm({ ...profileForm, agent_type: val ?? "" })}
                                          >
                                            <SelectTrigger className="h-12 rounded-xl border border-gray-200 dark:border-white/10 bg-transparent text-navy dark:text-white font-semibold">
                                              <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="individual">Individual Agent</SelectItem>
                                              <SelectItem value="company">Agency / Company</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>

                                        {/* Response Time Description */}
                                        <div className="space-y-1.5">
                                          <Label className="text-xs font-extrabold uppercase tracking-wider text-navy/70 dark:text-white/70">Response Time Description</Label>
                                          <Input
                                            value={profileForm.responseTime}
                                            onChange={(e) => setProfileForm({ ...profileForm, responseTime: e.target.value })}
                                            className="h-12 rounded-xl py-3 px-4 border border-gray-200 dark:border-white/10 bg-gray-50/30 dark:bg-white/5 text-navy dark:text-white font-semibold"
                                            placeholder="e.g. Replies within 5 mins"
                                          />
                                        </div>
                                      </div>

                                      <div className="pt-4 text-right border-t border-black/5 dark:border-white/5">
                                        <Button type="submit" className="h-12 px-8 rounded-xl bg-gold hover:bg-gold/90 text-navy font-extrabold shadow-md border-0 cursor-pointer flex items-center justify-center gap-2">
                                          <Save size={16} className="stroke-[2.5]" />
                                          Update Profile
                                        </Button>
                                      </div>
                                    </form>
                                  </motion.div>
                                )}

                                {/* Sub-tab 2: Account settings (Change Email) */}
                                {settingsTab === 'account' && (
                                  <motion.div
                                    key="account"
                                    initial={{ opacity: 0, x: 16 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -16 }}
                                    transition={{ duration: 0.15 }}
                                  >
                                    <form onSubmit={handleChangeEmailSubmit} className="space-y-6">
                                      <div className="space-y-1 text-left">
                                        <h3 className="text-xl font-bold text-navy dark:text-white">Account Settings</h3>
                                        <p className="text-xs text-gray-550 dark:text-gray-400">Manage your account email and access details</p>
                                      </div>

                                      <div className="p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200/20 text-amber-700 dark:text-amber-300 rounded-2xl text-xs space-y-1.5 leading-relaxed text-left">
                                        <span className="font-bold flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                                          <Info size={14} /> Security Alert Notice
                                        </span>
                                        <p>Changing your email will require verification before it can be used for future sign-ins. An update request notice will also be sent to your old email address to keep you protected.</p>
                                      </div>

                                      {emailChangePending ? (
                                        <div className="p-6 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-3xl text-sm text-center space-y-3">
                                          <p className="font-extrabold text-base">Verification Link Sent!</p>
                                          <p className="text-xs leading-relaxed max-w-sm mx-auto">
                                            We&apos;ve sent a verification link to <strong className="underline text-gold">{emailChangePending}</strong>. Please check your inbox and verify your new email address to complete the transition.
                                          </p>
                                          <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setEmailChangePending(null)}
                                            className="rounded-xl text-xs border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                                          >
                                            Change another email
                                          </Button>
                                        </div>
                                      ) : (
                                        <div className="space-y-4 max-w-md">
                                          {/* Current Email */}
                                          <div className="space-y-1.5">
                                            <Label className="text-xs font-extrabold uppercase tracking-wider text-navy/70 dark:text-white/70">Current Email Address</Label>
                                            <Input
                                              value={user?.email || "dubem@example.com"}
                                              disabled
                                              className="h-12 rounded-xl py-3 px-4 border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5 text-muted-foreground cursor-not-allowed font-semibold"
                                            />
                                          </div>

                                          {/* New Email */}
                                          <div className="space-y-1.5">
                                            <Label className="text-xs font-extrabold uppercase tracking-wider text-navy/70 dark:text-white/70">New Email Address</Label>
                                            <Input
                                              type="email"
                                              required
                                              placeholder="Enter new email address"
                                              value={changeEmailForm.newEmail}
                                              onChange={(e) => setChangeEmailForm({ ...changeEmailForm, newEmail: e.target.value })}
                                              className="h-12 rounded-xl py-3 px-4 border border-gray-200 dark:border-white/10 bg-gray-50/30 dark:bg-white/5 text-navy dark:text-white font-semibold"
                                            />
                                          </div>

                                          {/* Current Password */}
                                          <div className="space-y-1.5">
                                            <Label className="text-xs font-extrabold uppercase tracking-wider text-navy/70 dark:text-white/70">Confirm Current Password</Label>
                                            <Input
                                              type="password"
                                              required
                                              placeholder="Enter your current password"
                                              value={changeEmailForm.password}
                                              onChange={(e) => setChangeEmailForm({ ...changeEmailForm, password: e.target.value })}
                                              className="h-12 rounded-xl py-3 px-4 border border-gray-200 dark:border-white/10 bg-gray-50/30 dark:bg-white/5 text-navy dark:text-white font-semibold"
                                            />
                                          </div>

                                          {emailChangeError && (
                                            <div className="p-3.5 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-2xl text-xs font-medium text-left">
                                              {emailChangeError}
                                            </div>
                                          )}

                                          <div className="pt-2">
                                            <Button
                                              type="submit"
                                              disabled={isChangingEmail}
                                              className="h-12 px-8 rounded-xl bg-gold hover:bg-gold/90 text-navy font-extrabold shadow-md flex items-center justify-center gap-2 border-0 cursor-pointer"
                                            >
                                              {isChangingEmail ? (
                                                <>
                                                  <svg className="animate-spin h-4 w-4 text-navy" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                  </svg>
                                                  Updating Email...
                                                </>
                                              ) : (
                                                <>
                                                  <Save size={16} className="stroke-[2.5]" />
                                                  Change Email
                                                </>
                                              )}
                                            </Button>
                                          </div>
                                        </div>
                                      )}
                                    </form>
                                  </motion.div>
                                )}

                                {/* Sub-tab 3: Security Tab */}
                                {settingsTab === 'security' && (
                                  <motion.div
                                    key="security"
                                    initial={{ opacity: 0, x: 16 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -16 }}
                                    transition={{ duration: 0.15 }}
                                  >
                                    <div className="space-y-8">
                                      <div className="space-y-1 text-left">
                                        <h3 className="text-xl font-bold text-navy dark:text-white">Security Settings</h3>
                                        <p className="text-xs text-gray-550 dark:text-gray-400">Manage your account credentials and login sessions</p>
                                      </div>
                                      {/* Password Reset form */}
                                      <form onSubmit={handleUpdatePassword} className="space-y-6 border-b border-black/5 dark:border-white/5 pb-8">
                                        <div className="space-y-4 max-w-md">
                                          <div className="space-y-1.5">
                                            <Label className="text-xs font-extrabold uppercase tracking-wider text-navy/70 dark:text-white/70">Current Password</Label>
                                            <Input
                                              type="password"
                                              required
                                              placeholder="Enter current password"
                                              value={passwordForm.current}
                                              onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                                              className="h-12 rounded-xl py-3 px-4 border border-gray-200 dark:border-white/10 bg-gray-50/30 dark:bg-white/5 text-navy dark:text-white font-semibold"
                                            />
                                          </div>
                                          <div className="space-y-1.5">
                                            <Label className="text-xs font-extrabold uppercase tracking-wider text-navy/70 dark:text-white/70">New Password</Label>
                                            <Input
                                              type="password"
                                              required
                                              placeholder="Enter new password (min. 6 characters)"
                                              value={passwordForm.new}
                                              onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                                              className="h-12 rounded-xl py-3 px-4 border border-gray-200 dark:border-white/10 bg-gray-50/30 dark:bg-white/5 text-navy dark:text-white font-semibold"
                                            />
                                          </div>
                                          <div className="space-y-1.5">
                                            <Label className="text-xs font-extrabold uppercase tracking-wider text-navy/70 dark:text-white/70">Confirm New Password</Label>
                                            <Input
                                              type="password"
                                              required
                                              placeholder="Confirm new password"
                                              value={passwordForm.confirm}
                                              onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                                              className="h-12 rounded-xl py-3 px-4 border border-gray-200 dark:border-white/10 bg-gray-50/30 dark:bg-white/5 text-navy dark:text-white font-semibold"
                                            />
                                          </div>
                                        </div>
                                        <div className="pt-2">
                                          <Button type="submit" disabled={isUpdatingPassword} className="h-12 px-8 rounded-xl bg-gold hover:bg-gold/90 text-navy font-extrabold shadow-md border-0 cursor-pointer flex items-center justify-center gap-2">
                                            {isUpdatingPassword ? (
                                              "Updating..."
                                            ) : (
                                              <>
                                                <Save size={16} className="stroke-[2.5]" />
                                                Change Password
                                              </>
                                            )}
                                          </Button>
                                        </div>
                                      </form>

                                      {/* Mock 2FA & active sessions */}
                                      <div className="space-y-6 text-left">
                                        <div className="space-y-3">
                                          <h4 className="text-sm font-extrabold uppercase tracking-wider text-gray-400">Two-Factor Authentication</h4>
                                          <label className="flex items-start gap-3 rounded-2xl bg-gray-50/50 dark:bg-white/5 p-4 border border-black/5 dark:border-white/5 cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 transition max-w-xl">
                                            <input
                                              type="checkbox"
                                              defaultChecked={false}
                                              className="mt-1 h-4 w-4 rounded border-gray-300 accent-gold focus:ring-gold cursor-pointer"
                                            />
                                            <div className="space-y-0.5 text-left">
                                              <span className="text-sm font-bold text-navy dark:text-white">Enable 2FA Verification</span>
                                              <p className="text-xs text-gray-500 dark:text-gray-400">Require an OTP code sent to your phone or authentication app during sign in.</p>
                                            </div>
                                          </label>
                                        </div>

                                        <div className="space-y-3 pt-2">
                                          <h4 className="text-sm font-extrabold uppercase tracking-wider text-gray-400">Active Sessions</h4>
                                          <div className="space-y-3 max-w-xl">
                                            {[
                                              { device: "Chrome on Windows (Current)", ip: "102.89.34.12", location: "Owerri, Nigeria", status: "Active Now" },
                                              { device: "Safari on iPhone 15", ip: "102.89.44.89", location: "Lagos, Nigeria", status: "2 days ago" }
                                            ].map((session, idx) => (
                                              <div key={idx} className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5 text-xs text-left">
                                                <div className="space-y-0.5">
                                                  <p className="font-bold text-navy dark:text-white">{session.device}</p>
                                                  <p className="text-gray-400">{session.location} · {session.ip}</p>
                                                </div>
                                                <span className={cn(
                                                  "px-2.5 py-0.5 rounded-full font-bold uppercase text-[9px] tracking-wider border",
                                                  session.status === "Active Now"
                                                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                                    : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                                                )}>
                                                  {session.status}
                                                </span>
                                              </div>
                                            ))}

                                            <div className="pt-2">
                                              <Button
                                                type="button"
                                                onClick={() => toast.success("Successfully logged out of all other devices.")}
                                                className="rounded-xl border border-rose-500/30 hover:bg-rose-500/10 text-rose-500 bg-transparent text-xs font-bold cursor-pointer"
                                              >
                                                Logout All Devices
                                              </Button>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </motion.div>
                                )}

                                {/* Sub-tab 4: Appearance (Theme selection) */}
                                {settingsTab === 'appearance' && (
                                  <motion.div
                                    key="appearance"
                                    initial={{ opacity: 0, x: 16 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -16 }}
                                    transition={{ duration: 0.15 }}
                                  >
                                    <div className="space-y-6">
                                      <div className="space-y-1 text-left">
                                        <h3 className="text-xl font-bold text-navy dark:text-white">Appearance Settings</h3>
                                        <p className="text-xs text-gray-550 dark:text-gray-400">Customize the user interface look and theme mode</p>
                                      </div>
                                      <div className="space-y-4 text-left">
                                        <span className="text-xs font-bold uppercase tracking-wider text-gray-455">Select Theme Mode</span>
                                        <div className="grid grid-cols-3 gap-4 max-w-xl">
                                          {[
                                            { id: 'light', label: 'Light', icon: Sun },
                                            { id: 'dark', label: 'Dark', icon: Moon },
                                            { id: 'system', label: 'System', icon: Monitor }
                                          ].map(themeOpt => {
                                            const isThemeActive = themeOpt.id === 'system'
                                              ? !localStorage.getItem('theme')
                                              : (themeOpt.id === 'dark' ? isDark && localStorage.getItem('theme') : !isDark && localStorage.getItem('theme'));
                                            return (
                                              <button
                                                key={themeOpt.id}
                                                type="button"
                                                onClick={() => changeTheme(themeOpt.id as any)}
                                                className={cn(
                                                  "flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border transition-all cursor-pointer bg-gray-50 dark:bg-[#162535] border-0",
                                                  isThemeActive
                                                    ? "border-gold ring-2 ring-gold/20 text-gold dark:text-gold"
                                                    : "border-black/5 dark:border-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10"
                                                )}
                                              >
                                                <themeOpt.icon className="h-6 w-6" />
                                                <span className="text-xs font-bold uppercase tracking-wider">{themeOpt.label}</span>
                                              </button>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    </div>
                                  </motion.div>
                                )}

                                {/* Sub-tab 5: Notifications */}
                                {settingsTab === 'notifications' && (
                                  <motion.div
                                    key="notifications"
                                    initial={{ opacity: 0, x: 16 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -16 }}
                                    transition={{ duration: 0.15 }}
                                  >
                                    <div className="space-y-6">
                                      <div className="space-y-1 text-left">
                                        <h3 className="text-xl font-bold text-navy dark:text-white">Notification Settings</h3>
                                        <p className="text-xs text-gray-550 dark:text-gray-400">Configure channels for inquiry and review updates</p>
                                      </div>
                                      <div className="space-y-4 max-w-lg text-left">
                                        {[
                                          { state: notifyInquiries, setter: setNotifyInquiries, title: "New Inquiry", desc: "Notify me when a student asks a question about my listings." },
                                          { state: notifyBookingRequests, setter: setNotifyBookingRequests, title: "Booking Request", desc: "Notify me when a student initiates a direct booking slot request." },
                                          { state: notifyReviews, setter: setNotifyReviews, title: "Reviews", desc: "Send alerts when students leave feedback or ratings on my listings." },
                                          { state: notifyEmail, setter: setNotifyEmail, title: "Email Notifications", desc: "Send copy summaries to my registered agent email address." },
                                          { state: notifyPush, setter: setNotifyPush, title: "Push Notifications", desc: "Deliver live alert sounds and banners in my browser window." }
                                        ].map((item, idx) => (
                                          <label key={idx} className="flex items-start gap-3 rounded-2xl bg-gray-50 dark:bg-white/5 p-4 border border-black/5 dark:border-white/5 cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 transition">
                                            <input
                                              type="checkbox"
                                              checked={item.state}
                                              onChange={(e) => item.setter(e.target.checked)}
                                              className="mt-1 h-4 w-4 rounded border-gray-300 accent-gold focus:ring-gold cursor-pointer"
                                            />
                                            <div className="space-y-0.5 text-left">
                                              <span className="text-sm font-bold text-navy dark:text-white">{item.title}</span>
                                              <p className="text-xs text-gray-550 dark:text-gray-400">{item.desc}</p>
                                            </div>
                                          </label>
                                        ))}
                                      </div>

                                      <div className="pt-4">
                                        <Button
                                          type="button"
                                          onClick={() => toast.success("Notification preferences saved successfully.")}
                                          className="h-12 px-8 rounded-xl bg-gold hover:bg-gold/90 text-navy font-extrabold shadow-md border-0 cursor-pointer flex items-center justify-center gap-2"
                                        >
                                          <Save size={16} className="stroke-[2.5]" />
                                          Save Preferences
                                        </Button>
                                      </div>
                                    </div>
                                  </motion.div>
                                )}

                                {/* Sub-tab 6: Danger Zone */}
                                {settingsTab === 'danger' && (
                                  <motion.div
                                    key="danger"
                                    initial={{ opacity: 0, x: 16 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -16 }}
                                    transition={{ duration: 0.15 }}
                                  >
                                    <div className="space-y-6 text-left">
                                      <div className="space-y-1 text-left">
                                        <h3 className="text-xl font-bold text-rose-700 dark:text-rose-500">Danger Zone</h3>
                                        <p className="text-xs text-rose-900/60 dark:text-rose-300/60">Irreversible account deactivation and deletion options</p>
                                      </div>
                                      <div className="p-5 bg-rose-50 dark:bg-rose-500/5 rounded-3xl border border-rose-500/10 space-y-4 max-w-xl">
                                        <div className="space-y-1 text-left">
                                          <h4 className="text-sm font-bold text-rose-700 dark:text-rose-455">Deactivate Account</h4>
                                          <p className="text-xs text-rose-900/60 dark:text-rose-300/60">Temporarily hide all listed rooms from CampusHub browser search results. You can reactivate your account at any time.</p>
                                        </div>
                                        <Button
                                          type="button"
                                          onClick={() => toast.error("Account deactivation is disabled in test mode.")}
                                          className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-5 py-2.5 cursor-pointer border-0 shadow-sm"
                                        >
                                          Deactivate Account
                                        </Button>
                                      </div>

                                      <div className="p-5 bg-rose-50 dark:bg-rose-500/5 rounded-3xl border border-rose-500/10 space-y-4 max-w-xl">
                                        <div className="space-y-1 text-left">
                                          <h4 className="text-sm font-bold text-rose-700 dark:text-rose-455">Delete Account</h4>
                                          <p className="text-xs text-rose-900/60 dark:text-rose-300/60">Permanently delete your profile documents, verify badges, and active listings from database. This action is irreversible.</p>
                                        </div>
                                        <Button
                                          type="button"
                                          onClick={() => toast.error("Account deletion is disabled in test mode.")}
                                          className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-5 py-2.5 cursor-pointer border-0 shadow-sm"
                                        >
                                          Delete Account
                                        </Button>
                                      </div>
                                    </div>
                                  </motion.div>
                                )}

                              </AnimatePresence>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>



      {/* --- Profile Photo Update Dialog --- */}
      <Dialog open={isPhotoModalOpen} onOpenChange={setIsPhotoModalOpen}>
        <DialogContent className="max-w-md rounded-[2rem] p-0 overflow-hidden border-none bg-white dark:bg-[#0f1d2e] text-left shadow-2xl">
          <DialogHeader className="p-6 bg-[#0f1e2d] text-white relative">
            <DialogTitle className="text-xl font-bold">Update Profile Picture</DialogTitle>
            <DialogDescription className="text-white/60">
              Preview your new profile photo before saving.
            </DialogDescription>
            <button
              type="button"
              onClick={() => {
                setIsPhotoModalOpen(false);
                setTempPhoto(null);
              }}
              className="absolute right-6 top-6 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition"
              aria-label="Close dialog"
            >
              <X className="h-4 w-4" />
            </button>
          </DialogHeader>

          <div className="p-6 flex flex-col items-center gap-6 bg-white dark:bg-[#0f1d2e]">
            {tempPhoto && (
              <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-gold shadow-lg">
                <img
                  src={tempPhoto}
                  alt="New Profile Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <p className="text-xs text-muted-foreground text-center">
              Make sure your face is clearly visible and well lit.
            </p>
          </div>

          <DialogFooter className="p-6 bg-gray-50 dark:bg-white/5 border-t border-gray-100 dark:border-white/10 flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsPhotoModalOpen(false);
                setTempPhoto(null);
                toast.error("Upload cancelled");
              }}
              className="rounded-xl font-bold border-gray-200 dark:border-white/10 dark:text-white"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={async () => {
                if (tempPhoto && selectedDpFile && user) {
                  const toastId = toast.loading("Uploading and updating your profile picture...");
                  try {
                    const storageRef = ref(storage, `agents/${user.uid}/profile_picture_${Date.now()}_${selectedDpFile.name}`);
                    await uploadBytes(storageRef, selectedDpFile);
                    const downloadUrl = await getDownloadURL(storageRef);

                    // Update Firebase Auth user profile photo URL
                    await updateProfile(user, { photoURL: downloadUrl });

                    // Update Firestore document
                    await updateDoc(doc(db, "users", user.uid), {
                      photoURL: downloadUrl,
                      photo: downloadUrl
                    });

                    // Update states
                    setProfileForm(prev => ({ ...prev, photo: downloadUrl }));
                    setAgentData(prev => {
                      const updated = { ...prev, photo: downloadUrl };
                      localStorage.setItem("agent_data", JSON.stringify(updated));
                      window.dispatchEvent(new Event("agent-data-updated"));
                      return updated;
                    });
                    toast.success("Profile picture uploaded and updated successfully!", { id: toastId });
                  } catch (err: any) {
                    console.error("DP upload error:", err);
                    toast.error("Failed to upload image. Please try again.", { id: toastId });
                  }
                } else if (tempPhoto) {
                  setProfileForm(prev => ({ ...prev, photo: tempPhoto }));
                  setAgentData(prev => {
                    const updated = { ...prev, photo: tempPhoto };
                    localStorage.setItem("agent_data", JSON.stringify(updated));
                    window.dispatchEvent(new Event("agent-data-updated"));
                    return updated;
                  });
                  toast.success("Profile picture updated locally.");
                }
                setIsPhotoModalOpen(false);
                setTempPhoto(null);
                setSelectedDpFile(null);
              }}
              className="rounded-xl bg-gold hover:bg-gold/90 text-navy font-bold px-6"
            >
              Save Picture
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowOtpModal(false)} />
          <div className="relative w-full max-w-sm rounded-[2.5rem] border border-black/5 dark:border-white/5 bg-white dark:bg-[#0f1d2e] p-6 text-center shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold/10 text-gold mb-4">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-extrabold text-navy dark:text-white">Verify Phone</h3>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              We've sent a 6-digit OTP verification code to your phone number. Enter the code below to confirm.
            </p>
            {generatedOtp && (
              <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl text-[11px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20">
                Test OTP Code: <span className="font-extrabold text-sm tracking-wider">{generatedOtp}</span>
              </div>
            )}

            <form onSubmit={handleConfirmOtp} className="mt-6 space-y-4">
              <div className="space-y-2 text-center">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-navy/40 dark:text-white/40 block text-left">Enter 6-Digit Code</Label>

                <div className="flex justify-center gap-2 my-2">
                  {otpDigits.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-input-${index}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (isNaN(Number(val))) return;
                        const newDigits = [...otpDigits];
                        newDigits[index] = val;
                        setOtpDigits(newDigits);
                        setOtpCode(newDigits.join(""));
                        if (val && index < 5) {
                          document.getElementById(`otp-input-${index + 1}`)?.focus();
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Backspace" && !digit && index > 0) {
                          const newDigits = [...otpDigits];
                          newDigits[index - 1] = "";
                          setOtpDigits(newDigits);
                          setOtpCode(newDigits.join(""));
                          document.getElementById(`otp-input-${index - 1}`)?.focus();
                        }
                      }}
                      className="w-10 h-12 text-center text-lg font-bold rounded-xl border border-gray-200 dark:border-white/10 bg-transparent text-navy dark:text-white focus:border-gold focus:ring-1 focus:ring-gold outline-none transition"
                    />
                  ))}
                </div>

                {otpError && <p className="text-[11px] text-rose-500 font-bold mt-1 text-center">{otpError}</p>}
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <Button
                  type="submit"
                  disabled={isVerifyingOtp || otpCode.length !== 6}
                  className="w-full rounded-2xl bg-gold hover:bg-gold/90 text-navy font-bold py-5 text-xs shadow-md"
                >
                  {isVerifyingOtp ? "Verifying..." : "Confirm Verification"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowOtpModal(false)}
                  className="w-full rounded-2xl border-gray-200 dark:border-white/10 text-navy dark:text-white py-5 text-xs"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
