"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Heart,
  GraduationCap,
  MessageCircle,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  X,
  Building,
  MapPin,
  Check,
  SlidersHorizontal,
  PanelLeftRightDashed,
  ChevronDown,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import Header from "../components/Header";
import Footer from "../components/Footer";
import LodgeCard from "../components/LodgeCard";
import ImageCarousel from "../components/ImageCarousel";
import { db } from "../lib/firebase";
import { collection, getDocs, limit, query } from "firebase/firestore";
import { formatNaira, RoomUnit, Lodge } from "../lib/lodge-data";

const featured = [
  {
    id: "1",
    name: "Ihiagwa Gardens",
    area: "Ihiagwa",
    price: "₦280k/year",
    badge: "Official",
    rating: 4.9,
  },
  {
    id: "2",
    name: "Eziobodo Suites",
    area: "Eziobodo",
    price: "₦320k/year",
    badge: "Verified",
    rating: 4.8,
  },
  {
    id: "3",
    name: "Campus View",
    area: "FUTO",
    price: "₦250k/year",
    badge: "Popular",
    rating: 4.7,
  },
];

const stats = [
  { label: "Verified lodges", value: "120+" },
  { label: "Trusted agents", value: "45+" },
  { label: "Student searches", value: "2k+" },
];

const trustItems = [
  { icon: ShieldCheck, label: "Verified agents" },
  { icon: MessageCircle, label: "WhatsApp only" },
  { icon: Heart, label: "Save favorites" },
  { icon: BadgeCheck, label: "Student-first" },
];

const steps = [
  {
    icon: Search,
    title: "Search lodges",
    text: "Find options close to FUTO with filters for area, budget, and room type.",
  },
  {
    icon: Users,
    title: "Compare and shortlist",
    text: "Scan prices, ratings, photos, and official badges before contacting anyone.",
  },
  {
    icon: MessageCircle,
    title: "Book on WhatsApp",
    text: "Message agents instantly with a polished pre-filled request for inspections.",
  },
];

const row1Testimonials = [
  {
    text: "I found a verified lodge in under 24 hours and the agent was responsive on WhatsApp. Moving in was smooth and affordable.",
    name: "Chioma N.",
    dept: "Computer Science",
  },
  {
    text: "No stressful physical searching for hours. I filtered by Obinze, clicked WhatsApp, and booked an inspection instantly.",
    name: "Kelechi A.",
    dept: "Cybersecurity",
  },
  {
    text: "Saved room matches to my favorites, shared them with my course rep, and we secured a self-contain in Eziobodo easily.",
    name: "Precious E.",
    dept: "Information Technology",
  },
  {
    text: "The rating badges are accurate. I felt safe knowing agents are verified by the admin team before listings are posted.",
    name: "Michael B.",
    dept: "Civil Engineering",
  },
  {
    text: "The roommates match feature is a lifesaver. Found someone with similar study habits and shared the lodge costs.",
    name: "Favour J.",
    dept: "Biochemistry",
  },
  {
    text: "FUTO gates lodges are usually expensive but CampusHub budget slider helped me find a pocket-friendly place at gate.",
    name: "Daniel U.",
    dept: "Electrical Engineering",
  },
];

const row2Testimonials = [
  {
    text: "CampusHub made comparing room options easy. The photos were accurate and booking was direct.",
    name: "Emeka O.",
    dept: "Mechanical Engineering",
  },
  {
    text: "Finally, a student housing platform that gets it. No fake agents, no hidden registration fees. Just direct search.",
    name: "Somto V.",
    dept: "Software Engineering",
  },
  {
    text: "I love the clean interface and the night mode! Discovering apartments near FUTO has never been this stress-free.",
    name: "Sandra P.",
    dept: "Geology",
  },
  {
    text: "Found a flatmate in less than 3 days. The platform layout is highly responsive and fast on mobile.",
    name: "Chinedu S.",
    dept: "Project Management Tech",
  },
  {
    text: "Highly recommend this for freshmen. Finding housing close to class landmarks saved me from getting lost!",
    name: "Joy U.",
    dept: "Public Health",
  },
  {
    text: "WhatsApp-first flow is genius. Agents reply almost instantly since they don't have to monitor a separate app.",
    name: "Praise K.",
    dept: "Agricultural Engineering",
  },
];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut" },
  },
};

