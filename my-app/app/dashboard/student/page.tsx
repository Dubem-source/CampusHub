"use client";

import React, { useState, useEffect, Suspense, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  User,
  Users,
  Heart,
  Clock,
  Bell,
  Edit,
  Check,
  MessageCircle,
  MapPin,
  Phone,
  BookOpen,
  GraduationCap,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Eye,
  LogOut,
  Sun,
  Moon,
  Menu,
  Search,
  Trash2,
  Shield,
  Palette,
  Settings,
  Info,
  Monitor,
  ShoppingBag,
  Wrench,
  Plus,
  Tag,
  X,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { StudentSidebar } from "@/components/student/StudentSidebar";
import { useSidebar } from "@/components/ui/sidebar";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, doc, deleteDoc, setDoc } from "firebase/firestore";
import {
  formatNaira,
  RoomUnit,
  Lodge,
} from "@/lib/lodge-data";

import {
  getMarketplaceItems,
  saveMarketplaceItems,
  getServiceProviders,
  saveServiceProviders,
  MarketplaceItem,
  ServiceProvider,
} from "@/lib/marketplace-services-data";

import { RoommateNoticeboardContent } from "@/components/student/RoommateNoticeboardContent";

// --- Mock Data & Constants ---

const MOCK_STUDENT = {
  id: 'stu1',
  full_name: 'Chiamaka Okafor',
  email: 'chiamaka@example.com',
  phone: '08012345678',
  avatar_url: '',
  department: 'Computer Science',
  level: '300',
  university: 'FUTO',
  gender: 'Female'
};

// Saved rooms and notifications are fetched from Firestore — no mock arrays.



// --- Utilities ---

const getWhatsAppLink = (phone: string, name: string) => {
  // Convert 080... to 23480...
  const cleanPhone = phone.replace(/\D/g, '').replace(/^0/, '234');
  const message = encodeURIComponent(`Hi ${name}, we matched on CampusHub!`);
  return `https://wa.me/${cleanPhone}?text=${message}`;
};

