import React from "react";
import Link from "next/link";
import { ArrowUpRight, Globe, MessageCircle, Send, X } from "lucide-react";

const columns = [
  {
    title: "For students",
    links: [
      { label: "Find a Lodge", href: "/lodges" },
      { label: "Roommates", href: "/roommates" },
      { label: "Saved rooms", href: "#" },
    ],
  },
  {
    title: "For agents",
    links: [
      { label: "Become an Agent", href: "/become-agent" },
      { label: "Upload listings", href: "/dashboard/agent" },
      { label: "Agent profile", href: "/dashboard/agent" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Privacy", href: "#" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-black/5 bg-[#09131d] text-white">
      <div className="mx-auto max-w-7xl px-6 py-14 md:px-8 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <div className="mt-5">
              <div className="flex items-center gap-1.5">
                <img
                  src="/image/Campus-Hub2.png"
                  alt="CampusHub Logo"
                  className="h-12 w-12 object-contain"
                />
                <span className="text-2xl font-bold tracking-tight text-white">Campus<span className="text-gold">Hub</span></span>
              </div>
              <p className="mt-4 text-sm leading-6 text-white/75">
                CampusHub is the faster way to find student housing near FUTO.
              </p>
            </div>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/65">
              Built for a modern student housing experience with verified
              agents, simple discovery, and WhatsApp-first communication.
            </p>

            <div className="mt-6 flex items-center gap-3 text-white/70">
              <a
                href="https://campushub.ng"
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-white/10 p-3 transition hover:bg-white/10"
              >
                <Globe className="h-4 w-4" />
              </a>
              <a
                href="https://wa.me"
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-white/10 p-3 transition hover:bg-white/10"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-white/10 p-3 transition hover:bg-white/10"
                aria-label="X"
              >
                <X className="h-4 w-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-white/10 p-3 transition hover:bg-white/10"
                aria-label="Instagram"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4 fill-current"
                  aria-hidden="true"
                >
                  <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5a4.25 4.25 0 0 0 4.25 4.25h8.5a4.25 4.25 0 0 0 4.25-4.25v-8.5a4.25 4.25 0 0 0-4.25-4.25h-8.5Zm8.63 2.11a1.11 1.11 0 1 1 0 2.22 1.11 1.11 0 0 1 0-2.22ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.5A3.5 3.5 0 1 0 12 16a3.5 3.5 0 0 0 0-7Z" />
                </svg>
              </a>
              <a
                href="mailto:hello@campushub.ng"
                className="rounded-full border border-white/10 p-3 transition hover:bg-white/10"
              >
                <Send className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {columns.map((column) => (
              <div key={column.title}>
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-white/45">
                  {column.title}
                </h3>
                <ul className="mt-4 space-y-3 text-sm text-white/75">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="inline-flex items-center gap-1 transition hover:text-gold"
                      >
                        {link.label} <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-white/50 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-1.5">
            <img
              src="/image/Campus-Hub2.png"
              alt="CampusHub Logo"
              className="h-6 w-6 object-contain"
            />
            <span>© {new Date().getFullYear()} Campus<span className="text-gold">Hub</span>. Designed for FUTO students.</span>
          </div>
          <p>Fast, verified, and WhatsApp-first.</p>
        </div>
      </div>
    </footer>
  );
}
