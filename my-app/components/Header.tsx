"use client";

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, User, Heart, Clock, Bell, Home, Search, Users, Info, Phone, LogOut, GraduationCap } from 'lucide-react'
import { useSidebar } from '@/components/ui/sidebar'
import { StudentSidebar } from '@/components/student/StudentSidebar'

const links = [
  { href: '/', label: 'Home' },
  { href: '/lodges', label: 'Lodges' },
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/contact', label: 'Contact' },
]

function getInitials(name?: string) {
  if (!name) return "ST";
  return name.trim().split(/\s+/).map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const pathname = usePathname()
  const [agentData, setAgentData] = React.useState<{ full_name: string; photo: string } | null>(null);
  const [studentData, setStudentData] = React.useState<{ full_name: string; avatar_url?: string } | null>(null);
  const [userRole, setUserRole] = React.useState<string | null>(null);
  const [notificationsCount, setNotificationsCount] = React.useState(0);
  const { toggleSidebar, openMobile } = useSidebar();

  React.useEffect(() => {
    const loadData = () => {
      const role = localStorage.getItem("user_role");
      setUserRole(role);

      const isAgentLoggedIn = localStorage.getItem("agent_logged_in") === "true";
      const aData = localStorage.getItem("agent_data");
      if (isAgentLoggedIn && aData && role === "agent") {
        try {
          setAgentData(JSON.parse(aData));
        } catch (e) {
          console.error("Failed to parse agent_data", e);
        }
      } else {
        setAgentData(null);
      }

      const isStudentLoggedIn = localStorage.getItem("student_logged_in") === "true";
      const sData = localStorage.getItem("student_data");
      if (isStudentLoggedIn && sData && role === "student") {
        try {
          setStudentData(JSON.parse(sData));
        } catch (e) {
          console.error("Failed to parse student_data", e);
        }
      } else {
        setStudentData(null);
      }

      // Sync unread notification count
      const savedNotifications = localStorage.getItem("student_notifications");
      if (savedNotifications) {
        try {
          const list = JSON.parse(savedNotifications);
          const unreadCount = list.filter((n: any) => !n.read).length;
          setNotificationsCount(unreadCount);
        } catch (e) {
          setNotificationsCount(0);
        }
      } else {
        setNotificationsCount(2); // default mock unread count (two items are unread in the mock)
      }
    };

    loadData();

    window.addEventListener("storage", loadData);
    window.addEventListener("agent-data-updated", loadData);
    window.addEventListener("student-data-updated", loadData);
    window.addEventListener("student-notifications-updated", loadData);

    return () => {
      window.removeEventListener("storage", loadData);
      window.removeEventListener("agent-data-updated", loadData);
      window.removeEventListener("student-data-updated", loadData);
      window.removeEventListener("student-notifications-updated", loadData);
    };
  }, []);

  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-8 lg:px-10">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/image/Campus-Hub.png"
            alt="Campus-Hub Logo"
            width={50}
            height={50}
            className="rounded-lg"
          />
          <span className="text-xl font-bold text-black tracking-tight">CampusHub</span>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-navy"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {userRole === "agent" && agentData ? (
            <>
              {/* Desktop view profile dashboard link */}
              <Link
                href="/dashboard/agent"
                className="hidden items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1.5 text-sm font-medium text-black shadow-sm transition hover:-translate-y-0.5 hover:shadow-md md:inline-flex"
              >
                <img
                  src={agentData.photo || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"}
                  alt={agentData.full_name}
                  className="w-6 h-6 rounded-full object-cover border border-gold"
                />
                <span className="max-w-[100px] truncate">{agentData.full_name.split(" ")[0]}</span>
              </Link>
              {/* Mobile view profile picture next to hamburger menu */}
              <Link
                href="/dashboard/agent"
                className="inline-flex items-center justify-center rounded-full md:hidden"
              >
                <img
                  src={agentData.photo || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"}
                  alt={agentData.full_name}
                  className="w-8 h-8 rounded-full object-cover border border-gold"
                />
              </Link>
            </>
          ) : userRole === "student" && studentData ? (
            <>
              {/* Notification bell */}
              <Link
                href="/dashboard/student?tab=notifications"
                className="relative flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white text-gray-600 hover:text-navy hover:bg-gray-50 transition shadow-sm md:h-10 md:w-10"
              >
                <Bell className="h-4 w-4 md:h-5 md:w-5" />
                {notificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[9px] font-extrabold text-navy animate-pulse">
                    {notificationsCount}
                  </span>
                )}
              </Link>

              {/* Desktop view profile dashboard link */}
              <Link
                href="/dashboard/student"
                className="hidden items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1.5 text-sm font-medium text-black shadow-sm transition hover:-translate-y-0.5 hover:shadow-md md:inline-flex"
              >
                {studentData.avatar_url ? (
                  <img
                    src={studentData.avatar_url}
                    alt={studentData.full_name}
                    className="w-6 h-6 rounded-full object-cover border border-gold"
                  />
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-navy text-[10px] font-bold text-gold border border-gold/25">
                    {getInitials(studentData.full_name)}
                  </div>
                )}
                <span className="max-w-[100px] truncate">{studentData.full_name.split(" ")[0]}</span>
              </Link>
              {/* Mobile view profile picture next to hamburger menu */}
              <Link
                href="/dashboard/student"
                className="inline-flex items-center justify-center rounded-full md:hidden"
              >
                {studentData.avatar_url ? (
                  <img
                    src={studentData.avatar_url}
                    alt={studentData.full_name}
                    className="w-8 h-8 rounded-full object-cover border border-gold"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-xs font-bold text-gold border border-gold/25">
                    {getInitials(studentData.full_name)}
                  </div>
                )}
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/auth?mode=login"                  
                className="hidden rounded-full  border border-black/10 bg-white px-4 py-2.5 text-sm font-medium text-black shadow-sm transition hover:-translate-y-0.5 hover:shadow-md md:inline-flex"
              >
                Login
              </Link>
              <Link
                href="/auth?mode=signup"
                className="hidden rounded-full bg-[#e0b445] px-4 py-2.5 text-sm font-semibold text-black shadow-[0_12px_30px_rgba(224,180,69,0.35)] transition hover:-translate-y-0.5 hover:bg-[#d7a93a] md:inline-flex"
              >
                Sign up
              </Link>
            </>
          )}
          {userRole === "student" && studentData ? (
            <button
              type="button"
              aria-label="Toggle navigation menu"
              aria-expanded={openMobile}
              onClick={toggleSidebar}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white text-black shadow-sm transition hover:-translate-y-0.5 md:hidden"
            >
              {openMobile ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          ) : (
            <button
              type="button"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white text-black shadow-sm transition hover:-translate-y-0.5 md:hidden"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          )}
        </div>
      </div>

      <div className={`md:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="mx-6 mb-4 rounded-3xl border border-black/10 bg-white p-4 shadow-lg overflow-y-auto max-h-[80vh]">
          <nav className="flex flex-col gap-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-2xl px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-black"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {userRole === "agent" && agentData ? (
            <div className="mt-3">
              <Link
                href="/dashboard/agent"
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#e0b445] px-4 py-3 text-sm font-semibold text-black shadow-[0_10px_24px_rgba(224,180,69,0.28)] transition hover:bg-[#d7a93a]"
              >
                Go to Agent Dashboard
              </Link>
            </div>
          ) : (
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Link
                href="/auth?mode=login"
                className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-black"
              >
                Login
              </Link>
              <Link
                href="/auth?mode=signup"
                className="inline-flex items-center justify-center rounded-full bg-[#e0b445] px-4 py-3 text-sm font-semibold text-black shadow-[0_10px_24px_rgba(224,180,69,0.28)] transition hover:bg-[#d7a93a]"
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

      {userRole === "student" && studentData && (
        <StudentSidebar
          studentName={studentData.full_name}
          studentAvatar={studentData.avatar_url}
          notificationsCount={notificationsCount}
        />
      )}
    </>
  )
}
