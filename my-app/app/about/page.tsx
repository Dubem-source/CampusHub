"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { motion, type Variants } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Globe,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Zap,
} from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

const MotionLink = motion(Link);

const WhatsAppCircle = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M12 2C6.477 2 2 6.02 2 10.98c0 2.66 1.32 5.06 3.44 6.69L4.5 22l4.56-2.22c.92.22 1.88.34 2.94.34 5.523 0 10-4.02 10-9.02S17.523 2 12 2zm0 16.5c-.85 0-1.67-.11-2.44-.32l-.32-.08-2.63 1.28.6-2.57-.26-.19C5.15 15.48 4 13.35 4 10.98 4 7.14 7.57 4 12 4s8 3.14 8 6.98-3.57 6.52-8 6.52zm-3.2-7.03l1.84-1.96 2.11 1.54 2.88-3.06 1.06 1-3.95 4.21-2.1-1.53-1.78 1.9-1.06-1.1z" />
  </svg>
);

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

const stagger: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05,
    },
  },
};

function Accordion({ items }: { items: { q: string; a: string }[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  return (
    <div className="w-full space-y-3">
      {items.map((it, i) => {
        const open = openIndex === i;
        return (
          <div
            key={it.q}
            className="overflow-hidden rounded-2xl border border-gray-200"
          >
            <button
              type="button"
              aria-expanded={open}
              onClick={() => setOpenIndex(open ? null : i)}
              className="flex w-full items-center justify-between gap-4 bg-white px-5 py-4 text-left"
            >
              <span className="text-sm font-semibold text-navy">{it.q}</span>
              <span className="text-sm text-gray-500">{open ? "−" : "+"}</span>
            </button>
            <div
              className={`${open ? "block" : "hidden"} px-5 pb-4 pt-2 text-sm text-gray-600`}
            >
              {it.a}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function AboutPage() {
  const [isMobile, setIsMobile] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setPageLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");

    const updateIsMobile = () => setIsMobile(mediaQuery.matches);
    updateIsMobile();

    mediaQuery.addEventListener("change", updateIsMobile);
    return () => mediaQuery.removeEventListener("change", updateIsMobile);
  }, []);

  const faqItems = [
    {
      q: "Is CampusHub free for students?",
      a: "Yes — CampusHub is free for students. We make money from agent subscriptions and verified listings.",
    },
    {
      q: "How do I know an agent is real?",
      a: "Agents submit ID and are manually verified before they can list. Look for the verified badge on agent profiles.",
    },
    {
      q: "What if I get scammed?",
      a: "We verify agents, but always inspect a lodge in person before paying. Report suspicious listings and we'll investigate.",
    },
    {
      q: "How do I leave a review?",
      a: "After an inspection or stay, open the lodge page and tap 'Leave a review' — rate water, electricity, security, and add photos.",
    },
    {
      q: "How do I find a roommate?",
      a: "Use the filters to search for shared rooms, then message saved listings or agents to ask about roommates.",
    },
  ];

  if (pageLoading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white dark:bg-[#08131e] transition-colors duration-300">
        <div className="relative flex flex-col items-center space-y-4">
          <div className="relative h-20 w-20 rounded-2xl bg-gold/10 p-2 flex items-center justify-center shadow-lg border border-gold/20 animate-pulse">
            <Image
              src="/image/Campus-Hub.png"
              alt="CampusHub Logo"
              width={64}
              height={64}
              className="rounded-xl object-contain"
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
              <span>Loading About...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(201,149,42,0.06),transparent_30%),linear-gradient(180deg,#f8f9fa_0%,#ffffff_55%)] text-black">
      <Header />
      <main>
        {/* Hero mini-banner */}
        <section className="border-b border-black/5">
          <motion.div
            initial="hidden"
            animate="show"
            variants={stagger}
            className="mx-auto max-w-7xl py-8"
          >
            <motion.div
              variants={fadeUp}
              className="bg-[#071226] p-6 text-white"
            >
              <motion.div
                variants={stagger}
                className="mx-auto max-w-3xl text-center"
              >
                <motion.div
                  variants={fadeUp}
                  className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-gold"
                >
                  <Sparkles className="h-4 w-4 text-gold" />
                  About CampusHub
                </motion.div>
                <motion.h1
                  variants={fadeUp}
                  className="text-2xl font-semibold leading-snug md:text-3xl"
                >
                  We’re making lodge‑hunting safe and simple for FUTO students.
                </motion.h1>
                <motion.p
                  variants={fadeUp}
                  className="mt-3 text-sm text-white/85"
                >
                  CampusHub connects you with verified agents and real student
                  reviews — so you never walk into a bad deal.
                </motion.p>
              </motion.div>
            </motion.div>
          </motion.div>
        </section>

        {/* What is CampusHub? */}
        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          variants={fadeUp}
          className="mx-auto max-w-7xl px-6 py-12 md:px-8 lg:px-10"
        >
          <motion.div
            variants={stagger}
            className="grid gap-10 lg:grid-cols-2 lg:items-center"
          >
            <motion.div variants={fadeUp}>
              <h2 className="text-3xl font-semibold text-navy">
                What is CampusHub?
              </h2>
              <p className="mt-4 text-sm text-gray-600">
                CampusHub is a student platform made By a Notable Develooper who
                found the need in making lodge-hunting safe,stressfree and
                simple for FUTO students. It verifies agents, surfaces real
                photos and honest student reviews, and helps you compare lodges
                near FUTO — all in one place.
              </p>

              <div className="mt-6 space-y-5">
                <motion.div variants={fadeUp}>
                  <h3 className="text-base font-semibold text-navy">Problem</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Finding a good lodge near FUTO is stressful — fake agents,
                    missing amenities, no real reviews.
                  </p>
                </motion.div>

                <motion.div variants={fadeUp}>
                  <h3 className="text-base font-semibold text-navy">
                    Solution
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    CampusHub verifies every agent, lets you compare rooms with
                    real photos, and read honest reviews from other students.
                    And it’s completely free for students.
                  </p>
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="flex items-center justify-center"
            >
              <div className="rounded-2xl border border-black/5 bg-white p-8 text-center shadow-sm">
                <ShieldCheck className="mx-auto h-12 w-12 text-gold" />
                <p className="mt-4 text-sm text-gray-700">
                  Verified agents, clear listings, student reviews.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </motion.section>

        {/* How it works - 3 steps */}
        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          variants={fadeUp}
          className="mx-auto max-w-7xl px-6 py-10 md:px-8 lg:px-10"
        >
          <motion.div
            variants={stagger}
            className="mx-auto max-w-3xl text-center"
          >
            <p className="text-sm font-semibold uppercase tracking-wider text-gold">
              How it works
            </p>
            <motion.h3
              variants={fadeUp}
              className="mt-3 text-2xl font-semibold text-navy"
            >
              Search. Compare. Book an inspection.
            </motion.h3>
            <motion.p variants={fadeUp} className="mt-3 text-sm text-gray-600">
              Three simple steps to find a safe, affordable room near campus.
            </motion.p>
          </motion.div>

          <motion.div
            variants={stagger}
            className="mt-8 grid gap-6 md:grid-cols-3"
          >
            <motion.div
              variants={fadeUp}
              className="rounded-2xl border border-black  bg-white p-6 text-center  hover:shadow-lg transition hover:-translate-y-3"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#f7efe0] text-gold">
                <Globe className="h-6 w-6" />
              </div>
              <h4 className="mt-4 text-base font-semibold">Search</h4>
              <p className="mt-2 text-sm text-gray-600">
                Filter by area, price, room type, and amenities to find suitable
                lodges.
              </p>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="rounded-2xl border border-black bg-white p-6 text-center  hover:shadow-lg transition hover:-translate-y-3"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#f7efe0] text-gold">
                <BadgeCheck className="h-6 w-6" />
              </div>
              <h4 className="mt-4 text-base font-semibold">Compare & Review</h4>
              <p className="mt-2 text-sm text-gray-600">
                See real photos and verified reviews so you can choose with
                confidence.
              </p>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="rounded-2xl border border-black bg-white p-6 text-center  hover:shadow-lg transition hover:-translate-y-3"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#f7efe0] text-gold">
                <WhatsAppCircle className="h-6 w-6" />
              </div>
              <h4 className="mt-4 text-base font-semibold">
                Book an Inspection
              </h4>
              <p className="mt-2 text-sm text-gray-600">
                One tap to WhatsApp with a pre‑filled message to schedule a
                visit.
              </p>
            </motion.div>
          </motion.div>
        </motion.section>

        {/* Why Trust Us */}
        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          variants={fadeUp}
          className="mx-auto max-w-7xl px-6 py-10 md:px-8 lg:px-10"
        >
          <motion.div
            variants={stagger}
            className="mx-auto max-w-4xl text-center"
          >
            <p className="text-sm font-semibold uppercase tracking-wider text-gold">
              Why trust CampusHub?
            </p>
            <motion.h3
              variants={fadeUp}
              className="mt-3 text-2xl font-semibold text-navy"
            >
              Built for students. Trusted by the community.
            </motion.h3>
          </motion.div>

          <motion.div
            variants={stagger}
            className="mt-8 grid gap-6 md:grid-cols-4"
          >
            <motion.div
              variants={fadeUp}
              className="rounded-2xl border border-black bg-[#f7efe0] p-6 text-center hover:shadow-lg transition hover:-translate-y-3"
            >
              <BadgeCheck className="mx-auto h-6 w-6 text-gold" />
              <h5 className="mt-3 text-sm font-semibold text-navy">
                Verified Agents
              </h5>
              <p className="mt-2 text-xs text-gray-600">
                Every agent submits their NIN and is manually approved.
              </p>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="rounded-2xl border border-black bg-[#f7efe0] p-6 text-center hover:shadow-lg transition hover:-translate-y-3"
            >
              <Star className="mx-auto h-6 w-6 text-gold" />
              <h5 className="mt-3 text-sm font-semibold text-navy">
                Real Reviews
              </h5>
              <p className="mt-2 text-xs text-gray-600">
                Students rate water, electricity, and security — you see the
                truth.
              </p>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="rounded-2xl border border-black bg-[#f7efe0] p-6 text-center hover:shadow-lg transition hover:-translate-y-3"
            >
              <Users className="mx-auto h-6 w-6 text-gold" />
              <h5 className="mt-3 text-sm font-semibold text-navy">
                No Hidden Fees
              </h5>
              <p className="mt-2 text-xs text-gray-600">
                Students never pay a naira to use CampusHub.
              </p>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="rounded-2xl border border-black bg-[#f7efe0] p-6 text-center  hover:shadow-lg transition hover:-translate-y-3"
            >
              <ShieldCheck className="mx-auto h-6 w-6 text-gold" />
              <h5 className="mt-3 text-sm font-semibold text-navy">
                Secure Contact
              </h5>
              <p className="mt-2 text-xs text-gray-600">
                Your number stays private until you choose to connect.
              </p>
            </motion.div>
          </motion.div>
        </motion.section>

        {/* FAQ Accordion */}
        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeUp}
          className="mx-auto max-w-7xl px-6 py-10 md:px-8 lg:px-10"
        >
          <motion.div variants={stagger} className="mx-auto max-w-3xl">
            <motion.h3
              variants={fadeUp}
              className="text-2xl font-semibold text-navy"
            >
              Frequently asked questions
            </motion.h3>
            <motion.p variants={fadeUp} className="mt-3 text-sm text-gray-600">
              Short, honest answers to common questions.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-6">
              <Accordion
                items={[
                  {
                    q: "Is CampusHub free for students?",
                    a: "Yes — CampusHub is free for students. We make money from agent subscriptions and verified listings.",
                  },
                  {
                    q: "How do I know an agent is real?",
                    a: "Agents submit ID and are manually verified before they can list. Look for the verified badge on agent profiles.",
                  },
                  {
                    q: "What if I get scammed?",
                    a: "We verify agents, but always inspect a lodge in person before paying. Report suspicious listings and we'll investigate.",
                  },
                  {
                    q: "How do I leave a review?",
                    a: "After an inspection or stay, open the lodge page and tap 'Leave a review' — rate water, electricity, security, and add photos.",
                  },
                  {
                    q: "How do I find a roommate?",
                    a: "Use the filters to search for shared rooms, then message saved listings or agents to ask about roommates.",
                  },
                ]}
              />
            </motion.div>
          </motion.div>
        </motion.section>

        {/* Final CTA */}
        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          variants={fadeUp}
          className="mx-auto max-w-7xl py-12 md:px-8 lg:px-10"
        >
          <motion.div
            variants={stagger}
            className="lg:rounded-2xl bg-[#071226] p-8 text-white"
          >
            <motion.div
              variants={stagger}
              className="mx-auto flex max-w-4xl flex-col items-center gap-4 text-center"
            >
              <motion.h3 variants={fadeUp} className="text-2xl font-semibold">
                Ready to find your next home near FUTO?
              </motion.h3>
              <motion.p variants={fadeUp} className="text-sm text-white/85">
                Ready to find your next home near FUTO?
              </motion.p>
              <motion.div variants={fadeUp} className="mt-4 flex gap-3">
                <MotionLink
                  href="/lodges"
                  animate={
                    isMobile
                      ? {
                          y: [0, -8, 0, -6, 0],
                          scale: [1, 1.04, 1, 1.03, 1],
                        }
                      : undefined
                  }
                  transition={
                    isMobile
                      ? {
                          duration: 1.15,
                          ease: "easeInOut",
                          times: [0, 0.2, 0.4, 0.7, 1],
                          repeat: Infinity,
                          repeatDelay: 5.85,
                        }
                      : undefined
                  }
                  className="inline-flex items-center gap-2 rounded-lg bg-[#e0b445] px-6 py-3 text-sm font-semibold text-navy shadow-md transition-all hover:-translate-y-0.5 hover:bg-[#d7a93a]"
                >
                  Browse Lodges <ArrowRight className="h-4 w-4" />
                </MotionLink>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.section>
      </main>
      <Footer />
    </div>
  );
}
