"use client";

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Bell } from 'lucide-react'
import { useSidebar } from '@/components/ui/sidebar'
import { StudentSidebar } from '@/components/student/StudentSidebar'
import { useAuth } from '@/hooks/use-auth'

const links = [
  { href: '/', label: 'Home' },
  { href: '/lodges', label: 'Lodges' },
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/contact', label: 'Contact' },
]

function getInitials(name?: string) {
  if (!name) return "U";
  return name.trim().split(/\s+/).map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const pathname = usePathname()
  const { toggleSidebar, openMobile } = useSidebar()

  // ── Single source of truth: Firebase Auth + Firestore profile ──
  const { user, profile } = useAuth();

  const isAgent = !!user && profile?.role === "agent";
  const isStudent = !!user && profile?.role === "student";
  const displayName = profile?.fullName || user?.displayName || "";
  const photoURL = user?.photoURL || "";

  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-black/5 dark:border-white/10 bg-white/80 dark:bg-navy/80 backdrop-blur-xl transition-colors duration-300">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-8 lg:px-10">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/image/Campus-Hub.png"
            alt="Campus-Hub Logo"
            width={50}
            height={50}
            className="rounded-full object-contain bg-white p-0.5 border border-black/5 shadow-sm"
          />
          <span className="text-xl font-bold text-black dark:text-white tracking-tight">Campus<span className="text-gold">Hub</span></span>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 transition hover:bg-gray-100 dark:hover:bg-white/10 hover:text-navy dark:hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {isAgent ? (
            <>
              {/* Desktop agent avatar link */}
              <Link
                href="/dashboard/agent"
                className="hidden items-center gap-2 rounded-full border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-1.5 text-sm font-medium text-black dark:text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md md:inline-flex"
              >
                {photoURL ? (
                  <img src={photoURL} alt={displayName} className="w-6 h-6 rounded-full object-cover border border-gold" />
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-navy text-[10px] font-bold text-gold border border-gold/25">
                    {getInitials(displayName)}
                  </div>
                )}
                <span className="max-w-[100px] truncate">{displayName.split(" ")[0]}</span>
              </Link>
              {/* Mobile agent avatar */}
              <Link href="/dashboard/agent" className="inline-flex items-center justify-center rounded-full md:hidden">
                {photoURL ? (
                  <img src={photoURL} alt={displayName} className="w-8 h-8 rounded-full object-cover border border-gold" />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-xs font-bold text-gold border border-gold/25">
                    {getInitials(displayName)}
                  </div>
                )}
              </Link>
            </>
          ) : isStudent ? (
            <>
              {/* Notification bell */}
              <Link
                href="/dashboard/student"
                className="relative flex h-9 w-9 items-center justify-center rounded-full border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:text-navy dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/10 transition shadow-sm md:h-10 md:w-10"
              >
                <Bell className="h-4 w-4 md:h-5 md:w-5" />
              </Link>

              {/* Desktop student avatar link */}
              <Link
                href="/dashboard/student"
                className="hidden items-center gap-2 rounded-full border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-1.5 text-sm font-medium text-black dark:text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md md:inline-flex"
              >
                {photoURL ? (
                  <img src={photoURL} alt={displayName} className="w-6 h-6 rounded-full object-cover border border-gold" />
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-navy text-[10px] font-bold text-gold border border-gold/25">
                    {getInitials(displayName)}
                  </div>
                )}
                <span className="max-w-[100px] truncate">{displayName.split(" ")[0]}</span>
              </Link>
              {/* Mobile student avatar */}
              <Link href="/dashboard/student" className="inline-flex items-center justify-center rounded-full md:hidden">
                {photoURL ? (
                  <img src={photoURL} alt={displayName} className="w-8 h-8 rounded-full object-cover border border-gold" />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-xs font-bold text-gold border border-gold/25">
                    {getInitials(displayName)}
                  </div>
                )}
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/auth?mode=login"
                className="hidden rounded-full border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2.5 text-sm font-medium text-black dark:text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md md:inline-flex"
              >
                Login
              </Link>
              <Link
                href="/auth?mode=signup"
                className="hidden rounded-full bg-[#e0b445] px-4 py-2.5 text-sm font-semibold text-black dark:text-navy shadow-[0_12px_30px_rgba(224,180,69,0.35)] transition hover:-translate-y-0.5 hover:bg-[#d7a93a] md:inline-flex"
              >
                Sign up
              </Link>
            </>
          )}
          {isStudent ? (
            <button
              type="button"
              aria-label="Toggle navigation menu"
              aria-expanded={openMobile}
              onClick={toggleSidebar}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 text-black dark:text-white shadow-sm transition hover:-translate-y-0.5 md:hidden"
            >
              {openMobile ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          ) : (
            <button
              type="button"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 text-black dark:text-white shadow-sm transition hover:-translate-y-0.5 md:hidden"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          )}
        </div>
      </div>

      <div className={`md:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="mx-6 mb-4 rounded-3xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#0f1d2e] p-4 shadow-lg overflow-y-auto max-h-[80vh] text-black dark:text-white">
          <nav className="flex flex-col gap-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-2xl px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 transition hover:bg-gray-100 dark:hover:bg-white/10 hover:text-black dark:hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {isAgent ? (
            <div className="mt-3">
              <Link
                href="/dashboard/agent"
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#e0b445] px-4 py-3 text-sm font-semibold text-black shadow-[0_10px_24px_rgba(224,180,69,0.28)] transition hover:bg-[#d7a93a]"
              >
                Go to Agent Dashboard
              </Link>
            </div>
          ) : isStudent ? (
            <div className="mt-3">
              <Link
                href="/dashboard/student"
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#e0b445] px-4 py-3 text-sm font-semibold text-black shadow-[0_10px_24px_rgba(224,180,69,0.28)] transition hover:bg-[#d7a93a]"
              >
                Go to Student Dashboard
              </Link>
            </div>
          ) : (
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Link
                href="/auth?mode=login"
                className="inline-flex items-center justify-center rounded-full border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 transition hover:bg-gray-50 dark:hover:bg-white/10 hover:text-black dark:hover:text-white"
              >
                Login
              </Link>
              <Link
                href="/auth?mode=signup"
                className="inline-flex items-center justify-center rounded-full bg-[#e0b445] px-4 py-3 text-sm font-semibold text-black dark:text-navy shadow-[0_10px_24px_rgba(224,180,69,0.28)] transition hover:bg-[#d7a93a]"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>

      </header>

      {/* Spacer to prevent page content from going underneath the fixed header */}
      <div className="h-[82px] w-full shrink-0" />

      {isStudent && (
        <StudentSidebar
          studentName={displayName}
          studentAvatar={photoURL}
          notificationsCount={0}
        />
      )}
    </>
  )
}
