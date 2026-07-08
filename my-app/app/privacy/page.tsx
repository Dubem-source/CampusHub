"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Lock, Database, Eye, ShieldCheck, Heart, UserMinus } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function PrivacyPolicy() {
  const sections = [
    {
      icon: Database,
      title: "1. Information We Collect",
      content: "We collect user details necessary to deliver housing directory services. For Students, this includes your name, email, department, level, and phone number. For Agents, we collect additional details such as NIN (National Identity Numbers), utility bills, or business registration documents to fulfill our vetting and verification processes."
    },
    {
      icon: Eye,
      title: "2. How We Use and Share Information",
      content: "Student profile data is utilized for roommate search noticeboards. Phone numbers are visible to verified users to facilitate direct roommate connections. Agent phone numbers are displayed alongside listings to enable WhatsApp bookings. Vetting documents (e.g. NIN) are strictly confidential, stored securely, and viewed only by CampusHub super-administrators for account audit purposes. We never sell your personal information."
    },
    {
      icon: Heart,
      title: "3. Browser Storage & User Favorites",
      content: "We use browser local storage (localStorage) to store your recently viewed rooms locally on your device. This data is not synchronized to our servers and is used solely to enhance your local browsing experience and speed up your property comparisons."
    },
    {
      icon: Lock,
      title: "4. Data Security & Hosting",
      content: "CampusHub stores and processes database records within secured Supabase cloud servers. Standard encryption protocols protect your login credentials. While we enforce safety configurations, off-platform communication (such as WhatsApp chats or physical tours) is subject to the privacy settings and safety precautions of the individual parties."
    },
    {
      icon: UserMinus,
      title: "5. Data Retention & Deletion Rights",
      content: "You retain full ownership of your data. Students and agents can delete roommate posts or list items at any time. If you wish to permanently close your account and remove all personal information (including NIN checks and verification records) from our system, you can submit a deletion request to admin support."
    }
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(201,149,42,0.08),transparent_30%),linear-gradient(180deg,#f8f9fa_0%,#ffffff_52%)] text-[#0f1e2d]">
      <Header />

      <main className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        {/* Navigation Breadcrumb */}
        <Link 
          href="/auth?mode=signup&role=agent" 
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#C9952A] mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Signup
        </Link>

        {/* Page Header */}
        <div className="text-center md:text-left mb-12">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#C9952A]/10 text-[#C9952A] mb-4">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-[#0f1e2d] md:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-3 text-gray-500 text-base md:text-lg leading-relaxed max-w-2xl">
            This Privacy Policy details how CampusHub collects, stores, and protects personal information for students and house agents. Effective date: June 15, 2026.
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-8">
          {sections.map((section, idx) => {
            const IconComponent = section.icon;
            return (
              <div 
                key={idx} 
                className="bg-white rounded-3xl border border-black/5 p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-[#C9952A]/10 text-[#C9952A] rounded-xl shrink-0">
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[#0f1e2d] mb-3">{section.title}</h2>
                    <p className="text-gray-600 text-sm leading-relaxed md:text-base">{section.content}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Contact/Support Footer */}
        <div className="mt-12 text-center bg-[#0f1e2d] text-white rounded-[2rem] p-8 md:p-10 border border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(201,149,42,0.12),transparent_35%)] pointer-events-none" />
          <h3 className="text-xl font-bold mb-3">Concerned about your privacy?</h3>
          <p className="text-white/70 text-sm max-w-md mx-auto mb-6 leading-relaxed">
            If you want to request data deletion, ask questions about verification safety, or report an incident, email the admin support inbox.
          </p>
          <a 
            href="mailto:privacy@campushub.com" 
            className="inline-flex items-center justify-center rounded-full bg-[#C9952A] px-6 py-3 text-sm font-semibold text-[#0f1e2d] hover:bg-[#C9952A]/90 transition"
          >
            Contact Privacy Officer
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
}
