"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  Search,
  Calendar,
  MapPin,
  Send,
  Check,
  X,
  MessageCircle,
  Plus,
  BookOpen,
  Wallet,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- Types ---

export type RoommatePost = {
  id: string;
  student_id: string;
  student_name: string;
  phone: string;
  department: string;
  level: string;
  budget_range: string;
  area_preference: string;
  gender_preference: string;
  extra_info: string;
  created_at: Date;
  status: "active" | "closed";
  student_gender: string;
};

export type ConnectionRequest = {
  id: string;
  postId: string;
  requesterId: string;
  requesterName: string;
  requesterPhone: string;
  requesterDept: string;
  requesterLevel: string;
  status: "pending" | "accepted" | "declined";
};

// --- Mock Data ---

const initialPosts: RoommatePost[] = [
  {
    id: "post1",
    student_id: "stu2",
    student_name: "Emeka Uche",
    phone: "08034567890",
    department: "Civil Engineering",
    level: "400",
    budget_range: "₦150,000 – ₦200,000",
    area_preference: "Ihiagwa",
    gender_preference: "Male only",
    extra_info:
      "Looking for a quiet and clean roommate. I spend most of my time in the studio.",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    status: "active",
    student_gender: "Male",
  },
  {
    id: "post2",
    student_id: "stu3",
    student_name: "Chiamaka Okafor",
    phone: "08012345678",
    department: "Computer Science",
    level: "300",
    budget_range: "₦80,000 – ₦120,000",
    area_preference: "Eziobodo",
    gender_preference: "Female only",
    extra_info:
      "Need someone who is okay with late night coding sessions and early morning classes.",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
    status: "active",
    student_gender: "Female",
  },
  {
    id: "post3",
    student_id: "stu4",
    student_name: "Daniel Peters",
    phone: "08055566677",
    department: "Biological Sciences",
    level: "100",
    budget_range: "₦50,000 – ₦80,000",
    area_preference: "Umuchima",
    gender_preference: "Any",
    extra_info:
      "Freshman looking for a friendly roommate to navigate FUTO life with.",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10), // 10 days ago
    status: "active",
    student_gender: "Male",
  },
  {
    id: "post4",
    student_id: "stu5",
    student_name: "Adaeze Nwosu",
    phone: "08099887766",
    department: "Mechanical Engineering",
    level: "200",
    budget_range: "₦120,000 – ₦150,000",
    area_preference: "FUTO",
    gender_preference: "Female only",
    extra_info:
      "I have a place already in Ihiagwa Gardens. Just need a flatmate to share costs.",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1), // 1 day ago
    status: "active",
    student_gender: "Female",
  },
  {
    id: "post5",
    student_id: "stu6",
    student_name: "Kelechi Egwu",
    phone: "07011223344",
    department: "Physics",
    level: "500",
    budget_range: "₦100,000 – ₦130,000",
    area_preference: "Eziobodo",
    gender_preference: "Male only",
    extra_info:
      "Final year student. Very focused on project. Need a mature roommate.",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 32), // 32 days ago (Expired)
    status: "active",
    student_gender: "Male",
  },
  {
    id: "post6",
    student_id: "stu1", // OWN POST
    student_name: "Chiamaka Okafor", // Simulation
    phone: "08012345678",
    department: "Computer Science",
    level: "300",
    budget_range: "₦100,000 – ₦150,000",
    area_preference: "Ihiagwa",
    gender_preference: "Female only",
    extra_info:
      "Looking for a roommate for the next session. I am very organized.",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
    status: "active",
    student_gender: "Female",
  },
];

const initialRequests: ConnectionRequest[] = [
  {
    id: "req1",
    postId: "post6", // Request for the current user's post
    requesterId: "stu7",
    requesterName: "Precious Obi",
    requesterPhone: "08122334455",
    requesterDept: "Architecture",
    requesterLevel: "200",
    status: "pending",
  },
];

// --- Utilities ---

const formatWhatsAppLink = (phone: string, firstName: string) => {
  const cleanPhone = phone.replace(/\D/g, "").replace(/^0/, "234");
  const message = encodeURIComponent(
    `Hi ${firstName}, we matched on CampusHub!`,
  );
  return `https://wa.me/${cleanPhone}?text=${message}`;
};

const getFirstName = (fullName: string) => fullName.split(" ")[0];

