"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Wrench, MapPin, MessageCircle, Info, X } from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { 
  getServiceProviders, 
  ServiceProvider, 
  getServiceApplications, 
  saveServiceApplications,
  ServiceApplication 
} from "../../lib/marketplace-services-data";
import { toast } from "react-hot-toast";
import { useAuth } from "@/hooks/use-auth";

export default function ServicesPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  // A user is considered "logged in" as a student if they have a Firebase session + student role
  const isLoggedIn = !!user && profile?.role === "student";
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setPageLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Application Modal States
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [applyForm, setApplyForm] = useState({
    name: "",
    service_type: "Cleaning",
    phone: "",
    whatsapp: "",
    area: "",
    description: ""
  });
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Load vetted service providers
    setProviders(getServiceProviders());

    // Sync if updated
    const handleSync = () => {
      setProviders(getServiceProviders());
    };
    window.addEventListener("service-providers-updated", handleSync);
    return () => {
      window.removeEventListener("service-providers-updated", handleSync);
    };
  }, []);

  const handleContactProvider = (provider: ServiceProvider) => {
    if (!isLoggedIn) {
      // Redirect to login page and preserve redirect path
      router.push(`/auth?tab=login&redirect=/services`);
      return;
    }

    // Format phone to international WhatsApp standard
    let clean = provider.phone.replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) {
      clean = '234' + clean.slice(1);
    } else if (clean.startsWith('8') || clean.startsWith('7') || clean.startsWith('9')) {
      clean = '234' + clean;
    }
    
    const waUrl = `https://wa.me/${clean}?text=${encodeURIComponent(`Hi ${provider.name}, I saw your service profile on CampusHub and would like to make an inquiry.`)}`;
    window.open(waUrl, "_blank");
  };

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyForm.name || !applyForm.phone || !applyForm.area || !applyForm.description) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (!agreed) {
      toast.error("You must agree to the vetting disclaimer checkbox.");
      return;
    }

    setSubmitting(true);

    setTimeout(() => {
      const newApp: ServiceApplication = {
        id: `app-${Date.now()}`,
        name: applyForm.name,
        service_type: applyForm.service_type as any,
        phone: applyForm.phone,
        whatsapp: applyForm.whatsapp || applyForm.phone,
        area: applyForm.area,
        description: applyForm.description,
        status: "pending",
        created_at: new Date().toISOString()
      };

      // 1. Save application
      const currentApps = getServiceApplications();
      saveServiceApplications([newApp, ...currentApps]);

      // 2. Create in-app admin bell notification in localStorage
      const savedNotifs = localStorage.getItem("admin_notifications");
      let notifsList = [];
      if (savedNotifs) {
        try {
          notifsList = JSON.parse(savedNotifs);
        } catch(e) {}
      }
      const newNotif = {
        id: `admin-notif-${Date.now()}`,
        title: "New Service Application 📋",
        body: `A new service helper application has been submitted by ${applyForm.name} for "${applyForm.service_type}" services.`,
        timestamp: "Just now",
        read: false,
        type: "application"
      };
      localStorage.setItem("admin_notifications", JSON.stringify([newNotif, ...notifsList]));
      window.dispatchEvent(new Event("admin-notifications-updated"));

      // 3. Set a pending Resend email details simulation flag in localStorage
      const emailDetails = {
        to: "admin@campushub.com",
        subject: `[CampusHub] New Service Provider Application: ${applyForm.name}`,
        body: `Hi Admin,\n\nA new provider has applied to be listed in the CampusHub Services Directory.\n\nApplicant Details:\n- Name: ${applyForm.name}\n- Service Type: ${applyForm.service_type}\n- Phone: ${applyForm.phone}\n- WhatsApp: ${applyForm.whatsapp || applyForm.phone}\n- Area Served: ${applyForm.area}\n- Description: ${applyForm.description}\n\nPlease review their application under the "Service Applications" admin dashboard tab to vet their credentials and manually launch their live listing.\n\nBest regards,\nCampusHub Automation System`
      };
      localStorage.setItem("service_application_email_pending", JSON.stringify(emailDetails));
      window.dispatchEvent(new Event("admin-notifications-updated")); // Trigger sync in admin if open

      toast.success("Application submitted successfully! Admins will review and contact you.");
      setApplyForm({
        name: "",
        service_type: "Cleaning",
        phone: "",
        whatsapp: "",
        area: "",
        description: ""
      });
      setAgreed(false);
      setIsApplyModalOpen(false);
      setSubmitting(false);
    }, 1000);
  };

  if (pageLoading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white dark:bg-[#08131e] transition-colors duration-300">
        <div className="relative flex flex-col items-center space-y-4">
          <div className="relative h-20 w-20 rounded-full bg-gold/10 p-2 flex items-center justify-center shadow-lg border border-gold/20 animate-pulse">
            <Image
              src="/image/Campus-Hub2.png"
              alt="CampusHub Logo"
              width={64}
              height={64}
              className="rounded-full object-contain"
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
              <span>Loading Services...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[radial-gradient(circle_at_top,_rgba(201,149,42,0.08),_transparent_40%),linear-gradient(180deg,#f8f9fa_0%,#ffffff_60%,#f7f7f5_100%)] text-navy dark:bg-navy dark:text-white dark:bg-none">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 md:px-8 lg:px-10">
        {/* Intro Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full bg-gold/10 text-gold px-4 py-1.5 text-xs font-semibold uppercase tracking-wider"
          >
            Vetted Helpers
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-extrabold tracking-tight text-navy dark:text-white"
          >
            Services <span className="text-gold">Directory</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base text-gray-500 dark:text-gray-400 leading-relaxed"
          >
            Browse trusted local services vetted by the CampusHub team. From plumbing and solar setup to routine cleaning and tutoring, we have you covered.
          </motion.p>

          {/* CTA application button for guests / service providers */}
          {!isLoggedIn && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="pt-4"
            >
              <button
                onClick={() => setIsApplyModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-navy hover:bg-navy/90 dark:bg-gold dark:hover:bg-gold/90 px-6 py-3 text-xs font-bold text-white dark:text-navy shadow-lg transition hover:-translate-y-0.5 cursor-pointer border-0"
              >
                Want to be listed? Apply here
              </button>
            </motion.div>
          )}
        </div>

        {/* Directory Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {providers.filter(p => p.is_active).length > 0 ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {providers.filter(p => p.is_active).map(provider => (
                <div
                  key={provider.id}
                  className="group flex flex-col rounded-[2.5rem] border border-black/5 dark:border-white/5 bg-white dark:bg-[#0f1d2e] overflow-hidden shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="relative h-48 overflow-hidden bg-gray-150 dark:bg-white/5 flex items-center justify-center">
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
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4 text-left">
                    <div className="space-y-2">
                      <h3 className="font-extrabold text-navy dark:text-white text-lg tracking-tight truncate">{provider.name}</h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin size={12} className="text-gold" /> {provider.area}
                      </p>
                      <p className="text-xs leading-relaxed text-navy/70 dark:text-gray-300 line-clamp-3">
                        {provider.description}
                      </p>
                    </div>

                    <button
                      onClick={() => handleContactProvider(provider)}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-gold hover:bg-gold/90 px-4 py-3.5 text-xs font-bold text-navy shadow-md transition hover:-translate-y-0.5 border-0 cursor-pointer"
                    >
                      <MessageCircle size={14} />
                      Chat on WhatsApp
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-[3rem] border border-dashed border-black/10 dark:border-white/10 bg-white dark:bg-[#0f1d2e] py-20 text-center">
              <Wrench className="mx-auto h-12 w-12 text-gray-200 dark:text-white/20" />
              <p className="mt-4 text-base font-bold text-navy dark:text-white">No services listed yet</p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Please check back later or contact support.</p>
            </div>
          )}
        </motion.div>

        {/* Security / Vetting disclaimer */}
        <div className="mt-16 bg-gold/5 border border-gold/15 rounded-3xl p-6 flex flex-col md:flex-row items-center gap-4 text-left">
          <div className="p-3 bg-gold/10 rounded-2xl text-gold shrink-0">
            <Info size={24} />
          </div>
          <div>
            <h4 className="font-bold text-navy dark:text-white text-sm">Security & Trusted Vetting</h4>
            <p className="text-xs text-navy/70 dark:text-gray-400 mt-1 leading-relaxed">
              Every provider in the directory undergoes strict manual screening, NIN checks, and work validations by CampusHub admin before listing. Tapping provider links redirects you securely. Always inspect jobs before final service payments.
            </p>
          </div>
        </div>
      </main>

      {/* Service Provider Apply Modal */}
      <AnimatePresence>
        {isApplyModalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsApplyModalOpen(false)}
              className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
            />
            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 m-auto h-fit max-h-[95vh] w-full max-w-lg bg-white dark:bg-[#0f1d2e] dark:lg:bg-[#121212] rounded-[2.5rem] overflow-y-auto border border-black/5 dark:border-white/5 z-50 p-6 md:p-8 text-left shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/5">
                <div>
                  <h2 className="text-xl font-extrabold text-navy dark:text-white">Apply as Service Provider</h2>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Fill out your details to request listing in directory.</p>
                </div>
                <button
                  onClick={() => setIsApplyModalOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 hover:text-navy dark:hover:text-white cursor-pointer border-0 bg-transparent"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleApplySubmit} className="space-y-4 pt-4">
                {/* Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Full Name / Business Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chinedu Plumbing Services, FUTO Laundry Hub..."
                    value={applyForm.name}
                    onChange={(e) => setApplyForm({ ...applyForm, name: e.target.value })}
                    className="w-full rounded-xl bg-gray-50 dark:bg-white/5 text-navy dark:text-white px-4 py-3 text-xs border border-navy/5 dark:border-white/5 outline-none focus:ring-1 focus:ring-gold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Service Type */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Service Type *</label>
                    <select
                      value={applyForm.service_type}
                      onChange={(e) => setApplyForm({ ...applyForm, service_type: e.target.value })}
                      className="w-full rounded-xl bg-gray-55/20 dark:bg-white/5 text-navy dark:text-white px-4 py-3 text-xs border border-navy/5 dark:border-white/5 outline-none focus:ring-1 focus:ring-gold"
                    >
                      <option value="Cleaning">Cleaning</option>
                      <option value="Electrical">Electrical</option>
                      <option value="Plumbing">Plumbing</option>
                      <option value="Laundry">Laundry</option>
                      <option value="Solar Installation">Solar Installation</option>
                      <option value="Tutoring">Tutoring</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Area served */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Area Served *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Eziobodo, Ihiagwa, FUTO..."
                      value={applyForm.area}
                      onChange={(e) => setApplyForm({ ...applyForm, area: e.target.value })}
                      className="w-full rounded-xl bg-gray-55/20 dark:bg-white/5 text-navy dark:text-white px-4 py-3 text-xs border border-navy/5 dark:border-white/5 outline-none focus:ring-1 focus:ring-gold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Phone */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Phone Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 08034567891"
                      value={applyForm.phone}
                      onChange={(e) => setApplyForm({ ...applyForm, phone: e.target.value })}
                      className="w-full rounded-xl bg-gray-55/20 dark:bg-white/5 text-navy dark:text-white px-4 py-3 text-xs border border-navy/5 dark:border-white/5 outline-none focus:ring-1 focus:ring-gold"
                    />
                  </div>

                  {/* WhatsApp */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400">WhatsApp Number</label>
                    <input
                      type="text"
                      placeholder="Same as phone if empty"
                      value={applyForm.whatsapp}
                      onChange={(e) => setApplyForm({ ...applyForm, whatsapp: e.target.value })}
                      className="w-full rounded-xl bg-gray-55/20 dark:bg-white/5 text-navy dark:text-white px-4 py-3 text-xs border border-navy/5 dark:border-white/5 outline-none focus:ring-1 focus:ring-gold"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Description of Service *</label>
                  <textarea
                    required
                    placeholder="Provide details about your experience, typical charges, and work schedule..."
                    value={applyForm.description}
                    onChange={(e) => setApplyForm({ ...applyForm, description: e.target.value })}
                    rows={3}
                    className="w-full rounded-xl bg-gray-55/20 dark:bg-white/5 text-navy dark:text-white px-4 py-3 text-xs border border-navy/5 dark:border-white/5 outline-none focus:ring-1 focus:ring-gold resize-none"
                  />
                </div>

                {/* Disclaimer Checkbox */}
                <label className="flex items-start gap-3 pt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-gold focus:ring-gold cursor-pointer"
                  />
                  <span className="text-[11px] text-navy/70 dark:text-gray-300 leading-normal">
                    I understand that CampusHub will contact me on WhatsApp/phone to verify my details and request photos to complete my vetting and listing.
                  </span>
                </label>

                {/* Submit button */}
                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsApplyModalOpen(false)}
                    className="rounded-full bg-gray-150 hover:bg-gray-250 dark:bg-white/5 dark:hover:bg-white/10 px-6 py-3 font-bold text-xs text-navy dark:text-white transition cursor-pointer border-0"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-full bg-gold hover:bg-gold/90 px-6 py-3 font-bold text-xs text-navy shadow-md transition cursor-pointer border-0 disabled:opacity-50"
                  >
                    {submitting ? "Submitting..." : "Submit Application"}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
