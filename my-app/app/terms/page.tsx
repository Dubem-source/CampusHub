"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, FileText, Shield, Gavel, Scale, AlertTriangle, HelpCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function TermsAndConditions() {
  const sections = [
    {
      icon: Shield,
      title: "1. Scope of Services & Our Role",
      content: "CampusHub is an online directory and matching platform designed for students near FUTO (Federal University of Technology, Owerri). We connect students seeking accommodation or roommates with verified independent house agents and listing owners. CampusHub does not own, lease, or manage any properties listed, nor do we act as property transaction brokers. Any contract or agreement entered into following a lead on this platform is strictly between you and the respective counterparty."
    },
    {
      icon: Scale,
      title: "2. Agent Verification & Accountability",
      content: "Agents listing properties on CampusHub must submit legal verification documents (including National Identity Number - NIN, business registrations, or licenses) to our administrators. While we take meticulous steps to audit agent profiles, a 'Verified' badge does not constitute a legal guarantee. Students are strongly advised to inspect properties personally and verify ownership documents before making any financial commitments."
    },
    {
      icon: AlertTriangle,
      title: "3. Accuracy of Listings & Pricing Rules",
      content: "All listed room units must reflect real-time prices, accurate amenities (e.g. solar backup, borehole access, security details), and actual property photos. Agents are strictly prohibited from utilizing bait-and-switch pricing or uploading misleading images. CampusHub reserves the absolute right to suspend agent accounts, hide properties, or permanently delete listings that violate these standards of truthfulness."
    },
    {
      icon: Gavel,
      title: "4. Student Reviews & Code of Conduct",
      content: "Students may write reviews and rate lodges based on Water, Electricity, and Security criteria. All reviews must be honest, factual, and based on prospective tours or verified tenancies. Defamatory, offensive, or racially charged language will be flagged, investigated by the platform admins, and removed immediately."
    },
    {
      icon: HelpCircle,
      title: "5. WhatsApp Booking & Off-Platform Transactions",
      content: "Inspection bookings, tenancy contracts, and rent transfers are executed off-platform via WhatsApp or direct physical interactions. CampusHub is not responsible for, and shall have no liability in connection with, financial transactions, deposit holds, or contract breaches occurring outside our directory website."
    },
    {
      icon: FileText,
      title: "6. Platform Audit & Report Actions",
      content: "Students can flag suspicious listings using our reporting system. Platform admins will investigate reported incidents (wrong pricing, rude behavior, scams) and take actions, including suspending agents or reporting malicious activities to law enforcement when necessary."
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
            <Scale className="h-6 w-6" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-[#0f1e2d] md:text-5xl">
            Terms & Conditions
          </h1>
          <p className="mt-3 text-gray-500 text-base md:text-lg leading-relaxed max-w-2xl">
            Please read these terms carefully before listing properties or using roommates matching on CampusHub. Effective date: June 15, 2026.
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
          <h3 className="text-xl font-bold mb-3">Have questions about our Terms?</h3>
          <p className="text-white/70 text-sm max-w-md mx-auto mb-6 leading-relaxed">
            If you need further clarification regarding agent regulations, student protection, or reporting policies, contact the admin.
          </p>
          <a 
            href="mailto:support@campushub.com" 
            className="inline-flex items-center justify-center rounded-full bg-[#C9952A] px-6 py-3 text-sm font-semibold text-[#0f1e2d] hover:bg-[#C9952A]/90 transition"
          >
            Email Admin Support
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
}
