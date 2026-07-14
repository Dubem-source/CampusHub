"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "react-hot-toast";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Mail,
  MapPin,
  MessageSquareText,
  PhoneCall,
  Send,
} from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { FaWhatsapp } from "react-icons/fa";

type FormState = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

const initialForm: FormState = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

const subjectOptions = ["Agent application", "General inquiry"];

const contactDetails = [
  {
    label: "WhatsApp",
    value: "+234 800 000 0000",
    href: "https://wa.me/2348000000000?text=Hello%20CampusHub%2C%20I%20need%20help%20with",
    icon: FaWhatsapp,
  },
  {
    label: "Phone Call",
    value: "+234 800 000 0000",
    href: "tel:+2348000000000",
    icon: PhoneCall,
  },
  {
    label: "Email",
    value: "hello@campushub.com",
    href: "mailto:hello@campushub.com",
    icon: Mail,
  },
  {
    label: "Location",
    value: "FUTO, Owerri",
    href: "https://maps.google.com/?q=FUTO%20Owerri",
    icon: MapPin,
  },
];

export default function ContactPage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [isSubjectOpen, setIsSubjectOpen] = useState(false);
  const subjectWrapRef = useRef<HTMLDivElement | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setPageLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.subject) {
      toast.error("Please choose a subject.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = (await response.json()) as {
        ok?: boolean;
        message?: string;
        error?: string;
      };

      if (!response.ok || !data.ok) {
        throw new Error(
          data.error || "Something went wrong. Please try again.",
        );
      }

      toast.success(data.message || "Message sent successfully.");
      setForm(initialForm);
      setIsSubjectOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to send message.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white dark:bg-[#08131e] transition-colors duration-300">
        <div className="relative flex flex-col items-center space-y-4">
          <div className="relative h-20 w-20 rounded-full bg-gold/10 p-2 flex items-center justify-center shadow-lg border border-gold/20 animate-pulse">
            <Image
              src="/image/Campus-Hub.png"
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
              <span>Loading Contact...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(201,149,42,0.08),transparent_28%),linear-gradient(180deg,#f8f9fa_0%,#ffffff_50%)] text-black">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:px-8 lg:px-10">
        <section className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/20 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-gold shadow-sm">
            <MessageSquareText className="h-4 w-4" />
            Contact Us
          </div>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight text-navy md:text-5xl">
            Talk to CampusHub
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-gray-600 md:text-base">
            Reach us directly for support, partnerships, and general questions.
            If you need to report a scam or a suspicious listing, use the report
            page below.
          </p>
          <Link
            href="/contact/report"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#7a0608] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#620507]"
          >
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-white/20 text-[10px] leading-none text-white">
              !
            </span>
            Report scam or problem listing
          </Link>
        </section>

        <section className="mt-12 grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <div className="rounded-3xl border border-black/5 bg-[#071226] p-6 text-white shadow-[0_20px_60px_rgba(7,18,38,0.22)] sm:p-8">
            <h2 className="text-lg font-semibold text-white">Quick contact</h2>
            <p className="mt-2 text-sm leading-6 text-white/72">
              Simple ways to reach us right now.
            </p>

            <div className="mt-6 space-y-4 sm:space-y-5">
              {contactDetails.map(({ label, value, href, icon: Icon }) => (
                <Link
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 text-white/90 transition sm:gap-4"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gold sm:h-11 sm:w-11">
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </span>
                  <span>
                    <span className="block text-sm font-medium text-white/95">
                      {label}
                    </span>
                    <span className="mt-0.5 block text-sm text-white/68 hover:text-orange-400">
                      {value}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-black/5 bg-white p-5 shadow-sm sm:p-6 md:p-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gold">
                Send a message
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-navy">
                Tell us what you need
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Choose a topic, add context, and we&apos;ll send it to
                `/api/contact`.
              </p>
            </div>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <div className="grid gap-5 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-navy">Name</span>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="Your name"
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-gold focus:ring-4 focus:ring-gold/10"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-navy">Email</span>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="you@example.com"
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-gold focus:ring-4 focus:ring-gold/10"
                  />
                </label>
              </div>

              <div ref={subjectWrapRef} className="relative block space-y-2">
                <span className="text-sm font-medium text-navy">Subject</span>
                <button
                  type="button"
                  onClick={() => setIsSubjectOpen((current) => !current)}
                  className="flex w-full items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-left text-sm text-gray-500 outline-none transition hover:border-gray-300 focus:border-gold focus:ring-4 focus:ring-gold/10"
                >
                  <span
                    className={form.subject ? "text-gray-900" : "text-gray-400"}
                  >
                    {form.subject || "Select a subject"}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-gray-500 transition ${isSubjectOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isSubjectOpen && (
                  <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-20 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
                    {subjectOptions.map((option) => {
                      const selected = form.subject === option;
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => {
                            setForm((current) => ({
                              ...current,
                              subject: option,
                            }));
                            setIsSubjectOpen(false);
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

              <label className="space-y-2 block">
                <span className="text-sm font-medium text-navy">Message</span>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  placeholder="Write your message here..."
                  className="h-36 w-full resize-none rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-gold focus:ring-4 focus:ring-gold/10"
                />
              </label>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#071226] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#0c1c35] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Sending..." : "Send message"}
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
