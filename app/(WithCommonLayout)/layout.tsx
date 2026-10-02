
import Footer from "@/components/shared/Footer/Footer";
import { Navbar } from "@/components/shared/Navbar/Navbar";
import React from "react";

export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-gradient-to-b from-[#F5F7FB] to-[#EAF2FF] dark:from-[#0B0E20] dark:to-[#0B0E20]">
        {children}
      </main>
      <Footer />
    </div>
  );
}
