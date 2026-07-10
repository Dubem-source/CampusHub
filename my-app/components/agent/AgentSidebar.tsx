"use client";

import {
  User,
  LayoutDashboard,
  List,
  Bell,
  LogOut,
  Plus,
  ShieldCheck,
  Settings,
  Clock,
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

interface AgentSidebarProps {
  activeTab: "profile" | "overview" | "listings" | "notifications" | "settings" | "edit-listing" | "add-listing" | "view-listing";
  setActiveTab: (tab: "profile" | "overview" | "listings" | "notifications" | "settings" | "edit-listing" | "add-listing" | "view-listing") => void;
  agentName: string;
  agentPhoto: string;
  isApproved: boolean;
  onLogout?: () => void;
}

export function AgentSidebar({
  activeTab,
  setActiveTab,
  agentName,
  agentPhoto,
  isApproved,
  onLogout,
}: AgentSidebarProps) {
  const { state } = useSidebar();

  const navItems = [
    { id: "profile", label: "My Profile", icon: User },
    { id: "overview", label: "Dashboard", icon: LayoutDashboard },
    { id: "listings", label: "My Listings", icon: List },
    { id: "notifications", label: "Notifications", icon: Bell },
  ] as const;

  return (
    <Sidebar className="border-r border-black/5 dark:border-white/5 bg-white dark:bg-[#0f1d2e] text-navy dark:text-white">
      <SidebarHeader className="h-[80px] flex justify-center flex-col px-6 border-b border-black/5 dark:border-white/10 bg-white dark:bg-[#0f1d2e]">
        <div className="flex items-center gap-3">
          <img 
            src={agentPhoto || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"} 
            alt={agentName}
            className="w-9 h-9 rounded-xl border border-gold object-cover bg-white/10" 
          />
          {state === "expanded" && (
            <div className="flex flex-col max-w-[130px]">
              <span className="font-bold text-sm leading-tight text-navy dark:text-white tracking-tight truncate">
                {agentName}
              </span>
              {isApproved ? (
                <span className="text-[10px] text-gray-550 dark:text-gray-400 mt-1 font-medium flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3 text-gold fill-current" /> Verified Agent
                </span>
              ) : (
                <span className="text-[10px] text-amber-500 mt-1 font-medium flex items-center gap-1">
                  <Clock className="h-3 w-3 text-amber-500 fill-current" /> Pending Approval
                </span>
              )}
            </div>
          )}
        </div>
      </SidebarHeader>
 
      <SidebarContent className="px-3 py-6 bg-white dark:bg-[#0f1d2e] text-navy/80 dark:text-white/80">
        <SidebarMenu className="space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id || 
              (item.id === "listings" && (activeTab === "edit-listing" || activeTab === "add-listing")) ||
              (item.id === "profile" && activeTab === "view-listing");
            return (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  isActive={isActive}
                  onClick={() => setActiveTab(item.id)}
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
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
 
        {state === "expanded" && isApproved && (
          <div className="px-3 mt-8">
            <button 
              onClick={() => setActiveTab("add-listing")}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gold px-4 py-3.5 text-sm font-bold text-navy shadow-lg shadow-gold/15 hover:scale-[1.02] transition active:scale-95 duration-200 cursor-pointer border-0"
            >
              <Plus className="h-4 w-4" />
              Add Listing
            </button>
          </div>
        )}
      </SidebarContent>
 
      <SidebarFooter className="p-4 border-t border-black/5 dark:border-white/10 bg-white dark:bg-[#0f1d2e] text-navy/80 dark:text-white/80">
        <SidebarMenu className="space-y-1">
          {/* Settings tab inside footer */}
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={activeTab === "settings"}
              onClick={() => setActiveTab("settings")}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-6 rounded-lg transition-all duration-200 group hover:bg-navy/5 hover:text-navy dark:hover:bg-white/5 dark:hover:text-white",
                activeTab === "settings"
                  ? "bg-gold/10 text-gold border-l-4 border-gold rounded-l-none"
                  : "text-navy/70 dark:text-white/70",
              )}
            >
              <Settings
                className={cn(
                  "w-5 h-5 transition-colors duration-200",
                  activeTab === "settings"
                    ? "text-gold"
                    : "text-navy/60 group-hover:text-navy dark:text-white/60 dark:group-hover:text-white",
                )}
              />
              {state === "expanded" && (
                <span className="font-semibold text-sm">Settings</span>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Logout tab */}
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={onLogout || (() => {
                localStorage.removeItem("agent_logged_in");
                window.location.href = "/";
              })}
              className="text-rose-600 dark:text-rose-400 hover:text-rose-700 hover:dark:text-rose-300 hover:bg-rose-500/10 hover:dark:bg-rose-500/10 px-3 py-6 gap-3 rounded-lg"
            >
              <LogOut className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              {state === "expanded" && (
                <span className="font-semibold text-sm text-rose-600 dark:text-rose-400">Logout</span>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
