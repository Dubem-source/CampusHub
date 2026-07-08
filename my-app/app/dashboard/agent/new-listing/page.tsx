"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NewListingRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/agent?tab=add-listing");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-navy/10 flex items-center justify-center font-sans">
      <div className="text-center">
        <p className="text-navy dark:text-white font-medium">Redirecting to dashboard...</p>
      </div>
    </div>
  );
}