const getExpiryDays = (createdAt: Date) => {
  const diffTime = Math.abs(Date.now() - createdAt.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return 30 - diffDays;
};

export function RoommateNoticeboardContent() {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<RoommatePost[]>(initialPosts);
  const [requests, setRequests] =
    useState<ConnectionRequest[]>(initialRequests);
  const [sentRequestIds, setSentRequestIds] = useState<string[]>([]);

  // Modals & UI state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isMatchModalOpen, setIsMatchModalOpen] = useState<{
    open: boolean;
    requesterName: string;
    phone: string;
  }>({
    open: false,
    requesterName: "",
    phone: "",
  });

  // Filters
  const [filters, setFilters] = useState({
    gender: "Any",
    area: "",
    budget: "",
    department: "",
  });

  const [currentStudent, setCurrentStudent] = useState({
    id: "stu1",
    full_name: "Chiamaka Okafor",
    phone: "08012345678",
    gender: "Female",
  });

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    
    // Sync student details from localStorage
    const stored = localStorage.getItem("student_data");
    if (stored) {
      try {
        setCurrentStudent(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse student_data in roommates noticeboard", e);
      }
    }
    
    return () => clearTimeout(timer);
  }, []);

  const handleCreatePost = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const newPost: RoommatePost = {
      id: `post-${Date.now()}`,
      student_id: currentStudent.id,
      student_name: currentStudent.full_name,
      phone: currentStudent.phone,
      department: formData.get("department") as string,
      level: formData.get("level") as string,
      budget_range: formData.get("budget") as string,
      area_preference: formData.get("area") as string,
      gender_preference: formData.get("gender") as string,
      extra_info: formData.get("extra") as string,
      created_at: new Date(),
      status: "active",
      student_gender: currentStudent.gender || "Female",
    };

    setPosts([newPost, ...posts]);
    setIsCreateModalOpen(false);
    toast.success("Post notice created successfully!");
  };

  const handleSendRequest = (postId: string) => {
    setSentRequestIds([...sentRequestIds, postId]);
    toast.success("Request sent!");
  };

  const handleAcceptRequest = (request: ConnectionRequest) => {
    // Update request status
    setRequests(
      requests.map((r) =>
        r.id === request.id ? { ...r, status: "accepted" } : r,
      ),
    );
    // Update post status to closed
    setPosts(
      posts.map((p) =>
        p.id === request.postId ? { ...p, status: "closed" } : p,
      ),
    );

    setIsMatchModalOpen({
      open: true,
      requesterName: getFirstName(request.requesterName),
      phone: request.requesterPhone,
    });
  };

  const handleDeclineRequest = (id: string) => {
    setRequests(requests.filter((r) => r.id !== id));
    toast.success("Request declined");
  };

  const filteredPosts = posts.filter((post) => {
    const matchGender =
      filters.gender === "Any" || post.gender_preference === filters.gender;
    const matchArea =
      !filters.area ||
      post.area_preference.toLowerCase().includes(filters.area.toLowerCase());
    const matchBudget =
      !filters.budget ||
      post.budget_range.toLowerCase().includes(filters.budget.toLowerCase());
    const matchDept =
      !filters.department ||
      post.department.toLowerCase().includes(filters.department.toLowerCase());
    return matchGender && matchArea && matchBudget && matchDept;
  });

  const myPostsWithPendingRequests = posts
    .filter(
      (p) => p.student_id === currentStudent.id && p.status === "active",
    )
    .map((p) => ({
      post: p,
      pendingRequests: requests.filter(
        (r) => r.postId === p.id && r.status === "pending",
      ),
    }))
    .filter((item) => item.pendingRequests.length > 0);

  return (
    <div className="w-full">
      {/* --- Top Section --- */}
      <section className="mb-12">
        <div className="rounded-[2.5rem] bg-gradient-to-r from-amber-500 to-amber-300 p-8 text-center text-white shadow-xl md:p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold md:text-5xl lg:text-6xl">
              Find a Roommate
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-white/90">
              Post what you&apos;re looking for and connect with compatible
              students at FUTO. Safe, private, and verified.
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-gold px-8 py-4 text-lg font-bold text-navy shadow-lg transition hover:scale-105 hover:bg-[#d7a93a] cursor-pointer"
            >
              <Plus className="h-5 w-5" />
              Create a Post
            </button>
          </motion.div>
        </div>
      </section>

      {/* --- Requests Management (Pending Matches) --- */}
      <AnimatePresence>
        {myPostsWithPendingRequests.length > 0 && (
          <motion.section
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-12 overflow-hidden"
          >
            <div className="rounded-3xl border-2 border-gold/30 bg-gold/5 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold text-navy">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-navy">
                    Pending Requests
                  </h2>
                  <p className="text-sm text-gray-500">
                    Students want to connect with you regarding your posts.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {myPostsWithPendingRequests.map((item) =>
                  item.pendingRequests.map((req) => (
                    <motion.div
                      key={req.id}
                      layout
                      className="flex flex-col gap-4 rounded-2xl bg-white dark:bg-[#162535] p-5 shadow-sm border border-black/5 dark:border-white/5 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-white/5 text-gold text-lg font-bold">
                          {getFirstName(req.requesterName)[0]}
                        </div>
                        <div className="text-left">
                          <h3 className="font-bold text-navy dark:text-white">
                            {req.requesterName}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {req.requesterDept} • {req.requesterLevel} Level
                          </p>
                          <p className="mt-1 text-[10px] font-semibold text-gold uppercase tracking-wider">
                            For: {item.post.area_preference}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAcceptRequest(req)}
                          className="flex-1 flex items-center justify-center gap-1.5 rounded-full bg-green-500 px-4 py-2 text-xs font-bold text-white transition hover:bg-green-600 sm:flex-none cursor-pointer"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Accept
                        </button>
                        <button
                          onClick={() => handleDeclineRequest(req.id)}
                          className="flex-1 flex items-center justify-center gap-1.5 rounded-full bg-gray-100 dark:bg-white/5 px-4 py-2 text-xs font-bold text-gray-500 dark:text-gray-300 transition hover:bg-gray-200 dark:hover:bg-white/10 sm:flex-none cursor-pointer"
                        >
                          <X className="h-3.5 w-3.5" />
                          Decline
                        </button>
                      </div>
                    </motion.div>
                  )),
                )}
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* --- Filter Bar --- */}
      <section className="mb-8 rounded-3xl bg-white dark:bg-[#0f1d2e] p-4 shadow-sm border border-black/5 dark:border-white/5">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-1 min-w-[200px] items-center gap-2 rounded-2xl bg-gray-50 dark:bg-white/5 px-4 py-2.5 ring-1 ring-black/5 dark:ring-white/5 focus-within:ring-gold transition-all">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Filter by area or budget..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400 dark:placeholder:text-gray-550 text-navy dark:text-white"
              value={filters.area || filters.budget}
              onChange={(e) =>
                setFilters({ ...filters, area: e.target.value })
              }
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filters.gender}
              onChange={(e) =>
                setFilters({ ...filters, gender: e.target.value })
              }
              className="rounded-2xl bg-gray-50 dark:bg-[#162535] px-4 py-2.5 text-sm font-medium text-navy dark:text-white outline-none ring-1 ring-black/5 dark:ring-white/5"
            >
              <option value="Any">Gender: Any</option>
              <option value="Male only">Male only</option>
              <option value="Female only">Female only</option>
            </select>

            <button
              onClick={() =>
                setFilters({
                  gender: "Any",
                  area: "",
                  budget: "",
                  department: "",
                })
              }
              className="rounded-2xl px-4 py-2.5 text-sm font-bold text-gold transition hover:bg-gold/5 cursor-pointer"
            >
              Clear filters
            </button>
          </div>
        </div>
      </section>

      {/* --- Posts Grid --- */}
      <section>
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-[300px] animate-pulse rounded-2xl bg-gray-200 dark:bg-white/5"
              />
            ))}
          </div>
        ) : filteredPosts.length > 0 ? (
          <motion.div
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            initial="hidden"
            animate="show"
            variants={{
              show: { transition: { staggerChildren: 0.1 } },
            }}
          >
            {filteredPosts.map((post) => {
              const expiryDays = getExpiryDays(post.created_at);
              const isExpired = expiryDays <= 0;
              const isOwnPost = post.student_id === currentStudent.id;
              const isPending = sentRequestIds.includes(post.id);

              return (
                <motion.div
                  key={post.id}
                  variants={{
                    hidden: { opacity: 0, scale: 0.9 },
                    show: { opacity: 1, scale: 1 },
                  }}
                  className={cn(
                    "group flex flex-col rounded-2xl bg-white dark:bg-[#0f1d2e] p-6 shadow-sm border border-black/5 dark:border-white/5 transition-all hover:shadow-md hover:-translate-y-1",
                    isExpired && "opacity-60",
                    post.status === "closed" &&
                      "border-green-500/20 bg-green-50/10 dark:bg-green-950/10",
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy/5 dark:bg-white/5 text-navy dark:text-gold font-bold">
                        {getFirstName(post.student_name)[0]}
                      </div>
                      <div className="text-left">
                        <h3 className="font-bold text-navy dark:text-white">
                          {getFirstName(post.student_name)}
                        </h3>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">
                          {post.level} Level • {post.student_gender}
                        </p>
                      </div>
                    </div>
                    {isExpired ? (
                      <span className="rounded-full bg-gray-100 dark:bg-white/5 px-2.5 py-1 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                        Expired
                      </span>
                    ) : post.status === "closed" ? (
                      <span className="rounded-full bg-green-100 dark:bg-green-950/20 px-2.5 py-1 text-[10px] font-bold text-green-600 dark:text-green-400 uppercase tracking-widest">
                        Matched
                      </span>
                    ) : (
                      <span className="rounded-full bg-gold/10 px-2.5 py-1 text-[10px] font-bold text-gold uppercase tracking-widest">
                        Expires in {expiryDays}d
                      </span>
                    )}
                  </div>

                  <div className="mt-6 space-y-3 flex-1 text-left">
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                      <BookOpen className="h-4 w-4 text-gray-400" />
                      <span className="truncate">{post.department}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="truncate">
                        {post.area_preference}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-navy dark:text-white font-semibold">
                      <Wallet className="h-4 w-4 text-gold" />
                      <span>{post.budget_range}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span>Prefers: {post.gender_preference}</span>
                    </div>

                    <div className="mt-4 rounded-xl bg-gray-50 dark:bg-white/5 p-3 text-xs italic text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-3">
                      &quot;{post.extra_info}&quot;
                    </div>
                  </div>

                  <div className="mt-8">
                    {isOwnPost ? (
                      <div className="text-center text-xs font-bold text-gold uppercase tracking-wider py-3 border border-dashed border-gold/30 rounded-full">
                        Your Post notice
                      </div>
                    ) : post.status === "closed" ? (
                      <div className="flex h-[44px] items-center justify-center text-sm font-semibold text-green-600">
                        Already Matched
                      </div>
                    ) : isExpired ? (
                      <div className="flex h-[44px] items-center justify-center text-sm font-semibold text-gray-400">
                        Post no longer active
                      </div>
                    ) : isPending ? (
                      <button
                        disabled
                        className="flex w-full items-center justify-center gap-2 rounded-full bg-gray-100 dark:bg-white/5 py-3 text-sm font-bold text-gray-400 cursor-not-allowed"
                      >
                        <Calendar className="h-4 w-4" />
                        Request Pending
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSendRequest(post.id)}
                        className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-gold py-3 text-sm font-bold text-gold transition hover:bg-gold hover:text-navy cursor-pointer"
                      >
                        <Send className="h-4 w-4" />
                        Send Request
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-[2.5rem] bg-white dark:bg-[#0f1d2e] py-20 text-center shadow-sm border border-black/5 dark:border-white/5">
            <Search className="h-12 w-12 text-gray-200" />
            <h3 className="mt-4 text-xl font-bold text-navy dark:text-white">
              No posts found
            </h3>
            <p className="mt-2 max-w-sm text-gray-500 dark:text-gray-400">
              Try adjusting your filters or create your own post to find a
              roommate!
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-8 rounded-full bg-gold px-8 py-3 font-bold text-navy cursor-pointer"
            >
              Create Post
            </button>
          </div>
        )}
      </section>

      {/* --- Create Post Modal --- */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute inset-0 bg-navy/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full h-full flex flex-col sm:block sm:h-auto sm:max-w-lg overflow-hidden rounded-none sm:rounded-[2rem] bg-white dark:bg-[#0f1d2e] shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 p-6">
                <h2 className="text-xl font-bold text-navy dark:text-white">
                  Create Roommate Notice
                </h2>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-white/5 text-navy dark:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreatePost} className="p-6 flex-1 overflow-y-auto pb-24 sm:flex-none sm:overflow-visible sm:pb-6">
                <div className="grid gap-4 sm:grid-cols-2 text-left">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      Department
                    </label>
                    <input
                      name="department"
                      required
                      placeholder="e.g. Computer Science"
                      className="w-full rounded-xl bg-gray-50 dark:bg-white/5 text-navy dark:text-white px-4 py-3 text-sm ring-1 ring-black/5 dark:ring-white/5 focus:ring-2 focus:ring-gold transition-all outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      Current Level
                    </label>
                    <select
                      name="level"
                      required
                      className="w-full rounded-xl bg-gray-50 dark:bg-[#162535] text-navy dark:text-white px-4 py-3 text-sm ring-1 ring-black/5 dark:ring-white/5 focus:ring-2 focus:ring-gold"
                    >
                      {["100", "200", "300", "400", "500"].map((lvl) => (
                        <option key={lvl} value={lvl}>
                          {lvl} Level
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      Budget Range
                    </label>
                    <input
                      name="budget"
                      required
                      placeholder="e.g. ₦50k – ₦80k"
                      className="w-full rounded-xl bg-gray-50 dark:bg-white/5 text-navy dark:text-white px-4 py-3 text-sm ring-1 ring-black/5 dark:ring-white/5 focus:ring-2 focus:ring-gold transition-all outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      Preferred Area
                    </label>
                    <input
                      name="area"
                      required
                      placeholder="e.g. Eziobodo"
                      className="w-full rounded-xl bg-gray-50 dark:bg-white/5 text-navy dark:text-white px-4 py-3 text-sm ring-1 ring-black/5 dark:ring-white/5 focus:ring-2 focus:ring-gold transition-all outline-none"
                    />
                  </div>
                  <div className="col-span-full space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      Gender Preference
                    </label>
                    <select
                      name="gender"
                      required
                      className="w-full rounded-xl bg-gray-50 dark:bg-[#162535] text-navy dark:text-white px-4 py-3 text-sm ring-1 ring-black/5 dark:ring-white/5 focus:ring-2 focus:ring-gold"
                    >
                      <option value="Any">Any</option>
                      <option value="Male only">Male only</option>
                      <option value="Female only">Female only</option>
                    </select>
                  </div>
                  <div className="col-span-full space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      Extra Info (Optional)
                    </label>
                    <textarea
                      name="extra"
                      placeholder="Describe yourself and what you're looking for in a roommate..."
                      className="h-24 w-full resize-none rounded-xl bg-gray-50 dark:bg-white/5 text-navy dark:text-white px-4 py-3 text-sm ring-1 ring-black/5 dark:ring-white/5 focus:ring-2 focus:ring-gold transition-all outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="mt-8 w-full rounded-full bg-gold py-4 text-sm font-bold text-navy shadow-lg transition hover:bg-[#d7a93a] hover:-translate-y-0.5 cursor-pointer"
                >
                  Post Notice
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- Match Success Modal --- */}
      <AnimatePresence>
        {isMatchModalOpen.open && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-navy/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-sm rounded-[2rem] bg-white dark:bg-[#0f1d2e] p-8 text-center shadow-2xl"
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/30 text-green-600 mx-auto">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h2 className="mt-6 text-2xl font-bold text-navy dark:text-white">
                It&apos;s a Match! 🎉
              </h2>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                You’ve been matched with {isMatchModalOpen.requesterName}! Start
                a conversation on WhatsApp to finalize details.
              </p>

              <a
                href={formatWhatsAppLink(
                  isMatchModalOpen.phone,
                  isMatchModalOpen.requesterName,
                )}
                target="_blank"
                rel="noreferrer"
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-green-500 py-4 text-sm font-bold text-white shadow-lg transition hover:bg-green-600 cursor-pointer"
              >
                <MessageCircle className="h-5 w-5" />
                Chat on WhatsApp
              </a>

              <button
                onClick={() =>
                  setIsMatchModalOpen({
                    open: false,
                    requesterName: "",
                    phone: "",
                  })
                }
                className="mt-4 text-sm font-bold text-gray-400 hover:text-navy dark:hover:text-white cursor-pointer"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CheckCircle2(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
