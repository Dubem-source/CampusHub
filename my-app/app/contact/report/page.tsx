"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ShieldAlert,
  Send,
  BadgeCheck,
} from "lucide-react";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";

type ReportFormState = {
  name: string;
  email: string;
  listing: string;
  agent: string;
  location: string;
  issueType: string;
  details: string;
};

const initialReportForm: ReportFormState = {
  name: "",
  email: "",
  listing: "",
  agent: "",
  location: "",
  issueType: "",
  details: "",
};

const issueTypeOptions = [
  "Scam / fake listing",
  "Wrong pricing",
  "Bad photos / misleading info",
  "Agent behavior",
  "Other",
];

const reportHighlights = [
  "We review every submission carefully.",
  "Please include the listing name, agent name, and location.",
  "Add any proof or context that helps us verify the issue.",
];

export default function ReportPage() {
  const [form, setForm] = useState<ReportFormState>(initialReportForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isIssueTypeOpen, setIsIssueTypeOpen] = useState(false);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.issueType) {
      toast.error("Please choose an issue type.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          subject: `Report scam/problem listing: ${form.issueType}`,
          message: [
            `Listing / property: ${form.listing}`,
            `Agent name: ${form.agent}`,
            `Location: ${form.location}`,
            `Issue type: ${form.issueType}`,
            "",
            form.details,
          ].join("\n"),
        }),
      });

      const data = (await response.json()) as {
        ok?: boolean;
        message?: string;
        error?: string;
      };

      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Unable to submit report.");
      }

      toast.success(data.message || "Report submitted successfully.");
      setForm(initialReportForm);
      setIsIssueTypeOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to submit report.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(122,6,8,0.08),transparent_28%),linear-gradient(180deg,#f8f9fa_0%,#ffffff_52%)] text-black">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:px-8 lg:px-10 lg:py-12">
        <div className="mb-6 flex items-center justify-between gap-3">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:border-gray-300 hover:text-navy"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to contact
          </Link>
          <div className="hidden items-center gap-2 rounded-full border border-[#7a0608]/15 bg-[#7a0608]/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#7a0608] sm:inline-flex">
            <ShieldAlert className="h-4 w-4" />
            Serious report
          </div>
        </div>

        <section className="grid gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-start">
          <div className="rounded-3xl border border-[#7a0608]/10 bg-[#071226] p-6 text-white shadow-[0_20px_60px_rgba(7,18,38,0.22)] sm:p-8 lg:sticky lg:top-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[#f6d26a]">
              <ShieldAlert className="h-4 w-4" />
              Report scam or problem listing
            </div>

            <h1 className="mt-5 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              Report a listing with confidence.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-white/75 sm:text-base">
              Use this page for scam reports, fake listings, pricing problems, or suspicious agent behavior. We review reports and act on them as quickly as possible.
            </p>

            <div className="mt-7 space-y-4 rounded-3xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-start gap-3">
                <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#f6d26a]" />
                <p className="text-sm leading-6 text-white/78">
                  Please give the full listing name, agent name, and location.
                </p>
              </div>
              {reportHighlights.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#f6d26a]" />
                  <p className="text-sm leading-6 text-white/78">{item}</p>
                </div>
              ))}
            </div>

            <div className="mt-7 rounded-3xl border border-white/10 bg-white/5 p-5 text-sm leading-6 text-white/75">
              If you just need general support, go back to the contact page instead of using this form.
            </div>
          </div>

          <div className="rounded-3xl border border-black/5 bg-white p-5 shadow-sm sm:p-6 md:p-8">
            <div className="mb-6 border-b border-gray-100 pb-5">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#7a0608]">
                Serious report form
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-navy sm:text-3xl">
                Fill in the details below
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base">
                The more complete your report is, the easier it is for us to investigate.
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid gap-5 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-navy">Your name</span>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="Your full name"
                    className="w-full rounded-2xl border border-gray-200 bg-[#fcfcfc] px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#7a0608] focus:ring-4 focus:ring-[#7a0608]/10"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-navy">Your email</span>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="you@example.com"
                    className="w-full rounded-2xl border border-gray-200 bg-[#fcfcfc] px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#7a0608] focus:ring-4 focus:ring-[#7a0608]/10"
                  />
                </label>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-navy">Listing / lodge name</span>
                  <input
                    name="listing"
                    value={form.listing}
                    onChange={handleChange}
                    required
                    placeholder="Enter listing name"
                    className="w-full rounded-2xl border border-gray-200 bg-[#fcfcfc] px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#7a0608] focus:ring-4 focus:ring-[#7a0608]/10"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-navy">Agent name</span>
                  <input
                    name="agent"
                    value={form.agent}
                    onChange={handleChange}
                    required
                    placeholder="Enter agent name"
                    className="w-full rounded-2xl border border-gray-200 bg-[#fcfcfc] px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#7a0608] focus:ring-4 focus:ring-[#7a0608]/10"
                  />
                </label>
              </div>

              <div className="grid gap-5 md:grid-cols-[1.08fr_0.92fr]">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-navy">Location</span>
                  <input
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    required
                    placeholder="Area, street, or landmark"
                    className="w-full rounded-2xl border border-gray-200 bg-[#fcfcfc] px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#7a0608] focus:ring-4 focus:ring-[#7a0608]/10"
                  />
                </label>

                <div className="relative block space-y-2">
                  <span className="text-sm font-medium text-navy">Issue type</span>
                  <button
                    type="button"
                    onClick={() => setIsIssueTypeOpen((current) => !current)}
                    className="flex w-full items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-[#fcfcfc] px-4 py-3 text-left text-sm text-gray-500 outline-none transition hover:border-gray-300 focus:border-[#7a0608] focus:ring-4 focus:ring-[#7a0608]/10"
                  >
                    <span className={form.issueType ? "text-gray-900" : "text-gray-400"}>
                      {form.issueType || "Select issue type"}
                    </span>
                    <ChevronDown className={`h-4 w-4 shrink-0 text-gray-500 transition ${isIssueTypeOpen ? "rotate-180" : ""}`} />
                  </button>

                  {isIssueTypeOpen && (
                    <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-20 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
                      {issueTypeOptions.map((option) => {
                        const selected = form.issueType === option;
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => {
                              setForm((current) => ({ ...current, issueType: option }));
                              setIsIssueTypeOpen(false);
                            }}
                            className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm transition ${selected ? "bg-[#f7efe0] text-navy" : "text-gray-700 hover:bg-gray-50"}`}
                          >
                            <span>{option}</span>
                            {selected && <Check className="h-4 w-4 text-gold" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-navy">Details</span>
                <textarea
                  name="details"
                  value={form.details}
                  onChange={handleChange}
                  required
                  rows={6}
                  placeholder="Explain what happened, when it happened, and anything that helps us investigate."
                  className="h-40 w-full resize-none rounded-2xl border border-gray-200 bg-[#fcfcfc] px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#7a0608] focus:ring-4 focus:ring-[#7a0608]/10"
                />
              </label>

              <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm leading-6 text-gray-500">
                  This report is sent to the contact team for review.
                </p>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#071226] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0c1c35] disabled:cursor-not-allowed disabled:opacity-70 sm:min-w-44"
                >
                  {isSubmitting ? "Submitting..." : "Submit report"}
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>
        </section>

        <div className="mt-8 flex justify-center">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 text-sm font-semibold text-navy transition hover:text-[#7a0608]"
          >
            Return to contact page
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
