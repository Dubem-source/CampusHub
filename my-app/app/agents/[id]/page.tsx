"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Star,
  MessageCircle,
  Eye,
  Building,
  CheckCircle2,
  ArrowLeft,
  ShieldCheck,
  Building2,
  Share2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { toast } from "react-hot-toast";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import LodgeCard from "../../../components/LodgeCard";
import { db } from "../../../lib/firebase";
import { doc, getDoc, getDocs, collection, query, where } from "firebase/firestore";
import { formatNaira } from "../../../lib/lodge-data";

// --- Components ---

const StatItem = ({ icon: Icon, value, label }: { icon: LucideIcon; value: string | number; label: string }) => (
  <div className="flex flex-col items-center sm:items-start px-4">
    <div className="flex items-center gap-2 mb-1 text-center sm:text-left">
      <Icon className="h-4 w-4 text-gray-400" />
      <span className="text-white font-bold text-lg leading-none">{value}</span>
    </div>
    <span className="text-gray-400 text-[10px] uppercase tracking-wider font-semibold">{label}</span>
  </div>
);

type AgentProfile = {
  uid: string;
  fullName: string;
  phone: string;
  photoURL?: string;
  verified: boolean;
  approved: boolean;
  createdAt?: string;
  responseTime?: string;
};

type ListingEntry = {
  room: {
    id: string;
    lodgeSlug: string;
    roomType: string;
    price: number;
    area: string;
    photos: string[];
    availability: "available" | "pending" | "rented";
    rating?: number;
  };
  lodge: {
    name: string;
    landmark: string;
    isOfficial?: boolean;
  } | null;
};