const stagger: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.08,
    },
  },
};

export default function Home() {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [loading, setLoading] = React.useState(true);

  // Custom states for public hero section
  const [selectedArea, setSelectedArea] = React.useState("");
  const [selectedRoomType, setSelectedRoomType] = React.useState("");
  const [areaDropdownOpen, setAreaDropdownOpen] = React.useState(false);
  const [featuredLodges, setFeaturedLodges] = React.useState<(Lodge & { room: RoomUnit })[]>([]);

  React.useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const lodgesSnap = await getDocs(collection(db, "lodges"));
        const roomsSnap = await getDocs(collection(db, "rooms"));

        const lodgesMap = new Map<string, any>();
        lodgesSnap.forEach((doc) => {
          lodgesMap.set(doc.id, doc.data());
        });

        const activeListings: any[] = [];
        roomsSnap.forEach((doc) => {
          const room = doc.data() as RoomUnit;
          const lodge = lodgesMap.get(room.lodgeSlug);
          if (lodge) {
            activeListings.push({
              ...lodge,
              room,
            });
          }
        });

        activeListings.sort((left, right) => {
          if (left.isOfficial && !right.isOfficial) return -1;
          if (!left.isOfficial && right.isOfficial) return 1;
          return (right.rating || 0) - (left.rating || 0);
        });

        setFeaturedLodges(activeListings.slice(0, 3));
      } catch (err) {
        console.error("Error loading homepage featured:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  if (loading) {
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
              <span>Loading CampusHub...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[radial-gradient(circle_at_top,_rgba(201,149,42,0.10),_transparent_35%),linear-gradient(180deg,#f8f9fa_0%,#ffffff_60%,#f7f7f5_100%)] text-navy">
      <Header showSpacer={false} />

      <main className="flex-1">
        <section className="relative isolate overflow-hidden border-b border-black/5 min-h-[680px] lg:min-h-[750px] flex items-center bg-[#060c16]">
          <div className="absolute inset-0">
            <ImageCarousel />
          </div>
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(6,12,22,0.95),rgba(6,12,22,0.85))]" />
          {/* Subtle Grid pattern overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:3.5rem_3.5rem]" />

          {/* Luminous Abstract Glow Orbs */}
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-gold/15 to-transparent blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-blue-500/10 to-transparent blur-[100px] pointer-events-none" />

          <motion.div
            initial="hidden"
            animate="show"
            variants={stagger}
            className="relative z-10 mx-auto w-full max-w-7xl px-6 pt-24 pb-14 lg:pt-32 lg:pb-16 md:px-8 lg:px-10 grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-10 items-center"
          >
            {/* Left Content Area */}
            <div className="text-center lg:text-left text-white flex flex-col items-center lg:items-start justify-center lg:pl-10">
              <motion.div
                variants={fadeUp}
                className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold text-gold w-fit mb-5 shadow-[0_0_15px_rgba(201,149,42,0.1)]"
              >
                <span>Verified FUTO Student Accommodation</span>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="text-3xl sm:text-5xl lg:text-5xl font-extrabold leading-[1.1] tracking-tight mb-5"
              >
                Find FUTO Lodges
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-gold via-amber-400 to-yellow-200 mt-1">Stress-Free.</span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="text-xs sm:text-sm text-gray-300 max-w-md leading-relaxed mb-6"
              >
                Compare verified student apartments, filter by area/budget, and contact trusted local agents instantly via WhatsApp. Built by students, for students.
              </motion.p>

              {/* Inline Search Capsule Form */}
              <motion.form
                onSubmit={(e) => {
                  e.preventDefault();
                  const params = new URLSearchParams();
                  if (query.trim()) params.set("query", query);
                  if (selectedArea) params.set("area", selectedArea);
                  if (selectedRoomType) params.set("type", selectedRoomType);
                  router.push(`/lodges?${params.toString()}`);
                }}
                variants={fadeUp}
                className="w-full max-w-lg mb-8 mx-auto lg:mx-0"
              >
                <div className="flex flex-col md:flex-row items-stretch gap-2 p-2 bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl md:rounded-full shadow-2xl w-full">
                  {/* Custom Area Dropdown */}
                  <div className="relative flex items-center gap-2 px-3 border-b md:border-b-0 md:border-r border-white/10 py-2 md:py-0 min-w-[130px] select-none">
                    <div
                      className="flex items-center justify-between gap-2 w-full cursor-pointer py-1"
                      onClick={() => setAreaDropdownOpen(!areaDropdownOpen)}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <MapPin className="h-4 w-4 text-gold shrink-0" />
                        <span className="text-white text-xs font-semibold truncate text-left">
                          {selectedArea || "Any Area"}
                        </span>
                      </div>
                      <ChevronDown className={`h-3.5 w-3.5 text-gray-400 transition-transform duration-200 shrink-0 ${areaDropdownOpen ? 'rotate-180' : ''}`} />
                    </div>

                    {areaDropdownOpen && (
                      <>
                        {/* Overlay to close on outside click */}
                        <div
                          className="fixed inset-0 z-40 bg-transparent"
                          onClick={() => setAreaDropdownOpen(false)}
                        />
                        {/* Dropdown Menu list */}
                        <div className="absolute top-full left-0 mt-3 w-48 bg-[#0d1624] border border-white/10 rounded-2xl shadow-2xl p-1.5 z-50 flex flex-col gap-1 backdrop-blur-xl">
                          {[
                            { value: "", label: "Any Area" },
                            { value: "Eziobodo", label: "Eziobodo" },
                            { value: "Ihiagwa", label: "Ihiagwa" },
                            { value: "Umuchima", label: "Umuchima" },
                            { value: "Obinze", label: "Obinze" },
                            { value: "FUTO Gate", label: "FUTO Gate" }
                          ].map((item) => (
                            <div
                              key={item.value}
                              onClick={() => {
                                setSelectedArea(item.value);
                                setAreaDropdownOpen(false);
                              }}
                              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer select-none ${selectedArea === item.value
                                ? 'bg-[#e0b445] text-navy font-bold shadow-md shadow-gold/15'
                                : 'text-white/80 hover:bg-white/5 hover:text-white'
                                }`}
                            >
                              {item.label}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Landmark Search input */}
                  <div className="flex-1 relative flex items-center gap-2 px-3 py-2 md:py-0">
                    <Search className="h-4 w-4 text-gray-400 shrink-0" />
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Lodge name, landmark, specs..."
                      className="w-full bg-transparent text-white text-xs border-0 outline-none placeholder:text-gray-500 animate-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-gold text-navy font-extrabold text-xs px-5 py-3 rounded-full flex items-center justify-center gap-2 hover:bg-[#d7a93a] transition-all hover:scale-[1.02] cursor-pointer border-0 shrink-0 shadow-lg shadow-gold/25"
                  >
                    <Search className="h-3.5 w-3.5" />
                    Search Lodges
                  </button>
                </div>
              </motion.form>

              {/* Trust Factor Row */}
              <motion.div variants={stagger} className="grid grid-cols-3 gap-4 max-w-xl w-full text-center lg:text-left border-t border-white/10 pt-6">
                {stats.map((item) => (
                  <div key={item.label} className="space-y-1">
                    <span className="text-xl font-extrabold text-white block leading-none">{item.value}</span>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold block">{item.label}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right Interactive Mockup Showcase (iPhone image + Floating Cards) */}
            <div className="relative flex items-center justify-center w-full mt-8 lg:mt-0 select-none h-[400px] lg:h-[500px]">
              {/* Luminous Stand Podium effect under phone */}
              <div className="absolute bottom-6 w-44 h-6 bg-gold/15 blur-[10px] rounded-full transform rotate-x-60 pointer-events-none animate-pulse" />

              {/* Floating Card 1: Verified (Top-Left) */}
              <motion.div
                initial={{ opacity: 0, x: -20, y: -10 }}
                animate={{ opacity: 1, x: 0, y: [0, -6, 0] }}
                transition={{
                  opacity: { duration: 0.6, delay: 0.4 },
                  x: { duration: 0.6, delay: 0.4 },
                  y: { repeat: Infinity, duration: 4, ease: "easeInOut", delay: 0.2 }
                }}
                className="absolute left-2 sm:left-4 top-14 z-20 flex items-center gap-2 rounded-2xl bg-[#0d1624]/90 border border-white/10 p-2.5 sm:p-3 shadow-2xl backdrop-blur-md max-w-[140px] pointer-events-none"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold">
                  <BadgeCheck className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-gold">Verified</p>
                  <p className="text-xs font-semibold text-white/95 leading-tight">100% Inspected</p>
                </div>
              </motion.div>

              {/* Floating Card 2: Price (Bottom-Right) */}
              <motion.div
                initial={{ opacity: 0, x: 20, y: 20 }}
                animate={{ opacity: 1, x: 0, y: [0, 8, 0] }}
                transition={{
                  opacity: { duration: 0.6, delay: 0.6 },
                  x: { duration: 0.6, delay: 0.6 },
                  y: { repeat: Infinity, duration: 5.5, ease: "easeInOut", delay: 0.5 }
                }}
                className="absolute right-2 sm:right-4 bottom-16 z-20 flex items-center gap-2 rounded-2xl bg-[#0d1624]/90 border border-white/10 p-2.5 sm:p-3 shadow-2xl backdrop-blur-md max-w-[140px] pointer-events-none"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                  <Building className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-blue-400">FUTO gate</p>
                  <p className="text-xs font-semibold text-white/95 leading-tight">5 mins walk</p>
                </div>
              </motion.div>

              {/* Floating Card 3: Rating (Middle-Right/Upper-Right) */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
                transition={{
                  opacity: { duration: 0.6, delay: 0.8 },
                  scale: { duration: 0.6, delay: 0.8 },
                  y: { repeat: Infinity, duration: 4.8, ease: "easeInOut", delay: 0.8 }
                }}
                className="absolute right-1 sm:right-2 top-20 z-20 flex items-center gap-1.5 rounded-xl bg-gold text-navy px-2.5 py-1.5 shadow-2xl font-bold text-[10px] sm:text-xs pointer-events-none"
              >
                <Star className="h-3.5 w-3.5 fill-current" />
                <span>4.9 Rating</span>
              </motion.div>

              {/* Main Phone Mockup */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                className="relative z-10 flex justify-center w-full max-w-[200px] sm:max-w-[240px]"
              >
                <Image
                  src="/image/mobile image.png"
                  alt="CampusHub Mobile Preview"
                  width={240}
                  height={480}
                  className="object-contain"
                  priority
                />
              </motion.div>
            </div>
          </motion.div>

          {/* Bottom fade out overlay for mobile view to transition from dark hero to light body */}
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#f8f9fa] dark:from-[#08131e] to-transparent pointer-events-none lg:hidden" />
        </section>

        <section className="mx-auto max-w-7xl px-6 py-16 md:px-8 lg:px-10">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.div
              variants={fadeUp}
              className="flex items-end justify-between"
            >
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">
                  Featured Lodges
                </p>
                <h2 className="mt-3 text-3xl font-semibold text-navy md:text-4xl">
                  Top rated and official listings
                </h2>
              </div>
              <Link
                href="/lodges"
                className="hidden text-sm font-semibold text-gold transition hover:text-navy sm:block"
              >
                View all lodges →
              </Link>
            </motion.div>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredLodges.map((item) => {
                const { room, ...lodge } = item;
                return (
                  <motion.div key={room.id} variants={fadeUp}>
                    <LodgeCard
                      name={lodge.name}
                      area={`${lodge.area} · ${lodge.landmark}`}
                      price={formatNaira(room.price)}
                      rating={lodge.rating}
                      href={`/lodges/${lodge.slug}/rooms/${room.id}`}
                      photo={room.photos[0]}
                      isOfficial={lodge.isOfficial}
                      roomType={room.roomType}
                    />
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </section>

        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.22 }}
          variants={fadeUp}
          className="mx-auto max-w-7xl lg:pb-16 md:pb-16 md:px-8 lg:px-10 md:pt-8 lg:pt-10"
        >
          <div className="lg:rounded-[2rem] bg-[#0f1e2d] p-8 text-amber-400 md:p-10">
            <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
              <motion.div variants={fadeUp}>
                <p className="text-sm text-white font-semibold uppercase tracking-[0.24em] text-gold">
                  How it works
                </p>
                <h2 className="mt-3 text-2xl text-white font-semibold md:text-4xl">
                  A simpler way to find a lodge
                </h2>
                <p className="mt-4 max-w-lg text-sm leading-7 text-white/70">
                  Three focused steps to get from search to inspection, without
                  losing track of what matters.
                </p>
              </motion.div>

              <motion.div
                variants={stagger}
                className="grid gap-4 md:grid-cols-3"
              >
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <motion.div
                      key={step.title}
                      variants={fadeUp}
                      className="rounded-3xl border border-white/10 bg-white/6 p-5 backdrop-blur transition-all duration-300 ease-out hover:-translate-y-2 hover:bg-white/10 hover:border-gold/30 hover:shadow-2xl hover:shadow-gold/5 group cursor-default"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gold text-navy transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-md shadow-gold/10">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
                        Step {index + 1}
                      </div>
                      <h3 className="mt-2 text-lg font-bold text-white transition-colors duration-300 group-hover:text-gold">
                        {step.title}
                      </h3>
                      <p className="mt-2 text-sm leading-7 text-white/65">
                        {step.text}
                      </p>
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
          </div>
        </motion.section>
      </main>

      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
        variants={fadeUp}
        className="w-full pb-20 overflow-hidden"
      >
        <div className="mx-auto max-w-7xl px-6 md:px-8 lg:px-10 text-center mb-12 mt-16 md:mt-0">
          <h2 className="text-3xl font-extrabold text-navy dark:text-white tracking-tight">
            What students say
          </h2>
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            Real students. Real experiences from FUTO. See how they found housing stress-free.
          </p>
        </div>

        {/* Infinite Marquee Container */}
        <div className="marquee-container flex flex-col gap-6 w-full select-none">
          {/* Row 1: Moving Left */}
          <div className="relative flex overflow-x-hidden w-full mask-gradient-x py-1">
            <div className="animate-marquee-left flex gap-6">
              {/* First Set of Cards */}
              {row1Testimonials.map((t, idx) => (
                <div key={`r1-${idx}`} className="w-[300px] sm:w-[350px] shrink-0 rounded-2xl bg-white dark:bg-[#0f1d2e] border border-black/5 dark:border-white/10 p-6 shadow-sm flex flex-col justify-between hover:border-gold/30 transition-colors">
                  <p className="text-sm text-gray-700 dark:text-gray-300 italic leading-relaxed">
                    “{t.text}”
                  </p>
                  <div className="mt-4 flex items-center gap-3 border-t border-black/5 dark:border-white/5 pt-3">
                    <div className="h-8 w-8 rounded-full bg-gold/15 flex items-center justify-center text-xs font-bold text-gold shrink-0">
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-navy dark:text-white">{t.name}</p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">{t.dept}</p>
                    </div>
                  </div>
                </div>
              ))}
              {/* Duplicate Set for Seamless Loop */}
              {row1Testimonials.map((t, idx) => (
                <div key={`r1-dup-${idx}`} className="w-[300px] sm:w-[350px] shrink-0 rounded-2xl bg-white dark:bg-[#0f1d2e] border border-black/5 dark:border-white/10 p-6 shadow-sm flex flex-col justify-between hover:border-gold/30 transition-colors">
                  <p className="text-sm text-gray-700 dark:text-gray-300 italic leading-relaxed">
                    “{t.text}”
                  </p>
                  <div className="mt-4 flex items-center gap-3 border-t border-black/5 dark:border-white/5 pt-3">
                    <div className="h-8 w-8 rounded-full bg-gold/15 flex items-center justify-center text-xs font-bold text-gold shrink-0">
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-navy dark:text-white">{t.name}</p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">{t.dept}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Row 2: Moving Right */}
          <div className="relative flex overflow-x-hidden w-full mask-gradient-x py-1">
            <div className="animate-marquee-right flex gap-6">
              {/* First Set of Cards */}
              {row2Testimonials.map((t, idx) => (
                <div key={`r2-${idx}`} className="w-[300px] sm:w-[350px] shrink-0 rounded-2xl bg-white dark:bg-[#0f1d2e] border border-black/5 dark:border-white/10 p-6 shadow-sm flex flex-col justify-between hover:border-gold/30 transition-colors">
                  <p className="text-sm text-gray-700 dark:text-gray-300 italic leading-relaxed">
                    “{t.text}”
                  </p>
                  <div className="mt-4 flex items-center gap-3 border-t border-black/5 dark:border-white/5 pt-3">
                    <div className="h-8 w-8 rounded-full bg-gold/15 flex items-center justify-center text-xs font-bold text-gold shrink-0">
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-navy dark:text-white">{t.name}</p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">{t.dept}</p>
                    </div>
                  </div>
                </div>
              ))}
              {/* Duplicate Set for Seamless Loop */}
              {row2Testimonials.map((t, idx) => (
                <div key={`r2-dup-${idx}`} className="w-[300px] sm:w-[350px] shrink-0 rounded-2xl bg-white dark:bg-[#0f1d2e] border border-black/5 dark:border-white/10 p-6 shadow-sm flex flex-col justify-between hover:border-gold/30 transition-colors">
                  <p className="text-sm text-gray-700 dark:text-gray-300 italic leading-relaxed">
                    “{t.text}”
                  </p>
                  <div className="mt-4 flex items-center gap-3 border-t border-black/5 dark:border-white/5 pt-3">
                    <div className="h-8 w-8 rounded-full bg-gold/15 flex items-center justify-center text-xs font-bold text-gold shrink-0">
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-navy dark:text-white">{t.name}</p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">{t.dept}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>



      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeUp}
        className="mx-auto max-w-7xl px-6 pb-12 md:px-8 lg:px-10"
      >
        <div className="rounded-3xl bg-[#e0b445] p-6 flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          <motion.div
            variants={stagger}
            className="flex flex-wrap items-center gap-6"
          >
            <motion.div
              variants={fadeUp}
              className="inline-flex items-center gap-3"
            >
              <ShieldCheck className="h-5 w-5 text-gold" />
              <span className="text-sm text-white">Verified agents</span>
            </motion.div>
            <motion.div
              variants={fadeUp}
              className="inline-flex items-center gap-3"
            >
              <MessageCircle className="h-5 w-5 text-white/90" />
              <span className="text-sm text-white">Secure contact</span>
            </motion.div>
            <motion.div
              variants={fadeUp}
              className="inline-flex items-center gap-3"
            >
              <Star className="h-5 w-5 text-gold" />
              <span className="text-sm text-white">Real reviews</span>
            </motion.div>
            <motion.div
              variants={fadeUp}
              className="inline-flex items-center gap-3"
            >
              <BadgeCheck className="h-5 w-5 text-white/90" />
              <span className="text-sm text-white">Student-first</span>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeUp}
        className=" pb-20 "
      >
        <div className=" bg-black p-8 text-center">
          <h3 className="text-2xl font-semibold text-white">
            Are you an agent? Reach 1,200+ FUTO students.
          </h3>
          <Link
            href="/auth?mode=signup&role=agent"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#e0b445] px-6 py-3 text-sm font-semibold text-black shadow-sm transition hover:bg-[#d4a73a]"
          >
            Become an agent
          </Link>
        </div>
      </motion.section>

      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeUp}
        className="mx-auto max-w-7xl px-6 pb-20 md:px-8 lg:px-10"
      >
        <div className="rounded-2xl bg-white p-8 md:p-10">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-2xl font-semibold text-black">
              Join and connect with us on our platforms
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Connect with other students, get listing alerts, and join
              conversations about housing near FUTO.
            </p>

            <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-md  transition-all hover:-translate-y-0.5"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#25D366]">
                  <FaWhatsapp className="h-4 w-4 text-white" aria-hidden />
                </span>
                Join WhatsApp Community
              </a>

              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 px-6 py-3 text-sm font-semibold text-white shadow-md hover:opacity-95 transition-all hover:-translate-y-0.5"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                >
                  <rect width="24" height="24" rx="6" fill="url(#g)" />
                  <path
                    d="M12 7.2a4.8 4.8 0 100 9.6 4.8 4.8 0 000-9.6zm0 7.92a3.12 3.12 0 110-6.24 3.12 3.12 0 010 6.24zM17.88 6.48a1.12 1.12 0 11-2.24 0 1.12 1.12 0 012.24 0z"
                    fill="#fff"
                  />
                  <defs>
                    <linearGradient
                      id="g"
                      x1="0"
                      x2="24"
                      y1="0"
                      y2="24"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#8a3ab9" />
                      <stop offset="0.5" stopColor="#d6249f" />
                      <stop offset="1" stopColor="#fca34d" />
                    </linearGradient>
                  </defs>
                </svg>
                Follow on Instagram
              </a>

              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 rounded-full bg-[#0b1120] px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-[#0e1526] transition-all hover:-translate-y-0.5"
              >
                <X className="h-5 w-5 text-white" />
                Follow on X
              </a>
            </div>
          </div>
        </div>
      </motion.section>
      <Footer />
    </div>
  );
}
