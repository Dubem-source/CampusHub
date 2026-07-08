"use client";

import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { RoommateNoticeboardContent } from "@/components/student/RoommateNoticeboardContent";

export default function RoommateNoticeboard() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f8f9fa] dark:bg-navy/10">
      <Header />
      <main className="flex-1 px-4 py-8 md:px-8 lg:px-10 lg:py-12">
        <div className="mx-auto max-w-7xl">
          <RoommateNoticeboardContent />
        </div>
      </main>
      <Footer />
    </div>
  );
}
