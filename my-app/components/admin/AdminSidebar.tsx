"use client";

import * as React from "react";
import Image from "next/image";
import {
  LayoutDashboard,
  UserCheck,
  Users,
  Building2,
  Flag,
  ShieldCheck,
  Settings,
  LogOut,
  ShoppingBag,
  Wrench,
  ClipboardCheck,
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
  SidebarMenuBadge,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { getServiceApplications } from "@/lib/marketplace-services-data";

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingApplicationsCount: number;
}

export function AdminSidebar({
  activeTab,
  setActiveTab,
  pendingApplicationsCount,
}: AdminSidebarProps) {
  const { state, isMobile, setOpenMobile } = useSidebar();
  const [pendingServicesCount, setPendingServicesCount] = React.useState(0);

  React.useEffect(() => {
    setPendingServicesCount(getServiceApplications().filter(a => a.status === 'pending').length);
    const handleSync = () => {
      setPendingServicesCount(getServiceApplications().filter(a => a.status === 'pending').length);
    };
    window.addEventListener("service-applications-updated", handleSync);
    return () => {
      window.removeEventListener("service-applications-updated", handleSync);
    };
  }, []);

  const navItems = [
    { id: "overview", label: "Dashboard", icon: LayoutDashboard },
    {
      id: "applications",
      label: "Agent Applications",
      icon: UserCheck,
      count: pendingApplicationsCount,
    },
    { id: "agents", label: "Agents Management", icon: Users },
    { id: "lodges", label: "Listings Management", icon: Building2 },
    { id: "reports", label: "Reports", icon: Flag },
    { id: "official", label: "CampusHub Official", icon: ShieldCheck },
    { id: "marketplace", label: "Marketplace", icon: ShoppingBag },
    { id: "services", label: "Service Providers", icon: Wrench },
    {
      id: "service-applications",
      label: "Service Applications",
      icon: ClipboardCheck,
      count: pendingServicesCount,
    },
    { id: "analytics", label: "Analytics", icon: LayoutDashboard }, // Analytics icon
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <Sidebar className="border-r-0">
      <SidebarHeader className="h-[72px] flex justify-center flex-col px-5 border-b border-sidebar-border shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
            <Image
              src="/image/Campus-Hub2.png"
              alt="CampusHub Logo"
              width={40}
              height={40}
              className="w-full h-full object-contain"
            />
          </div>
          {state === "expanded" && (
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-sm leading-tight text-sidebar-foreground tracking-tight truncate">
                Campus<span className="text-gold">Hub</span>
              </span>
              <span className="text-[10px] text-sidebar-foreground/50 mt-1 font-medium flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-gold" /> Admin Panel
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-6">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton
                isActive={activeTab === item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (isMobile) {
                    setOpenMobile(false);
                  }
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-6 rounded-lg transition-all duration-200 group",
                  activeTab === item.id
                    ? "bg-gold/10 text-gold border-l-4 border-gold rounded-l-none"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                )}
              >
                <item.icon
                  className={cn(
                    "w-5 h-5",
                    activeTab === item.id
                      ? "text-gold"
                      : "text-sidebar-foreground/70 group-hover:text-sidebar-foreground",
                  )}
                />
                {state === "expanded" && (
                  <span className="font-medium">{item.label}</span>
                )}
                {item.count && item.count > 0 && state === "expanded" && (
                  <SidebarMenuBadge className="bg-gold text-navy font-bold">
                    {item.count}
                  </SidebarMenuBadge>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground px-3 py-6 gap-3">
              <LogOut className="w-5 h-5" />
              {state === "expanded" && (
                <span className="font-medium">Logout</span>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