const getInitials = (name?: string) => {
  if (!name) return "ST";
  return name.trim().split(/\s+/).map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

// --- Components ---

interface CustomSelectOption<T> {
  value: T;
  label: string;
}

interface CustomSelectProps<T> {
  value: T;
  onChange: (val: T) => void;
  options: CustomSelectOption<T>[];
  className?: string;
}

function CustomSelect<T extends string | number>({
  value,
  onChange,
  options,
  className
}: CustomSelectProps<T>) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div ref={containerRef} className={cn("relative w-full text-left", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full rounded-xl bg-gray-50 dark:bg-[#162535] text-navy dark:text-white px-4 py-2.5 text-xs border border-black/5 dark:border-white/5 flex items-center justify-between cursor-pointer hover:bg-gray-100 dark:hover:bg-white/[0.03] transition-all outline-none focus:ring-1 focus:ring-gold"
      >
        <span className="font-semibold text-navy dark:text-white">{selectedOption ? selectedOption.label : "Select..."}</span>
        <ChevronDown size={14} className={cn("text-gray-400 transition-transform duration-200", isOpen && "transform rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.1 }}
            className="absolute z-50 left-0 right-0 mt-1.5 bg-white dark:bg-[#0f1d2e] border border-black/5 dark:border-white/5 rounded-2xl shadow-xl overflow-hidden py-1 max-h-56 overflow-y-auto"
          >
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <div
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "px-4 py-2.5 text-xs font-semibold cursor-pointer transition-colors flex items-center justify-between",
                    isSelected
                      ? "text-gold bg-gold/5"
                      : "text-navy/80 dark:text-white/80 hover:bg-navy/5 hover:text-navy dark:hover:bg-white/5 dark:hover:text-white"
                  )}
                >
                  <span>{opt.label}</span>
                  {isSelected && <Check size={12} className="text-gold" />}
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

type Section = 'profile' | 'saved' | 'recent' | 'notifications' | 'roommates' | 'settings' | 'marketplace' | 'services';

function SearchParamsSync({
  onChange,
  onProductChange,
  items
}: {
  onChange: (tab: Section) => void;
  onProductChange: (product: MarketplaceItem | null) => void;
  items: MarketplaceItem[];
}) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const productIdParam = searchParams.get('productId');

  useEffect(() => {
    if (tabParam) {
      onChange(tabParam as Section);
    }
  }, [tabParam, onChange]);

  useEffect(() => {
    if (productIdParam && items.length > 0) {
      const matched = items.find(item => item.id === productIdParam);
      if (matched) {
        onProductChange(matched);
      }
    } else if (!productIdParam) {
      onProductChange(null);
    }
  }, [productIdParam, items, onProductChange]);

  return null;
}

function StudentDashboardContent() {
  const router = useRouter();
  const { user, profile, loading: authLoading, logout: handleFirebaseLogout } = useAuth();
  const { toggleSidebar } = useSidebar();
  const [activeSection, setActiveSection] = useState<Section>('profile');
  const [student, setStudent] = useState(MOCK_STUDENT);
  const [isEditing, setIsEditing] = useState(false);

  // Sync profile document updates from Firestore in real-time
  useEffect(() => {
    if (profile) {
      setStudent(prev => ({
        ...prev,
        id: profile.uid,
        full_name: profile.fullName || prev.full_name,
        email: profile.email || prev.email,
        phone: profile.phone || prev.phone,
      }));
    }
  }, [profile]);

  // ── Route Guard: must be logged in AND be a student ──
  useEffect(() => {
    if (authLoading) return; // wait until Firebase resolves
    if (!user) {
      router.push("/auth?mode=login");
      return;
    }
    if (profile) {
      if (profile.role !== "student") {
        // Logged in but wrong role — redirect them to their correct dashboard
        if (profile.role === "agent") router.push("/dashboard/agent");
        else if (profile.role === "admin") router.push("/admin");
        else router.push("/auth?mode=login");
      }
    } else {
      // User is logged in but has no profile document in Firestore, bounce to login
      router.push("/auth?mode=login");
    }
  }, [user, profile, authLoading, router]);
  // savedRooms stores full {room, lodge} objects fetched from Firestore savedRooms collection
  const [savedRooms, setSavedRooms] = useState<{ id: string; room: RoomUnit; lodge: Lodge | null }[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [recentRooms, setRecentRooms] = useState<{ room: RoomUnit; lodge: Lodge }[]>([]);
  const [isDark, setIsDark] = useState(false);
  const mainRef = useRef<HTMLElement | null>(null);
  const [mounted, setMounted] = useState(false);
  // Loading states defined below to avoid TDZ for filters

  // Marketplace States
  const [marketplaceItems, setMarketplaceItems] = useState<MarketplaceItem[]>([]);
  const [marketplaceTab, setMarketplaceTab] = useState<'browse' | 'my-items'>('browse');

  // Marketplace Filters
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterArea, setFilterArea] = useState<string>('All');
  const [filterCondition, setFilterCondition] = useState<string>('All');
  const [filterMaxPrice, setFilterMaxPrice] = useState<string>('');

  // Post Item Modal Form
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isMarketVettingModalOpen, setIsMarketVettingModalOpen] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postPrice, setPostPrice] = useState('');
  const [postCategory, setPostCategory] = useState<'Electronics' | 'Furniture' | 'Kitchen' | 'Books' | 'Other'>('Electronics');
  const [postArea, setPostArea] = useState('');
  const [postCondition, setPostCondition] = useState<'New' | 'Gently Used' | 'Fair'>('New');
  const [postDescription, setPostDescription] = useState('');
  const [postPhotos, setPostPhotos] = useState<string[]>([]);

  const [marketplaceLoading, setMarketplaceLoading] = useState(false);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [savedRoomsLoading, setSavedRoomsLoading] = useState(false);
  const [recentRoomsLoading, setRecentRoomsLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (activeSection === 'marketplace' && marketplaceTab === 'browse') {
      setMarketplaceLoading(true);
      const timer = setTimeout(() => setMarketplaceLoading(false), 500);
      return () => clearTimeout(timer);
    }
  }, [filterCategory, filterArea, filterCondition, filterMaxPrice, activeSection, marketplaceTab]);

  useEffect(() => {
    if (activeSection === 'services') {
      setServicesLoading(true);
      const timer = setTimeout(() => setServicesLoading(false), 500);
      return () => clearTimeout(timer);
    }
  }, [activeSection]);

  useEffect(() => {
    if (activeSection === 'saved') {
      setSavedRoomsLoading(true);
      const timer = setTimeout(() => setSavedRoomsLoading(false), 450);
      return () => clearTimeout(timer);
    }
  }, [activeSection]);

  useEffect(() => {
    if (activeSection === 'recent') {
      setRecentRoomsLoading(true);
      const timer = setTimeout(() => setRecentRoomsLoading(false), 450);
      return () => clearTimeout(timer);
    }
  }, [activeSection]);

  // Edit Item States & Handlers
  const [editingItem, setEditingItem] = useState<MarketplaceItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState<MarketplaceItem | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const handleProductChange = useCallback((product: MarketplaceItem | null) => {
    setActiveProduct(prev => {
      if (prev?.id === product?.id) return prev;
      return product;
    });
  }, []);
  const [editItemForm, setEditItemForm] = useState({
    title: "",
    price: "",
    category: "Electronics" as MarketplaceItem['category'],
    area: "",
    condition: "Gently Used" as MarketplaceItem['condition'],
    description: "",
    photos: [] as string[]
  });

  const handleOpenEditItem = (item: MarketplaceItem) => {
    setEditingItem(item);
    setEditItemForm({
      title: item.title,
      price: String(item.price),
      category: item.category,
      area: item.area,
      condition: item.condition,
      description: item.description || "",
      photos: item.photos
    });
    setIsEditModalOpen(true);
  };

  const handleEditItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    if (!editItemForm.title || !editItemForm.price || !editItemForm.area) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const updated = marketplaceItems.map(item =>
      item.id === editingItem.id
        ? {
          ...item,
          title: editItemForm.title,
          price: Number(editItemForm.price),
          category: editItemForm.category,
          area: editItemForm.area,
          condition: editItemForm.condition,
          description: editItemForm.description,
          photos: editItemForm.photos
        }
        : item
    );

    setMarketplaceItems(updated);
    saveMarketplaceItems(updated);
    toast.success("Listing updated successfully!");
    setIsEditModalOpen(false);
    setEditingItem(null);
  };

  const handleEditPhotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newPhotos: string[] = [];
      const fileList = Array.from(files).slice(0, 3 - editItemForm.photos.length);

      fileList.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            newPhotos.push(reader.result as string);
            if (newPhotos.length === fileList.length) {
              setEditItemForm(prev => ({
                ...prev,
                photos: [...prev.photos, ...newPhotos]
              }));
            }
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // Service Providers State
  const [serviceProviders, setServiceProviders] = useState<ServiceProvider[]>([]);

  // Phone to WhatsApp API Link Converter
  const getSellerWhatsAppLink = (phone: string, itemTitle: string) => {
    let clean = phone.replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) {
      clean = '234' + clean.slice(1);
    } else if (clean.startsWith('8') || clean.startsWith('7') || clean.startsWith('9')) {
      clean = '234' + clean;
    }
    return `https://wa.me/${clean}?text=${encodeURIComponent(`Hi, I saw your listing for "${itemTitle}" on CampusHub. Is it still available?`)}`;
  };

  const getConditionColor = (condition: MarketplaceItem['condition']) => {
    if (condition === 'New') return 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400';
    if (condition === 'Gently Used') return 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400';
    return 'bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300';
  };

  const getProviderWhatsAppLink = (phone: string, providerName: string) => {
    let clean = phone.replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) {
      clean = '234' + clean.slice(1);
    } else if (clean.startsWith('8') || clean.startsWith('7') || clean.startsWith('9')) {
      clean = '234' + clean;
    }
    return `https://wa.me/${clean}?text=${encodeURIComponent(`Hi ${providerName}, I saw your service profile on CampusHub and would like to make an inquiry.`)}`;
  };

  const handlePostPhotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newPhotos: string[] = [];
      const fileList = Array.from(files).slice(0, 3 - postPhotos.length);

      let loaded = 0;
      fileList.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPhotos.push(reader.result as string);
          loaded++;
          if (loaded === fileList.length) {
            setPostPhotos(prev => [...prev, ...newPhotos].slice(0, 3));
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handlePostItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle || !postPrice || !postArea) {
      toast.error("Please fill in all required fields");
      return;
    }
    const newItem: MarketplaceItem = {
      id: `item-${Date.now()}`,
      seller_id: student.id,
      seller_name: student.full_name,
      seller_phone: student.phone,
      title: postTitle,
      price: parseFloat(postPrice),
      category: postCategory,
      condition: postCondition,
      area: postArea,
      description: postDescription,
      photos: postPhotos.length > 0 ? postPhotos : ["https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=400&q=80"],
      status: 'active',
      created_at: new Date().toISOString()
    };

    const updated = [newItem, ...marketplaceItems];
    setMarketplaceItems(updated);
    saveMarketplaceItems(updated);

    // Reset Form
    setPostTitle('');
    setPostPrice('');
    setPostCategory('Electronics');
    setPostCondition('New');
    setPostArea('');
    setPostDescription('');
    setPostPhotos([]);
    setIsPostModalOpen(false);
    toast.success("Item posted successfully!");
  };

  const handleMarkAsSold = (id: string) => {
    const updated = marketplaceItems.map(item =>
      item.id === id ? { ...item, status: 'sold' as const } : item
    );
    setMarketplaceItems(updated);
    saveMarketplaceItems(updated);
    toast.success("Item marked as sold");
  };

  const handleDeleteItem = (id: string) => {
    setDeletingItemId(id);
  };

  const confirmDeleteListing = () => {
    if (!deletingItemId) return;
    const updated = marketplaceItems.map(item =>
      item.id === deletingItemId ? { ...item, status: 'deleted' as const } : item
    );
    setMarketplaceItems(updated);
    saveMarketplaceItems(updated);
    toast.success("Item deleted successfully");
    setDeletingItemId(null);
  };

  // Settings State Hooks
  const [settingsTab, setSettingsTab] = useState<'profile' | 'account' | 'roommate' | 'privacy' | 'notifications' | 'appearance' | 'danger'>('profile');
  const [prefGender, setPrefGender] = useState('Any');
  const [prefBudget, setPrefBudget] = useState('₦80,000 – ₦120,000');
  const [prefLocation, setPrefLocation] = useState('Eziobodo');
  const [privacyProfilePublic, setPrivacyProfilePublic] = useState(true);
  const [privacyPhonePublic, setPrivacyPhonePublic] = useState(true);
  const [notifyMatches, setNotifyMatches] = useState(true);
  const [notifyWhatsApp, setNotifyWhatsApp] = useState(true);

  // Scroll main container to top when switching active sections
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
    setActiveProduct(null);
    setActiveImageIndex(0);
  }, [activeSection]);

  // Scroll main container to top when activeProduct changes (entering product page detail view)
  useEffect(() => {
    if (activeProduct && mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
  }, [activeProduct]);

  // Track viewed products to avoid double counting within the same session
  const viewedSessionIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (activeProduct) {
      const prodId = activeProduct.id;
      if (!viewedSessionIds.current.has(prodId)) {
        viewedSessionIds.current.add(prodId);
        // Increment view count in local state and localStorage
        setMarketplaceItems(prevItems => {
          const updated = prevItems.map(item => {
            if (item.id === prodId) {
              const currentViews = item.views || 0;
              return { ...item, views: currentViews + 1 };
            }
            return item;
          });
          // Save to localStorage
          if (typeof window !== "undefined") {
            localStorage.setItem("marketplace_items", JSON.stringify(updated));
            window.dispatchEvent(new Event("marketplace-items-updated"));
          }
          return updated;
        });

        // Also update activeProduct views locally
        setActiveProduct(prev => {
          if (prev && prev.id === prodId) {
            return { ...prev, views: (prev.views || 0) + 1 };
          }
          return prev;
        });
      }
    }
  }, [activeProduct?.id]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  // Sync theme and local storage data on mount
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
  }, []);

  // Update URL search parameters when activeSection or activeProduct changes
  useEffect(() => {
    if (activeSection === 'marketplace' && activeProduct) {
      router.push(`/dashboard/student?tab=marketplace&productId=${activeProduct.id}`, { scroll: false });
    } else {
      router.push(`/dashboard/student?tab=${activeSection}`, { scroll: false });
    }
  }, [activeSection, activeProduct, router]);

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
    if (mode === 'light') {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
      toast.success("Theme changed to Light");
    } else if (mode === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
      toast.success("Theme changed to Dark");
    } else {
      localStorage.removeItem('theme');
      const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(isSystemDark);
      if (isSystemDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      toast.success("Theme synced with System");
    }
  };

  // Recently viewed rooms — stored in localStorage as room IDs only (non-sensitive browsing history)
  useEffect(() => {
    const LOCAL_STORAGE_KEY = 'campus_recent';
    const recentIds = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]') as string[];
    // Recent rooms will be fetched from Firestore rooms collection
    // For now, just clear any stale mock IDs from pre-launch
    if (recentIds.some((id: string) => id.startsWith('room-ig') || id.startsWith('room-es') || id.startsWith('room-cv') || id.startsWith('room-at'))) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
    setRecentRooms([]);
  }, []);

  // Sync student details, notifications, and clear agent logged in status on mount
  useEffect(() => {
    localStorage.removeItem("agent_logged_in");
    localStorage.setItem("student_logged_in", "true");
    localStorage.setItem("user_role", "student");
    window.dispatchEvent(new Event("agent-data-updated"));
    window.dispatchEvent(new Event("student-data-updated"));

    const savedTab = localStorage.getItem("student_dashboard_tab");
    if (savedTab) {
      setActiveSection(savedTab as Section);
      localStorage.removeItem("student_dashboard_tab");
    }

    const saved = localStorage.getItem("student_data");
    if (saved) {
      try {
        setStudent(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse student_data", e);
      }
    } else {
      localStorage.setItem("student_data", JSON.stringify(MOCK_STUDENT));
    }

    const savedPrefs = localStorage.getItem("student_settings_prefs");
    if (savedPrefs) {
      try {
        const parsed = JSON.parse(savedPrefs);
        if (parsed.prefGender) setPrefGender(parsed.prefGender);
        if (parsed.prefBudget) setPrefBudget(parsed.prefBudget);
        if (parsed.prefLocation) setPrefLocation(parsed.prefLocation);
        if (parsed.privacyProfilePublic !== undefined) setPrivacyProfilePublic(parsed.privacyProfilePublic);
        if (parsed.privacyPhonePublic !== undefined) setPrivacyPhonePublic(parsed.privacyPhonePublic);
        if (parsed.notifyMatches !== undefined) setNotifyMatches(parsed.notifyMatches);
        if (parsed.notifyWhatsApp !== undefined) setNotifyWhatsApp(parsed.notifyWhatsApp);
      } catch (e) {
        console.error("Failed to parse student_settings_prefs", e);
      }
    }

    // Subscribe to student notifications from Firestore
    if (user) {
      const notifsUnsub = onSnapshot(
        query(collection(db, "notifications"), where("uid", "==", user.uid)),
        (snap) => {
          const dbNotifs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          setNotifications(dbNotifs.sort((a: any, b: any) => (b.createdAt || "").localeCompare(a.createdAt || "")));
        }
      );
      return () => notifsUnsub();
    }
  }, [user]);

  // Subscribe to saved rooms from Firestore savedRooms collection
  useEffect(() => {
    if (!user) return;
    const unsubSaved = onSnapshot(
      query(collection(db, "savedRooms"), where("studentId", "==", user.uid)),
      (snap) => {
        const fetched: { id: string; room: RoomUnit; lodge: Lodge | null }[] = [];
        snap.forEach((d) => {
          const data = d.data();
          fetched.push({
            id: d.id,
            room: data.room as RoomUnit,
            lodge: data.lodge as Lodge | null,
          });
        });
        setSavedRooms(fetched);
      }
    );
    return () => unsubSaved();
  }, [user]);

  // Sync marketplace and services data
  useEffect(() => {
    setMarketplaceItems(getMarketplaceItems());
    setServiceProviders(getServiceProviders());

    const handleMarketplaceUpdate = () => {
      setMarketplaceItems(getMarketplaceItems());
    };
    const handleProvidersUpdate = () => {
      setServiceProviders(getServiceProviders());
    };

    window.addEventListener("marketplace-items-updated", handleMarketplaceUpdate);
    window.addEventListener("service-providers-updated", handleProvidersUpdate);

    return () => {
      window.removeEventListener("marketplace-items-updated", handleMarketplaceUpdate);
      window.removeEventListener("service-providers-updated", handleProvidersUpdate);
    };
  }, []);

  const handleToggleEdit = () => {
    if (isEditing) {
      localStorage.setItem("student_data", JSON.stringify(student));
      window.dispatchEvent(new Event("student-data-updated"));
      toast.success("Profile updated");
    }
    setIsEditing(!isEditing);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setStudent(prev => ({
          ...prev,
          avatar_url: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Settings Save Handlers
  const handleSaveSettingsPrefs = (tabName: string) => {
    const prefs = {
      prefGender,
      prefBudget,
      prefLocation,
      privacyProfilePublic,
      privacyPhonePublic,
      notifyMatches,
      notifyWhatsApp,
    };
    localStorage.setItem("student_settings_prefs", JSON.stringify(prefs));
    toast.success(`${tabName} updated successfully`);
  };

  const handleUpdateStudentProfile = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("student_data", JSON.stringify(student));
    window.dispatchEvent(new Event("student-data-updated"));
    toast.success("Profile settings updated successfully");
  };

  const [passwordForm, setPasswordForm] = useState({ current: "", new: "", confirm: "" });
  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordForm.current || !passwordForm.new || !passwordForm.confirm) {
      toast.error("Please fill in all password fields");
      return;
    }
    if (passwordForm.new !== passwordForm.confirm) {
      toast.error("New passwords do not match");
      return;
    }
    toast.success("Account password updated successfully");
    setPasswordForm({ current: "", new: "", confirm: "" });
  };

  const removeSavedRoom = async (docId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await deleteDoc(doc(db, "savedRooms", docId));
      toast.success("Room removed from saved");
    } catch (err) {
      console.error("Failed to remove saved room:", err);
      toast.error("Could not remove. Please try again.");
    }
  };

  const markAsRead = (id: number) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const deleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast.success("Notification deleted");
  };

  const navLinks = [
    { id: 'profile' as Section, label: 'Profile', icon: User },
    { id: 'saved' as Section, label: 'Saved Rooms', icon: Heart },
    { id: 'recent' as Section, label: 'Recently Viewed', icon: Clock },
    { id: 'notifications' as Section, label: 'Notifications', icon: Bell, badge: notifications.filter(n => !n.read).length },
  ];

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
              <span>Loading Student Dashboard...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Suspense fallback={null}>
        <SearchParamsSync
          onChange={setActiveSection}
          onProductChange={handleProductChange}
          items={marketplaceItems}
        />
      </Suspense>

      {/* 1. Left Sidebar Navigation */}
      <StudentSidebar
        activeTab={activeSection}
        setActiveTab={setActiveSection}
        studentName={student.full_name}
        studentAvatar={student.avatar_url}
        notificationsCount={notifications.filter(n => !n.read).length}
        onLogout={handleFirebaseLogout}
      />

      {/* 2. Main content wrap */}
      <div className="flex-grow flex flex-col h-[100dvh] overflow-hidden bg-gray-50/50 dark:bg-navy/5">

        {/* Mobile Navbar */}
        <div className="flex lg:hidden items-center justify-between bg-white dark:bg-[#0f1d2e] text-navy dark:text-white px-6 py-4 border-b border-black/5 dark:border-white/10 shadow-sm z-40">
          <div className="flex items-center gap-2">
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
            {/* Theme Toggle (Mobile) */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-navy dark:text-white hover:bg-navy/5 dark:hover:bg-white/10 h-8 w-8 p-0 rounded-full flex items-center justify-center"
            >
              {isDark ? <Sun size={18} className="text-gold" /> : <Moon size={18} />}
            </Button>

            {/* Notification Bell (Mobile) */}
            <Link
              href="/dashboard/student?tab=notifications"
              className="relative flex h-8 w-8 items-center justify-center rounded-full text-navy dark:text-white hover:bg-navy/5 dark:hover:bg-white/10 transition"
            >
              <Bell className="h-5 w-5" />
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[9px] font-extrabold text-navy animate-pulse">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </Link>

            {/* Profile DP (Mobile) */}
            <div
              className="w-8 h-8 rounded-full border border-gold/40 bg-navy overflow-hidden flex items-center justify-center font-bold text-xs text-gold flex-shrink-0 cursor-pointer"
              onClick={() => setActiveSection('profile')}
            >
              {student.avatar_url ? (
                <img
                  src={student.avatar_url}
                  alt={student.full_name}
                  className="h-full w-full object-cover"
                />
              ) : (
                getInitials(student.full_name)
              )}
            </div>

            {/* Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="text-navy dark:text-white hover:bg-navy/5 dark:hover:bg-white/10 h-10 w-10 p-0 rounded-full"
              aria-label="Toggle navigation menu"
            >
              <Menu className="h-6 w-6" />
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

            <Link
              href="/dashboard/student?tab=notifications"
              className="relative text-navy/60 dark:text-white/60 hover:text-navy dark:hover:text-white p-2 rounded-full hover:bg-navy/5 dark:hover:bg-white/5 transition"
            >
              <Bell className="h-5 w-5" />
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-extrabold text-white animate-pulse">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </Link>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full border border-gold bg-navy overflow-hidden flex items-center justify-center font-bold text-xs text-gold flex-shrink-0">
                {student.avatar_url ? (
                  <img
                    src={student.avatar_url}
                    alt={student.full_name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  getInitials(student.full_name)
                )}
              </div>
              <span className="text-sm font-semibold text-navy dark:text-white">
                {student.full_name.split(" ")[0]}
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable Dashboard Body */}
        <main ref={mainRef} className="flex-1 overflow-y-auto relative overscroll-y-contain">

          {/* Main Dashboard Body Container */}
          <div className="px-2 pt-2 pb-6 md:p-8">

            {/* Greeting Card (Profile tab only) */}
            {activeSection === 'profile' && (
              <div className="rounded-[2.5rem] p-6 py-10 md:p-10 bg-gradient-to-r from-[#0f1d2e] via-[#162535] to-[#122132] dark:to-[#c9952a]/15 border border-gold/15 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm mb-4 md:mb-8">
                <div className="space-y-3">
                  <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white">
                    {getGreeting()}, {student.full_name.split(" ")[0]}!
                  </h2>
                  <p className="text-white/95 text-xs md:text-base leading-relaxed max-w-xl">
                    Find your next verified student lodge and connect with the perfect flatmate around FUTO.
                  </p>
                </div>
                <div className="hidden md:flex flex-wrap gap-3 shrink-0">
                  <Link
                    href="/lodges"
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 px-6 py-3 text-xs font-semibold text-white transition-all backdrop-blur-sm shadow-sm"
                  >
                    <Search className="h-3.5 w-3.5 text-gold" />
                    Browse Lodges
                  </Link>
                  <button
                    onClick={() => setActiveSection('roommates')}
                    className="inline-flex items-center gap-2 rounded-full bg-gold hover:bg-gold/90 px-6 py-3 text-xs font-semibold text-navy transition-all shadow-md cursor-pointer border-0"
                  >
                    <Users className="h-3.5 w-3.5 text-navy" />
                    Find Roommates
                  </button>
                </div>
              </div>
            )}

            {/* Mobile-only Quick Action Buttons (Browse Lodges & Find Roommates stacked vertically) */}
            {activeSection === 'profile' && (
              <div className="flex flex-col gap-3 md:hidden mb-4 px-2">
                <Link
                  href="/lodges"
                  className="flex items-center justify-center gap-2 rounded-full border border-black/10 dark:border-white/10 bg-white dark:bg-[#0f1d2e] hover:bg-gray-50 dark:hover:bg-[#162535] py-3.5 text-sm font-bold text-navy dark:text-white shadow-sm transition"
                >
                  <Search className="h-4 w-4 text-gold" />
                  Browse Lodges
                </Link>
                <button
                  onClick={() => setActiveSection('roommates')}
                  className="flex items-center justify-center gap-2 rounded-full bg-gold hover:bg-gold/90 py-3.5 text-sm font-bold text-navy shadow-md transition cursor-pointer border-0"
                >
                  <Users className="h-4 w-4 text-navy" />
                  Find Roommates
                </button>
              </div>
            )}

            {/* Section title (Visible for non-profile sections like Saved, Recent, Notifications) */}
            {activeSection !== 'profile' && activeSection !== 'roommates' && activeSection !== 'settings' && activeSection !== 'marketplace' && activeSection !== 'services' && (
              <div className="flex flex-row items-center justify-between gap-4 mb-4 md:mb-8">
                <div className="text-left">
                  <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-navy dark:text-white capitalize">
                    {activeSection === 'saved' ? 'Saved Rooms' :
                      activeSection === 'recent' ? 'Recently Viewed' :
                        'Notifications'}
                  </h1>
                  <p className="text-muted-foreground text-xs md:text-sm mt-1">
                    {activeSection === 'saved' ? "Rooms you've bookmarked. We'll notify you if availability changes." :
                      activeSection === 'recent' ? "Pick up where you left off in your search." :
                        "Stay updated on matches and room availability"}
                  </p>
                </div>

                {activeSection === 'notifications' && notifications.some(n => !n.read) && (
                  <button
                    onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
                    className="text-xs font-bold text-gold hover:underline shrink-0"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
            )}

            <div className="min-w-0">
              <AnimatePresence mode="wait">

                {/* 1. Profile Section */}
                {activeSection === 'profile' && (
                  <motion.section
                    key="profile"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <div className="rounded-none md:rounded-[2rem] border-x-0 md:border border-black/5 dark:border-white/5 bg-white dark:bg-[#0f1d2e] shadow-sm -mx-2 md:mx-0 overflow-hidden">
                      {/* Ocean Wave Header Banner */}
                      <div className="relative h-28 md:h-36 bg-gradient-to-r from-blue-600 via-[#1d528f] to-[#0f1d2e] overflow-hidden">
                        {/* SVG Wave */}
                        <svg
                          className="absolute bottom-0 w-full h-8 text-white dark:text-[#0f1d2e] fill-current"
                          viewBox="0 0 1440 100"
                          preserveAspectRatio="none"
                        >
                          <path
                            d="M0,32 C240,70 480,10 720,50 C960,90 1200,30 1440,70 L1440,100 L0,100 Z"
                          />
                        </svg>
                      </div>

                      <div className="p-6 md:p-10 pt-0 relative z-10">
                        <div className="flex flex-col items-center gap-6 md:flex-row md:items-end -mt-12 md:-mt-16 mb-4 md:mb-8 text-center md:text-left">
                          <div className="relative">
                            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-navy/5 dark:bg-white/5 text-3xl font-bold text-gold ring-4 ring-white dark:ring-[#0f1d2e] shadow-md lg:h-32 lg:w-32 lg:text-4xl overflow-hidden">
                              {student.avatar_url ? (
                                <img
                                  src={student.avatar_url}
                                  alt={student.full_name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                student.full_name ? student.full_name.trim().split(/\s+/).map(n => n[0]).join('').toUpperCase().slice(0, 2) : "ST"
                              )}
                            </div>
                          </div>
                          <div className="text-center md:text-left">
                            <h2 className="text-2xl font-bold text-navy dark:text-white">{student.full_name}</h2>
                            <p className="text-gray-500 dark:text-gray-400">{student.email}</p>
                            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-gold/10 px-4 py-1 text-xs font-bold text-gold animate-pulse">
                              <GraduationCap className="h-3.5 w-3.5" />
                              Verified FUTO Student
                            </div>
                          </div>
                        </div>

                        <div className="mt-12 grid gap-6 md:grid-cols-2">
                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-navy/40 dark:text-white/40">Full Name</label>
                            {isEditing ? (
                              <input
                                type="text"
                                value={student.full_name}
                                onChange={(e) => setStudent({ ...student, full_name: e.target.value })}
                                className="w-full rounded-2xl border-0 bg-white dark:bg-[#162535] text-navy dark:text-white px-5 py-4 text-sm ring-1 ring-gold focus:ring-2 focus:ring-gold transition-all"
                              />
                            ) : (
                              <div className="flex items-center gap-3 rounded-2xl bg-white dark:bg-[#162535] px-5 py-4 text-sm text-navy dark:text-white ring-1 ring-black/5 dark:ring-white/5 shadow-sm">
                                <User className="h-4 w-4 text-gold" />
                                {student.full_name}
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-navy/40 dark:text-white/40">Email Address</label>
                            <div className="flex items-center gap-3 rounded-2xl bg-gray-50 dark:bg-white/5 px-5 py-4 text-sm text-navy/40 dark:text-white/40 ring-1 ring-black/5 dark:ring-white/5">
                              <Bell className="h-4 w-4" />
                              {student.email}
                            </div>
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 italic">Account email cannot be changed</p>
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-navy/40 dark:text-white/40">Phone Number</label>
                            {isEditing ? (
                              <input
                                type="tel"
                                value={student.phone}
                                onChange={(e) => setStudent({ ...student, phone: e.target.value })}
                                className="w-full rounded-2xl border-0 bg-white dark:bg-[#162535] text-navy dark:text-white px-5 py-4 text-sm ring-1 ring-gold focus:ring-2 focus:ring-gold transition-all"
                              />
                            ) : (
                              <div className="flex items-center gap-3 rounded-2xl bg-white dark:bg-[#162535] px-5 py-4 text-sm text-navy dark:text-white ring-1 ring-black/5 dark:ring-white/5 shadow-sm">
                                <Phone className="h-4 w-4 text-gold" />
                                {student.phone}
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-navy/40 dark:text-white/40">Department</label>
                            {isEditing ? (
                              <input
                                type="text"
                                value={student.department}
                                onChange={(e) => setStudent({ ...student, department: e.target.value })}
                                className="w-full rounded-2xl border-0 bg-white dark:bg-[#162535] text-navy dark:text-white px-5 py-4 text-sm ring-1 ring-gold focus:ring-2 focus:ring-gold transition-all"
                              />
                            ) : (
                              <div className="flex items-center gap-3 rounded-2xl bg-white dark:bg-[#162535] px-5 py-4 text-sm text-navy dark:text-white ring-1 ring-black/5 dark:ring-white/5 shadow-sm">
                                <BookOpen className="h-4 w-4 text-gold" />
                                {student.department}
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-navy/40 dark:text-white/40">Academic Level</label>
                            {isEditing ? (
                              <select
                                value={student.level}
                                onChange={(e) => setStudent({ ...student, level: e.target.value })}
                                className="w-full rounded-2xl border-0 bg-white dark:bg-[#162535] text-navy dark:text-white px-5 py-4 text-sm ring-1 ring-gold focus:ring-2 focus:ring-gold transition-all"
                              >
                                {['100', '200', '300', '400', '500'].map(lvl => (
                                  <option key={lvl} value={lvl}>{lvl} Level</option>
                                ))}
                              </select>
                            ) : (
                              <div className="flex items-center gap-3 rounded-2xl bg-white dark:bg-[#162535] px-5 py-4 text-sm text-navy dark:text-white ring-1 ring-black/5 dark:ring-white/5 shadow-sm">
                                <GraduationCap className="h-4 w-4 text-gold" />
                                {student.level} Level
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-navy/40 dark:text-white/40">Gender</label>
                            {isEditing ? (
                              <select
                                value={student.gender || 'Female'}
                                onChange={(e) => setStudent({ ...student, gender: e.target.value })}
                                className="w-full rounded-2xl border-0 bg-white dark:bg-[#162535] text-navy dark:text-white px-5 py-4 text-sm ring-1 ring-gold focus:ring-2 focus:ring-gold transition-all"
                              >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                              </select>
                            ) : (
                              <div className="flex items-center gap-3 rounded-2xl bg-white dark:bg-[#162535] px-5 py-4 text-sm text-navy dark:text-white ring-1 ring-black/5 dark:ring-white/5 shadow-sm">
                                <User className="h-4 w-4 text-gold" />
                                {student.gender || 'Female'}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.section>
                )}

                {/* 2. Saved Rooms Section */}
                {activeSection === 'saved' && (
                  <motion.section
                    key="saved"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    {savedRoomsLoading ? (
                      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="h-[320px] animate-pulse rounded-[2rem] bg-gray-200 dark:bg-[#121212]"
                          />
                        ))}
                      </div>
                    ) : savedRooms.length > 0 ? (
                      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                        <AnimatePresence mode="popLayout">
                          {savedRooms.map(({ id: docId, room, lodge }) => {
                            if (!room) return null;

                            return (
                              <motion.div
                                key={docId}
                                initial={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                layout
                                className="group relative overflow-hidden rounded-[2rem] border border-black/5 dark:border-white/5 bg-white dark:bg-[#0f1d2e] shadow-sm transition-all hover:shadow-md"
                              >
                                <div className="relative h-48 overflow-hidden">
                                  {/* Nav Trigger */}
                                  <div
                                    onClick={() => lodge && router.push(`/lodges/${room.lodgeSlug}/rooms/${room.id}`)}
                                    className="absolute inset-0 z-10 cursor-pointer"
                                  />
                                  <img
                                    src={room.photos?.[0] || ""}
                                    alt={room.roomType}
                                    className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-110"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-navy/60 to-transparent" />

                                  <button
                                    onClick={(e) => removeSavedRoom(docId, e)}
                                    type="button"
                                    className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur transition hover:bg-white hover:text-red-500"
                                  >
                                    <Heart className="h-4 w-4 fill-current" />
                                  </button>

                                  <div className="absolute bottom-4 left-4 z-10">
                                    <span className={cn(
                                      "rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white",
                                      room.availability === 'available' ? 'bg-green-500' :
                                        room.availability === 'pending' ? 'bg-amber-500' : 'bg-red-500'
                                    )}>
                                      {room.availability}
                                    </span>
                                  </div>
                                </div>

                                <div
                                  onClick={() => lodge && router.push(`/lodges/${room.lodgeSlug}/rooms/${room.id}`)}
                                  className="cursor-pointer p-5"
                                >
                                  <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-navy dark:text-white">{room.roomType}</h3>
                                    <p className="text-sm font-bold text-gold">{formatNaira(room.price)}</p>
                                  </div>
                                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{lodge?.name || "Lodge"} • {room.area}</p>
                                  <div className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gray-50 dark:bg-white/5 py-3 text-xs font-bold text-navy dark:text-gold transition hover:bg-gold dark:hover:bg-gold hover:text-navy dark:hover:text-navy">
                                    View Details
                                    <ArrowRight className="h-3.5 w-3.5" />
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center rounded-[3rem] border border-dashed border-black/10 dark:border-white/10 bg-white dark:bg-[#0f1d2e] py-20 text-center">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-50 dark:bg-white/5 text-gray-300 dark:text-white/20">
                          <Heart className="h-10 w-10" />
                        </div>
                        <h3 className="mt-6 text-xl font-bold text-navy dark:text-white">No saved rooms yet</h3>
                        <p className="mt-2 max-w-xs text-sm text-gray-500 dark:text-gray-400">
                          Browse lodges around FUTO to find your perfect place and save them here.
                        </p>
                        <Link
                          href="/lodges"
                          className="mt-8 inline-flex items-center gap-2 rounded-full bg-gold px-8 py-3.5 text-sm font-bold text-navy shadow-lg transition hover:scale-105 hover:bg-[#d7a93a]"
                        >
                          Browse Lodges
                        </Link>
                      </div>
                    )}
                  </motion.section>
                )}

                {/* 3. Recently Viewed Section */}
                {activeSection === 'recent' && (
                  <motion.section
                    key="recent"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    {recentRoomsLoading ? (
                      <div className="flex flex-col gap-4">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="h-28 animate-pulse rounded-[2rem] bg-gray-205 dark:bg-[#121212]"
                          />
                        ))}
                      </div>
                    ) : recentRooms.length > 0 ? (
                      <div className="flex flex-col gap-4">
                        {recentRooms.map(({ room, lodge }) => (
                          <div
                            key={room.id}
                            onClick={() => router.push(`/lodges/${lodge.slug}/rooms/${room.id}`)}
                            className="group flex items-center gap-4 rounded-[2rem] border border-black/5 dark:border-white/5 bg-white dark:bg-[#0f1d2e] p-4 transition hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
                          >
                            <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl">
                              <img
                                src={room.photos[0]}
                                alt={room.roomType}
                                className="absolute inset-0 h-full w-full object-cover"
                              />
                            </div>
                            <div className="flex-grow min-w-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                              <div className="text-left">
                                <h3 className="font-bold text-navy dark:text-white text-base truncate">{room.roomType}</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{lodge.name} · {lodge.area}</p>
                              </div>
                              <div className="flex items-center gap-4 self-start sm:self-auto">
                                <div className="text-left sm:text-right">
                                  <p className="text-sm font-extrabold text-gold">{formatNaira(room.price)}</p>
                                  <span className={cn(
                                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase mt-1",
                                    room.availability === 'available'
                                      ? 'bg-green-100 dark:bg-green-950/30 text-green-600 dark:text-green-400'
                                      : 'bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400'
                                  )}>
                                    {room.availability}
                                  </span>
                                </div>
                                <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gold transition-colors duration-200" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-[3rem] border border-dashed border-black/10 dark:border-white/10 bg-white dark:bg-[#0f1d2e] py-20 text-center">
                        <Clock className="mx-auto h-10 w-10 text-gray-200 dark:text-white/20" />
                        <p className="mt-4 text-lg font-bold text-navy dark:text-white">No recently viewed rooms</p>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">The rooms you browse will appear here.</p>
                      </div>
                    )}
                  </motion.section>
                )}

                {/* 4. Notifications Section */}
                {activeSection === 'notifications' && (
                  <motion.section
                    key="notifications"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <div className="space-y-4">
                      {notifications.length > 0 ? (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => markAsRead(n.id)}
                            className={cn(
                              "group relative cursor-pointer overflow-hidden rounded-3xl border border-black/5 dark:border-white/5 p-5 transition-all hover:bg-white dark:hover:bg-[#162535] md:p-6",
                              !n.read ? "bg-gold/5 border-gold/10 dark:bg-gold/5 dark:border-gold/10" : "bg-white/50 dark:bg-[#0f1d2e]/50"
                            )}
                          >
                            <div className="flex gap-5">
                              <div className={cn(
                                "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl",
                                n.type === 'roommate_match' ? "bg-green-100 dark:bg-green-950/30 text-green-600 dark:text-green-400" :
                                  n.type === 'availability' ? "bg-gold/10 dark:bg-gold/10 text-gold" :
                                    "bg-navy/5 dark:bg-white/5 text-navy/40 dark:text-white/40"
                              )}>
                                {n.type === 'roommate_match' ? <Users className="h-6 w-6" /> :
                                  n.type === 'availability' ? <MapPin className="h-6 w-6" /> :
                                    <Bell className="h-6 w-6" />}
                              </div>
                              <div className="flex-1 space-y-1 text-left">
                                <div className="flex items-center justify-between gap-2">
                                  <h3 className="font-bold text-navy dark:text-white text-sm md:text-base">{n.title}</h3>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 md:text-xs uppercase tracking-wider">{n.time}</span>
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        deleteNotification(n.id);
                                      }}
                                      className="p-1 rounded-full text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer"
                                      title="Delete notification"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </div>
                                <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400 md:text-sm">{n.message}</p>

                                {n.type === 'roommate_match' && n.actionPhone && (
                                  <div className="pt-4">
                                    <a
                                      href={getWhatsAppLink(n.actionPhone, n.actionName || 'Roommate')}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-2 rounded-full bg-green-500 px-6 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-green-600 hover:shadow-lg active:scale-95"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <MessageCircle className="h-4 w-4" />
                                      Chat on WhatsApp
                                    </a>
                                  </div>
                                )}
                              </div>
                              {!n.read && (
                                <div className="absolute right-6 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-gold shadow-[0_0_12px_#C9952A]" />
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-[3rem] border border-dashed border-black/10 dark:border-white/10 bg-white dark:bg-[#0f1d2e] py-20 text-center">
                          <p className="text-sm text-gray-500 dark:text-gray-400 font-bold">No notifications yet.</p>
                        </div>
                      )}
                    </div>
                  </motion.section>
                )}

                {/* 5. Roommate Board Section */}
                {activeSection === 'roommates' && (
                  <motion.section
                    key="roommates"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <RoommateNoticeboardContent />
                  </motion.section>
                )}

                {/* 6. Settings Section */}
                {activeSection === 'settings' && (
                  <motion.section
                    key="settings"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    {/* Settings Title Header */}
                    <div className="mb-4 md:mb-8 text-left p-4 ">
                      <h1 className="text-3xl md:text-3xl font-extrabold tracking-tight text-navy dark:text-white">
                        Settings
                      </h1>
                      <p className="text-muted-foreground text-xs md:text-sm mt-1">
                        Manage your account settings and preferences
                      </p>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8 text-left">
                      {/* Left Sidebar categories panel */}
                      <div className="w-full lg:w-72 shrink-0">
                        <div className="rounded-3xl bg-white dark:bg-gradient-to-br dark:from-[#0f1d2e] dark:to-[#162535] p-4 border border-black/5 dark:border-white/5 space-y-1 shadow-sm">
                          {[
                            { id: 'profile', label: 'Profile', icon: User },
                            { id: 'account', label: 'Account', icon: Settings },
                            { id: 'roommate', label: 'Roommate Preferences', icon: Users },
                            { id: 'privacy', label: 'Privacy & Safety', icon: Shield },
                            { id: 'notifications', label: 'Notifications', icon: Bell },
                            { id: 'appearance', label: 'Appearance', icon: Palette },
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
                                    : "text-gray-550 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-navy dark:hover:text-white"
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
                      <div className="flex-1">
                        <div className="rounded-3xl bg-white dark:bg-gradient-to-br dark:from-[#0f1d2e] dark:to-[#162535] p-6 md:p-8 border border-black/5 dark:border-white/5 shadow-sm min-h-[400px] overflow-hidden">
                          <AnimatePresence mode="wait">

                            {/* Profile settings form */}
                            {settingsTab === 'profile' && (
                              <motion.div
                                key="profile"
                                initial={{ opacity: 0, x: 16 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -16 }}
                                transition={{ duration: 0.15, ease: "easeInOut" }}
                              >
                                <form onSubmit={handleUpdateStudentProfile} className="space-y-6">
                                  <div>
                                    <h3 className="text-xl font-bold text-navy dark:text-white">Profile Settings</h3>
                                    <p className="text-xs text-gray-550 dark:text-gray-400 mt-1">Manage your student profile details visible on CampusHub</p>
                                  </div>
                                  <div className="border-b border-black/5 dark:border-white/5 pb-6">
                                    <div className="flex items-center gap-4">
                                      <div className="relative">
                                        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-navy/5 dark:bg-white/5 text-2xl font-bold text-gold ring-4 ring-white dark:ring-[#0f1d2e] shadow-md overflow-hidden">
                                          {student.avatar_url ? (
                                            <img src={student.avatar_url} alt={student.full_name} className="h-full w-full object-cover" />
                                          ) : (
                                            getInitials(student.full_name)
                                          )}
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => document.getElementById("settings-avatar-upload")?.click()}
                                          className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-gold text-navy shadow-md ring-2 ring-white dark:ring-[#0f1d2e] hover:scale-105 transition cursor-pointer"
                                        >
                                          <Edit className="h-3 w-3" />
                                        </button>
                                        <input
                                          id="settings-avatar-upload"
                                          type="file"
                                          accept="image/*"
                                          className="hidden"
                                          onChange={handleImageUpload}
                                        />
                                      </div>
                                      <div>
                                        <h4 className="text-sm font-bold text-navy dark:text-white">Avatar Image</h4>
                                        <p className="text-[11px] text-gray-550 dark:text-gray-400 mt-0.5">JPG or PNG. Max 2MB.</p>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-1.5">
                                      <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Full Name</label>
                                      <input
                                        type="text"
                                        required
                                        value={student.full_name}
                                        onChange={(e) => setStudent({ ...student, full_name: e.target.value })}
                                        className="w-full rounded-xl bg-gray-55/20 dark:bg-white/5 text-navy dark:text-white px-4 py-3.5 text-sm ring-1 ring-black/5 dark:ring-white/5 focus:ring-2 focus:ring-gold transition-all outline-none"
                                      />
                                    </div>
                                    <div className="space-y-1.5">
                                      <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Email Address</label>
                                      <input
                                        type="email"
                                        disabled
                                        value={student.email}
                                        className="w-full rounded-xl bg-gray-100 dark:bg-white/5 text-navy/40 dark:text-white/40 px-4 py-3.5 text-sm ring-1 ring-black/5 dark:ring-white/5 cursor-not-allowed outline-none font-medium"
                                      />
                                    </div>
                                    <div className="space-y-1.5">
                                      <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Phone Number</label>
                                      <input
                                        type="tel"
                                        required
                                        value={student.phone}
                                        onChange={(e) => setStudent({ ...student, phone: e.target.value })}
                                        className="w-full rounded-xl bg-gray-55/20 dark:bg-white/5 text-navy dark:text-white px-4 py-3.5 text-sm ring-1 ring-black/5 dark:ring-white/5 focus:ring-2 focus:ring-gold transition-all outline-none"
                                      />
                                    </div>
                                    <div className="space-y-1.5">
                                      <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Department</label>
                                      <input
                                        type="text"
                                        required
                                        value={student.department}
                                        onChange={(e) => setStudent({ ...student, department: e.target.value })}
                                        className="w-full rounded-xl bg-gray-55/20 dark:bg-white/5 text-navy dark:text-white px-4 py-3.5 text-sm ring-1 ring-black/5 dark:ring-white/5 focus:ring-2 focus:ring-gold transition-all outline-none"
                                      />
                                    </div>
                                    <div className="space-y-1.5">
                                      <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Academic Level</label>
                                      <select
                                        value={student.level}
                                        onChange={(e) => setStudent({ ...student, level: e.target.value })}
                                        className="w-full rounded-xl bg-gray-50 dark:bg-[#162535] text-navy dark:text-white px-4 py-3.5 text-sm ring-1 ring-black/5 dark:ring-white/5 focus:ring-2 focus:ring-gold outline-none"
                                      >
                                        {['100', '200', '300', '400', '500'].map(lvl => (
                                          <option key={lvl} value={lvl}>{lvl} Level</option>
                                        ))}
                                      </select>
                                    </div>
                                    <div className="space-y-1.5">
                                      <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Gender</label>
                                      <select
                                        value={student.gender || 'Female'}
                                        onChange={(e) => setStudent({ ...student, gender: e.target.value })}
                                        className="w-full rounded-xl bg-gray-50 dark:bg-[#162535] text-navy dark:text-white px-4 py-3.5 text-sm ring-1 ring-black/5 dark:ring-white/5 focus:ring-2 focus:ring-gold outline-none"
                                      >
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="pt-4 text-right">
                                    <button
                                      type="submit"
                                      className="rounded-full bg-gold hover:bg-gold/90 px-6 py-3.5 font-bold text-navy shadow-md text-sm cursor-pointer hover:-translate-y-0.5 transition border-0"
                                    >
                                      Update Profile
                                    </button>
                                  </div>
                                </form>
                              </motion.div>
                            )}

                            {/* Account Settings form (Change Password) */}
                            {settingsTab === 'account' && (
                              <motion.div
                                key="account"
                                initial={{ opacity: 0, x: 16 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -16 }}
                                transition={{ duration: 0.15, ease: "easeInOut" }}
                              >
                                <form onSubmit={handleUpdatePassword} className="space-y-6">
                                  <div>
                                    <h3 className="text-xl font-bold text-navy dark:text-white">Account Settings</h3>
                                    <p className="text-xs text-gray-555 dark:text-gray-400 mt-1">Manage your account credentials and security details</p>
                                  </div>
                                  <div className="space-y-4 max-w-md">
                                    <div className="space-y-1.5">
                                      <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Current Password</label>
                                      <input
                                        type="password"
                                        required
                                        placeholder="Enter current password"
                                        value={passwordForm.current}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                                        className="w-full rounded-xl bg-gray-55/20 dark:bg-white/5 text-navy dark:text-white px-4 py-3.5 text-sm ring-1 ring-black/5 dark:ring-white/5 focus:ring-2 focus:ring-gold transition-all outline-none"
                                      />
                                    </div>
                                    <div className="space-y-1.5">
                                      <label className="text-xs font-bold uppercase tracking-wider text-gray-400">New Password</label>
                                      <input
                                        type="password"
                                        required
                                        placeholder="Enter new password"
                                        value={passwordForm.new}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                                        className="w-full rounded-xl bg-gray-55/20 dark:bg-white/5 text-navy dark:text-white px-4 py-3.5 text-sm ring-1 ring-black/5 dark:ring-white/5 focus:ring-2 focus:ring-gold transition-all outline-none"
                                      />
                                    </div>
                                    <div className="space-y-1.5">
                                      <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Confirm New Password</label>
                                      <input
                                        type="password"
                                        required
                                        placeholder="Confirm new password"
                                        value={passwordForm.confirm}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                                        className="w-full rounded-xl bg-gray-55/20 dark:bg-white/5 text-navy dark:text-white px-4 py-3.5 text-sm ring-1 ring-black/5 dark:ring-white/5 focus:ring-2 focus:ring-gold transition-all outline-none"
                                      />
                                    </div>
                                  </div>
                                  <div className="pt-4">
                                    <button
                                      type="submit"
                                      className="rounded-full bg-gold hover:bg-gold/90 px-6 py-3.5 font-bold text-navy shadow-md text-sm cursor-pointer hover:-translate-y-0.5 transition border-0"
                                    >
                                      Update Password
                                    </button>
                                  </div>
                                </form>
                              </motion.div>
                            )}

                            {/* Roommate preferences form */}
                            {settingsTab === 'roommate' && (
                              <motion.div
                                key="roommate"
                                initial={{ opacity: 0, x: 16 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -16 }}
                                transition={{ duration: 0.15, ease: "easeInOut" }}
                              >
                                <div className="space-y-6">
                                  <div>
                                    <h3 className="text-xl font-bold text-navy dark:text-white">Roommate Preferences</h3>
                                    <p className="text-xs text-gray-555 dark:text-gray-400 mt-1">Set matching preferences used to suggest prospective roommates</p>
                                  </div>
                                  <div className="grid gap-6 sm:grid-cols-2 max-w-xl">
                                    <div className="space-y-1.5">
                                      <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Roommate Gender Preference</label>
                                      <select
                                        value={prefGender}
                                        onChange={(e) => setPrefGender(e.target.value)}
                                        className="w-full rounded-xl bg-gray-50 dark:bg-[#162535] text-navy dark:text-white px-4 py-3.5 text-sm ring-1 ring-black/5 dark:ring-white/5 focus:ring-2 focus:ring-gold outline-none"
                                      >
                                        <option value="Any">Gender: Any</option>
                                        <option value="Male only">Male only</option>
                                        <option value="Female only">Female only</option>
                                      </select>
                                    </div>
                                    <div className="space-y-1.5">
                                      <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Budget Range Preference</label>
                                      <select
                                        value={prefBudget}
                                        onChange={(e) => setPrefBudget(e.target.value)}
                                        className="w-full rounded-xl bg-gray-50 dark:bg-[#162535] text-navy dark:text-white px-4 py-3.5 text-sm ring-1 ring-black/5 dark:ring-white/5 focus:ring-2 focus:ring-gold outline-none"
                                      >
                                        <option value="₦50,000 – ₦80,000">₦50,000 – ₦80,000</option>
                                        <option value="₦80,000 – ₦120,000">₦80,000 – ₦120,000</option>
                                        <option value="₦120,000 – ₦150,000">₦120,000 – ₦150,000</option>
                                        <option value="₦150,000 – ₦200,000">₦150,000 – ₦200,000</option>
                                        <option value="₦200,000+">₦200,000+</option>
                                      </select>
                                    </div>
                                    <div className="space-y-1.5 col-span-full">
                                      <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Preferred Area/Location</label>
                                      <select
                                        value={prefLocation}
                                        onChange={(e) => setPrefLocation(e.target.value)}
                                        className="w-full rounded-xl bg-gray-50 dark:bg-[#162535] text-navy dark:text-white px-4 py-3.5 text-sm ring-1 ring-black/5 dark:ring-white/5 focus:ring-2 focus:ring-gold outline-none"
                                      >
                                        <option value="Eziobodo">Eziobodo (Near FUTO Gate)</option>
                                        <option value="Ihiagwa">Ihiagwa Campus Area</option>
                                        <option value="Umuchima">Umuchima Village</option>
                                        <option value="FUTO Campus">FUTO In-Campus Hostels</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="pt-4">
                                    <button
                                      onClick={() => handleSaveSettingsPrefs("Roommate preferences")}
                                      className="rounded-full bg-gold hover:bg-gold/90 px-6 py-3.5 font-bold text-navy shadow-md text-sm cursor-pointer hover:-translate-y-0.5 transition border-0"
                                    >
                                      Save Preferences
                                    </button>
                                  </div>
                                </div>
                              </motion.div>
                            )}

                            {/* Privacy & Safety Form */}
                            {settingsTab === 'privacy' && (
                              <motion.div
                                key="privacy"
                                initial={{ opacity: 0, x: 16 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -16 }}
                                transition={{ duration: 0.15, ease: "easeInOut" }}
                              >
                                <div className="space-y-6">
                                  <div>
                                    <h3 className="text-xl font-bold text-navy dark:text-white">Privacy & Safety</h3>
                                    <p className="text-xs text-gray-550 dark:text-gray-400 mt-1">Control how your contact details and roommate profile are shared</p>
                                  </div>
                                  <div className="space-y-4 max-w-lg">
                                    <label className="flex items-start gap-3 rounded-2xl bg-gray-50 dark:bg-white/5 p-4 border border-black/5 dark:border-white/5 cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 transition">
                                      <input
                                        type="checkbox"
                                        checked={privacyProfilePublic}
                                        onChange={(e) => setPrivacyProfilePublic(e.target.checked)}
                                        className="mt-1 h-4 w-4 rounded border-gray-300 accent-gold focus:ring-gold cursor-pointer"
                                      />
                                      <div className="space-y-0.5 text-left">
                                        <span className="text-sm font-bold text-navy dark:text-white">Public Matching Profile</span>
                                        <p className="text-xs text-gray-550 dark:text-gray-400">Allow other students on CampHub to view your noticecard profile and send matching requests.</p>
                                      </div>
                                    </label>
                                    <label className="flex items-start gap-3 rounded-2xl bg-gray-50 dark:bg-white/5 p-4 border border-black/5 dark:border-white/5 cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 transition">
                                      <input
                                        type="checkbox"
                                        checked={privacyPhonePublic}
                                        onChange={(e) => setPrivacyPhonePublic(e.target.checked)}
                                        className="mt-1 h-4 w-4 rounded border-gray-300 accent-gold focus:ring-gold cursor-pointer"
                                      />
                                      <div className="space-y-0.5 text-left">
                                        <span className="text-sm font-bold text-navy dark:text-white">Show WhatsApp Phone to matches</span>
                                        <p className="text-xs text-gray-550 dark:text-gray-400">Reveal your phone number to prospective roommates only after you accept their matching request.</p>
                                      </div>
                                    </label>
                                  </div>
                                  <div className="pt-4">
                                    <button
                                      onClick={() => handleSaveSettingsPrefs("Privacy settings")}
                                      className="rounded-full bg-gold hover:bg-gold/90 px-6 py-3.5 font-bold text-navy shadow-md text-sm cursor-pointer hover:-translate-y-0.5 transition border-0"
                                    >
                                      Save Privacy Settings
                                    </button>
                                  </div>
                                </div>
                              </motion.div>
                            )}

                            {/* Notifications Form */}
                            {settingsTab === 'notifications' && (
                              <motion.div
                                key="notifications"
                                initial={{ opacity: 0, x: 16 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -16 }}
                                transition={{ duration: 0.15, ease: "easeInOut" }}
                              >
                                <div className="space-y-6">
                                  <div>
                                    <h3 className="text-xl font-bold text-navy dark:text-white">Notification Preferences</h3>
                                    <p className="text-xs text-gray-555 dark:text-gray-400 mt-1">Manage channels and frequency of match update notifications</p>
                                  </div>
                                  <div className="space-y-4 max-w-lg">
                                    <label className="flex items-start gap-3 rounded-2xl bg-gray-50 dark:bg-white/5 p-4 border border-black/5 dark:border-white/5 cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 transition">
                                      <input
                                        type="checkbox"
                                        checked={notifyMatches}
                                        onChange={(e) => setNotifyMatches(e.target.checked)}
                                        className="mt-1 h-4 w-4 rounded border-gray-300 accent-gold focus:ring-gold cursor-pointer"
                                      />
                                      <div className="space-y-0.5 text-left">
                                        <span className="text-sm font-bold text-navy dark:text-white">Email Match Alerts</span>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Send me a summary of matched roommate profiles to my student email address.</p>
                                      </div>
                                    </label>
                                    <label className="flex items-start gap-3 rounded-2xl bg-gray-50 dark:bg-white/5 p-4 border border-black/5 dark:border-white/5 cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 transition">
                                      <input
                                        type="checkbox"
                                        checked={notifyWhatsApp}
                                        onChange={(e) => setNotifyWhatsApp(e.target.checked)}
                                        className="mt-1 h-4 w-4 rounded border-gray-300 accent-gold focus:ring-gold cursor-pointer"
                                      />
                                      <div className="space-y-0.5 text-left">
                                        <span className="text-sm font-bold text-navy dark:text-white">WhatsApp Match Notifications</span>
                                        <p className="text-xs text-gray-550 dark:text-gray-400">Instantly text me match notifications via CampusHub WhatsApp helper bot.</p>
                                      </div>
                                    </label>
                                  </div>
                                  <div className="pt-4">
                                    <button
                                      onClick={() => handleSaveSettingsPrefs("Notification preferences")}
                                      className="rounded-full bg-gold hover:bg-gold/90 px-6 py-3.5 font-bold text-navy shadow-md text-sm cursor-pointer hover:-translate-y-0.5 transition border-0"
                                    >
                                      Save Notification Settings
                                    </button>
                                  </div>
                                </div>
                              </motion.div>
                            )}

                            {/* Appearance Form (Theme Selectors) */}
                            {settingsTab === 'appearance' && (
                              <motion.div
                                key="appearance"
                                initial={{ opacity: 0, x: 16 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -16 }}
                                transition={{ duration: 0.15, ease: "easeInOut" }}
                              >
                                <div className="space-y-6">
                                  <div>
                                    <h3 className="text-xl font-bold text-navy dark:text-white">Appearance Settings</h3>
                                    <p className="text-xs text-gray-555 dark:text-gray-400 mt-1">Customize the interface look, dark modes, and visual layouts</p>
                                  </div>
                                  <div className="space-y-4 text-left">
                                    <span className="text-xs font-bold uppercase tracking-wider text-gray-450">Select Theme Mode</span>
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
                                              "flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border transition-all cursor-pointer bg-gray-50 dark:bg-[#162535]",
                                              isThemeActive
                                                ? "border-gold ring-2 ring-gold/20 text-gold dark:text-gold"
                                                : "border-black/5 dark:border-white/5 text-gray-500 dark:text-gray-455 hover:bg-gray-100 dark:hover:bg-white/10"
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

                            {/* Danger Zone */}
                            {settingsTab === 'danger' && (
                              <motion.div
                                key="danger"
                                initial={{ opacity: 0, x: 16 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -16 }}
                                transition={{ duration: 0.15, ease: "easeInOut" }}
                              >
                                <div className="space-y-6 text-left">
                                  <div>
                                    <h3 className="text-xl font-bold text-rose-700 dark:text-rose-500">Danger Zone</h3>
                                    <p className="text-xs text-rose-900/60 dark:text-rose-300/60 mt-1">Irreversible account deactivation and deletion options</p>
                                  </div>
                                  
                                  <div className="p-5 bg-rose-50 dark:bg-rose-500/5 rounded-3xl border border-rose-500/10 space-y-4 max-w-xl">
                                    <div className="space-y-1 text-left">
                                      <h4 className="text-sm font-bold text-rose-700 dark:text-rose-455">Deactivate Account</h4>
                                      <p className="text-xs text-rose-900/60 dark:text-rose-300/60">Temporarily hide all listed items and flatmate profiles from CampusHub browser search results. You can reactivate your account at any time.</p>
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
                  </motion.section>
                )}

                {/* 7. Marketplace Section */}
                {activeSection === 'marketplace' && (
                  <motion.section
                    key="marketplace"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6 text-left"
                  >
                    {/* Header */}
                    {!activeProduct && (
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-[#0f1d2e] p-6 rounded-3xl border border-black/5 dark:border-white/5 shadow-sm">
                        <div>
                          <h1 className="text-2xl font-extrabold tracking-tight text-navy dark:text-white">Student Marketplace</h1>
                          <p className="text-xs text-muted-foreground mt-1">Buy and sell items directly with other FUTO students.</p>
                        </div>
                        <button
                          onClick={() => setIsMarketVettingModalOpen(true)}
                          className="inline-flex items-center gap-2 rounded-full bg-gold hover:bg-gold/90 px-5 py-3 text-xs font-bold text-navy shadow-md transition hover:-translate-y-0.5 border-0 self-start sm:self-auto cursor-pointer"
                        >
                          <Plus className="h-4 w-4" />
                          Post an Item
                        </button>
                      </div>
                    )}

                    {/* Sub-Tabs Selector */}
                    {!activeProduct && (
                      <div className="flex border-b border-black/5 dark:border-white/5">
                        <button
                          onClick={() => { setMarketplaceTab('browse'); setActiveProduct(null); }}
                          className={cn(
                            "px-6 py-3 font-bold text-sm border-b-2 transition-all cursor-pointer border-0 bg-transparent",
                            marketplaceTab === 'browse' ? "border-gold text-gold" : "border-transparent text-gray-55/60 hover:text-navy dark:hover:text-white"
                          )}
                        >
                          Browse Items
                        </button>
                        <button
                          onClick={() => { setMarketplaceTab('my-items'); setActiveProduct(null); }}
                          className={cn(
                            "px-6 py-3 font-bold text-sm border-b-2 transition-all cursor-pointer border-0 bg-transparent",
                            marketplaceTab === 'my-items' ? "border-gold text-gold" : "border-transparent text-gray-55/60 hover:text-navy dark:hover:text-white"
                          )}
                        >
                          My Listings
                        </button>
                      </div>
                    )}

                    {marketplaceTab === 'browse' ? (
                      activeProduct ? (
                        <div className="space-y-6">
                          {/* Back Button */}
                          <button
                            onClick={() => {
                              setActiveProduct(null);
                              setActiveImageIndex(0);
                            }}
                            className="inline-flex items-center gap-2 text-sm font-bold text-navy dark:text-white bg-transparent border-0 cursor-pointer hover:opacity-85 transition self-start"
                          >
                            <ArrowLeft size={16} className="text-gold" />
                            Back
                          </button>

                          {/* Image Card */}
                          <div className="bg-white dark:bg-[#0f1d2e] rounded-[2rem] border border-black/5 dark:border-white/5 shadow-sm overflow-hidden p-4 md:p-6 relative">
                            <div className="relative aspect-[4/3] lg:aspect-auto lg:h-[480px] w-full rounded-2xl overflow-hidden bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                              {activeProduct.photos && activeProduct.photos.length > 0 ? (
                                <img
                                  src={activeProduct.photos[activeImageIndex]}
                                  alt={activeProduct.title}
                                  className="h-full w-full object-cover transition duration-300"
                                />
                              ) : (
                                <ShoppingBag className="h-16 w-16 text-gray-300" />
                              )}

                              {/* Navigation arrows overlay shown always on desktop/lg, and prev/next controls on touch or overlay */}
                              {activeProduct.photos && activeProduct.photos.length > 1 && (
                                <>
                                  {/* Left arrow */}
                                  <button
                                    type="button"
                                    onClick={() => setActiveImageIndex(prev => (prev === 0 ? activeProduct.photos.length - 1 : prev - 1))}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center border-0 cursor-pointer backdrop-blur-sm transition z-20"
                                    aria-label="Previous image"
                                  >
                                    <ChevronLeft size={20} />
                                  </button>
                                  {/* Right arrow */}
                                  <button
                                    type="button"
                                    onClick={() => setActiveImageIndex(prev => (prev === activeProduct.photos.length - 1 ? 0 : prev + 1))}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center border-0 cursor-pointer backdrop-blur-sm transition z-20"
                                    aria-label="Next image"
                                  >
                                    <ChevronRight size={20} />
                                  </button>

                                  {/* Mobile Swipe Indicators / Pagination dots */}
                                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                                    {activeProduct.photos.map((_, idx) => (
                                      <button
                                        key={idx}
                                        type="button"
                                        onClick={() => setActiveImageIndex(idx)}
                                        className={cn(
                                          "h-2 w-2 rounded-full border-0 transition-all cursor-pointer",
                                          idx === activeImageIndex ? "bg-gold w-4" : "bg-white/50 hover:bg-white"
                                        )}
                                        aria-label={`Go to slide ${idx + 1}`}
                                      />
                                    ))}
                                  </div>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Description & Product Info Card (Separated from image card) */}
                          <div className="bg-white dark:bg-[#0f1d2e] rounded-[2rem] border border-black/5 dark:border-white/5 shadow-sm p-6 space-y-6">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                              <div className="space-y-1">
                                <div className="flex flex-wrap gap-2">
                                  <span className="bg-gold/15 text-gold px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase">
                                    {activeProduct.category}
                                  </span>
                                  <span className={cn(
                                    "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase",
                                    getConditionColor(activeProduct.condition)
                                  )}>
                                    {activeProduct.condition}
                                  </span>
                                  <span className="inline-flex items-center gap-1 bg-navy/5 dark:bg-white/5 rounded-full px-2.5 py-0.5 text-[10px] font-bold text-navy/70 dark:text-white/70">
                                    <Eye size={12} className="text-gray-400 dark:text-gray-500" />
                                    <span>{activeProduct.views || 1} views</span>
                                  </span>
                                </div>
                                <h2 className="text-xl md:text-2xl font-extrabold text-navy dark:text-white tracking-tight">
                                  {activeProduct.title}
                                </h2>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <MapPin size={12} className="text-gold" /> {activeProduct.area}
                                </p>
                              </div>
                              <div className="text-left md:text-right">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Price</span>
                                <p className="text-2xl font-extrabold text-gold">{formatNaira(activeProduct.price)}</p>
                              </div>
                            </div>

                            {activeProduct.description && (
                              <div className="space-y-2 border-t border-black/5 dark:border-white/5 pt-4">
                                <h3 className="text-sm font-bold text-navy dark:text-white uppercase tracking-wider">Product Description</h3>
                                <p className="text-xs md:text-sm text-navy/70 dark:text-gray-300 leading-relaxed whitespace-pre-wrap bg-gray-50/50 dark:bg-white/[0.02] p-4 rounded-2xl border border-black/5 dark:border-white/5">
                                  {activeProduct.description}
                                </p>
                              </div>
                            )}

                            {/* Seller & Contact Info */}
                            <div className="border-t border-black/5 dark:border-white/5 pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Seller Info</span>
                                <p className="text-sm font-bold text-navy dark:text-white">{activeProduct.seller_name}</p>
                                <p className="text-xs text-muted-foreground">Listing date: {new Date(activeProduct.created_at).toLocaleDateString()}</p>
                              </div>

                              {activeProduct.seller_id !== student.id ? (
                                <a
                                  href={getSellerWhatsAppLink(activeProduct.seller_phone, activeProduct.title)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center justify-center gap-2 rounded-full border border-gold hover:bg-gold/10 px-6 py-3 text-xs font-bold text-gold transition-colors cursor-pointer no-underline"
                                >
                                  <MessageCircle size={14} />
                                  Chat to Buy
                                </a>
                              ) : (
                                <div className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground bg-gray-50 dark:bg-white/5 rounded-xl">
                                  Your Listing
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {/* Filters Panel */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white dark:bg-[#0f1d2e] p-5 rounded-3xl border border-black/5 dark:border-white/5 shadow-sm">
                            {/* Category Filter */}
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Category</label>
                              <CustomSelect
                                value={filterCategory}
                                onChange={setFilterCategory}
                                options={[
                                  { value: "All", label: "All Categories" },
                                  { value: "Electronics", label: "Electronics" },
                                  { value: "Furniture", label: "Furniture" },
                                  { value: "Kitchen", label: "Kitchen" },
                                  { value: "Books", label: "Books" },
                                  { value: "Other", label: "Other" }
                                ]}
                              />
                            </div>

                            {/* Condition Filter */}
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Condition</label>
                              <CustomSelect
                                value={filterCondition}
                                onChange={setFilterCondition}
                                options={[
                                  { value: "All", label: "All Conditions" },
                                  { value: "New", label: "New" },
                                  { value: "Gently Used", label: "Gently Used" },
                                  { value: "Fair", label: "Fair" }
                                ]}
                              />
                            </div>

                            {/* Area Filter */}
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Area</label>
                              <CustomSelect
                                value={filterArea}
                                onChange={setFilterArea}
                                options={[
                                  { value: "All", label: "All Areas" },
                                  { value: "Eziobodo", label: "Eziobodo" },
                                  { value: "Ihiagwa", label: "Ihiagwa" },
                                  { value: "Umuchima", label: "Umuchima" },
                                  { value: "FUTO", label: "FUTO Campus" }
                                ]}
                              />
                            </div>

                            {/* Max Price Filter */}
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Max Price (₦)</label>
                              <input
                                type="number"
                                placeholder="e.g. 50000"
                                value={filterMaxPrice}
                                onChange={(e) => setFilterMaxPrice(e.target.value)}
                                className="w-full rounded-xl bg-gray-55/20 dark:bg-[#162535] text-navy dark:text-white px-3 py-2 text-xs border border-navy/5 outline-none"
                              />
                            </div>
                          </div>

                          {/* Items Grid */}
                          {marketplaceLoading ? (
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                <div
                                  key={i}
                                  className="flex flex-col rounded-[2.5rem] border border-black/5 dark:border-white/5 bg-white dark:bg-[#0f1d2e] overflow-hidden p-5 space-y-4 animate-pulse text-left"
                                >
                                  <div className="h-48 w-full bg-gray-200 dark:bg-white/5 rounded-2xl" />
                                  <div className="space-y-3 flex-1 flex flex-col justify-between">
                                    <div className="space-y-2">
                                      <div className="h-4 w-3/4 bg-gray-200 dark:bg-white/5 rounded-md" />
                                      <div className="h-3 w-1/2 bg-gray-200 dark:bg-white/5 rounded-md" />
                                    </div>
                                    <div className="space-y-2 pt-2">
                                      <div className="h-4 w-1/3 bg-gray-200 dark:bg-white/5 rounded-md" />
                                      <div className="h-8 w-full bg-gray-200 dark:bg-white/5 rounded-full mt-2" />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : marketplaceItems.filter(item => {
                            if (item.status !== 'active') return false;
                            if (filterCategory !== 'All' && item.category !== filterCategory) return false;
                            if (filterCondition !== 'All' && item.condition !== filterCondition) return false;
                            if (filterArea !== 'All' && !item.area.toLowerCase().includes(filterArea.toLowerCase())) return false;
                            if (filterMaxPrice && item.price > parseFloat(filterMaxPrice)) return false;
                            return true;
                          }).length > 0 ? (
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                              {marketplaceItems.filter(item => {
                                if (item.status !== 'active') return false;
                                if (filterCategory !== 'All' && item.category !== filterCategory) return false;
                                if (filterCondition !== 'All' && item.condition !== filterCondition) return false;
                                if (filterArea !== 'All' && !item.area.toLowerCase().includes(filterArea.toLowerCase())) return false;
                                if (filterMaxPrice && item.price > parseFloat(filterMaxPrice)) return false;
                                return true;
                              }).map(item => (
                                <div
                                  key={item.id}
                                  onClick={() => { setActiveProduct(item); setActiveImageIndex(0); }}
                                  className="group flex flex-col rounded-[2rem] border border-black/5 dark:border-white/5 bg-white dark:bg-[#0f1d2e] overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer text-left"
                                >
                                  <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-white/5">
                                    <img
                                      src={item.photos[0]}
                                      alt={item.title}
                                      className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                    />
                                    <span className={cn(
                                      "absolute top-4 left-4 rounded-full px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider shadow-sm",
                                      getConditionColor(item.condition)
                                    )}>
                                      {item.condition}
                                    </span>
                                    <span className="absolute bottom-4 right-4 bg-navy/80 text-white rounded-full px-3 py-1 text-[10px] font-bold backdrop-blur-sm">
                                      {item.category}
                                    </span>
                                  </div>
                                  <div className="p-5 flex-1 flex flex-col justify-between text-left space-y-4">
                                    <div className="space-y-1">
                                      <h3 className="font-extrabold text-navy dark:text-white text-base tracking-tight truncate" title={item.title}>
                                        {item.title}
                                      </h3>
                                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                                        <MapPin size={12} className="text-gold" /> {item.area}
                                      </p>
                                      <p className="text-sm font-extrabold text-gold mt-2">{formatNaira(item.price)}</p>
                                      {item.description && (
                                        <p className="text-xs text-navy/70 dark:text-gray-400 mt-2 line-clamp-2 leading-relaxed">
                                          {item.description}
                                        </p>
                                      )}
                                    </div>

                                    {item.seller_id !== student.id ? (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setActiveProduct(item);
                                          setActiveImageIndex(0);
                                        }}
                                        className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-gold hover:bg-gold/10 px-4 py-2.5 text-xs font-bold text-gold transition-colors bg-transparent cursor-pointer"
                                      >
                                        <Eye size={14} />
                                        View Product
                                      </button>
                                    ) : (
                                      <div className="text-center py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-gray-50 dark:bg-white/5 rounded-xl">
                                        My Listing
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="rounded-[3rem] border border-dashed border-black/10 dark:border-white/10 bg-white dark:bg-[#0f1d2e] py-20 text-center">
                              <ShoppingBag className="mx-auto h-12 w-12 text-gray-250 dark:text-white/20" />
                              <p className="mt-4 text-base font-bold text-navy dark:text-white">No items found</p>
                              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Try adjusting your filters or category selection.</p>
                            </div>
                          )}
                        </div>
                      )
                    ) : (
                      /* My Items Management Tab */
                      <div className="space-y-6">
                        {marketplaceItems.filter(item => item.seller_id === student.id && item.status !== 'deleted').length > 0 ? (
                          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {marketplaceItems.filter(item => item.seller_id === student.id && item.status !== 'deleted').map(item => (
                              <div
                                key={item.id}
                                className={cn(
                                  "group flex flex-col rounded-[2rem] border overflow-hidden shadow-sm transition-all duration-200 bg-white dark:bg-[#0f1d2e]",
                                  item.status === 'sold' ? "border-black/5 dark:border-white/5 opacity-70" : "border-black/5 dark:border-white/5"
                                )}
                              >
                                <div className="relative h-44 overflow-hidden bg-gray-100 dark:bg-white/5">
                                  <img
                                    src={item.photos[0]}
                                    alt={item.title}
                                    className="absolute inset-0 h-full w-full object-cover"
                                  />
                                  {item.status === 'sold' && (
                                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                                      <span className="bg-red-500 text-white font-extrabold text-xs uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                                        Sold
                                      </span>
                                    </div>
                                  )}
                                  <span className={cn(
                                    "absolute top-4 left-4 rounded-full px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider shadow-sm",
                                    getConditionColor(item.condition)
                                  )}>
                                    {item.condition}
                                  </span>
                                </div>
                                <div className="p-5 flex-1 flex flex-col justify-between text-left space-y-4">
                                  <div className="space-y-1">
                                    <h3 className="font-extrabold text-navy dark:text-white text-base truncate">{item.title}</h3>
                                    <p className="text-xs text-muted-foreground">{item.area}</p>
                                    <p className="text-sm font-extrabold text-gold mt-2">{formatNaira(item.price)}</p>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    {item.status === 'active' && (
                                      <>
                                        <button
                                          onClick={() => handleMarkAsSold(item.id)}
                                          className="flex-grow rounded-full bg-green-500 hover:bg-green-600 text-white py-2 text-xs font-bold transition border-0 cursor-pointer"
                                        >
                                          Mark as Sold
                                        </button>
                                        <button
                                          onClick={() => handleOpenEditItem(item)}
                                          className="rounded-full bg-navy hover:bg-navy/90 dark:bg-gold dark:hover:bg-gold/90 text-white dark:text-navy px-3 py-2 text-xs font-bold transition border-0 cursor-pointer flex items-center justify-center shrink-0"
                                          title="Edit Listing"
                                        >
                                          Edit
                                        </button>
                                      </>
                                    )}
                                    <button
                                      onClick={() => handleDeleteItem(item.id)}
                                      className="rounded-full bg-red-500 hover:bg-red-600 text-white p-2.5 transition border-0 cursor-pointer flex items-center justify-center shrink-0"
                                      title="Delete Listing"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="rounded-[3rem] border border-dashed border-black/10 dark:border-white/10 bg-white dark:bg-[#0f1d2e] py-20 text-center">
                            <Tag className="mx-auto h-12 w-12 text-gray-200 dark:text-white/20" />
                            <p className="mt-4 text-base font-bold text-navy dark:text-white">No listings posted yet</p>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Post items you want to sell to start matching with buyers.</p>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.section>
                )}

                {/* 8. Services Section */}
                {activeSection === 'services' && (
                  <motion.section
                    key="services"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6 text-left"
                  >
                    {/* Header */}
                    <div className="bg-white dark:bg-[#0f1d2e] p-6 rounded-3xl border border-black/5 dark:border-white/5 shadow-sm">
                      <h1 className="text-2xl font-extrabold tracking-tight text-navy dark:text-white">Services Directory</h1>
                      <p className="text-xs text-muted-foreground mt-1">Find admin-vetted service providers and local handy help around FUTO.</p>
                    </div>

                    {/* Providers Grid */}
                    {servicesLoading ? (
                      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                          <div
                            key={i}
                            className="flex flex-col rounded-[2.5rem] border border-black/5 dark:border-white/5 bg-white dark:bg-[#0f1d2e] overflow-hidden p-6 space-y-4 animate-pulse text-left"
                          >
                            <div className="h-44 w-full bg-gray-200 dark:bg-white/5 rounded-2xl" />
                            <div className="space-y-3 flex-1 flex flex-col justify-between">
                              <div className="space-y-2">
                                <div className="h-4 w-2/3 bg-gray-200 dark:bg-white/5 rounded-md" />
                                <div className="h-3 w-1/2 bg-gray-200 dark:bg-white/5 rounded-md" />
                                <div className="h-3 w-3/4 bg-gray-200 dark:bg-white/5 rounded-md mt-2" />
                              </div>
                              <div className="h-10 w-full bg-gray-200 dark:bg-white/5 rounded-full mt-4" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : serviceProviders.filter(p => p.is_active).length > 0 ? (
                      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {serviceProviders.filter(p => p.is_active).map(provider => (
                          <div
                            key={provider.id}
                            className="group flex flex-col rounded-[2.5rem] border border-black/5 dark:border-white/5 bg-white dark:bg-[#0f1d2e] overflow-hidden shadow-sm hover:shadow-md transition-all duration-200"
                          >
                            <div className="relative h-44 overflow-hidden bg-gray-150 dark:bg-white/5 flex items-center justify-center">
                              {provider.photo_url ? (
                                <img
                                  src={provider.photo_url}
                                  alt={provider.name}
                                  className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                />
                              ) : (
                                <div className="h-16 w-16 rounded-full bg-gold/10 text-gold flex items-center justify-center">
                                  <Wrench size={32} />
                                </div>
                              )}
                              <span className="absolute bottom-4 left-4 bg-navy/80 text-white rounded-full px-3 py-1 text-[10px] font-bold backdrop-blur-sm shadow-sm">
                                {provider.service_type}
                              </span>
                            </div>
                            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                              <div className="space-y-2">
                                <h3 className="font-extrabold text-navy dark:text-white text-base tracking-tight truncate">{provider.name}</h3>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <MapPin size={12} className="text-gold" /> {provider.area}
                                </p>
                                <p className="text-xs leading-relaxed text-navy/70 dark:text-gray-300 line-clamp-3">
                                  {provider.description}
                                </p>
                              </div>
                              <a
                                href={getProviderWhatsAppLink(provider.phone, provider.name)}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center justify-center gap-2 rounded-full bg-gold hover:bg-gold/90 px-4 py-3 text-xs font-bold text-navy shadow-md hover:-translate-y-0.5 transition border-0"
                              >
                                <MessageCircle size={14} />
                                Chat on WhatsApp
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-[3rem] border border-dashed border-black/10 dark:border-white/10 bg-white dark:bg-[#0f1d2e] py-20 text-center">
                        <Wrench className="mx-auto h-12 w-12 text-gray-250 dark:text-white/20" />
                        <p className="mt-4 text-base font-bold text-navy dark:text-white">No services available</p>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Curated helper profiles will appear here soon.</p>
                      </div>
                    )}
                  </motion.section>
                )}

              </AnimatePresence>
            </div>
          </div>
        </main>
      </div>

      {/* Post Marketplace Item Modal */}
      <AnimatePresence>
        {isPostModalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPostModalOpen(false)}
              className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
            />
            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 m-auto h-fit max-h-[90vh] w-full max-w-lg bg-white dark:bg-[#0f1d2e] rounded-[2.5rem] overflow-y-auto border border-black/5 dark:border-white/5 z-50 p-6 md:p-8 text-left shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/5">
                <div>
                  <h2 className="text-xl font-extrabold text-navy dark:text-white">Post Item for Sale</h2>
                  <p className="text-[11px] text-muted-foreground mt-0.5">List your item in the peer-to-peer student marketplace.</p>
                </div>
                <button
                  onClick={() => setIsPostModalOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 hover:text-navy dark:hover:text-white cursor-pointer border-0 bg-transparent"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handlePostItemSubmit} className="space-y-4 pt-4">
                {/* Title */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Item Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Electric Kettle, Study Lamp..."
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    className="w-full rounded-xl bg-gray-55/20 dark:bg-white/5 text-navy dark:text-white px-4 py-3 text-xs border border-navy/5 outline-none focus:ring-1 focus:ring-gold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Price */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Price (₦) *</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 5000"
                      value={postPrice}
                      onChange={(e) => setPostPrice(e.target.value)}
                      className="w-full rounded-xl bg-gray-55/20 dark:bg-white/5 text-navy dark:text-white px-4 py-3 text-xs border border-navy/5 outline-none focus:ring-1 focus:ring-gold"
                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Category *</label>
                    <CustomSelect
                      value={postCategory}
                      onChange={(val) => setPostCategory(val as any)}
                      options={[
                        { value: "Electronics", label: "Electronics" },
                        { value: "Furniture", label: "Furniture" },
                        { value: "Kitchen", label: "Kitchen" },
                        { value: "Books", label: "Books" },
                        { value: "Other", label: "Other" }
                      ]}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Condition */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Condition *</label>
                    <CustomSelect
                      value={postCondition}
                      onChange={(val) => setPostCondition(val as any)}
                      options={[
                        { value: "New", label: "New" },
                        { value: "Gently Used", label: "Gently Used" },
                        { value: "Fair", label: "Fair" }
                      ]}
                    />
                  </div>

                  {/* Location Area */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Area *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Eziobodo, Ihiagwa..."
                      value={postArea}
                      onChange={(e) => setPostArea(e.target.value)}
                      className="w-full rounded-xl bg-gray-55/20 dark:bg-white/5 text-navy dark:text-white px-4 py-3 text-xs border border-navy/5 outline-none focus:ring-1 focus:ring-gold"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Description</label>
                  <textarea
                    placeholder="Provide details about size, defects, reasons for selling..."
                    value={postDescription}
                    onChange={(e) => setPostDescription(e.target.value)}
                    rows={3}
                    className="w-full rounded-xl bg-gray-55/20 dark:bg-white/5 text-navy dark:text-white px-4 py-3 text-xs border border-navy/5 outline-none focus:ring-1 focus:ring-gold resize-none"
                  />
                </div>

                {/* Photos */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Photos (Up to 3)</label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => document.getElementById("post-photos-upload")?.click()}
                      className="h-16 w-16 rounded-2xl border-2 border-dashed border-gray-300 dark:border-white/10 hover:border-gold dark:hover:border-gold transition flex items-center justify-center text-gray-400 bg-transparent cursor-pointer"
                    >
                      <Plus size={20} />
                    </button>
                    <input
                      id="post-photos-upload"
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handlePostPhotosChange}
                    />
                    <div className="flex gap-2">
                      {postPhotos.map((photo, i) => (
                        <div key={i} className="relative h-16 w-16 rounded-2xl overflow-hidden shadow-sm">
                          <img src={photo} className="h-full w-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Submit button */}
                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsPostModalOpen(false)}
                    className="rounded-full bg-gray-150 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 px-6 py-3 font-bold text-xs text-navy dark:text-white transition cursor-pointer border-0"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-full bg-gold hover:bg-gold/90 px-6 py-3 font-bold text-xs text-navy shadow-md transition cursor-pointer border-0"
                  >
                    Post Listing
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Edit Marketplace Item Modal */}
      <AnimatePresence>
        {isEditModalOpen && editingItem && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
            />
            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 m-auto h-fit max-h-[90vh] w-full max-w-lg bg-white dark:bg-[#0f1d2e] rounded-[2.5rem] overflow-y-auto border border-black/5 dark:border-white/5 z-50 p-6 md:p-8 text-left shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/5">
                <div>
                  <h2 className="text-xl font-extrabold text-navy dark:text-white">Edit Marketplace Item</h2>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Update details of your marketplace listing.</p>
                </div>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 hover:text-navy dark:hover:text-white cursor-pointer border-0 bg-transparent"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleEditItemSubmit} className="space-y-4 pt-4">
                {/* Title */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Item Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Electric Kettle, Study Lamp..."
                    value={editItemForm.title}
                    onChange={(e) => setEditItemForm({ ...editItemForm, title: e.target.value })}
                    className="w-full rounded-xl bg-gray-55/20 dark:bg-white/5 text-navy dark:text-white px-4 py-3 text-xs border border-navy/5 outline-none focus:ring-1 focus:ring-gold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Price */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Price (₦) *</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 5000"
                      value={editItemForm.price}
                      onChange={(e) => setEditItemForm({ ...editItemForm, price: e.target.value })}
                      className="w-full rounded-xl bg-gray-55/20 dark:bg-white/5 text-navy dark:text-white px-4 py-3 text-xs border border-navy/5 outline-none focus:ring-1 focus:ring-gold"
                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Category *</label>
                    <CustomSelect
                      value={editItemForm.category}
                      onChange={(val) => setEditItemForm({ ...editItemForm, category: val as any })}
                      options={[
                        { value: "Electronics", label: "Electronics" },
                        { value: "Furniture", label: "Furniture" },
                        { value: "Kitchen", label: "Kitchen" },
                        { value: "Books", label: "Books" },
                        { value: "Other", label: "Other" }
                      ]}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Condition */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Condition *</label>
                    <CustomSelect
                      value={editItemForm.condition}
                      onChange={(val) => setEditItemForm({ ...editItemForm, condition: val as any })}
                      options={[
                        { value: "New", label: "New" },
                        { value: "Gently Used", label: "Gently Used" },
                        { value: "Fair", label: "Fair" }
                      ]}
                    />
                  </div>

                  {/* Location Area */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Area *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Eziobodo, Ihiagwa..."
                      value={editItemForm.area}
                      onChange={(e) => setEditItemForm({ ...editItemForm, area: e.target.value })}
                      className="w-full rounded-xl bg-gray-55/20 dark:bg-white/5 text-navy dark:text-white px-4 py-3 text-xs border border-navy/5 outline-none focus:ring-1 focus:ring-gold"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Description</label>
                  <textarea
                    placeholder="Provide details about size, defects, reasons for selling..."
                    value={editItemForm.description}
                    onChange={(e) => setEditItemForm({ ...editItemForm, description: e.target.value })}
                    rows={3}
                    className="w-full rounded-xl bg-gray-55/20 dark:bg-white/5 text-navy dark:text-white px-4 py-3 text-xs border border-navy/5 outline-none focus:ring-1 focus:ring-gold resize-none"
                  />
                </div>

                {/* Photos */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Photos (Up to 3, Click to Delete)</label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => document.getElementById("edit-photos-upload")?.click()}
                      className="h-16 w-16 rounded-2xl border-2 border-dashed border-gray-300 dark:border-white/10 hover:border-gold dark:hover:border-gold transition flex items-center justify-center text-gray-400 bg-transparent cursor-pointer"
                      disabled={editItemForm.photos.length >= 3}
                    >
                      <Plus size={20} />
                    </button>
                    <input
                      id="edit-photos-upload"
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleEditPhotosChange}
                    />
                    <div className="flex gap-2">
                      {editItemForm.photos.map((photo, i) => (
                        <div
                          key={i}
                          onClick={() => setEditItemForm(prev => ({ ...prev, photos: prev.photos.filter((_, idx) => idx !== i) }))}
                          className="relative h-16 w-16 rounded-2xl overflow-hidden shadow-sm cursor-pointer group"
                        >
                          <img src={photo} className="h-full w-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                            <X size={14} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Submit button */}
                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="rounded-full bg-gray-150 hover:bg-gray-250 dark:bg-white/5 dark:hover:bg-white/10 px-6 py-3 font-bold text-xs text-navy dark:text-white transition cursor-pointer border-0"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-full bg-gold hover:bg-gold/90 px-6 py-3 font-bold text-xs text-navy shadow-md transition cursor-pointer border-0"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Custom Delete Item Modal */}
      <AnimatePresence>
        {deletingItemId && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeletingItemId(null)}
              className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
            />
            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 m-auto h-fit max-h-[90vh] w-full max-w-sm bg-white dark:bg-[#0f1d2e] rounded-[2.5rem] border border-black/5 dark:border-white/5 z-50 p-6 text-center shadow-2xl flex flex-col items-center space-y-4"
            >
              {/* Danger/Trash Icon bubble */}
              <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-950/30 flex items-center justify-center text-red-600 dark:text-red-400">
                <Trash2 size={24} />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-extrabold text-navy dark:text-white">Delete Listing?</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Are you sure you want to delete this listing? This action is permanent and cannot be undone.
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex w-full gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingItemId(null)}
                  className="flex-1 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 py-3 font-bold text-xs text-navy dark:text-white transition cursor-pointer border-0"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteListing}
                  className="flex-1 rounded-full bg-red-600 hover:bg-red-700 py-3 font-bold text-xs text-white shadow-md transition cursor-pointer border-0"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </>
        )}

        {isMarketVettingModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMarketVettingModalOpen(false)}
              className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 m-auto h-fit max-h-[90vh] w-full max-w-sm bg-white dark:bg-[#0f1d2e] rounded-[2.5rem] border border-black/5 dark:border-white/5 z-50 p-6 text-center shadow-2xl flex flex-col items-center space-y-4"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold/10 text-gold shadow-sm">
                <Sparkles className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-extrabold text-navy dark:text-white">Coming Soon!</h3>
                <p className="text-xs text-muted-foreground leading-relaxed mt-2">
                  Peer-to-peer uploads are currently in vetting mode to prevent scams and protect student buyers.
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-gold/5 border border-gold/10 text-left text-[11px] text-gold font-medium leading-relaxed">
                💡 <strong>Vetted Sellers Mode:</strong> Only manually approved merchants can list items for now. If you are a student seller, contact the admin to verify your account and list your items!
              </div>
              <div className="flex flex-col w-full gap-2 pt-2">
                <a
                  href="https://wa.me/2348000000000?text=Hello%20CampusHub%20Admin%2C%20I%20am%20a%20student%20seller%20and%20want%20to%20vet%20my%20marketplace%20items."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gold hover:bg-gold/90 py-3.5 font-bold text-xs text-navy shadow-md transition cursor-pointer border-0"
                >
                  Contact Admin on WhatsApp
                </a>
                <button
                  type="button"
                  onClick={() => setIsMarketVettingModalOpen(false)}
                  className="w-full rounded-2xl bg-gray-50 hover:bg-gray-100 dark:bg-white/5 dark:hover:bg-white/10 py-3 font-bold text-xs text-navy dark:text-white transition cursor-pointer border-0"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default function StudentDashboard() {
  return <StudentDashboardContent />;
}
