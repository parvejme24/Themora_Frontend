"use client";

import React, { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/Providers/AuthProvider";
import Sidebar from "@/components/modules/DadhboardModules/dashboard/Sidebar";
import Topbar from "@/components/modules/DadhboardModules/dashboard/Topbar";
import { LoadingState } from "@/components/shared/Feedback/Spinner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authContext = useContext(AuthContext);
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (authContext && !authContext.user && !authContext.loading) {
      router.replace("/login");
    }
  }, [authContext, router]);

  if (authContext?.loading) {
    return <LoadingState className="min-h-screen bg-[#F5F7FB] dark:bg-[#05071A]" />;
  }

  if (!authContext?.user) {
    // Optionally, you can return null or a spinner here
    return null;
  }

  return (
    <div className="tf-dashboard tf-noise relative min-h-screen bg-gradient-to-b from-[#F5F7FB] to-[#EAF2FF] dark:from-[#05071A] dark:to-[#0B0E20] lg:flex lg:h-screen lg:overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col lg:h-screen">
        <Topbar onMenuToggle={() => setSidebarOpen((open) => !open)} />
        <main className="relative isolate min-w-0 flex-1 overflow-x-clip overflow-y-auto">
          {/* Hero band: grid + aurora blobs, same recipe as the public page heroes */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[560px] overflow-hidden [mask-image:linear-gradient(to_bottom,#000_55%,transparent)]">
            <div className="absolute inset-0 bg-gradient-to-b from-[#EEF3FC] to-transparent dark:from-[#070A24]" />
            <div className="tf-grid-bg absolute inset-0" />
            <div className="tf-aurora absolute -left-32 -top-40 h-[420px] w-[420px] rounded-full bg-[#3B82F6]/20 blur-[110px] dark:bg-[#2563EB]/25" />
            <div className="tf-aurora-slow absolute -right-24 -top-16 h-[380px] w-[380px] rounded-full bg-[#8B5CF6]/15 blur-[110px] dark:bg-[#7C3AED]/25" />
          </div>
          <div className="mx-auto w-full max-w-[1560px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
