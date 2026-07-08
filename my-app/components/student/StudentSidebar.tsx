"use client";

import * as React from "react";
import {
  User,
  Heart,
  Clock,
  Bell,
  LogOut,
  GraduationCap,
  Home,
  Search,
  Users,
  Info,
  Phone,
  Settings,
  ShoppingBag,
  Wrench,
} from "lucide-react";
import {
  useSidebar,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface StudentSidebarProps {
  activeTab?: "profile" | "saved" | "recent" | "notifications" | "roommates" | "settings" | "marketplace" | "services";
  setActiveTab?: (tab: "profile" | "saved" | "recent" | "notifications" | "roommates" | "settings" | "marketplace" | "services") => void;
  studentName: string;
  studentAvatar?: string;
  notificationsCount?: number;
}

export function StudentSidebar({
  activeTab,
  setActiveTab,
  studentName,
  studentAvatar,
  notificationsCount = 0,
}: StudentSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { state, isMobile, setOpenMobile } = useSidebar();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDashboard = pathname.startsWith("/dashboard/student");

  // Hydration safety: do not render anything on server for non-dashboard pages
  if (!mounted && !isDashboard) {
    return null;
  }

  // On desktop view, hide sidebar completely if we are not on the dashboard page
  if (!isDashboard && !isMobile) {
    return null;
  }

  const getInitials = (name?: string) => {
    if (!name) return "ST";
    return name.trim().split(/\s+/).map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  interface NavItem {
    id: "profile" | "saved" | "recent" | "notifications" | "roommates" | "settings" | "marketplace" | "services";
    label: string;
    icon: React.ComponentType<any>;
    badge?: number;
  }

  const navItems: NavItem[] = [
    { id: "profile", label: "My Profile", icon: User },
    { id: "saved", label: "Saved Rooms", icon: Heart },
    { id: "recent", label: "Recently Viewed", icon: Clock },
    { id: "roommates", label: "Roommate Board", icon: Users },
    { id: "marketplace", label: "Marketplace", icon: ShoppingBag },
    { id: "services", label: "Services", icon: Wrench },
    { id: "notifications", label: "Notifications", icon: Bell, badge: notificationsCount },
  ];

  const quickLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/lodges", label: "Browse Lodges", icon: Search },
    { href: "/about", label: "About Us", icon: Info },
    { href: "/contact", label: "Contact Us", icon: Phone },
  ] as const;

  const handleItemClick = (itemId: "profile" | "saved" | "recent" | "notifications" | "roommates" | "settings" | "marketplace" | "services") => {
    setOpenMobile(false);
    if (setActiveTab) {
      setActiveTab(itemId);
    } else {
      localStorage.setItem("student_dashboard_tab", itemId);
      router.push("/dashboard/student");
    }
  };

  return (
    <Sidebar className="border-r border-black/5 dark:border-white/5 bg-white dark:bg-[#0f1d2e] text-navy dark:text-white">
      {/* Mini Profile Header */}
      <SidebarHeader className="h-[80px] flex justify-center flex-col px-6 border-b border-black/5 dark:border-white/10 bg-white dark:bg-[#0f1d2e]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl border border-gold/40 bg-navy overflow-hidden flex items-center justify-center font-bold text-xs text-gold flex-shrink-0">
            {studentAvatar ? (
              <img
                src={studentAvatar}
                alt={studentName}
                className="h-full w-full object-cover"
              />
            ) : (
              getInitials(studentName)
            )}
          </div>
          {state === "expanded" && (
            <div className="flex flex-col max-w-[130px]">
              <span className="font-bold text-sm leading-tight text-navy dark:text-white tracking-tight truncate">
                {studentName}
              </span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 font-medium flex items-center gap-1">
                <GraduationCap className="h-3 w-3 text-gold" /> Verified Student
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-6 bg-white dark:bg-[#0f1d2e] text-navy/80 dark:text-white/80 space-y-6">
        <div>
          {state === "expanded" && (
            <p className="px-3 mb-2 text-[10px] font-bold tracking-wider text-navy/40 dark:text-white/40 uppercase">
              Dashboard
            </p>
          )}
          <SidebarMenu className="space-y-1">
            {navItems.map((item) => {
              const isActive = isDashboard && activeTab === item.id;
              return (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={isActive}
                    onClick={() => handleItemClick(item.id)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-6 rounded-lg transition-all duration-200 group hover:bg-navy/5 hover:text-navy dark:hover:bg-white/5 dark:hover:text-white",
                      isActive
                        ? "bg-gold/10 text-gold border-l-4 border-gold rounded-l-none"
                        : "text-navy/70 dark:text-white/70",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon
                        className={cn(
                          "w-5 h-5 transition-colors duration-200",
                          isActive
                            ? "text-gold"
                            : "text-navy/60 group-hover:text-navy dark:text-white/60 dark:group-hover:text-white",
                        )}
                      />
                      {state === "expanded" && (
                        <span className="font-semibold text-sm">{item.label}</span>
                      )}
                    </div>
                    {state === "expanded" && item.badge ? (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-navy">
                        {item.badge}
                      </span>
                    ) : null}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </div>

        {/* Quick Links Section */}
        <div>
          {state === "expanded" && (
            <p className="px-3 mb-2 text-[10px] font-bold tracking-wider text-navy/40 dark:text-white/40 uppercase">
              Navigation
            </p>
          )}
          <SidebarMenu className="space-y-1">
            {quickLinks.map((item) => {
              const isActive = pathname === item.href;
              return (
                <SidebarMenuItem key={item.href}>
                  <Link
                    href={item.href}
                    className="w-full block"
                    onClick={() => setOpenMobile(false)}
                  >
                    <SidebarMenuButton
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-6 rounded-lg transition-all duration-200 group hover:bg-navy/5 hover:text-navy dark:hover:bg-white/5 dark:hover:text-white",
                        isActive
                          ? "bg-gold/10 text-gold border-l-4 border-gold rounded-l-none"
                          : "text-navy/70 dark:text-white/70",
                      )}
                    >
                      <item.icon
                        className={cn(
                          "w-5 h-5 transition-colors duration-200",
                          isActive
                            ? "text-gold"
                            : "text-navy/60 group-hover:text-navy dark:text-white/60 dark:group-hover:text-white",
                        )}
                      />
                      {state === "expanded" && (
                        <span className="font-semibold text-sm">{item.label}</span>
                      )}
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              );
            })}
            {/* Settings Tab below Contact Us */}
            <SidebarMenuItem>
              <button
                onClick={() => handleItemClick("settings")}
                className="w-full text-left bg-transparent border-0 p-0 cursor-pointer"
              >
                <SidebarMenuButton
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-6 rounded-lg transition-all duration-200 group hover:bg-navy/5 hover:text-navy dark:hover:bg-white/5 dark:hover:text-white",
                    isDashboard && activeTab === "settings"
                      ? "bg-gold/10 text-gold border-l-4 border-gold rounded-l-none"
                      : "text-navy/70 dark:text-white/70",
                  )}
                >
                  <Settings className={cn(
                    "w-5 h-5 transition-colors duration-200",
                    isDashboard && activeTab === "settings"
                      ? "text-gold"
                      : "text-navy/60 group-hover:text-navy dark:text-white/60 dark:group-hover:text-white"
                  )} />
                  {state === "expanded" && (
                    <span className="font-semibold text-sm">Settings</span>
                  )}
                </SidebarMenuButton>
              </button>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-black/5 dark:border-white/10 bg-white dark:bg-[#0f1d2e] text-navy/80 dark:text-white/80">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={() => {
                setOpenMobile(false);
                localStorage.removeItem("student_logged_in");
                localStorage.removeItem("user_role");
                window.dispatchEvent(new Event("student-data-updated"));
                window.location.href = "/";
              }}
              className="text-navy/70 dark:text-white/70 hover:text-navy hover:dark:text-white hover:bg-navy/5 hover:dark:bg-white/5 px-3 py-6 gap-3 rounded-lg"
            >
              <LogOut className="w-5 h-5" />
              {state === "expanded" && (
                <span className="font-semibold text-sm">Logout</span>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