export default function AgentProfilePage() {
  const params = useParams();
  const router = useRouter();
  const agentId = params.id as string;

  const [agent, setAgent] = useState<AgentProfile | null>(null);
  const [listings, setListings] = useState<ListingEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!agentId) return;

    const fetchAgent = async () => {
      setLoading(true);
      try {
        // Fetch agent profile from Firestore users collection
        const userDoc = await getDoc(doc(db, "users", agentId));
        if (!userDoc.exists()) {
          setAgent(null);
          setLoading(false);
          return;
        }
        const data = userDoc.data();
        setAgent({
          uid: agentId,
          fullName: data.fullName || "Agent",
          phone: data.phone || "",
          photoURL: data.photoURL || "",
          verified: data.verified || false,
          approved: data.approved || false,
          createdAt: data.createdAt,
          responseTime: data.responseTime || "Replies within 30 mins",
        });

        // Fetch agent's rooms from Firestore
        const roomsSnap = await getDocs(
          query(collection(db, "rooms"), where("agentId", "==", agentId))
        );

        const fetchedListings: ListingEntry[] = [];
        for (const roomDoc of roomsSnap.docs) {
          const r = roomDoc.data();
          let lodge: ListingEntry["lodge"] = null;
          if (r.lodgeSlug) {
            const lodgeDoc = await getDoc(doc(db, "lodges", r.lodgeSlug));
            if (lodgeDoc.exists()) {
              const l = lodgeDoc.data();
              lodge = {
                name: l.name || r.building_name || "Lodge",
                landmark: l.landmark || r.landmark || "",
                isOfficial: l.isOfficial || false,
              };
            }
          }
          fetchedListings.push({
            room: {
              id: roomDoc.id,
              lodgeSlug: r.lodgeSlug || "",
              roomType: r.roomType || "Self-contain",
              price: Number(r.price || 0),
              area: r.area || "",
              photos: r.photos || [],
              availability: r.availability || "available",
              rating: 4.5,
            },
            lodge,
          });
        }
        setListings(fetchedListings);
      } catch (err) {
        console.error("Error fetching agent profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAgent();
  }, [agentId]);

  const waLink = agent
    ? `https://wa.me/${agent.phone.replace(/\D/g, "")}?text=${encodeURIComponent("Hello, I found you on CampusHub.")}`
    : "#";

  const handleShare = async () => {
    if (!agent) return;
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${agent.fullName} - Agent Profile`,
          text: `Check out ${agent.fullName}'s properties on CampusHub!`,
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
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center space-y-2 animate-pulse">
            <div className="h-20 w-20 rounded-full bg-gray-200 mx-auto" />
            <div className="h-4 w-40 bg-gray-200 rounded mx-auto" />
            <div className="h-3 w-24 bg-gray-200 rounded mx-auto" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[#0f1e2d] mb-4">Agent not found</h1>
            <button
              onClick={() => router.push("/")}
              className="text-[#C9952A] hover:underline font-semibold"
            >
              Return Home
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col font-sans">
      <Header />

      <main className="flex-grow">
        {/* --- Profile Header --- */}
        <section className="bg-[#0f1e2d] pt-12 pb-8 px-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#C9952A] opacity-5 blur-[100px] rounded-full -mr-32 -mt-32"></div>

          <div className="max-w-4xl mx-auto relative z-10">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-white/50 hover:text-[#C9952A] transition text-sm mb-8 group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Back
            </button>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative shrink-0"
                >
                  <img
                    src={agent.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(agent.fullName)}`}
                    alt={agent.fullName}
                    className="w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-[#C9952A] object-cover bg-white/10"
                  />
                  {agent.verified && (
                    <div className="absolute -bottom-1 -right-1 bg-[#C9952A] rounded-full p-1 border-2 border-[#0f1e2d]">
                      <ShieldCheck className="h-4 w-4 text-[#0f1e2d]" />
                    </div>
                  )}
                </motion.div>

                <div>
                  <motion.h1
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-2xl md:text-3xl font-bold text-white mb-2"
                  >
                    {agent.fullName}
                  </motion.h1>

                  <div className="flex flex-col gap-1.5">
                    {agent.verified ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-bold border border-green-500/30 w-fit uppercase tracking-tighter">
                        <CheckCircle2 className="h-3 w-3" />
                        Verified Agent
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs font-medium">Agent</span>
                    )}
                    <span className="text-gray-400 text-[11px]">
                      {agent.responseTime}
                      {agent.createdAt && (
                        <> · Joined {new Date(agent.createdAt).toLocaleDateString("en-NG", { month: "short", year: "numeric" })}</>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-6 items-center md:items-end">
                <div className="flex flex-wrap justify-center md:justify-end gap-y-4 divide-x divide-white/10">
                  <StatItem icon={Building2} value={listings.length} label="Properties" />
                  <StatItem icon={Star} value="4.8" label="Rating" />
                  <StatItem icon={MessageCircle} value={0} label="Reviews" />
                  <StatItem icon={Eye} value={0} label="Views" />
                </div>

                <div className="flex gap-4">
                  <motion.button
                    onClick={handleShare}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white/10 text-white h-12 px-5 rounded-full flex items-center justify-center gap-2 border border-white/20 hover:bg-white/20 transition cursor-pointer text-xs font-bold"
                  >
                    <Share2 className="h-4 w-4 text-[#C9952A]" />
                    <span>Share Profile</span>
                  </motion.button>

                  <motion.a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-[#25D366] text-white h-12 w-12 rounded-full flex items-center justify-center shadow-xl shadow-green-500/20 hover:bg-[#25D366]/90 transition"
                  >
                    <FaWhatsapp className="h-6 w-6" />
                  </motion.a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- Listings Section --- */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-[#0f1e2d]">
                Properties by <span className="text-[#C9952A]">{agent.fullName}</span>
              </h2>
              <div className="h-1 flex-grow mx-8 bg-gray-50 rounded-full hidden sm:block"></div>
            </div>

            {listings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {listings.map(({ room, lodge }, index) => (
                  <motion.div
                    key={room.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <LodgeCard
                      name={lodge?.name || "Lodge"}
                      area={`${room.area}${lodge?.landmark ? " · " + lodge.landmark : ""}`}
                      price={formatNaira(room.price)}
                      badge={lodge?.isOfficial ? "CampusHub Official" : "Verified ID"}
                      rating={room.rating || 4.5}
                      photo={room.photos[0] || ""}
                      availability={
                        room.availability === "available"
                          ? "Available now"
                          : room.availability === "pending"
                          ? "Pending"
                          : "Rented"
                      }
                      isOfficial={lodge?.isOfficial}
                      href={`/lodges/${room.lodgeSlug}/rooms/${room.id}`}
                      roomType={room.roomType}
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center flex flex-col items-center">
                <div className="h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <Building className="h-10 w-10 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">No properties yet</h3>
                <p className="text-gray-500 max-w-xs text-sm">
                  This agent hasn&apos;t listed any lodges on CampusHub yet.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
