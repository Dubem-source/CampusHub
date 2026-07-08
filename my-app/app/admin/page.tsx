"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Users,
  GraduationCap,
  AlertTriangle,
  Eye,
  Check,
  X,
  Plus,
  Search,
  Filter,
  TrendingUp,
  ShieldCheck,
  Moon,
  Sun,
  Menu,
  Bell,
  Mail,
  Edit,
  ArrowLeft,
  Trash2,
  Info,
  MapPin,
  Monitor,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  AlertCircle,
  ClipboardCheck,
  Home,
  UserPlus,
  BellOff,
  ShoppingBag,
  Wrench,
  CheckCircle,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";

import {
  MOCK_AGENT_APPLICATIONS,
  MOCK_AGENTS,
  MOCK_LODGES,
  MOCK_REPORTS,
  AgentApplication,
  Agent,
  Lodge,
  Report,
} from "@/lib/admin-mock-data";

import {
  getMarketplaceItems,
  saveMarketplaceItems,
  getServiceProviders,
  saveServiceProviders,
  getServiceApplications,
  saveServiceApplications,
  MarketplaceItem,
  ServiceProvider,
  ServiceApplication,
} from "@/lib/marketplace-services-data";

// --- Sub-components (declared outside to avoid re-creation on render) ---

const OverviewTab = ({
  lodges,
  pendingAppsCount,
  reports,
  setActiveTab
}: {
  lodges: Lodge[],
  pendingAppsCount: number,
  reports: Report[],
  setActiveTab: (t: string) => void
}) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[
        { label: "Total Listings", value: lodges.length, icon: Building2, trend: "+12% this month", trendColor: "text-emerald-500" },
        { label: "Pending Agents", value: pendingAppsCount, icon: Users, trend: "Needs review", trendColor: "text-amber-500" },
        { label: "Total Students", value: "1,420", icon: GraduationCap, trend: "+5% increase", trendColor: "text-emerald-500" },
        { label: "Open Reports", value: reports.filter(r => r.status === 'Pending').length, icon: AlertTriangle, trend: "Requires action", trendColor: "text-rose-500" },
      ].map((stat, i) => (
        <Card key={i} className="border-none shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <h3 className="text-3xl font-bold mt-2">{stat.value}</h3>
                <p className={`text-xs mt-2 font-medium ${stat.trendColor}`}>{stat.trend}</p>
              </div>
              <div className="p-3 bg-navy/5 dark:bg-white/5 rounded-xl text-navy dark:text-gold">
                <stat.icon size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 border-none shadow-sm">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest events happening across the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { event: "New agent application", user: "Kelechi Uche", time: "2 hours ago", status: "Pending" },
              { event: "Lodge reported", user: "Chiamaka Okafor", time: "5 hours ago", status: "Flagged" },
              { event: "Listing approved", user: "Official CampusHub", time: "Yesterday", status: "Success" },
              { event: "Agent suspended", user: "Blessing Udoh", time: "2 days ago", status: "Action Taken" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-navy dark:bg-gold rounded-full flex items-center justify-center text-white dark:text-navy font-bold">
                    {item.user[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{item.event}</p>
                    <p className="text-xs text-muted-foreground">by {item.user} • {item.time}</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-white dark:bg-navy/20">{item.status}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button className="w-full justify-start gap-3 bg-navy hover:bg-navy/90 text-white" onClick={() => setActiveTab('official')}>
            <Plus size={18} /> Add Official Listing
          </Button>
          <Button variant="outline" className="w-full justify-start gap-3 border-navy/10 text-navy dark:text-white" onClick={() => setActiveTab('applications')}>
            <UserCheck size={18} /> Review Applications
          </Button>
          <Button variant="outline" className="w-full justify-start gap-3 border-navy/10 text-navy dark:text-white" onClick={() => setActiveTab('reports')}>
            <Flag size={18} /> Audit Reports
          </Button>
          <Button variant="outline" className="w-full justify-start gap-3 border-navy/10 text-navy dark:text-white" onClick={() => setActiveTab('analytics')}>
            <TrendingUp size={18} /> View Analytics
          </Button>
        </CardContent>
      </Card>
    </div>
  </div>
);

const UserCheck = ({ size }: { size: number }) => <ShieldCheck size={size} />;
const Flag = ({ size }: { size: number }) => <AlertTriangle size={size} />;

const AgentApplicationsTab = ({
  applications,
  handleApproveApp,
  handleRejectApp
}: {
  applications: AgentApplication[],
  handleApproveApp: (id: string) => void,
  handleRejectApp: (id: string) => void
}) => {
  const [searchText, setSearchText] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = React.useState(false);

  const filteredApplications = React.useMemo(() => {
    return applications.filter((app) => {
      const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
      const matchesSearch = app.name.toLowerCase().includes(searchText.toLowerCase()) ||
        app.email.toLowerCase().includes(searchText.toLowerCase()) ||
        (app.phone && app.phone.includes(searchText));
      return matchesStatus && matchesSearch;
    });
  }, [applications, statusFilter, searchText]);

  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6">
        <div>
          <CardTitle>Agent Applications</CardTitle>
          <CardDescription>Manage and verify new agent signups.</CardDescription>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              className="pl-9 w-full sm:w-64 bg-gray-50 dark:bg-white/5 border-none text-xs h-9 rounded-lg"
              placeholder="Search applications..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
          <div className="relative">
            <Button
              variant="outline"
              onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
              className="gap-2 border-navy/10 hover:bg-navy/5 dark:hover:bg-white/5 cursor-pointer font-bold text-xs h-9 rounded-lg px-4"
            >
              <Filter size={14} /> Filter
              {statusFilter !== 'All' && (
                <span className="ml-1 bg-gold text-navy text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                  {statusFilter}
                </span>
              )}
            </Button>
            {isFilterDropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-[#0f1d2e] rounded-xl shadow-xl border border-navy/10 dark:border-white/5 z-50 p-1.5 space-y-0.5">
                {(['All', 'Pending', 'Approved', 'Rejected'] as const).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setStatusFilter(opt);
                      setIsFilterDropdownOpen(false);
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer",
                      statusFilter === opt
                        ? "bg-gold/10 text-gold dark:bg-gold/25"
                        : "text-navy/70 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                    )}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto w-full rounded-2xl">
          <Table className="min-w-[900px]">
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApplications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell>
                    <div>
                      <p className="font-semibold">{app.name}</p>
                      <p className="text-xs text-muted-foreground">{app.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>{app.appliedDate}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn(
                      app.status === 'Approved' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                        app.status === 'Rejected' ? "bg-rose-500/10 text-rose-500 border-rose-500/20" :
                          "bg-amber-500/10 text-amber-500 border-amber-500/20"
                    )}>
                      {app.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2 items-center">
                      <Dialog>
                        <DialogTrigger render={<Button variant="ghost" size="sm" className="font-semibold text-navy dark:text-gold" />}>
                          View App
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Application Details: {app.name}</DialogTitle>
                          </DialogHeader>
                          <div className="grid grid-cols-2 gap-6 py-4 text-left">
                            <div className="space-y-4">
                              <div>
                                <Label className="text-xs text-muted-foreground">Full Name</Label>
                                <p className="font-semibold text-sm text-navy dark:text-white">{app.name}</p>
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground">Contact Info</Label>
                                <p className="font-semibold text-sm text-navy dark:text-white">{app.email}</p>
                                <p className="font-semibold text-sm text-navy dark:text-white">{app.phone}</p>
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground">Lodges Managed</Label>
                                <p className="font-semibold text-sm text-navy dark:text-white">{app.lodgesManaged}</p>
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground">Operating Area</Label>
                                <p className="font-semibold text-sm text-navy dark:text-white">{app.area}</p>
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground block mb-1">Verification Status</Label>
                                <div className="flex gap-2">
                                  <Badge className="bg-emerald-500 text-white border-0 text-[10px] font-bold uppercase tracking-wider">Email Verified</Badge>
                                  {app.phoneVerified ? (
                                    <Badge className="bg-emerald-500 text-white border-0 text-[10px] font-bold uppercase tracking-wider">Phone Verified</Badge>
                                  ) : (
                                    <Badge className="bg-rose-500 text-white border-0 text-[10px] font-bold uppercase tracking-wider">Phone Unverified</Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="space-y-4">
                              <div>
                                <Label className="text-xs text-muted-foreground">Verification Document</Label>
                                {app.ninImage ? (
                                  <div className="mt-2 border border-navy/10 dark:border-white/10 rounded-xl overflow-hidden bg-gray-50 dark:bg-white/5 flex flex-col items-center justify-center p-2">
                                    <img src={app.ninImage} alt="NIN ID Card" className="max-h-48 object-contain rounded-lg shadow-sm" />
                                    <p className="text-[10px] text-muted-foreground mt-2">{app.documentPlaceholder}</p>
                                  </div>
                                ) : (
                                  <div className="mt-2 p-4 border-2 border-dashed border-navy/10 dark:border-white/10 rounded-xl flex flex-col items-center justify-center bg-gray-50 dark:bg-white/5">
                                    <p className="text-xs font-semibold text-navy/60 dark:text-gold/60">{app.documentPlaceholder}</p>
                                    <Button variant="link" className="text-xs text-navy dark:text-gold mt-1">Download Document</Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" className="text-rose-500 hover:text-rose-600 hover:bg-rose-50" onClick={() => handleRejectApp(app.id)}>Reject</Button>
                            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white" onClick={() => handleApproveApp(app.id)}>Approve Agent</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      {app.status === 'Pending' && (
                        <>
                          <Button variant="ghost" size="icon" className="text-emerald-500 hover:bg-emerald-50" onClick={() => handleApproveApp(app.id)}><Check size={18} /></Button>
                          <Button variant="ghost" size="icon" className="text-rose-500 hover:bg-rose-50" onClick={() => handleRejectApp(app.id)}><X size={18} /></Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Stacked Card View */}
        <div className="block md:hidden space-y-4">
          {filteredApplications.map((app) => (
            <div key={app.id} className="bg-white dark:bg-[#0f1e2d] rounded-2xl p-4 border border-black/5 dark:border-white/5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-bold text-navy dark:text-white text-sm">{app.name}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{app.email}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{app.phone}</p>
                </div>
                <Badge variant="outline" className={cn(
                  app.status === 'Approved' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                    app.status === 'Rejected' ? "bg-rose-500/10 text-rose-500 border-rose-500/20" :
                      "bg-amber-500/10 text-amber-500 border-amber-500/20"
                )}>
                  {app.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between border-t border-black/5 dark:border-white/5 pt-3">
                <span className="text-[10px] text-navy/40 dark:text-white/40 font-semibold">{app.appliedDate}</span>
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger render={<Button variant="outline" size="sm" className="h-8 text-xs font-semibold px-3 rounded-lg text-navy dark:text-gold border-navy/10" />}>
                      View App
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Application Details: {app.name}</DialogTitle>
                      </DialogHeader>
                      <div className="grid grid-cols-1 gap-4 py-4 text-left">
                        <div className="space-y-4">
                          <div>
                            <Label className="text-xs text-muted-foreground">Full Name</Label>
                            <p className="font-semibold text-sm text-navy dark:text-white">{app.name}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Contact Info</Label>
                            <p className="font-semibold text-sm text-navy dark:text-white">{app.email}</p>
                            <p className="font-semibold text-sm text-navy dark:text-white">{app.phone}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Lodges Managed</Label>
                            <p className="font-semibold text-sm text-navy dark:text-white">{app.lodgesManaged}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Operating Area</Label>
                            <p className="font-semibold text-sm text-navy dark:text-white">{app.area}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground block mb-1">Verification Status</Label>
                            <div className="flex gap-2">
                              <Badge className="bg-emerald-500 text-white border-0 text-[10px] font-bold uppercase tracking-wider">Email Verified</Badge>
                              {app.phoneVerified ? (
                                <Badge className="bg-emerald-500 text-white border-0 text-[10px] font-bold uppercase tracking-wider">Phone Verified</Badge>
                              ) : (
                                <Badge className="bg-rose-500 text-white border-0 text-[10px] font-bold uppercase tracking-wider">Phone Unverified</Badge>
                              )}
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground block mb-1">Verification Document</Label>
                            {app.ninImage ? (
                              <div className="mt-2 border border-navy/10 dark:border-white/10 rounded-xl overflow-hidden bg-gray-50 dark:bg-white/5 flex flex-col items-center justify-center p-2">
                                <img src={app.ninImage} alt="NIN ID Card" className="max-h-40 object-contain rounded-lg shadow-sm" />
                                <p className="text-[9px] text-muted-foreground mt-2">{app.documentPlaceholder}</p>
                              </div>
                            ) : (
                              <div className="mt-2 p-4 border-2 border-dashed border-navy/10 dark:border-white/10 rounded-xl flex flex-col items-center justify-center bg-gray-50 dark:bg-white/5">
                                <p className="text-xs font-semibold text-navy/60 dark:text-gold/60">{app.documentPlaceholder}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" className="text-rose-500 hover:text-rose-600 hover:bg-rose-50" onClick={() => handleRejectApp(app.id)}>Reject</Button>
                        <Button className="bg-emerald-500 hover:bg-emerald-600 text-white" onClick={() => handleApproveApp(app.id)}>Approve Agent</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  {app.status === 'Pending' && (
                    <>
                      <Button variant="outline" size="icon" className="h-8 w-8 text-emerald-500 hover:bg-emerald-50 border-emerald-500/10" onClick={() => handleApproveApp(app.id)}><Check size={14} /></Button>
                      <Button variant="outline" size="icon" className="h-8 w-8 text-rose-500 hover:bg-rose-50 border-rose-500/10" onClick={() => handleRejectApp(app.id)}><X size={14} /></Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const AgentsManagementTab = ({ agents, setAgents }: { agents: Agent[], setAgents: React.Dispatch<React.SetStateAction<Agent[]>> }) => (
  <Card className="border-none shadow-sm">
    <CardHeader className="flex flex-row items-center justify-between">
      <div>
        <CardTitle>Agents Management</CardTitle>
        <CardDescription>Directory of all registered agents on the platform.</CardDescription>
      </div>
    </CardHeader>
    <CardContent>
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto w-full rounded-2xl">
        <Table className="min-w-[800px]">
          <TableHeader>
            <TableRow>
              <TableHead>Agent</TableHead>
              <TableHead>Verification</TableHead>
              <TableHead>Listings</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Joined Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {agents
              .filter((agent) => agent.verificationStatus === "Verified" || agent.verificationStatus === "Suspended")
              .map((agent) => {
                const digits = agent.phone.replace(/\D/g, "");
                const cleanPhone = digits.startsWith("234")
                  ? digits
                  : digits.startsWith("0")
                    ? "234" + digits.slice(1)
                    : "234" + digits;
                const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hello ${agent.name}, this is CampusHub Admin.`)}`;
                return (
                  <TableRow key={agent.id}>
                    <TableCell>
                      <div>
                        <p className="font-semibold">{agent.name}</p>
                        <p className="text-xs text-muted-foreground">
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-[#C9952A] hover:underline"
                          >
                            {agent.phone}
                          </a>
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn(
                        agent.verificationStatus === 'Verified' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                          agent.verificationStatus === 'Suspended' ? "bg-rose-500/10 text-rose-500 border-rose-500/20" :
                            "bg-amber-500/10 text-amber-500 border-amber-500/20"
                      )}>
                        {agent.verificationStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>{agent.listingsCount}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className="text-gold font-bold">{agent.avgRating}</span>
                        <span className="text-xs text-muted-foreground">/5</span>
                      </div>
                    </TableCell>
                    <TableCell>{agent.joinedDate}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" className="text-navy dark:text-gold font-semibold">View Profile</Button>
                        <Button variant="ghost" size="sm" className="text-rose-500 font-semibold" onClick={() => {
                          const nextStatus = agent.verificationStatus === 'Suspended' ? 'Verified' : 'Suspended';
                          setAgents(prev => prev.map(a => a.id === agent.id ? { ...a, verificationStatus: nextStatus } : a));

                          // If onboarding agent is suspended/restored, sync to localStorage
                          if (agent.id === 'agent1' || agent.id === 'agent-app-agent1') {
                            const saved = localStorage.getItem("agent_data");
                            if (saved) {
                              try {
                                const parsed = JSON.parse(saved);
                                const updated = {
                                  ...parsed,
                                  suspended: nextStatus === 'Suspended',
                                };
                                localStorage.setItem("agent_data", JSON.stringify(updated));
                                window.dispatchEvent(new Event("storage"));
                                window.dispatchEvent(new Event("agent-data-updated"));
                              } catch (e) {
                                console.error(e);
                              }
                            }
                          }

                          toast.success(`Agent ${nextStatus === 'Verified' ? 'Restored' : 'Suspended'}`);
                        }}>
                          {agent.verificationStatus === 'Suspended' ? "Restore" : "Suspend"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Stacked Card View */}
      <div className="block md:hidden space-y-4">
        {agents
          .filter((agent) => agent.verificationStatus === "Verified" || agent.verificationStatus === "Suspended")
          .map((agent) => {
            const digits = agent.phone.replace(/\D/g, "");
            const cleanPhone = digits.startsWith("234")
              ? digits
              : digits.startsWith("0")
                ? "234" + digits.slice(1)
                : "234" + digits;
            const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hello ${agent.name}, this is CampusHub Admin.`)}`;
            return (
              <div key={agent.id} className="bg-white dark:bg-[#0f1e2d] rounded-2xl p-4 border border-black/5 dark:border-white/5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-navy dark:text-white text-sm">{agent.name}</h4>
                    <a href={waLink} target="_blank" rel="noopener noreferrer" className="text-xs text-[#C9952A] hover:underline mt-0.5 block">{agent.phone}</a>
                  </div>
                  <Badge variant="outline" className={cn(
                    agent.verificationStatus === 'Verified' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                      "bg-rose-500/10 text-rose-500 border-rose-500/20"
                  )}>
                    {agent.verificationStatus}
                  </Badge>
                </div>
                <div className="flex items-center justify-between border-t border-black/5 dark:border-white/5 pt-3">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-[10px] text-muted-foreground">Listings</p>
                      <p className="text-xs font-bold text-navy dark:text-white mt-0.5">{agent.listingsCount}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">Rating</p>
                      <p className="text-xs font-bold text-gold mt-0.5">{agent.avgRating} / 5</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="h-8 text-xs font-semibold px-3 rounded-lg text-navy dark:text-gold border-navy/10">View Profile</Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs font-semibold px-3 rounded-lg text-rose-500 border-rose-500/10"
                      onClick={() => {
                        const nextStatus = agent.verificationStatus === 'Suspended' ? 'Verified' : 'Suspended';
                        setAgents(prev => prev.map(a => a.id === agent.id ? { ...a, verificationStatus: nextStatus } : a));
                        toast.success(`Agent ${nextStatus === 'Verified' ? 'Restored' : 'Suspended'}`);
                      }}
                    >
                      {agent.verificationStatus === 'Suspended' ? "Restore" : "Suspend"}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </CardContent>
  </Card>
);

const LodgesManagementTab = ({
  lodges,
  handleToggleLodgeStatus,
  handleDeleteLodge
}: {
  lodges: Lodge[],
  handleToggleLodgeStatus: (id: string) => void,
  handleDeleteLodge: (id: string) => void
}) => {
  const sortedListings = React.useMemo(() => {
    return [...lodges].sort(
      (a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
    );
  }, [lodges]);

  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Listings Management</CardTitle>
          <CardDescription>Control all room listings submitted by agents.</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto w-full rounded-2xl">
          <Table className="min-w-[900px]">
            <TableHeader>
              <TableRow>
                <TableHead>Listing Name</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead>Area</TableHead>
                <TableHead>Room Type</TableHead>
                <TableHead>Date Listed</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Availability</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedListings.map((lodge) => (
                <TableRow key={lodge.id}>
                  <TableCell className="font-semibold">{lodge.name}</TableCell>
                  <TableCell className="text-sm">{lodge.agentName}</TableCell>
                  <TableCell className="text-sm">{lodge.area}</TableCell>
                  <TableCell>
                    <div className="font-medium text-navy dark:text-gold">{lodge.roomType}</div>
                  </TableCell>
                  <TableCell className="text-sm">{lodge.createdDate}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn(
                      lodge.status === 'Active' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-gray-100 text-gray-500"
                    )}>
                      {lodge.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn(
                      lodge.availability === 'available' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                        lodge.availability === 'pending' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                          "bg-rose-500/10 text-rose-500 border-rose-500/20"
                    )}>
                      {lodge.availability ? (lodge.availability.charAt(0).toUpperCase() + lodge.availability.slice(1)) : 'Available'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" className="text-navy dark:text-gold font-semibold">View</Button>
                      <Button variant="ghost" size="sm" className="text-muted-foreground font-semibold" onClick={() => handleToggleLodgeStatus(lodge.id)}>
                        {lodge.status === 'Active' ? "Hide" : "Unhide"}
                      </Button>
                      <Button variant="ghost" size="sm" className="text-rose-500 font-semibold" onClick={() => handleDeleteLodge(lodge.id)}>Delete</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Stacked Card View */}
        <div className="block md:hidden space-y-4">
          {sortedListings.map((lodge) => (
            <div key={lodge.id} className="bg-white dark:bg-[#0f1e2d] rounded-2xl p-4 border border-black/5 dark:border-white/5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-bold text-navy dark:text-white text-sm">{lodge.name}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Agent: {lodge.agentName}</p>
                  <p className="text-[10px] text-navy/40 dark:text-white/40 font-semibold uppercase tracking-wider mt-1">{lodge.roomType} · {lodge.area}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <Badge variant="outline" className={cn(
                    lodge.status === 'Active' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-gray-100 text-gray-500"
                  )}>
                    {lodge.status}
                  </Badge>
                  <Badge variant="outline" className={cn(
                    lodge.availability === 'available' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                      lodge.availability === 'pending' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                        "bg-rose-500/10 text-rose-500 border-rose-500/20"
                  )}>
                    {lodge.availability ? (lodge.availability.charAt(0).toUpperCase() + lodge.availability.slice(1)) : 'Available'}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-black/5 dark:border-white/5 pt-3">
                <span className="text-[10px] text-navy/40 dark:text-white/40 font-semibold">{lodge.createdDate}</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="h-8 text-xs font-semibold px-3 rounded-lg text-navy dark:text-gold border-navy/10">View</Button>
                  <Button variant="outline" size="sm" className="h-8 text-xs font-semibold px-3 rounded-lg text-muted-foreground border-navy/10" onClick={() => handleToggleLodgeStatus(lodge.id)}>
                    {lodge.status === 'Active' ? "Hide" : "Unhide"}
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 text-xs font-semibold px-3 rounded-lg text-rose-500 border-rose-500/10" onClick={() => handleDeleteLodge(lodge.id)}>Delete</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const ReportsTab = ({ reports, handleUpdateReportStatus }: { reports: Report[], handleUpdateReportStatus: (id: string, s: Report['status']) => void }) => (
  <Card className="border-none shadow-sm">
    <CardHeader>
      <CardTitle>System Reports & Flags</CardTitle>
      <CardDescription>Review and action reports filed by students.</CardDescription>
    </CardHeader>
    <CardContent>
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto w-full rounded-2xl">
        <Table className="min-w-[800px]">
          <TableHeader>
            <TableRow>
              <TableHead>Reporter</TableHead>
              <TableHead>Target</TableHead>
              <TableHead className="max-w-xs">Reason</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.map((report) => (
              <TableRow key={report.id}>
                <TableCell className="font-semibold text-sm">{report.reporter}</TableCell>
                <TableCell>
                  <div className="text-xs">
                    <span className="font-bold uppercase text-navy/40 dark:text-gold/40">{report.entityType}:</span>
                    <p>{report.entityName}</p>
                  </div>
                </TableCell>
                <TableCell className="max-w-xs truncate text-sm" title={report.reason}>{report.reason}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn(
                    report.status === 'Pending' ? "bg-rose-500/10 text-rose-500" :
                      report.status === 'Investigating' ? "bg-amber-500/10 text-amber-500" :
                        report.status === 'Resolved' ? "bg-emerald-500/10 text-emerald-500" :
                          "bg-gray-100 text-gray-500"
                  )}>
                    {report.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs">{report.date}</TableCell>
                <TableCell className="text-right">
                  <Dialog>
                    <DialogTrigger render={<Button variant="ghost" size="sm" className="font-semibold text-navy dark:text-gold" />}>
                      Investigate
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Investigate Report #{report.id}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div>
                          <Label className="text-xs text-muted-foreground">Full Complaint</Label>
                          <p className="text-sm bg-gray-50 dark:bg-white/5 p-4 rounded-xl mt-1">{report.reason}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button className="bg-amber-500 hover:bg-amber-600 text-white" onClick={() => handleUpdateReportStatus(report.id, 'Investigating')}>Mark as Investigating</Button>
                          <Button className="bg-emerald-500 hover:bg-emerald-600 text-white" onClick={() => handleUpdateReportStatus(report.id, 'Resolved')}>Resolve Report</Button>
                          <Button variant="outline" onClick={() => handleUpdateReportStatus(report.id, 'Dismissed')}>Dismiss</Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Stacked Card View */}
      <div className="block md:hidden space-y-4">
        {reports.map((report) => (
          <Dialog key={report.id}>
            <DialogTrigger render={
              <button
                type="button"
                className="w-full text-left bg-white dark:bg-[#0f1e2d] rounded-2xl p-4 border border-black/5 dark:border-white/5 space-y-3 block transition-all hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer outline-none"
              />
            }>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-navy dark:text-white text-sm">Reporter: {report.reporter}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Target: {report.entityName} ({report.entityType})</p>
                  <p className="text-xs text-navy/70 dark:text-gray-300 bg-gray-50 dark:bg-white/5 p-2 rounded-xl mt-2 line-clamp-2">{report.reason}</p>
                </div>
                <Badge className={cn(
                  "shrink-0",
                  report.status === 'Resolved' ? "bg-emerald-500 text-white" :
                    report.status === 'Investigating' ? "bg-amber-500 text-white" :
                      "bg-gray-500 text-white"
                )}>
                  {report.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between border-t border-black/5 dark:border-white/5 pt-3">
                <span className="text-[10px] text-navy/40 dark:text-white/40 font-semibold">{report.date}</span>
                <span className="text-xs font-semibold text-gold hover:underline">View Details & Investigate →</span>
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-md rounded-2xl">
              <DialogHeader>
                <DialogTitle>Investigate Report #{report.id}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4 text-left">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Reporter</Label>
                    <p className="font-semibold text-navy dark:text-white mt-0.5">{report.reporter}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Report Date</Label>
                    <p className="font-semibold text-navy dark:text-white mt-0.5">{report.date}</p>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Target Entity</Label>
                    <p className="font-semibold text-navy dark:text-white mt-0.5">
                      <span className="font-bold uppercase text-navy/40 dark:text-gold/40 mr-1">{report.entityType}:</span>
                      {report.entityName}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Status</Label>
                    <div>
                      <Badge className={cn(
                        "mt-0.5",
                        report.status === 'Resolved' ? "bg-emerald-500 text-white" :
                          report.status === 'Investigating' ? "bg-amber-500 text-white" :
                            "bg-gray-500 text-white"
                      )}>
                        {report.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="border-t border-gray-100 dark:border-white/5 pt-3">
                  <Label className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Full Complaint & Reason</Label>
                  <p className="text-sm bg-gray-50 dark:bg-white/5 p-4 rounded-xl mt-1.5 leading-relaxed whitespace-pre-wrap break-words">{report.reason}</p>
                </div>
                <div className="flex gap-2 flex-wrap pt-2">
                  <Button className="bg-amber-500 hover:bg-amber-600 text-white text-xs h-9 rounded-lg" onClick={() => handleUpdateReportStatus(report.id, 'Investigating')}>Mark as Investigating</Button>
                  <Button className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs h-9 rounded-lg" onClick={() => handleUpdateReportStatus(report.id, 'Resolved')}>Resolve Report</Button>
                  <Button variant="outline" className="text-xs h-9 rounded-lg" onClick={() => handleUpdateReportStatus(report.id, 'Dismissed')}>Dismiss</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </CardContent>
  </Card>
);

const OfficialListingsTab = ({
  lodges,
  onAddClick,
  onEditClick,
  onDeleteClick,
  onViewClick,
  onUpdateAvailability
}: {
  lodges: Lodge[],
  onAddClick: () => void,
  onEditClick: (lodge: Lodge) => void,
  onDeleteClick: (id: string) => void,
  onViewClick: (lodge: Lodge) => void,
  onUpdateAvailability: (id: string, availability: 'available' | 'pending' | 'rented') => void
}) => {
  const [activeDropdownId, setActiveDropdownId] = React.useState<string | null>(null);

  const sortedOfficial = React.useMemo(() => {
    return lodges
      .filter((l) => l.isOfficial)
      .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());
  }, [lodges]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start gap-1">
        <div>
          <h2 className="text-2xl font-bold text-navy dark:text-white">CampusHub Official Listings</h2>
          <p className="text-sm text-muted-foreground">Manage properties listed directly by CampusHub.</p>
        </div>
        <Button onClick={onAddClick} className="mt-3 bg-gold hover:bg-gold/90 text-navy font-bold gap-2 cursor-pointer border-0">
          <Plus size={18} /> Add New Official Listing
        </Button>
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="p-0 sm:p-6">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto w-full rounded-2xl">
            <Table className="min-w-[800px]">
              <TableHeader>
                <TableRow className="border-b border-black/5 dark:border-white/5">
                  <TableHead className="pl-6 uppercase tracking-wider text-xs font-bold text-navy/40 dark:text-white/40">Listing Info</TableHead>
                  <TableHead className="uppercase tracking-wider text-xs font-bold text-navy/40 dark:text-white/40">Area</TableHead>
                  <TableHead className="uppercase tracking-wider text-xs font-bold text-navy/40 dark:text-white/40">First Payment</TableHead>
                  <TableHead className="uppercase tracking-wider text-xs font-bold text-navy/40 dark:text-white/40">To Pay</TableHead>
                  <TableHead className="uppercase tracking-wider text-xs font-bold text-navy/40 dark:text-white/40">Availability</TableHead>
                  <TableHead className="text-right pr-6 uppercase tracking-wider text-xs font-bold text-navy/40 dark:text-white/40">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedOfficial.map((lodge) => {
                  const defaultPhotos: Record<string, string> = {
                    "Self-contain": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80",
                    "Mini-flat": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80",
                    "Single room": "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=600&q=80",
                    "One-bedroom": "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80",
                  };
                  const thumb = (lodge.photos && lodge.photos[0]) || defaultPhotos[lodge.roomType] || defaultPhotos["Self-contain"];

                  return (
                    <TableRow key={lodge.id} className="border-b border-black/5 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                      <TableCell className="pl-6 py-4">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => onViewClick(lodge)}
                            className="h-14 w-14 rounded-[1.25rem] overflow-hidden border border-black/5 dark:border-white/5 shrink-0 hover:scale-105 transition-transform duration-200 cursor-pointer bg-transparent p-0"
                            title="View room details"
                          >
                            <img src={thumb} alt={lodge.name} className="h-full w-full object-cover" />
                          </button>
                          <div className="text-left">
                            <p className="font-bold text-navy dark:text-white leading-tight">{lodge.roomType}</p>
                            <p className="text-xs text-muted-foreground mt-1">{lodge.name}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-navy dark:text-gray-200 font-medium">{lodge.area}</TableCell>
                      <TableCell className="font-bold text-navy dark:text-white">
                        ₦{(lodge.price ?? 250000).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-navy dark:text-gray-200 font-medium">
                        ₦{(lodge.entryPrice ?? 0).toLocaleString()}/yr
                      </TableCell>
                      <TableCell>
                        <div className="relative inline-block text-left">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdownId(prev => prev === lodge.id ? null : lodge.id);
                            }}
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-white font-semibold text-xs shadow-sm cursor-pointer border-0",
                              lodge.availability === 'available' ? "bg-[#00c58d]" :
                                lodge.availability === 'pending' ? "bg-[#ff9f00]" :
                                  "bg-[#ff2d55]"
                            )}
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-white shrink-0" />
                            <span className="capitalize">
                              {lodge.availability || 'Available'}
                            </span>
                            <svg className="w-3 h-3 text-white/90 shrink-0 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          {activeDropdownId === lodge.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setActiveDropdownId(null)} />
                              <div className="absolute left-0 mt-2 w-32 rounded-xl bg-white dark:bg-[#162535] border border-black/5 dark:border-white/10 shadow-lg z-20 overflow-hidden py-1">
                                {(['available', 'pending', 'rented'] as const).map((opt) => (
                                  <button
                                    key={opt}
                                    type="button"
                                    onClick={() => {
                                      onUpdateAvailability(lodge.id, opt);
                                      setActiveDropdownId(null);
                                    }}
                                    className="w-full text-left px-4 py-2 text-xs font-semibold text-navy dark:text-white hover:bg-gray-100 dark:hover:bg-white/5 capitalize cursor-pointer border-0 bg-transparent flex items-center gap-2"
                                  >
                                    <span className={cn(
                                      "h-1.5 w-1.5 rounded-full",
                                      opt === 'available' ? "bg-[#00c58d]" :
                                        opt === 'pending' ? "bg-[#ff9f00]" :
                                          "bg-[#ff2d55]"
                                    )} />
                                    {opt}
                                  </button>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex justify-end gap-4 items-center">
                          <button
                            type="button"
                            onClick={() => onEditClick(lodge)}
                            className="text-gray-400 hover:text-navy dark:hover:text-white transition cursor-pointer bg-transparent border-0 p-0"
                            title="Edit Listing"
                          >
                            <Edit size={20} />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteClick(lodge.id)}
                            className="text-rose-500 hover:text-rose-600 transition cursor-pointer bg-transparent border-0 p-0"
                            title="Delete Listing"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Stacked Card View */}
          <div className="block md:hidden space-y-4 p-4 sm:p-0">
            {sortedOfficial.map((lodge) => {
              const defaultPhotos: Record<string, string> = {
                "Self-contain": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80",
                "Mini-flat": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80",
                "Single room": "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=600&q=80",
                "One-bedroom": "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80",
              };
              const thumb = (lodge.photos && lodge.photos[0]) || defaultPhotos[lodge.roomType] || defaultPhotos["Self-contain"];

              return (
                <div key={lodge.id} className="bg-white dark:bg-[#0f1e2d] rounded-2xl p-4 border border-black/5 dark:border-white/5 space-y-4">
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => onViewClick(lodge)}
                      className="h-16 w-16 rounded-xl overflow-hidden border border-black/5 dark:border-white/5 shrink-0"
                    >
                      <img src={thumb} alt={lodge.name} className="h-full w-full object-cover" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-navy dark:text-white truncate">{lodge.roomType}</h4>
                        {/* Editable availability dropdown */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdownId(prev => prev === lodge.id ? null : lodge.id);
                            }}
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-white font-bold text-[10px] shadow-sm cursor-pointer border-0",
                              lodge.availability === 'available' ? "bg-[#00c58d]" :
                                lodge.availability === 'pending' ? "bg-[#ff9f00]" :
                                  "bg-[#ff2d55]"
                            )}
                          >
                            <span className="capitalize">{lodge.availability || 'Available'}</span>
                            <svg className="w-2.5 h-2.5 text-white/90 shrink-0 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          {activeDropdownId === lodge.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setActiveDropdownId(null)} />
                              <div className="absolute right-0 mt-1 w-28 rounded-xl bg-white dark:bg-[#162535] border border-black/5 dark:border-white/10 shadow-lg z-20 overflow-hidden py-1">
                                {(['available', 'pending', 'rented'] as const).map((opt) => (
                                  <button
                                    key={opt}
                                    type="button"
                                    onClick={() => {
                                      onUpdateAvailability(lodge.id, opt);
                                      setActiveDropdownId(null);
                                    }}
                                    className="w-full text-left px-3 py-1.5 text-[10px] font-bold text-navy dark:text-white hover:bg-gray-100 dark:hover:bg-white/5 capitalize cursor-pointer border-0 bg-transparent flex items-center gap-1.5"
                                  >
                                    <span className={cn(
                                      "h-1.5 w-1.5 rounded-full",
                                      opt === 'available' ? "bg-[#00c58d]" :
                                        opt === 'pending' ? "bg-[#ff9f00]" :
                                          "bg-[#ff2d55]"
                                    )} />
                                    {opt}
                                  </button>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{lodge.name}</p>
                      <p className="text-[10px] text-navy/40 dark:text-white/40 mt-1 font-semibold uppercase tracking-wider">{lodge.area}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-black/5 dark:border-white/5 pt-3">
                    <div className="space-y-0.5">
                      <p className="text-[10px] text-muted-foreground">Price Details</p>
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="font-bold text-navy dark:text-white">₦{lodge.price?.toLocaleString()}</span>
                        <span className="text-navy/40 dark:text-white/40">/</span>
                        <span className="font-semibold text-navy/70 dark:text-gray-300">₦{lodge.entryPrice?.toLocaleString()}/yr</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onEditClick(lodge)}
                        className="h-8 w-8 rounded-lg border-navy/10 dark:border-white/10 hover:bg-navy/5 dark:hover:bg-white/5"
                      >
                        <Edit size={14} className="text-gray-500 dark:text-gray-400" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onDeleteClick(lodge.id)}
                        className="h-8 w-8 rounded-lg border-rose-100 hover:bg-rose-50 dark:border-rose-950/30"
                      >
                        <Trash2 size={14} className="text-rose-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
const AnalyticsTab = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle>User Growth</CardTitle>
          <CardDescription>Monthly student signups vs Agent signups.</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-end justify-between px-6 pb-6">
          {/* Mock chart representation */}
          {[40, 60, 45, 90, 120, 100, 140].map((h, i) => (
            <div key={i} className="w-12 h-full bg-navy/10 dark:bg-gold/10 rounded-t-lg relative group">
              <div
                className="absolute bottom-0 w-full bg-navy dark:bg-gold rounded-t-lg transition-all duration-1000"
                style={{ height: `${h}%` }}
              ></div>
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-navy text-white text-[10px] px-2 py-1 rounded">
                {h * 10}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle>Top Performing Areas</CardTitle>
          <CardDescription>Most popular locations by search volume.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {[
            { area: "Ihiagwa", val: 85 },
            { area: "Eziobodo", val: 70 },
            { area: "Umuchima", val: 45 },
            { area: "Aladinma", val: 30 },
          ].map((item, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span>{item.area}</span>
                <span>{item.val}%</span>
              </div>
              <div className="h-2 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.val}%` }}
                  transition={{ duration: 1, delay: i * 0.1 }}
                  className="h-full bg-gold"
                ></motion.div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[
        { label: "Lodge Views", val: "48.2k", trend: "+22%", icon: Eye },
        { label: "Agent Contacts", val: "2,190", trend: "+14%", icon: Users },
        { label: "Successful Matches", val: "640", trend: "+28%", icon: ShieldCheck },
      ].map((m, i) => (
        <Card key={i} className="border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-navy/5 dark:bg-white/5 rounded-xl text-navy dark:text-gold">
                <m.icon size={20} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">{m.label}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xl font-bold">{m.val}</span>
                  <span className="text-xs text-emerald-500 font-bold">{m.trend}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

const ServiceApplicationsTab = ({
  applications,
  handleApprove,
  handleReject,
  handleViewEmail
}: {
  applications: ServiceApplication[];
  handleApprove: (id: string) => void;
  handleReject: (id: string) => void;
  handleViewEmail: (app: ServiceApplication) => void;
}) => {
  const getWhatsAppLink = (phone: string, providerName: string) => {
    let clean = phone.replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) {
      clean = '234' + clean.slice(1);
    } else if (clean.startsWith('8') || clean.startsWith('7') || clean.startsWith('9')) {
      clean = '234' + clean;
    }
    return `https://wa.me/${clean}?text=${encodeURIComponent(`Hi ${providerName}, I saw your service application on CampusHub and would like to follow up regarding your listing.`)}`;
  };

  return (
    <Card className="border-none shadow-sm">
      <CardHeader>
        <CardTitle>Service Applications</CardTitle>
        <CardDescription>Review and vet service provider applications. Contact them via WhatsApp to request photos.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-2xl border border-navy/5 dark:border-white/5 overflow-hidden">
          <Table>
            <TableHeader className="bg-navy/5 dark:bg-white/5">
              <TableRow>
                <TableHead className="font-bold">Applicant</TableHead>
                <TableHead className="font-bold">Service Type</TableHead>
                <TableHead className="font-bold">Phone / WhatsApp</TableHead>
                <TableHead className="font-bold">Area Served</TableHead>
                <TableHead className="font-bold">Description</TableHead>
                <TableHead className="font-bold">Status</TableHead>
                <TableHead className="text-right font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.length > 0 ? (
                applications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-bold">{app.name}</TableCell>
                    <TableCell>
                      <span className="bg-gold/15 text-gold px-2.5 py-0.5 rounded-full text-xs font-bold uppercase">
                        {app.service_type}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs font-semibold">
                      <div>Phone: {app.phone}</div>
                      {app.whatsapp && <div className="text-muted-foreground mt-0.5">WA: {app.whatsapp}</div>}
                    </TableCell>
                    <TableCell className="text-xs">{app.area}</TableCell>
                    <TableCell className="text-xs max-w-[250px] truncate" title={app.description}>
                      {app.description}
                    </TableCell>
                    <TableCell>
                      <span className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                        app.status === 'pending' ? "bg-amber-100 text-amber-700 dark:bg-amber-950/35 dark:text-amber-400" :
                        app.status === 'approved' ? "bg-green-100 text-green-700 dark:bg-green-950/35 dark:text-green-400" :
                        "bg-red-100 text-red-700 dark:bg-red-950/35 dark:text-red-400"
                      )}>
                        {app.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <a
                          href={getWhatsAppLink(app.whatsapp || app.phone, app.name)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center rounded-xl border border-gold hover:bg-gold/5 px-3.5 py-1.5 text-xs font-bold text-gold transition cursor-pointer no-underline"
                        >
                          Contact WA
                        </a>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewEmail(app)}
                          className="font-bold border-navy/10 dark:border-white/10"
                        >
                          View Email
                        </Button>
                        {app.status === 'pending' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleApprove(app.id)}
                              className="text-green-600 hover:text-green-700 hover:bg-green-50 font-bold border-green-200"
                            >
                              Approve
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReject(app.id)}
                              className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 font-bold"
                            >
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No service applications listed.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

// --- Main Page Component ---

const TAB_TITLES: Record<string, string> = {
  overview: "Dashboard Overview",
  applications: "Agent Applications",
  agents: "Agents Management",
  lodges: "Listings Management",
  reports: "Reports & Flags",
  official: "CampusHub Official",
  analytics: "Platform Analytics",
  settings: "System Settings",
  marketplace: "Marketplace Management",
  services: "Service Providers",
  "service-applications": "Service Applications",
  "add-official": "Add Official Listing",
  "edit-official": "Edit Official Listing",
};

const ROOM_TYPES = ["Self-contain", "Mini-flat", "Single room", "One-bedroom"];
const AMENITY_OPTIONS = ["Solar power", "Borehole water", "WiFi", "Security", "POP Ceiling", "Tiled floor", "Fenced", "Kitchen cabinet"];
const AREAS = ["Ihiagwa", "Eziobodo", "FUTO", "Umuchima"];

const CustomSelect = ({
  value,
  onChange,
  options,
  placeholder = "Select option"
}: {
  value: string,
  onChange: (val: string) => void,
  options: string[],
  placeholder?: string
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#162535] text-navy dark:text-white px-4 py-3 text-sm focus:border-gold focus:ring-gold outline-none text-left cursor-pointer shadow-sm capitalize"
      >
        <span>{value || placeholder}</span>
        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 mt-2 w-full rounded-xl bg-white dark:bg-[#162535] border border-black/5 dark:border-white/10 shadow-lg z-20 overflow-hidden py-1 max-h-60 overflow-y-auto">
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 text-xs font-semibold text-navy dark:text-white hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer border-0 bg-transparent capitalize"
              >
                {opt}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

interface AdminNotification {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
  type: 'application' | 'listing' | 'report' | 'signup' | 'system';
}

export default function AdminDashboard() {
  const { toggleSidebar } = useSidebar();
  const [activeTab, setActiveTabState] = useState("overview");
  const mainRef = React.useRef<HTMLElement>(null);
  const [mounted, setMounted] = React.useState(false);
  const [tableLoading, setTableLoading] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    setTableLoading(true);
    const timer = setTimeout(() => setTableLoading(false), 500);
    return () => clearTimeout(timer);
  }, [activeTab]);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab) {
      setActiveTabState(tab);
    } else {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", "overview");
      window.history.replaceState({ tab: "overview" }, "", url.pathname + url.search);
    }

    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.tab) {
        setActiveTabState(event.state.tab);
      } else {
        const currentParams = new URLSearchParams(window.location.search);
        setActiveTabState(currentParams.get("tab") || "overview");
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  React.useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo(0, 0);
    }
  }, [activeTab]);

  const setActiveTab = (tabName: string) => {
    setActiveTabState(tabName);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tabName);
      window.history.pushState({ tab: tabName }, "", url.pathname + url.search);
    }
  };

  const [isDark, setIsDark] = useState(false);

  // Marketplace States
  const [marketplaceItems, setMarketplaceItems] = useState<MarketplaceItem[]>([]);
  
  // Services States
  const [serviceProviders, setServiceProviders] = useState<ServiceProvider[]>([]);
  const [serviceApplications, setServiceApplications] = useState<ServiceApplication[]>([]);
  const [editingProvider, setEditingProvider] = useState<ServiceProvider | null>(null);
  const [isProviderModalOpen, setIsProviderModalOpen] = useState(false);
  
  // Provider Form State
  const [providerForm, setProviderForm] = useState({
    name: "",
    service_type: "Cleaning" as ServiceProvider['service_type'],
    phone: "",
    whatsapp: "",
    area: "",
    description: "",
    photo_url: "",
    is_active: true
  });

  // Sync marketplace and services database state
  React.useEffect(() => {
    setMarketplaceItems(getMarketplaceItems());
    setServiceProviders(getServiceProviders());
    setServiceApplications(getServiceApplications());

    const handleMarketplaceUpdate = () => {
      setMarketplaceItems(getMarketplaceItems());
    };
    const handleProvidersUpdate = () => {
      setServiceProviders(getServiceProviders());
    };
    const handleApplicationsUpdate = () => {
      setServiceApplications(getServiceApplications());
    };

    window.addEventListener("marketplace-items-updated", handleMarketplaceUpdate);
    window.addEventListener("service-providers-updated", handleProvidersUpdate);
    window.addEventListener("service-applications-updated", handleApplicationsUpdate);

    return () => {
      window.removeEventListener("marketplace-items-updated", handleMarketplaceUpdate);
      window.removeEventListener("service-providers-updated", handleProvidersUpdate);
      window.removeEventListener("service-applications-updated", handleApplicationsUpdate);
    };
  }, []);

  const handleAdminDeleteMarketplaceItem = (id: string, hardRemove: boolean = false) => {
    if (confirm(hardRemove ? "Are you sure you want to permanently remove this item?" : "Are you sure you want to delete this listing?")) {
      const updated = hardRemove 
        ? marketplaceItems.filter(item => item.id !== id)
        : marketplaceItems.map(item => item.id === id ? { ...item, status: 'deleted' as const } : item);
      setMarketplaceItems(updated);
      saveMarketplaceItems(updated);
      toast.success(hardRemove ? "Item removed permanently" : "Item soft deleted");
    }
  };

  const handleAdminRestoreMarketplaceItem = (id: string) => {
    const updated = marketplaceItems.map(item => item.id === id ? { ...item, status: 'active' as const } : item);
    setMarketplaceItems(updated);
    saveMarketplaceItems(updated);
    toast.success("Marketplace item restored to active");
  };

  const [viewingMarketplaceItem, setViewingMarketplaceItem] = useState<MarketplaceItem | null>(null);

  const handleOpenAddProvider = () => {
    setEditingProvider(null);
    setProviderForm({
      name: "",
      service_type: "Cleaning",
      phone: "",
      whatsapp: "",
      area: "",
      description: "",
      photo_url: "",
      is_active: true
    });
    setIsProviderModalOpen(true);
  };

  const handleOpenEditProvider = (provider: ServiceProvider) => {
    setEditingProvider(provider);
    setProviderForm({
      name: provider.name,
      service_type: provider.service_type,
      phone: provider.phone,
      whatsapp: provider.whatsapp || "",
      area: provider.area,
      description: provider.description,
      photo_url: provider.photo_url || "",
      is_active: provider.is_active
    });
    setIsProviderModalOpen(true);
  };

  const handleSaveProviderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!providerForm.name || !providerForm.service_type || !providerForm.phone || !providerForm.area) {
      toast.error("Please fill in all required fields");
      return;
    }

    let updated: ServiceProvider[];
    if (editingProvider) {
      updated = serviceProviders.map(p => 
        p.id === editingProvider.id 
          ? {
              ...p,
              name: providerForm.name,
              service_type: providerForm.service_type,
              phone: providerForm.phone,
              whatsapp: providerForm.whatsapp || providerForm.phone,
              area: providerForm.area,
              description: providerForm.description,
              photo_url: providerForm.photo_url || "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=400&q=80",
              is_active: providerForm.is_active
            }
          : p
      );
      toast.success("Service provider updated successfully");
    } else {
      const newProvider: ServiceProvider = {
        id: `provider-${Date.now()}`,
        name: providerForm.name,
        service_type: providerForm.service_type,
        phone: providerForm.phone,
        whatsapp: providerForm.whatsapp || providerForm.phone,
        area: providerForm.area,
        description: providerForm.description,
        photo_url: providerForm.photo_url || "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=400&q=80",
        is_active: providerForm.is_active,
        created_at: new Date().toISOString()
      };
      updated = [newProvider, ...serviceProviders];
      toast.success("Service provider added successfully");
    }

    setServiceProviders(updated);
    saveServiceProviders(updated);
    setIsProviderModalOpen(false);
  };

  const handleDeleteProvider = (id: string) => {
    if (confirm("Are you sure you want to delete this service provider?")) {
      const updated = serviceProviders.filter(p => p.id !== id);
      setServiceProviders(updated);
      saveServiceProviders(updated);
      toast.success("Service provider deleted successfully");
    }
  };

  // Notifications and simulated email states
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [simulatedEmailDetails, setSimulatedEmailDetails] = useState<{ to: string; subject: string; body: string } | null>(null);
  const [notifications, setNotifications] = useState<AdminNotification[]>([
    {
      id: "notif-1",
      title: "Agent Application Submitted 📋",
      body: 'A new agent, Johnson Okonkwo, has uploaded verification documents for approval.',
      timestamp: "Just now",
      read: false,
      type: "application"
    },
    {
      id: "notif-2",
      title: "New Report Filed 🚨",
      body: 'A student reported "Umuchima Heights" for pricing discrepancies. Review required.',
      timestamp: "2 hours ago",
      read: false,
      type: "report"
    },
    {
      id: "notif-3",
      title: "Agent Listing Uploaded 🏠",
      body: 'Agent Legacy Lodge uploaded a new mini-flat listing "Legacy Court" for review.',
      timestamp: "1 day ago",
      read: true,
      type: "listing"
    },
    {
      id: "notif-4",
      title: "New Student Registered 🎓",
      body: 'A new student, Dubem Obi, just signed up using a FUTO campus email address.',
      timestamp: "2 days ago",
      read: true,
      type: "signup"
    },
    {
      id: "notif-5",
      title: "Listing Booked/Rented 🔑",
      body: 'Lodge "Umuchima Heights" has been successfully marked as rented by its agent.',
      timestamp: "3 days ago",
      read: true,
      type: "listing"
    }
  ]);

  // Official listing states
  const [editingOfficialLodge, setEditingOfficialLodge] = useState<Lodge | null>(null);
  const [viewingOfficialLodge, setViewingOfficialLodge] = useState<Lodge | null>(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(0);

  const [newOfficialForm, setNewOfficialForm] = useState({
    name: "",
    roomType: "Self-contain",
    area: "Eziobodo",
    price: "",
    entryPrice: "",
    description: "",
    availability: "available" as 'available' | 'pending' | 'rented'
  });
  const [newOfficialAmenities, setNewOfficialAmenities] = useState<string[]>([]);
  const [newOfficialPhotos, setNewOfficialPhotos] = useState<string[]>([]);
  const [officialLoading, setOfficialLoading] = useState(false);

  const formatNaira = (amount: number) => {
    return `₦${amount.toLocaleString()}`;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent, totalPhotos: number) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (diff > 50) {
      setActivePhotoIndex((prev) => (prev === totalPhotos - 1 ? 0 : prev + 1));
    } else if (diff < -50) {
      setActivePhotoIndex((prev) => (prev === 0 ? totalPhotos - 1 : prev - 1));
    }
  };

  const handleViewOfficialClick = (lodge: Lodge) => {
    setViewingOfficialLodge(lodge);
    setActivePhotoIndex(0);
    setActiveTab("view-official");
  };

  const handleUpdateOfficialAvailability = (id: string, availability: 'available' | 'pending' | 'rented') => {
    setLodges(prev => prev.map(lodge => lodge.id === id ? { ...lodge, availability } : lodge));
    toast.success("Listing availability status updated");
  };

  // Sync theme on mount
  React.useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    } else if (savedTheme === "light") {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    } else {
      const isDarkTheme = document.documentElement.classList.contains("dark");
      setIsDark(isDarkTheme);
    }
  }, []);

  // Local state for mock interactions
  const [applications, setApplications] = useState<AgentApplication[]>(MOCK_AGENT_APPLICATIONS);
  const [agents, setAgents] = useState<Agent[]>(MOCK_AGENTS);
  const [lodges, setLodges] = useState<Lodge[]>(MOCK_LODGES);
  const [reports, setReports] = useState<Report[]>(MOCK_REPORTS);

  const handleAddOfficialClick = () => {
    setNewOfficialForm({
      name: "",
      roomType: "Self-contain",
      area: "Eziobodo",
      price: "",
      entryPrice: "",
      description: "",
      availability: "available"
    });
    setNewOfficialAmenities([]);
    setNewOfficialPhotos([]);
    setActiveTab("add-official");
  };

  const handleEditOfficialClick = (lodge: Lodge) => {
    setEditingOfficialLodge({ ...lodge });
    setActiveTab("edit-official");
  };

  const handleDeleteOfficialLodge = (id: string) => {
    setLodges(prev => prev.filter(l => l.id !== id));
    toast.success("Official listing deleted successfully");
  };

  const handleCreateOfficialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOfficialForm.name.trim()) {
      toast.error("Please enter a lodge name.");
      return;
    }
    if (!newOfficialForm.price || isNaN(Number(newOfficialForm.price))) {
      toast.error("Please enter a valid first payment.");
      return;
    }
    if (!newOfficialForm.entryPrice || isNaN(Number(newOfficialForm.entryPrice))) {
      toast.error("Please enter a valid to pay price.");
      return;
    }

    setOfficialLoading(true);

    setTimeout(() => {
      const DEFAULT_PHOTOS: Record<string, string> = {
        "Self-contain": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80",
        "Mini-flat": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80",
        "Single room": "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=600&q=80",
        "One-bedroom": "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80",
      };

      const finalPhotos = newOfficialPhotos.length > 0
        ? newOfficialPhotos
        : [DEFAULT_PHOTOS[newOfficialForm.roomType] || DEFAULT_PHOTOS["Self-contain"]];

      const newLodge: Lodge = {
        id: `official-${Date.now()}`,
        name: newOfficialForm.name,
        agentName: "Official CampusHub",
        area: newOfficialForm.area,
        roomType: newOfficialForm.roomType,
        status: "Active",
        createdDate: new Date().toISOString().split("T")[0],
        isOfficial: true,
        availability: newOfficialForm.availability,
        price: Number(newOfficialForm.price),
        entryPrice: Number(newOfficialForm.entryPrice),
        description: newOfficialForm.description,
        amenities: newOfficialAmenities,
        photos: finalPhotos
      };

      setLodges(prev => [newLodge, ...prev]);
      toast.success("Official listing published successfully!");
      setActiveTab("official");
      setOfficialLoading(false);
    }, 800);
  };

  const handleEditOfficialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOfficialLodge || !editingOfficialLodge.name.trim()) {
      toast.error("Please enter a lodge name.");
      return;
    }
    setLodges(prev => prev.map(l => l.id === editingOfficialLodge.id ? editingOfficialLodge : l));
    toast.success("Official listing updated successfully!");
    setActiveTab("official");
    setEditingOfficialLodge(null);
  };

  const pendingAppsCount = applications.filter(app => app.status === 'Pending').length;
  const pendingAgentSignups = applications.filter(app => app.id.startsWith('app-agent') && app.status === 'Pending');

  // Synchronize with localStorage for custom signups
  React.useEffect(() => {
    const syncFromLocalStorage = () => {
      const saved = localStorage.getItem("agent_data");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const agentId = parsed.id || 'agent1';

          // Sync listings notifications
          if (parsed.listings && parsed.listings.length > 0) {
            parsed.listings.forEach((l: any) => {
              const notifId = `notif-list-${agentId}-${l.id}`;
              setNotifications(nPrev => {
                if (nPrev.some(n => n.id === notifId)) return nPrev;
                return [
                  {
                    id: notifId,
                    title: "Agent Listing Uploaded 🏠",
                    body: `Agent ${parsed.full_name || 'Johnson Okonkwo'} uploaded a new listing "${l.building_name}" for review.`,
                    timestamp: "Just now",
                    read: false,
                    type: "listing"
                  },
                  ...nPrev
                ];
              });
            });
          }

          // 1. Sync Applications state
          if (parsed.ninUploaded) {
            setApplications(prev => {
              const appId = `app-${parsed.id}`;
              const exists = prev.some(app => app.id === appId);
              if (exists) {
                return prev.map(app =>
                  app.id === appId
                    ? { 
                        ...app, 
                        lodgesManaged: parsed.listings?.length || 0, 
                        status: parsed.approved ? 'Approved' : (parsed.rejected ? 'Rejected' : 'Pending'),
                        emailVerified: parsed.emailVerified !== undefined ? parsed.emailVerified : true,
                        phoneVerified: parsed.phoneVerified !== undefined ? parsed.phoneVerified : false,
                      }
                    : app
                );
              } else {
                const newApp: AgentApplication = {
                  id: appId,
                  name: parsed.full_name || 'Johnson Okonkwo',
                  email: parsed.email || 'johnson@campushub.com',
                  phone: parsed.phone || '08012345678',
                  area: 'Eziobodo',
                  lodgesManaged: parsed.listings?.length || 0,
                  status: parsed.approved ? 'Approved' : (parsed.rejected ? 'Rejected' : 'Pending'),
                  appliedDate: new Date().toISOString().split('T')[0],
                  documentPlaceholder: parsed.ninImageName || 'NIN_document.jpg',
                  ninImage: parsed.ninImage || undefined,
                  emailVerified: parsed.emailVerified !== undefined ? parsed.emailVerified : true,
                  phoneVerified: parsed.phoneVerified !== undefined ? parsed.phoneVerified : false,
                };

                // Add system notification for the new agent application
                setNotifications(nPrev => {
                  if (nPrev.some(n => n.id === `notif-app-${appId}`)) return nPrev;
                  return [
                    {
                      id: `notif-app-${appId}`,
                      title: "Agent Application Submitted 📋",
                      body: `A new agent, ${parsed.full_name || 'Johnson Okonkwo'}, uploaded documents for review.`,
                      timestamp: "Just now",
                      read: false,
                      type: "application"
                    },
                    ...nPrev
                  ];
                });

                return [newApp, ...prev];
              }
            });
          }

          // 2. Sync Agents directory
          const isSuspended = parsed.suspended === true;
          const verificationStatus = isSuspended ? 'Suspended' : (parsed.approved && parsed.verified ? 'Verified' : 'Unverified');

          setAgents(prev => {
            const exists = prev.some(a => a.id === agentId);
            if (exists) {
              return prev.map(a => a.id === agentId ? {
                ...a,
                name: parsed.full_name || a.name,
                email: parsed.email || a.email,
                phone: parsed.phone || a.phone,
                verificationStatus: verificationStatus,
                listingsCount: parsed.listings?.length || 0,
              } : a);
            } else if (parsed.approved && parsed.verified) {
              const newAgent: Agent = {
                id: agentId,
                name: parsed.full_name || 'Johnson Okonkwo',
                email: parsed.email || 'johnson@campushub.com',
                phone: parsed.phone || '08012345678',
                verificationStatus: verificationStatus,
                listingsCount: parsed.listings?.length || 0,
                avgRating: 4.5,
                joinedDate: parsed.joinedDate || '2026-06-19',
              };
              return [newAgent, ...prev];
            }
            return prev;
          });

          // 3. Sync Lodges (listings management) list
          const isApproved = parsed.approved && parsed.verified;
          setLodges(prev => {
            // Keep all lodges that do not belong to this agent
            let baseLodges = prev.filter(l => l.agentName !== parsed.full_name && !l.id.startsWith(`l-${agentId}-`));

            if (isApproved && !isSuspended) {
              const agentListings = parsed.listings || [];
              const mappedListings = agentListings.map((l: any) => ({
                id: `l-${agentId}-${l.id}`,
                name: l.building_name,
                agentName: parsed.full_name || 'Johnson Okonkwo',
                area: l.area,
                roomType: l.room_type,
                status: l.availability === 'available' ? 'Active' : 'Hidden',
                createdDate: l.created_at || new Date().toISOString().split('T')[0],
                availability: l.availability || 'available',
                price: l.price,
                entryPrice: l.entryPrice,
                description: l.description,
                amenities: l.amenities,
                photos: l.photos,
              }));
              return [...mappedListings, ...baseLodges];
            }
            return baseLodges;
          });

        } catch (e) {
          console.error("Failed to parse agent_data in admin page:", e);
        }
      }
    };

    const syncMarketplaceAndServices = () => {
      // Sync notifications list from localStorage
      const savedAdminNotifs = localStorage.getItem("admin_notifications");
      if (savedAdminNotifs) {
        try {
          setNotifications(JSON.parse(savedAdminNotifs));
        } catch(e) {}
      }

      // Sync applications list
      setServiceApplications(getServiceApplications());

      // Sync email pending simulation
      const emailPending = localStorage.getItem("service_application_email_pending");
      if (emailPending) {
        try {
          const details = JSON.parse(emailPending);
          setSimulatedEmailDetails(details);
          setIsEmailModalOpen(true);
          localStorage.removeItem("service_application_email_pending");
        } catch(e) {}
      }
    };

    syncFromLocalStorage();
    syncMarketplaceAndServices();

    window.addEventListener("storage", syncFromLocalStorage);
    window.addEventListener("focus", syncFromLocalStorage);
    window.addEventListener("agent-data-updated", syncFromLocalStorage);
    window.addEventListener("admin-notifications-updated", syncMarketplaceAndServices);
    window.addEventListener("service-applications-updated", syncMarketplaceAndServices);

    return () => {
      window.removeEventListener("storage", syncFromLocalStorage);
      window.removeEventListener("focus", syncFromLocalStorage);
      window.removeEventListener("agent-data-updated", syncFromLocalStorage);
      window.removeEventListener("admin-notifications-updated", syncMarketplaceAndServices);
      window.removeEventListener("service-applications-updated", syncMarketplaceAndServices);
    };
  }, []);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    if (newDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const handleViewSimulatedEmail = (app: AgentApplication) => {
    setSimulatedEmailDetails({
      to: "admin@campushub.com",
      subject: `[CampusHub] New Agent Registration: ${app.name}`,
      body: `Hi Admin,\n\nA new agent, ${app.name}, has registered on CampusHub and uploaded their NIN verification document.\n\nDetails:\n- Name: ${app.name}\n- Email: ${app.email}\n- Phone: ${app.phone}\n\nPlease log in to the admin panel to review and approve/reject their verification status.\n\nBest regards,\nCampusHub Automation System`
    });
    setIsEmailModalOpen(true);
    setIsNotificationOpen(false);
  };

  // Actions
  const handleApproveApp = (id: string) => {
    setApplications(prev => prev.map(app => app.id === id ? { ...app, status: 'Approved' } : app));

    const app = applications.find(a => a.id === id);
    if (app) {
      const newAgent: Agent = {
        id: `agent-${app.id}`,
        name: app.name,
        email: app.email,
        phone: app.phone,
        verificationStatus: 'Verified',
        listingsCount: 0,
        avgRating: 0,
        joinedDate: new Date().toISOString().split('T')[0]
      };
      setAgents(prev => {
        if (prev.some(a => a.email === app.email)) return prev;
        return [...prev, newAgent];
      });

      // Update localStorage if it's the registered onboarding agent
      if (id.startsWith('app-agent')) {
        const saved = localStorage.getItem("agent_data");
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            const updated = {
              ...parsed,
              approved: true,
              verified: true,
              rejected: false
            };
            localStorage.setItem("agent_data", JSON.stringify(updated));
            window.dispatchEvent(new Event("storage"));
            window.dispatchEvent(new Event("agent-data-updated"));
          } catch (e) {
            console.error(e);
          }
        }
      }
    }

    toast.success("Application approved successfully");
  };

  const handleRejectApp = (id: string) => {
    setApplications(prev => prev.map(app => app.id === id ? { ...app, status: 'Rejected' } : app));

    // Update localStorage if it's the registered onboarding agent
    if (id.startsWith('app-agent')) {
      const saved = localStorage.getItem("agent_data");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const updated = {
            ...parsed,
            approved: false,
            verified: false,
            rejected: true
          };
          localStorage.setItem("agent_data", JSON.stringify(updated));
          window.dispatchEvent(new Event("storage"));
          window.dispatchEvent(new Event("agent-data-updated"));
        } catch (e) {
          console.error(e);
        }
      }
    }

    toast.error("Application rejected");
  };

  const handleApproveServiceApp = (id: string) => {
    const updated = serviceApplications.map(app => app.id === id ? { ...app, status: 'approved' as const } : app);
    setServiceApplications(updated);
    saveServiceApplications(updated);
    toast.success("Service application status marked as Approved");
  };

  const handleRejectServiceApp = (id: string) => {
    const updated = serviceApplications.map(app => app.id === id ? { ...app, status: 'rejected' as const } : app);
    setServiceApplications(updated);
    saveServiceApplications(updated);
    toast.error("Service application status marked as Rejected");
  };

  const handleViewServiceAppEmail = (app: ServiceApplication) => {
    setSimulatedEmailDetails({
      to: "admin@campushub.com",
      subject: `[CampusHub] New Service Provider Application: ${app.name}`,
      body: `Hi Admin,\n\nA new provider has applied to be listed in the CampusHub Services Directory.\n\nApplicant Details:\n- Name: ${app.name}\n- Service Type: ${app.service_type}\n- Phone: ${app.phone}\n- WhatsApp: ${app.whatsapp || app.phone}\n- Area Served: ${app.area}\n- Description: ${app.description}\n\nPlease review their application under the "Service Applications" admin dashboard tab to vet their credentials and manually launch their live listing.\n\nBest regards,\nCampusHub Automation System`
    });
    setIsEmailModalOpen(true);
    setIsNotificationOpen(false);
  };

  const handleToggleLodgeStatus = (id: string) => {
    setLodges(prev => prev.map(lodge => lodge.id === id ? { ...lodge, status: lodge.status === 'Active' ? 'Hidden' : 'Active' } : lodge));
    toast.success("Lodge status updated");
  };

  const handleDeleteLodge = (id: string) => {
    setLodges(prev => prev.filter(lodge => lodge.id !== id));
    toast.success("Lodge deleted");
  };

  const handleUpdateReportStatus = (id: string, status: Report['status']) => {
    setReports(prev => prev.map(rep => rep.id === id ? { ...rep, status } : rep));
    toast.success(`Report status updated to ${status}`);
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success("All notifications marked as read");
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast.success("Notification deleted");
  };

  if (!mounted) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white dark:bg-[#08131e] transition-colors duration-300">
        <div className="relative flex flex-col items-center space-y-4">
          <div className="relative h-20 w-20 rounded-2xl bg-gold/10 p-2 flex items-center justify-center shadow-lg border border-gold/20 animate-pulse">
            <Image
              src="/image/Campus-Hub.png"
              alt="CampusHub Logo"
              width={64}
              height={64}
              className="rounded-xl object-contain"
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
              <span>Loading Admin Panel...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingApplicationsCount={pendingAppsCount}
      />

      <div className="flex-1 flex flex-col h-[100dvh] overflow-hidden">
        {/* Mobile Navbar */}
        <div className="flex md:hidden items-center justify-between bg-[#0f1e2d] text-white px-6 py-4 border-b border-white/10 shadow-sm z-40 shrink-0">
          <div className="flex items-center gap-2">
            <Image
              src="/image/Campus-Hub.png"
              alt="Campus-Hub Logo"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <span className="text-lg font-bold tracking-tight">
              Campus<span className="text-[#C9952A]">Hub</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {/* Notification Bell Trigger */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsNotificationOpen(true)}
              className="rounded-full hover:bg-white/10 h-9 w-9 p-0 relative text-white flex items-center justify-center"
              aria-label="Open notifications drawer"
            >
              <Bell size={18} />
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-gold text-[9px] font-extrabold text-[#0f1e2d] animate-pulse border border-[#0f1e2d]">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full hover:bg-white/10 h-9 w-9 p-0 text-white"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </Button>

            {/* Profile Avatar */}
            <div className="w-8 h-8 bg-gold rounded-full flex items-center justify-center font-bold text-navy text-xs shrink-0 select-none">
              A
            </div>

            {/* Divider */}
            <div className="w-[1px] h-6 bg-white/10 mx-1"></div>

            {/* Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="text-white hover:bg-white/10 h-9 w-9 p-0 rounded-full"
              aria-label="Toggle navigation menu"
            >
              <Menu className="h-5.5 w-5.5" />
            </Button>
          </div>
        </div>

        {/* Desktop Top Bar (lg screens) */}
        <div className="hidden md:flex items-center justify-between bg-white dark:bg-[#121212] border-b border-navy/5 dark:border-white/5 px-8 h-[72px] shrink-0 z-30 shadow-sm">
          <div>
            {activeTab !== "official" && activeTab !== "view-official" && activeTab !== "add-official" && activeTab !== "edit-official" ? (
              <div>
                <h1 className="text-xl font-extrabold tracking-tight text-navy dark:text-white leading-none">
                  {TAB_TITLES[activeTab] || activeTab}
                </h1>
                <p className="text-muted-foreground text-xs mt-0.5">Welcome back, Admin. System is running smoothly.</p>
              </div>
            ) : (
              <span className="text-xl font-extrabold tracking-tight text-navy dark:text-white">
                {TAB_TITLES[activeTab] || activeTab}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Notification Bell Trigger */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsNotificationOpen(true)}
              className="rounded-full border-navy/10 dark:border-white/10 hover:bg-navy/5 dark:hover:bg-white/5 relative flex items-center justify-center"
              aria-label="Open notifications drawer"
            >
              <Bell size={20} />
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-gold text-[9px] font-extrabold text-navy animate-pulse border border-white dark:border-navy">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full border-navy/10 dark:border-white/10 hover:bg-navy/5 dark:hover:bg-white/5"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </Button>
            <div className="h-10 w-[1px] bg-navy/10 dark:bg-white/10 mx-1"></div>
            <div className="flex items-center gap-3 bg-white dark:bg-white/5 px-4 py-2 rounded-full border border-navy/5 shadow-sm">
              <div className="w-8 h-8 bg-gold rounded-full flex items-center justify-center font-bold text-navy text-sm shrink-0">A</div>
              <div>
                <p className="text-xs font-bold leading-none">Super Admin</p>
                <p className="text-[10px] text-muted-foreground mt-1">admin@campushub.com</p>
              </div>
            </div>
          </div>
        </div>

        <main ref={mainRef} className="flex-1 px-4 py-6 md:px-8 md:py-8 overflow-y-auto bg-gray-50/30 dark:bg-navy/10">

          {/* Mobile Page Title (shown only on mobile, hidden on desktop since top bar handles it) */}
          {activeTab !== "add-official" && activeTab !== "edit-official" && (
            <div className="flex md:hidden flex-col mb-6">
              <h1 className="text-2xl font-extrabold tracking-tight text-navy dark:text-white">
                {TAB_TITLES[activeTab] || activeTab}
              </h1>
              <p className="text-muted-foreground text-xs mt-0.5">Welcome back, Admin. System is running smoothly.</p>
            </div>
          )}

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {tableLoading && activeTab !== "add-official" && activeTab !== "edit-official" && activeTab !== "view-official" ? (
                <div className="space-y-8 animate-pulse text-left">
                  {activeTab === "overview" ? (
                    <div className="space-y-6">
                      {/* Metric Stat Cards Skeletons */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className="bg-white dark:bg-[#121212] rounded-3xl border border-black/5 dark:border-white/5 p-6 space-y-3 shadow-sm">
                            <div className="flex justify-between items-start">
                              <div className="space-y-2 flex-1">
                                <div className="h-3 w-2/3 bg-gray-200 dark:bg-[#1c1c1e] rounded" />
                                <div className="h-6 w-1/2 bg-gray-200 dark:bg-[#1c1c1e] rounded" />
                                <div className="h-3 w-1/3 bg-gray-200 dark:bg-[#1c1c1e] rounded mt-2" />
                              </div>
                              <div className="h-10 w-10 bg-gray-200 dark:bg-[#1c1c1e] rounded-xl shrink-0" />
                            </div>
                          </div>
                        ))}
                      </div>
                      {/* Overview Activity and Quick Actions Skeletons */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-white dark:bg-[#121212] rounded-[2rem] border border-black/5 dark:border-white/5 p-6 space-y-6 shadow-sm">
                          <div className="space-y-2">
                            <div className="h-4 w-1/3 bg-gray-200 dark:bg-[#1c1c1e] rounded" />
                            <div className="h-3 w-1/2 bg-gray-200 dark:bg-[#1c1c1e] rounded" />
                          </div>
                          <div className="space-y-4">
                            {[1, 2, 3, 4].map(i => (
                              <div key={i} className="flex items-center justify-between p-4 border border-black/5 dark:border-white/5 rounded-xl">
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 bg-gray-200 dark:bg-[#1c1c1e] rounded-full shrink-0" />
                                  <div className="space-y-2">
                                    <div className="h-3 w-32 bg-gray-200 dark:bg-[#1c1c1e] rounded" />
                                    <div className="h-3 w-24 bg-gray-200 dark:bg-[#1c1c1e] rounded" />
                                  </div>
                                </div>
                                <div className="h-5 w-16 bg-gray-200 dark:bg-[#1c1c1e] rounded-full" />
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="bg-white dark:bg-[#121212] rounded-[2rem] border border-black/5 dark:border-white/5 p-6 space-y-6 shadow-sm">
                          <div className="h-4 w-1/3 bg-gray-200 dark:bg-[#1c1c1e] rounded" />
                          <div className="space-y-3 pt-2">
                            {[1, 2, 3, 4].map(i => (
                              <div key={i} className="h-10 w-full bg-gray-200 dark:bg-[#1c1c1e] rounded-xl" />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : activeTab === "analytics" ? (
                    <div className="space-y-6">
                      {/* Top Grid: Two large cards */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Card 1: Chart Skeleton */}
                        <div className="bg-white dark:bg-[#121212] rounded-[2rem] border border-black/5 dark:border-white/5 p-6 space-y-6 shadow-sm">
                          <div className="space-y-2">
                            <div className="h-4 w-1/3 bg-gray-200 dark:bg-[#1c1c1e] rounded" />
                            <div className="h-3 w-1/2 bg-gray-200 dark:bg-[#1c1c1e] rounded" />
                          </div>
                          <div className="h-[200px] flex items-end justify-between pt-6 px-4">
                            {[60, 90, 70, 110, 150, 120, 160].map((h, i) => (
                              <div key={i} className="w-12 bg-gray-200 dark:bg-[#1c1c1e] rounded-t-lg" style={{ height: `${h}px` }} />
                            ))}
                          </div>
                        </div>
                        {/* Card 2: List Progress bars */}
                        <div className="bg-white dark:bg-[#121212] rounded-[2rem] border border-black/5 dark:border-white/5 p-6 space-y-6 shadow-sm">
                          <div className="space-y-2">
                            <div className="h-4 w-1/3 bg-gray-200 dark:bg-[#1c1c1e] rounded" />
                            <div className="h-3 w-1/2 bg-gray-200 dark:bg-[#1c1c1e] rounded" />
                          </div>
                          <div className="space-y-6 pt-4">
                            {[1, 2, 3, 4].map(i => (
                              <div key={i} className="space-y-2">
                                <div className="flex justify-between">
                                  <div className="h-3 w-16 bg-gray-200 dark:bg-[#1c1c1e] rounded" />
                                  <div className="h-3 w-8 bg-gray-200 dark:bg-[#1c1c1e] rounded" />
                                </div>
                                <div className="h-2 w-full bg-gray-200 dark:bg-[#1c1c1e] rounded-full" />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      {/* Bottom Grid: Three metric cards */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="bg-white dark:bg-[#121212] rounded-[2rem] border border-black/5 dark:border-white/5 p-6 shadow-sm flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-gray-200 dark:bg-[#1c1c1e]" />
                            <div className="space-y-2 flex-1">
                              <div className="h-3 w-2/3 bg-gray-200 dark:bg-[#1c1c1e] rounded" />
                              <div className="h-5 w-1/2 bg-gray-200 dark:bg-[#1c1c1e] rounded" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : activeTab === "settings" ? (
                    <div className="bg-white dark:bg-[#121212] rounded-[2rem] border border-black/5 dark:border-white/5 p-6 space-y-4 shadow-sm">
                      <div className="space-y-2">
                        <div className="h-6 w-1/3 bg-gray-200 dark:bg-[#1c1c1e] rounded" />
                        <div className="h-4 w-1/2 bg-gray-200 dark:bg-[#1c1c1e] rounded" />
                      </div>
                      <div className="h-10 w-full bg-gray-200 dark:bg-[#1c1c1e] rounded mt-4" />
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-[#121212] rounded-[2.5rem] border border-black/5 dark:border-white/5 shadow-sm overflow-hidden p-6 md:p-8 space-y-6">
                      {/* Table Header skeleton */}
                      <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-4">
                        <div className="h-6 w-48 bg-gray-200 dark:bg-[#1c1c1e] rounded" />
                        <div className="h-8 w-24 bg-gray-200 dark:bg-[#1c1c1e] rounded-xl" />
                      </div>
                      {/* Table Rows skeleton */}
                      <div className="space-y-4">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                          <div key={i} className="flex items-center justify-between py-4 border-b border-black/5 dark:border-white/5 last:border-0">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 bg-gray-200 dark:bg-[#1c1c1e] rounded-full shrink-0" />
                              <div className="space-y-2">
                                <div className="h-4 w-32 bg-gray-200 dark:bg-[#1c1c1e] rounded" />
                                <div className="h-3 w-20 bg-gray-200 dark:bg-[#1c1c1e] rounded" />
                              </div>
                            </div>
                            <div className="h-4 w-20 bg-gray-200 dark:bg-[#1c1c1e] rounded" />
                            <div className="h-4 w-24 bg-gray-200 dark:bg-[#1c1c1e] rounded" />
                            <div className="h-6 w-16 bg-gray-200 dark:bg-[#1c1c1e] rounded-full" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : activeTab === "overview" && (
                <OverviewTab
                  lodges={lodges}
                  pendingAppsCount={pendingAppsCount}
                  reports={reports}
                  setActiveTab={setActiveTab}
                />
              )}
              {activeTab === "applications" && (
                <AgentApplicationsTab
                  applications={applications}
                  handleApproveApp={handleApproveApp}
                  handleRejectApp={handleRejectApp}
                />
              )}
              {activeTab === "agents" && (
                <AgentsManagementTab
                  agents={agents}
                  setAgents={setAgents}
                />
              )}
              {activeTab === "lodges" && (
                <LodgesManagementTab
                  lodges={lodges}
                  handleToggleLodgeStatus={handleToggleLodgeStatus}
                  handleDeleteLodge={handleDeleteLodge}
                />
              )}
              {activeTab === "reports" && (
                <ReportsTab
                  reports={reports}
                  handleUpdateReportStatus={handleUpdateReportStatus}
                />
              )}
              {activeTab === "official" && (
                <OfficialListingsTab
                  lodges={lodges}
                  onAddClick={handleAddOfficialClick}
                  onEditClick={handleEditOfficialClick}
                  onDeleteClick={handleDeleteOfficialLodge}
                  onViewClick={handleViewOfficialClick}
                  onUpdateAvailability={handleUpdateOfficialAvailability}
                />
              )}
              {activeTab === "add-official" && (
                <div className="space-y-6 text-left">
                  <div className="bg-white dark:bg-[#0f1d2e] dark:lg:bg-[#121212] rounded-none sm:rounded-[2rem] border-x-0 border-t-0 sm:border border-black/5 dark:border-white/5 shadow-sm overflow-hidden -mx-4 -mt-6 sm:mt-0 sm:mx-0">
                    <div className="p-6 sm:p-8 border-b border-gray-100 dark:border-white/10 bg-[#0f1e2d] dark:lg:bg-[#121212] text-white flex flex-col items-start gap-4">
                      <button
                        type="button"
                        onClick={() => setActiveTab("official")}
                        className="p-2 -ml-2 rounded-full hover:bg-white/10 text-white transition cursor-pointer border-0 bg-transparent flex items-center justify-center"
                        aria-label="Go back to official listings"
                      >
                        <ArrowLeft className="h-6 w-6 text-gold" />
                      </button>
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold">Add New Official Lodge Listing</h2>
                        <p className="text-white/60 text-xs sm:text-sm mt-1">
                          Publish an official premium property unit managed directly by CampusHub.
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleCreateOfficialSubmit} className="space-y-8 p-6 sm:p-8">
                      <div className="space-y-6">
                        <h3 className="text-base font-bold text-navy dark:text-white border-b border-gray-100 dark:border-white/5 pb-2">Lodge Details</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="official_building_name" className="text-xs font-bold uppercase tracking-widest text-navy/40 dark:text-white/40">Lodge/Building Name</Label>
                            <Input
                              id="official_building_name"
                              placeholder="e.g. CampusHub Premium Suites"
                              value={newOfficialForm.name}
                              onChange={(e) => setNewOfficialForm({ ...newOfficialForm, name: e.target.value })}
                              className="rounded-xl border-gray-200 dark:border-white/10 bg-transparent text-navy dark:text-white focus:border-gold focus:ring-gold"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-widest text-navy/40 dark:text-white/40">Room Type</Label>
                            <CustomSelect
                              value={newOfficialForm.roomType}
                              options={ROOM_TYPES}
                              onChange={(val) => setNewOfficialForm({ ...newOfficialForm, roomType: val })}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="official_price" className="text-xs font-bold uppercase tracking-widest text-navy/40 dark:text-white/40">First Payment (₦)</Label>
                            <Input
                              id="official_price"
                              type="number"
                              placeholder="e.g. 350000"
                              value={newOfficialForm.price}
                              onChange={(e) => setNewOfficialForm({ ...newOfficialForm, price: e.target.value })}
                              className="rounded-xl border-gray-200 dark:border-white/10 bg-transparent text-navy dark:text-white focus:border-gold focus:ring-gold"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="official_entryPrice" className="text-xs font-bold uppercase tracking-widest text-navy/40 dark:text-white/40">To Pay (₦)</Label>
                            <Input
                              id="official_entryPrice"
                              type="number"
                              placeholder="e.g. 150000"
                              value={newOfficialForm.entryPrice}
                              onChange={(e) => setNewOfficialForm({ ...newOfficialForm, entryPrice: e.target.value })}
                              className="rounded-xl border-gray-200 dark:border-white/10 bg-transparent text-navy dark:text-white focus:border-gold focus:ring-gold"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-widest text-navy/40 dark:text-white/40">Lodge Location / Area</Label>
                            <CustomSelect
                              value={newOfficialForm.area}
                              options={AREAS}
                              onChange={(val) => setNewOfficialForm({ ...newOfficialForm, area: val })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-widest text-navy/40 dark:text-white/40">Availability Status</Label>
                            <CustomSelect
                              value={newOfficialForm.availability}
                              options={["available", "pending", "rented"]}
                              onChange={(val) => setNewOfficialForm({ ...newOfficialForm, availability: val as any })}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="official_description" className="text-xs font-bold uppercase tracking-widest text-navy/40 dark:text-white/40">Listing Description</Label>
                          <textarea
                            id="official_description"
                            placeholder="Describe building highlights, facilities, and rent details..."
                            value={newOfficialForm.description}
                            onChange={(e) => setNewOfficialForm({ ...newOfficialForm, description: e.target.value })}
                            className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#162535] text-navy dark:text-white px-4 py-3 text-sm focus:border-gold focus:ring-gold outline-none min-h-[100px]"
                          />
                        </div>
                      </div>

                      {/* Amenities block */}
                      <div className="space-y-4">
                        <h3 className="text-base font-bold text-navy dark:text-white border-b border-gray-100 dark:border-white/5 pb-2">Amenities</h3>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {AMENITY_OPTIONS.map((amenity) => {
                            const active = newOfficialAmenities.includes(amenity);
                            return (
                              <button
                                key={amenity}
                                type="button"
                                onClick={() => {
                                  setNewOfficialAmenities(prev =>
                                    prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
                                  );
                                }}
                                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all duration-200 cursor-pointer ${active
                                  ? "bg-gold/10 border-gold text-gold shadow-sm"
                                  : "bg-transparent border-gray-200 dark:border-white/10 text-navy/60 dark:text-white/60 hover:border-navy/30 dark:hover:border-white/30"
                                  }`}
                              >
                                {amenity}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Photos upload block */}
                      <div className="space-y-4">
                        <h3 className="text-base font-bold text-navy dark:text-white border-b border-gray-100 dark:border-white/5 pb-2">Photos</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          {newOfficialPhotos.map((photo, index) => (
                            <div key={index} className="aspect-square rounded-2xl overflow-hidden relative border border-gray-100 group shadow-sm bg-gray-50">
                              <img src={photo} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => setNewOfficialPhotos(prev => prev.filter((_, idx) => idx !== index))}
                                className="absolute inset-0 bg-black/55 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer border-0"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              const newPhoto = `https://picsum.photos/400/300?random=${Date.now()}`;
                              setNewOfficialPhotos(prev => [...prev, newPhoto]);
                              toast.success("Photo added (simulated)");
                            }}
                            className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/10 flex flex-col items-center justify-center text-gray-400 hover:border-gold hover:text-gold transition-all duration-200 group cursor-pointer bg-transparent"
                          >
                            <Plus className="h-6 w-6" />
                            <span className="text-[10px] mt-1.5 font-bold uppercase tracking-wider">Add Photo</span>
                          </button>
                        </div>
                      </div>

                      {/* Form Action buttons */}
                      <div className="border-t border-gray-100 dark:border-white/5 pt-6 flex justify-end gap-3 font-sans">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setActiveTab("official")}
                          className="rounded-xl font-bold text-gray-500 hover:bg-gray-100"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          className="rounded-xl bg-gold hover:bg-gold/90 text-navy font-extrabold px-8 shadow-lg shadow-gold/20 flex items-center gap-2 border-0 cursor-pointer"
                          disabled={officialLoading}
                        >
                          {officialLoading ? "Publishing..." : "Publish Official Listing"}
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
              {activeTab === "edit-official" && editingOfficialLodge && (
                <div className="space-y-6 text-left">
                  <div className="bg-white dark:bg-[#0f1d2e] dark:lg:bg-[#121212] rounded-none sm:rounded-[2rem] border-x-0 border-t-0 sm:border border-black/5 dark:border-white/5 shadow-sm overflow-hidden -mx-4 -mt-6 sm:mt-0 sm:mx-0">
                    <div className="p-6 sm:p-8 border-b border-gray-100 dark:border-white/10 bg-[#0f1e2d] dark:lg:bg-[#121212] text-white flex flex-col items-start gap-4">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab("official");
                          setEditingOfficialLodge(null);
                        }}
                        className="p-2 -ml-2 rounded-full hover:bg-white/10 text-white transition cursor-pointer border-0 bg-transparent flex items-center justify-center"
                        aria-label="Go back to official listings"
                      >
                        <ArrowLeft className="h-6 w-6 text-gold" />
                      </button>
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold">Edit Official Lodge Listing</h2>
                        <p className="text-white/60 text-xs sm:text-sm mt-1">
                          Modify details for official CampusHub property {editingOfficialLodge.name}.
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleEditOfficialSubmit} className="space-y-8 p-6 sm:p-8">
                      <div className="space-y-6">
                        <h3 className="text-base font-bold text-navy dark:text-white border-b border-gray-100 dark:border-white/5 pb-2">Lodge Details</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="edit_official_building_name" className="text-xs font-bold uppercase tracking-widest text-navy/40 dark:text-white/40">Lodge/Building Name</Label>
                            <Input
                              id="edit_official_building_name"
                              value={editingOfficialLodge.name}
                              onChange={(e) => setEditingOfficialLodge({ ...editingOfficialLodge, name: e.target.value })}
                              className="rounded-xl border-gray-200 dark:border-white/10 bg-transparent text-navy dark:text-white focus:border-gold focus:ring-gold"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-widest text-navy/40 dark:text-white/40">Room Type</Label>
                            <CustomSelect
                              value={editingOfficialLodge.roomType}
                              options={ROOM_TYPES}
                              onChange={(val) => setEditingOfficialLodge({ ...editingOfficialLodge, roomType: val })}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="edit_official_price" className="text-xs font-bold uppercase tracking-widest text-navy/40 dark:text-white/40">First Payment (₦)</Label>
                            <Input
                              id="edit_official_price"
                              type="number"
                              placeholder="e.g. 350000"
                              value={editingOfficialLodge.price || ""}
                              onChange={(e) => setEditingOfficialLodge({ ...editingOfficialLodge, price: Number(e.target.value) })}
                              className="rounded-xl border-gray-200 dark:border-white/10 bg-transparent text-navy dark:text-white focus:border-gold focus:ring-gold"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit_official_entry_price" className="text-xs font-bold uppercase tracking-widest text-navy/40 dark:text-white/40">To Pay (₦)</Label>
                            <Input
                              id="edit_official_entry_price"
                              type="number"
                              placeholder="e.g. 150000"
                              value={editingOfficialLodge.entryPrice || ""}
                              onChange={(e) => setEditingOfficialLodge({ ...editingOfficialLodge, entryPrice: Number(e.target.value) })}
                              className="rounded-xl border-gray-200 dark:border-white/10 bg-transparent text-navy dark:text-white focus:border-gold focus:ring-gold"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-widest text-navy/40 dark:text-white/40">Lodge Location / Area</Label>
                            <CustomSelect
                              value={editingOfficialLodge.area}
                              options={AREAS}
                              onChange={(val) => setEditingOfficialLodge({ ...editingOfficialLodge, area: val })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-widest text-navy/40 dark:text-white/40">Availability Status</Label>
                            <CustomSelect
                              value={editingOfficialLodge.availability || "available"}
                              options={["available", "pending", "rented"]}
                              onChange={(val) => setEditingOfficialLodge({ ...editingOfficialLodge, availability: val as any })}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase tracking-widest text-navy/40 dark:text-white/40">Publication Status</Label>
                          <CustomSelect
                            value={editingOfficialLodge.status === "Active" ? "active (visible)" : "hidden"}
                            options={["active (visible)", "hidden"]}
                            onChange={(val) => setEditingOfficialLodge({ ...editingOfficialLodge, status: val === "active (visible)" ? "Active" : "Hidden" })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="edit_official_description" className="text-xs font-bold uppercase tracking-widest text-navy/40 dark:text-white/40">Listing Description</Label>
                          <textarea
                            id="edit_official_description"
                            placeholder="Describe building highlights, facilities, and rent details..."
                            value={editingOfficialLodge.description || ""}
                            onChange={(e) => setEditingOfficialLodge({ ...editingOfficialLodge, description: e.target.value })}
                            className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#162535] text-navy dark:text-white px-4 py-3 text-sm focus:border-gold focus:ring-gold outline-none min-h-[100px]"
                          />
                        </div>
                      </div>

                      {/* Amenities block */}
                      <div className="space-y-4">
                        <h3 className="text-base font-bold text-navy dark:text-white border-b border-gray-100 dark:border-white/5 pb-2">Amenities</h3>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {AMENITY_OPTIONS.map((amenity) => {
                            const active = editingOfficialLodge.amenities?.includes(amenity) || false;
                            return (
                              <button
                                key={amenity}
                                type="button"
                                onClick={() => {
                                  const currentAmenities = editingOfficialLodge.amenities || [];
                                  const nextAmenities = currentAmenities.includes(amenity)
                                    ? currentAmenities.filter(a => a !== amenity)
                                    : [...currentAmenities, amenity];
                                  setEditingOfficialLodge({ ...editingOfficialLodge, amenities: nextAmenities });
                                }}
                                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all duration-200 cursor-pointer ${active
                                  ? "bg-gold/10 border-gold text-gold shadow-sm"
                                  : "bg-transparent border-gray-200 dark:border-white/10 text-navy/60 dark:text-white/60 hover:border-navy/30 dark:hover:border-white/30"
                                  }`}
                              >
                                {amenity}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Photos upload block */}
                      <div className="space-y-4">
                        <h3 className="text-base font-bold text-navy dark:text-white border-b border-gray-100 dark:border-white/5 pb-2">Photos</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          {(editingOfficialLodge.photos || []).map((photo, index) => (
                            <div key={index} className="aspect-square rounded-2xl overflow-hidden relative border border-gray-100 group shadow-sm bg-gray-50">
                              <img src={photo} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => {
                                  const currentPhotos = editingOfficialLodge.photos || [];
                                  setEditingOfficialLodge({ ...editingOfficialLodge, photos: currentPhotos.filter((_, idx) => idx !== index) });
                                }}
                                className="absolute inset-0 bg-black/55 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer border-0"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              const newPhoto = `https://picsum.photos/400/300?random=${Date.now()}`;
                              const currentPhotos = editingOfficialLodge.photos || [];
                              setEditingOfficialLodge({ ...editingOfficialLodge, photos: [...currentPhotos, newPhoto] });
                              toast.success("Photo added (simulated)");
                            }}
                            className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/10 flex flex-col items-center justify-center text-gray-400 hover:border-gold hover:text-gold transition-all duration-200 group cursor-pointer bg-transparent"
                          >
                            <Plus className="h-6 w-6" />
                            <span className="text-[10px] mt-1.5 font-bold uppercase tracking-wider">Add Photo</span>
                          </button>
                        </div>
                      </div>

                      {/* Form Action buttons */}
                      <div className="border-t border-gray-100 dark:border-white/5 pt-6 flex justify-end gap-3 font-sans">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => {
                            setActiveTab("official");
                            setEditingOfficialLodge(null);
                          }}
                          className="rounded-xl font-bold text-gray-500 hover:bg-gray-100"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          className="rounded-xl bg-gold hover:bg-gold/90 text-navy font-extrabold px-8 shadow-lg shadow-gold/20 flex items-center gap-2 border-0 cursor-pointer"
                        >
                          Save Changes
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
              {activeTab === "view-official" && viewingOfficialLodge && (
                <div className="space-y-6 text-left">
                  {/* Back button and title */}
                  <div className="mb-6 flex flex-wrap items-center justify-between gap-3 px-4 sm:px-0">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("official");
                        setViewingOfficialLodge(null);
                      }}
                      className="inline-flex items-center gap-2 rounded-full border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0f1e2d] dark:lg:bg-[#121212] px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm transition hover:border-gold hover:text-gold cursor-pointer"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back to listings
                    </button>
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#C9952A]/15 bg-[#C9952A]/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#8f6d18]">
                      <ImageIcon className="h-4 w-4" />
                      Room Detail
                    </div>
                  </div>

                  {(() => {
                    const amenities = (viewingOfficialLodge.amenities && viewingOfficialLodge.amenities.length > 0)
                      ? viewingOfficialLodge.amenities
                      : ["Solar power", "Borehole water", "WiFi", "Security", "POP Ceiling", "Tiled floor"];
                    const description = viewingOfficialLodge.description || `Premium ${viewingOfficialLodge.roomType} located in ${viewingOfficialLodge.area}. Features modern standard utilities, tiled floors, stable borehole water pressure, and secure compound gates. Outstanding choice for FUTO students seeking comfort, convenience, and peace of mind.`;
                    const photos = (viewingOfficialLodge.photos && viewingOfficialLodge.photos.length > 0)
                      ? viewingOfficialLodge.photos
                      : [
                        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80",
                        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80",
                        "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=600&q=80"
                      ];

                    return (
                      <div className="grid gap-8 lg:grid-cols-[100%] lg:items-start max-w-4xl mx-auto">
                        <div className="space-y-6 min-w-0">
                          <div className="rounded-3xl sm:rounded-4xl border border-black/5 dark:border-white/5 bg-white dark:bg-[#0f1e2d] dark:lg:bg-[#121212] p-4 shadow-sm sm:p-5">
                            <div className="flex items-center justify-between gap-3 px-1 pb-4">
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold">
                                  {viewingOfficialLodge.roomType}
                                </p>
                                <h1 className="mt-2 text-2xl font-semibold tracking-tight text-navy dark:text-white sm:text-3xl">
                                  {viewingOfficialLodge.name}
                                </h1>
                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{viewingOfficialLodge.area} · CampusHub Official</p>
                              </div>
                              <div className="hidden rounded-2xl bg-[#f7efe0] dark:bg-white/5 px-4 py-3 text-right sm:block">
                                <p className="text-xs uppercase tracking-[0.24em] text-gray-500 dark:text-gray-400">First Payment</p>
                                <p className="mt-1 text-lg font-semibold text-navy dark:text-gold">{formatNaira(viewingOfficialLodge.price ?? 250000)}</p>
                              </div>
                            </div>

                            <div className="space-y-3">
                              {/* Main Photo Display */}
                              <div
                                className="relative h-64 sm:h-105 w-full overflow-hidden rounded-3xl border border-black/5 dark:border-white/5 bg-gray-100 dark:bg-white/5 group cursor-pointer"
                                onTouchStart={handleTouchStart}
                                onTouchEnd={(e) => handleTouchEnd(e, photos.length)}
                              >
                                <img
                                  src={photos[activePhotoIndex] || photos[0]}
                                  alt={`${viewingOfficialLodge.name} photo ${activePhotoIndex + 1}`}
                                  className="h-full w-full object-cover transition-all duration-300"
                                />

                                {/* Overlay indicators */}
                                <span className="absolute left-4 top-4 rounded-full bg-black/55 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                                  Photo {activePhotoIndex + 1} of {photos.length}
                                </span>

                                {/* Left Arrow */}
                                {photos.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setActivePhotoIndex((prev) =>
                                        prev === 0 ? photos.length - 1 : prev - 1
                                      )
                                    }
                                    className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur transition hover:bg-black/60 opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                                    aria-label="Previous photo"
                                  >
                                    <ChevronLeft className="h-6 w-6" />
                                  </button>
                                )}

                                {/* Right Arrow */}
                                {photos.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setActivePhotoIndex((prev) =>
                                        prev === photos.length - 1 ? 0 : prev + 1
                                      )
                                    }
                                    className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur transition hover:bg-black/60 opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                                    aria-label="Next photo"
                                  >
                                    <ChevronRight className="h-6 w-6" />
                                  </button>
                                )}
                              </div>

                              {/* Thumbnails */}
                              <div className="flex gap-2 overflow-x-auto py-1 w-full max-w-full px-2 sm:px-0">
                                {photos.map((photo, index) => (
                                  <button
                                    key={photo}
                                    type="button"
                                    onClick={() => setActivePhotoIndex(index)}
                                    className={`h-16 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition cursor-pointer ${activePhotoIndex === index ? "border-gold shadow-md" : "border-gray-200 dark:border-white/10 opacity-60 hover:opacity-100"}`}
                                  >
                                    <img src={photo} alt="Thumbnail" className="h-full w-full object-cover" />
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="grid gap-6">
                            <div className="rounded-2xl border border-black/5 dark:border-white/5 bg-white dark:bg-[#0f1e2d] dark:lg:bg-[#121212] p-6 lg:p-8 shadow-sm">
                              <div className="flex flex-wrap items-center gap-3">
                                <span className="rounded-full bg-[#f7efe0] dark:bg-white/5 px-4 py-2 text-sm font-semibold text-navy dark:text-white">
                                  {viewingOfficialLodge.roomType}
                                </span>
                                <span className={`rounded-full px-4 py-2 text-sm font-semibold ${viewingOfficialLodge.availability === "available" ? "bg-emerald-100 text-emerald-700" : viewingOfficialLodge.availability === "pending" ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"}`}>
                                  {viewingOfficialLodge.availability ? (viewingOfficialLodge.availability.charAt(0).toUpperCase() + viewingOfficialLodge.availability.slice(1)) : 'Available'}
                                </span>
                                <span className="rounded-full bg-gray-100 dark:bg-white/10 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                  First Payment {formatNaira(viewingOfficialLodge.price ?? 250000)}
                                </span>
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 dark:bg-blue-950/30 px-4 py-2 text-sm font-semibold text-blue-700 dark:text-blue-400">
                                  <Eye className="h-4 w-4" />
                                  {viewingOfficialLodge.viewsCount ?? 12} Views
                                </span>
                              </div>

                              <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                <div>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                                  <p className="mt-1 text-base font-medium text-gray-700 dark:text-white">{viewingOfficialLodge.area}</p>
                                </div>

                                <div className="mt-3 lg:mt-0 text-right">
                                  <p className="text-sm text-gray-500 dark:text-gray-400">To Pay</p>
                                  <p className="mt-1 text-3xl font-extrabold text-navy dark:text-white lg:text-4xl">{formatNaira(viewingOfficialLodge.entryPrice ?? 0)}/yr</p>
                                </div>
                              </div>

                              <div className="mt-6">
                                <h2 className="text-lg font-semibold text-navy dark:text-white">Highlights & Amenities</h2>
                                <div className="mt-3 grid auto-rows-auto grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                                  {amenities.map((amenity) => (
                                    <span key={amenity} className="inline-flex items-center justify-center rounded-lg border border-gray-200 dark:border-white/10 bg-[#fcfcfc] dark:bg-white/5 px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
                                      {amenity}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              {/* About Section */}
                              <div className="mt-6">
                                <h2 className="text-lg font-semibold text-navy dark:text-white">About This Apartment</h2>
                                <p className="mt-3 text-sm leading-relaxed text-navy/70 dark:text-gray-300 whitespace-pre-line bg-gray-50/50 dark:bg-navy/10 p-5 rounded-2xl border border-gray-100 dark:border-white/5">
                                  {description}
                                </p>
                              </div>

                              {/* Lodge & Building Details */}
                              <div className="mt-6 rounded-2xl border border-black/5 dark:border-white/5 bg-[#fcfcfc] dark:bg-white/5 p-6 shadow-sm">
                                <h3 className="text-base font-semibold text-navy dark:text-white mb-4">Lodge & Building Details</h3>
                                <div className="grid gap-4 sm:grid-cols-2">
                                  <div className="space-y-2">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Lodge Name</p>
                                    <p className="text-sm font-medium text-navy dark:text-white">{viewingOfficialLodge.name}</p>
                                  </div>
                                  <div className="space-y-2">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Location / Area</p>
                                    <p className="text-sm font-medium text-navy dark:text-white">{viewingOfficialLodge.area}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
              {activeTab === "analytics" && (
                <AnalyticsTab />
              )}
              {activeTab === "settings" && (
                <Card className="border-none shadow-sm">
                  <CardHeader>
                    <CardTitle>System Settings</CardTitle>
                    <CardDescription>Configuration for the CampusHub platform.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Settings configuration placeholder. Future updates will allow platform-wide tweaks.</p>
                  </CardContent>
                </Card>
              )}

              {activeTab === "marketplace" && (
                <div className="space-y-6 text-left">
                  <Card className="border-none shadow-sm">
                    <CardHeader>
                      <CardTitle>Marketplace Management</CardTitle>
                      <CardDescription>Monitor and moderate student peer-to-peer item listings.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-2xl border border-navy/5 dark:border-white/5 overflow-hidden">
                        <Table>
                          <TableHeader className="bg-navy/5 dark:bg-white/5 font-bold">
                            <TableRow>
                              <TableHead className="w-12 font-bold"></TableHead>
                              <TableHead className="font-bold">Item Title</TableHead>
                              <TableHead className="font-bold">Seller Name</TableHead>
                              <TableHead className="font-bold">Category</TableHead>
                              <TableHead className="font-bold">Price</TableHead>
                              <TableHead className="font-bold">Status</TableHead>
                              <TableHead className="font-bold">Date Listed</TableHead>
                              <TableHead className="text-right font-bold">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {marketplaceItems.length > 0 ? (
                              marketplaceItems.map((item) => (
                                <TableRow key={item.id}>
                                  <TableCell>
                                    <div className="h-10 w-10 rounded-lg overflow-hidden border border-black/5 dark:border-white/5 bg-gray-50 flex items-center justify-center shrink-0">
                                      {item.photos && item.photos.length > 0 ? (
                                        <img src={item.photos[0]} alt="" className="h-full w-full object-cover" />
                                      ) : (
                                        <ShoppingBag className="h-4 w-4 text-gray-300" />
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell className="font-bold">{item.title}</TableCell>
                                  <TableCell className="text-xs font-semibold">{item.seller_name}</TableCell>
                                  <TableCell>
                                    <span className="bg-navy/5 dark:bg-white/5 px-2 py-0.5 rounded-full text-xs font-semibold text-muted-foreground">
                                      {item.category}
                                    </span>
                                  </TableCell>
                                  <TableCell className="font-extrabold text-gold">{formatNaira(item.price)}</TableCell>
                                  <TableCell>
                                    <span className={cn(
                                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                                      item.status === 'active' ? "bg-green-100 text-green-700 dark:bg-green-950/35 dark:text-green-400" :
                                      item.status === 'sold' ? "bg-blue-100 text-blue-700 dark:bg-blue-950/35 dark:text-blue-400" :
                                      "bg-red-100 text-red-700 dark:bg-red-950/35 dark:text-red-400"
                                    )}>
                                      {item.status}
                                    </span>
                                  </TableCell>
                                  <TableCell className="text-xs text-muted-foreground">
                                    {new Date(item.created_at).toLocaleDateString()}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setViewingMarketplaceItem(item)}
                                        className="font-bold border-navy/10 dark:border-white/10"
                                      >
                                        View
                                      </Button>
                                      {item.status === 'active' ? (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => handleAdminDeleteMarketplaceItem(item.id, false)}
                                          className="text-rose-500 hover:text-rose-600 dark:hover:bg-rose-950/30 font-bold border-rose-200"
                                        >
                                          Remove
                                        </Button>
                                      ) : (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => handleAdminRestoreMarketplaceItem(item.id)}
                                          className="text-green-600 hover:text-green-700 font-bold border-green-200"
                                        >
                                          Restore
                                        </Button>
                                      )}
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleAdminDeleteMarketplaceItem(item.id, true)}
                                        className="text-muted-foreground hover:text-red-500 font-bold"
                                      >
                                        Delete Perm
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                  No marketplace items listed.
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === "services" && (
                <div className="space-y-6 text-left">
                  <div className="flex justify-between items-center bg-white dark:bg-[#0f1d2e] p-6 rounded-3xl border border-black/5 dark:border-white/5 shadow-sm">
                    <div>
                      <h2 className="text-xl font-extrabold text-navy dark:text-white">Service Providers Directory</h2>
                      <p className="text-xs text-muted-foreground mt-1">Manage and curate handy service helper listings for students.</p>
                    </div>
                    <Button
                      onClick={handleOpenAddProvider}
                      className="bg-gold hover:bg-gold/90 text-navy font-bold rounded-full px-5 py-2.5 transition"
                    >
                      <Plus className="h-4 w-4 mr-2" /> Add New Provider
                    </Button>
                  </div>

                  <Card className="border-none shadow-sm">
                    <CardContent className="pt-6">
                      <div className="rounded-2xl border border-navy/5 dark:border-white/5 overflow-hidden">
                        <Table>
                          <TableHeader className="bg-navy/5 dark:bg-white/5 font-bold">
                            <TableRow>
                              <TableHead className="font-bold">Provider Info</TableHead>
                              <TableHead className="font-bold">Service Type</TableHead>
                              <TableHead className="font-bold">Phone / WhatsApp</TableHead>
                              <TableHead className="font-bold">Area Served</TableHead>
                              <TableHead className="font-bold">Status</TableHead>
                              <TableHead className="text-right font-bold">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {serviceProviders.length > 0 ? (
                              serviceProviders.map((provider) => (
                                <TableRow key={provider.id}>
                                  <TableCell className="font-bold">{provider.name}</TableCell>
                                  <TableCell>
                                    <span className="bg-gold/10 text-gold px-2.5 py-0.5 rounded-full text-xs font-bold uppercase">
                                      {provider.service_type}
                                    </span>
                                  </TableCell>
                                  <TableCell className="text-xs font-semibold">{provider.phone}</TableCell>
                                  <TableCell className="text-xs text-muted-foreground">{provider.area}</TableCell>
                                  <TableCell>
                                    <span className={cn(
                                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                                      provider.is_active ? "bg-green-100 text-green-700 dark:bg-green-950/35 dark:text-green-400" : "bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-400"
                                    )}>
                                      {provider.is_active ? "Active" : "Inactive"}
                                    </span>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleOpenEditProvider(provider)}
                                        className="font-bold border-navy/10 dark:border-white/10"
                                      >
                                        Edit
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteProvider(provider.id)}
                                        className="text-rose-500 hover:text-rose-600 dark:hover:bg-rose-950/30 font-bold"
                                      >
                                        Delete
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                  No service providers curated yet.
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
              {activeTab === "service-applications" && (
                <div className="space-y-6 text-left">
                  <ServiceApplicationsTab
                    applications={serviceApplications}
                    handleApprove={handleApproveServiceApp}
                    handleReject={handleRejectServiceApp}
                    handleViewEmail={handleViewServiceAppEmail}
                  />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Add / Edit Service Provider Modal */}
      <AnimatePresence>
        {isProviderModalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProviderModalOpen(false)}
              className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
            />
            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 m-auto h-fit max-h-[90vh] w-full max-w-lg bg-white dark:bg-[#0f1d2e] dark:lg:bg-[#121212] rounded-[2.5rem] overflow-y-auto border border-black/5 dark:border-white/5 z-50 p-6 md:p-8 text-left shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/5">
                <div>
                  <h2 className="text-xl font-extrabold text-navy dark:text-white">
                    {editingProvider ? "Edit Service Provider" : "Add Service Provider"}
                  </h2>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Curate and configure vetted help profile details.</p>
                </div>
                <button
                  onClick={() => setIsProviderModalOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 hover:text-navy dark:hover:text-white cursor-pointer border-0 bg-transparent"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveProviderSubmit} className="space-y-4 pt-4">
                {/* Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Provider / Business Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. FUTO Laundry Hub, Chinedu Plumbing..."
                    value={providerForm.name}
                    onChange={(e) => setProviderForm({ ...providerForm, name: e.target.value })}
                    className="w-full rounded-xl bg-gray-55/20 dark:bg-white/5 text-navy dark:text-white px-4 py-3 text-xs border border-navy/5 dark:border-white/5 outline-none focus:ring-1 focus:ring-gold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Service Type */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Service Type *</label>
                    <select
                      value={providerForm.service_type}
                      onChange={(e) => setProviderForm({ ...providerForm, service_type: e.target.value as any })}
                      className="w-full rounded-xl bg-gray-50 dark:bg-white/5 text-navy dark:text-white px-4 py-3 text-xs border border-navy/5 dark:border-white/5 outline-none focus:ring-1 focus:ring-gold"
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
                      value={providerForm.area}
                      onChange={(e) => setProviderForm({ ...providerForm, area: e.target.value })}
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
                      value={providerForm.phone}
                      onChange={(e) => setProviderForm({ ...providerForm, phone: e.target.value })}
                      className="w-full rounded-xl bg-gray-55/20 dark:bg-white/5 text-navy dark:text-white px-4 py-3 text-xs border border-navy/5 dark:border-white/5 outline-none focus:ring-1 focus:ring-gold"
                    />
                  </div>

                  {/* WhatsApp */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400">WhatsApp (Optional)</label>
                    <input
                      type="text"
                      placeholder="Leave blank if same as phone"
                      value={providerForm.whatsapp}
                      onChange={(e) => setProviderForm({ ...providerForm, whatsapp: e.target.value })}
                      className="w-full rounded-xl bg-gray-55/20 dark:bg-white/5 text-navy dark:text-white px-4 py-3 text-xs border border-navy/5 dark:border-white/5 outline-none focus:ring-1 focus:ring-gold"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Description *</label>
                  <textarea
                    required
                    placeholder="Provide details about standard charges, service time, work portfolio..."
                    value={providerForm.description}
                    onChange={(e) => setProviderForm({ ...providerForm, description: e.target.value })}
                    rows={3}
                    className="w-full rounded-xl bg-gray-55/20 dark:bg-white/5 text-navy dark:text-white px-4 py-3 text-xs border border-navy/5 dark:border-white/5 outline-none focus:ring-1 focus:ring-gold resize-none"
                  />
                </div>

                 {/* Photo URL */}
                <div className="space-y-2">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Photo URL (Optional)</label>
                    <input
                      type="text"
                      placeholder="Paste an image address link"
                      value={providerForm.photo_url}
                      onChange={(e) => setProviderForm({ ...providerForm, photo_url: e.target.value })}
                      className="w-full rounded-xl bg-gray-55/20 dark:bg-white/5 text-navy dark:text-white px-4 py-3 text-xs border border-navy/5 dark:border-white/5 outline-none focus:ring-1 focus:ring-gold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block">Or Upload Provider Image</label>
                    {providerForm.photo_url && (
                      <div className="mb-2 h-20 w-32 rounded-xl overflow-hidden border border-black/5 dark:border-white/5 bg-gray-50">
                        <img src={providerForm.photo_url} alt="Preview" className="h-full w-full object-cover" />
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setProviderForm({ ...providerForm, photo_url: reader.result as string });
                            toast.success("Image uploaded & loaded");
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="w-full text-xs text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-gold/10 file:text-gold hover:file:bg-gold/20"
                    />
                  </div>
                </div>

                {/* Active Toggle */}
                <label className="flex items-center gap-3 pt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={providerForm.is_active}
                    onChange={(e) => setProviderForm({ ...providerForm, is_active: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-gold focus:ring-gold cursor-pointer"
                  />
                  <span className="text-xs font-bold text-navy dark:text-white uppercase tracking-wider">Visible in directory (Active)</span>
                </label>

                {/* Submit button */}
                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsProviderModalOpen(false)}
                    className="rounded-full bg-gray-150 hover:bg-gray-250 dark:bg-white/5 dark:hover:bg-white/10 px-6 py-3 font-bold text-xs text-navy dark:text-white transition cursor-pointer border-0"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-full bg-gold hover:bg-gold/90 px-6 py-3 font-bold text-xs text-navy shadow-md transition cursor-pointer border-0"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* --- Simulated Email Notification Dialog --- */}
      <Dialog open={isEmailModalOpen} onOpenChange={setIsEmailModalOpen}>
        <DialogContent className="max-w-md rounded-[2rem] p-0 overflow-hidden border-none bg-white dark:bg-[#0f1d2e] text-left shadow-2xl">
          <DialogHeader className="p-6 bg-[#0f1e2d] text-white relative">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Mail className="h-5 w-5 text-gold" />
              Simulated Email Alert
            </DialogTitle>
            <DialogDescription className="text-white/60">
              This simulates the email notification received by CampusHub admins.
            </DialogDescription>
            <button
              type="button"
              onClick={() => setIsEmailModalOpen(false)}
              className="absolute right-6 top-6 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition"
              aria-label="Close dialog"
            >
              <X className="h-4 w-4" />
            </button>
          </DialogHeader>

          {simulatedEmailDetails && (
            <div className="p-6 bg-gray-50/50 dark:bg-[#0f1d2e] space-y-4">
              <div className="bg-white dark:bg-[#0f1d2e] p-4 rounded-xl border border-gray-100 dark:border-white/5 space-y-2">
                <p className="text-xs text-muted-foreground">
                  <span className="font-bold text-navy dark:text-white">To:</span> {simulatedEmailDetails.to}
                </p>
                <p className="text-xs text-muted-foreground">
                  <span className="font-bold text-navy dark:text-white">Subject:</span> {simulatedEmailDetails.subject}
                </p>
              </div>

              <div className="bg-white dark:bg-[#0f1d2e] p-5 rounded-2xl border border-gray-100 dark:border-white/5 whitespace-pre-line text-sm text-navy dark:text-white leading-relaxed font-sans shadow-inner">
                {simulatedEmailDetails.body}
              </div>
            </div>
          )}

          <DialogFooter className="p-6 bg-gray-50 dark:bg-white/5 border-t border-gray-100 dark:border-white/10 flex justify-end">
            <Button
              type="button"
              onClick={() => setIsEmailModalOpen(false)}
              className="rounded-xl bg-gold hover:bg-gold/90 text-[#0f1e2d] font-bold px-6"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- Admin Notification Drawer (Slide-out from Right) --- */}
      <AnimatePresence>
        {isNotificationOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNotificationOpen(false)}
              className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
            />

            {/* Notification Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed top-0 right-0 h-full w-full max-w-md lg:max-w-sm bg-white dark:bg-[#121212] z-50 shadow-2xl border-l border-black/5 dark:border-white/5 flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-100 dark:border-white/10 flex items-center justify-between bg-[#0f1e2d] dark:bg-[#121212] text-white">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold tracking-tight">Notifications</h2>
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="bg-gold text-navy font-bold text-xs h-5 w-5 rounded-full flex items-center justify-center animate-pulse">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  {notifications.length > 0 && (
                    <button
                      onClick={handleMarkAllNotificationsRead}
                      className="text-xs font-semibold text-gray-300 hover:text-white flex items-center gap-1 bg-transparent border-0 cursor-pointer p-0 transition"
                    >
                      <Check className="h-4 w-4 text-green-400" />
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setIsNotificationOpen(false)}
                    className="text-gray-400 hover:text-white bg-transparent border-0 cursor-pointer p-1 rounded-lg hover:bg-white/10 transition"
                    aria-label="Close drawer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Notifications List */}
              <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-white/5">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={cn(
                        "p-5 flex items-start gap-4 transition-colors relative group",
                        notif.read ? "bg-white dark:bg-[#121212]" : "bg-gray-50/50 dark:bg-white/[0.02]"
                      )}
                    >
                      {/* Icon */}
                      <div className="shrink-0 mt-0.5">
                        {notif.type === 'report' ? (
                          <div className="h-8 w-8 rounded-full bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-rose-500">
                            <AlertCircle size={16} />
                          </div>
                        ) : notif.type === 'application' ? (
                          <div className="h-8 w-8 rounded-full bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-500">
                            <ClipboardCheck size={16} />
                          </div>
                        ) : notif.type === 'listing' ? (
                          <div className="h-8 w-8 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                            <Home size={16} />
                          </div>
                        ) : notif.type === 'signup' ? (
                          <div className="h-8 w-8 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-500">
                            <UserPlus size={16} />
                          </div>
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-gray-50 dark:bg-gray-500/10 flex items-center justify-center text-gray-500">
                            <CheckCircle size={16} />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div
                        onClick={() => {
                          setNotifications(prev => {
                            const updated = prev.map(n => n.id === notif.id ? { ...n, read: true } : n);
                            localStorage.setItem("admin_notifications", JSON.stringify(updated));
                            return updated;
                          });
                          if (notif.title.includes("Service Application")) {
                            const relatedApp = serviceApplications.find(a => notif.body.includes(a.name));
                            if (relatedApp) {
                              handleViewServiceAppEmail(relatedApp);
                            } else {
                              setSimulatedEmailDetails({
                                to: "admin@campushub.com",
                                subject: notif.title,
                                body: notif.body
                              });
                              setIsEmailModalOpen(true);
                              setIsNotificationOpen(false);
                            }
                          } else {
                            const relatedAgentApp = applications.find(a => notif.body.includes(a.name));
                            if (relatedAgentApp) {
                              handleViewSimulatedEmail(relatedAgentApp);
                            }
                          }
                        }}
                        className="flex-1 min-w-0 pr-6 cursor-pointer"
                      >
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-sm text-navy dark:text-white truncate">
                            {notif.title}
                          </h4>
                          {!notif.read && (
                            <span className="shrink-0 h-2 w-2 rounded-full bg-gold" />
                          )}
                        </div>
                        <p className="text-xs text-navy/70 dark:text-gray-300 mt-1 leading-relaxed whitespace-pre-wrap">
                          {notif.body}
                        </p>
                        <span className="text-[10px] text-muted-foreground mt-2 block font-medium">
                          {notif.timestamp}
                        </span>
                      </div>

                      {/* Delete Action button */}
                      <button
                        onClick={() => handleDeleteNotification(notif.id)}
                        className="absolute right-4 top-5 text-muted-foreground hover:text-rose-500 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity bg-transparent border-0 cursor-pointer"
                        aria-label="Delete notification"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center space-y-3">
                    <div className="h-12 w-12 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center text-muted-foreground mx-auto">
                      <BellOff size={20} />
                    </div>
                    <p className="text-sm text-muted-foreground">No notifications at the moment.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* View Marketplace Item Modal */}
      <AnimatePresence>
        {viewingMarketplaceItem && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewingMarketplaceItem(null)}
              className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
            />
            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 m-auto h-fit max-h-[90vh] w-full max-w-lg bg-white dark:bg-[#0f1d2e] dark:lg:bg-[#121212] rounded-[2.5rem] overflow-y-auto border border-black/5 dark:border-white/5 z-50 p-6 md:p-8 text-left shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/5">
                <div>
                  <h2 className="text-xl font-extrabold text-navy dark:text-white">
                    Marketplace Item Details
                  </h2>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Moderate listing properties and seller contact details.</p>
                </div>
                <button
                  onClick={() => setViewingMarketplaceItem(null)}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 hover:text-navy dark:hover:text-white cursor-pointer border-0 bg-transparent"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-6 pt-4">
                {/* Images Carousel / Grid */}
                {viewingMarketplaceItem.photos && viewingMarketplaceItem.photos.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {viewingMarketplaceItem.photos.map((photo, i) => (
                      <div key={i} className="aspect-video rounded-xl overflow-hidden border border-black/5 dark:border-white/5 bg-gray-50">
                        <img src={photo} alt="" className="h-full w-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Item Title</span>
                      <p className="text-sm font-extrabold text-navy dark:text-white">{viewingMarketplaceItem.title}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Price</span>
                      <p className="text-sm font-extrabold text-gold">{formatNaira(viewingMarketplaceItem.price)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Category</span>
                      <p className="text-xs font-semibold text-navy/70 dark:text-gray-300">{viewingMarketplaceItem.category}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Condition</span>
                      <p className="text-xs font-semibold text-navy/70 dark:text-gray-300">{viewingMarketplaceItem.condition}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Location Area</span>
                      <p className="text-xs font-semibold text-navy/70 dark:text-gray-300">{viewingMarketplaceItem.area}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Status</span>
                      <p className="text-xs font-semibold text-navy/70 dark:text-gray-300 capitalize">{viewingMarketplaceItem.status}</p>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Seller Details</span>
                    <div className="text-xs font-semibold text-navy/80 dark:text-gray-200 mt-0.5">
                      {viewingMarketplaceItem.seller_name} ({viewingMarketplaceItem.seller_phone})
                    </div>
                  </div>

                  {viewingMarketplaceItem.description && (
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Description</span>
                      <p className="text-xs text-navy/70 dark:text-gray-300 leading-relaxed mt-1 whitespace-pre-wrap bg-gray-55/20 dark:bg-white/5 p-3 rounded-xl border border-black/5 dark:border-white/5">
                        {viewingMarketplaceItem.description}
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-4 flex justify-end gap-2 border-t border-black/5 dark:border-white/5">
                  {viewingMarketplaceItem.status === 'active' ? (
                    <Button
                      variant="outline"
                      onClick={() => {
                        handleAdminDeleteMarketplaceItem(viewingMarketplaceItem.id, false);
                        setViewingMarketplaceItem(null);
                      }}
                      className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 font-bold border-rose-200"
                    >
                      Remove Item
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => {
                        handleAdminRestoreMarketplaceItem(viewingMarketplaceItem.id);
                        setViewingMarketplaceItem(null);
                      }}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50 font-bold border-green-200"
                    >
                      Restore Item
                    </Button>
                  )}
                  <Button
                    onClick={() => setViewingMarketplaceItem(null)}
                    className="bg-gold text-navy hover:bg-gold/90 font-extrabold"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
