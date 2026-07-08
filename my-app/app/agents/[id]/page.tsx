"use client";

import React, { useMemo } from "react";
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
  LucideIcon,
  Share2,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { toast } from "react-hot-toast";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import LodgeCard from "../../../components/LodgeCard";
import { getAgentById, getAgentRooms, formatNaira, getLodgeRooms } from "../../../lib/lodge-data";

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

export default function AgentProfilePage() {
  const params = useParams();
  const router = useRouter();
  const agentId = params.id as string;
  
  const agent = useMemo(() => getAgentById(agentId), [agentId]);
  const listings = useMemo(() => getAgentRooms(agentId), [agentId]);

  const waLink = useMemo(() => {
    if (!agent) return "#";
    const cleanPhone = agent.phone.replace(/\D/g, "");
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent("Hello, I found you on CampusHub.")}`;
  }, [agent]);

  const handleShare = async () => {
    if (!agent) return;
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${agent.name} - Agent Profile`,
          text: `Check out ${agent.name}'s properties on CampusHub!`,
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
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#C9952A] opacity-5 blur-[100px] rounded-full -mr-32 -mt-32"></div>

          <div className="max-w-4xl mx-auto relative z-10">
            {/* Back Button */}
            <button 
              onClick={() => router.back()}
              className="flex items-center gap-2 text-white/50 hover:text-[#C9952A] transition text-sm mb-8 group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Back
            </button>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              {/* Left Side: Avatar & Name */}
              <div className="flex items-center gap-6">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative shrink-0"
                >
                  <img
                    src={agent.photo}
                    alt={agent.name}
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
                    {agent.name}
                  </motion.h1>
                  
                  <div className="flex flex-col gap-1.5">
                    {agent.id === 'agent-official' ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#C9952A]/20 text-[#C9952A] text-xs font-bold border border-[#C9952A]/30 w-fit uppercase tracking-tighter">
                        <Star className="h-3 w-3 fill-[#C9952A]" />
                        CampusHub Official
                      </span>
                    ) : agent.verified ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-bold border border-green-500/30 w-fit uppercase tracking-tighter">
                        <CheckCircle2 className="h-3 w-3" />
                        Verified Agent
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs font-medium">Agent</span>
                    )}
                    <span className="text-gray-400 text-[11px] flex flex-wrap items-center gap-1.5">
                      <span>{agent.responseTime}</span>
                      {agent.id !== "agent-official" && agent.joinedDate && (
                        <>
                          <span className="text-gray-500">•</span>
                          <span>Joined {agent.joinedDate}</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Side: Stats & Action */}
              <div className="flex flex-col gap-6 items-center md:items-end">
                <div className="flex flex-wrap justify-center md:justify-end gap-y-4 divide-x divide-white/10">
                  <StatItem icon={Building2} value={listings.length} label="Properties" />
                  <StatItem icon={Star} value={4.8} label="Rating" />
                  <StatItem icon={MessageCircle} value={12} label="Reviews" />
                  <StatItem icon={Eye} value={340} label="Views" />
                </div>

                <div className="flex gap-4">
                  {/* Share Profile Button */}
                  <motion.button
                    onClick={handleShare}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white/10 text-white h-12 px-5 rounded-full flex items-center justify-center gap-2 border border-white/20 hover:bg-white/20 transition cursor-pointer text-xs font-bold"
                    title="Share Profile"
                  >
                    <Share2 className="h-4 w-4 text-[#C9952A]" />
                    <span>Share Profile</span>
                  </motion.button>

                  {/* Contact on WhatsApp */}
                  <motion.a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-[#25D366] text-white h-12 w-12 rounded-full flex items-center justify-center shadow-xl shadow-green-500/20 hover:bg-[#25D366]/90 transition"
                    title="Contact on WhatsApp"
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
                Properties by <span className="text-[#C9952A]">{agent.name}</span>
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
                      area={`${room.area} · ${lodge?.landmark || ""}`}
                      price={formatNaira(room.price)}
                      badge={lodge?.isOfficial ? "CampusHub Official" : "Verified ID"}
                      rating={room.rating}
                      photo={room.photos[0]}
                      availability={room.availability === "available" ? "Available now" : room.availability === "pending" ? "Pending" : "Rented"}
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
