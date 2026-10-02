"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, useScroll, useSpring } from "framer-motion";
import { TopNavbar } from "./navbar/TopNavbar";
import { LogoComponent } from "./navbar/LogoComponent";
import { DesktopNavigation } from "./navbar/DesktopNavigation";
import { NavActions } from "./navbar/NavActions";
import { MobileNavigation } from "./navbar/MobileNavigation";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 30, mass: 0.3 });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close the drawer whenever the route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      <TopNavbar />

      <header
        className={`sticky top-0 z-50 transition-[background-color,box-shadow,border-color] duration-500 ${
          scrolled
            ? "border-b border-slate-200/70 bg-white/75 shadow-[0_8px_30px_-12px_rgb(15_53_167/0.18)] backdrop-blur-xl backdrop-saturate-150 dark:border-white/[0.06] dark:bg-[#05071A]/75"
            : "border-b border-transparent bg-[#F5F7FB] dark:bg-[#05071A]"
        }`}
      >
        <nav
          aria-label="Main"
          className={`container mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 transition-[padding] duration-500 sm:px-6 lg:px-8 ${
            scrolled ? "py-2.5" : "py-4"
          }`}
        >
          <LogoComponent />
          <DesktopNavigation pathname={pathname} />
          <NavActions isOpen={isOpen} setIsOpen={setIsOpen} />
        </nav>

        {/* Reading progress */}
        <motion.div
          aria-hidden
          style={{ scaleX: progress }}
          className={`absolute inset-x-0 bottom-0 h-[2px] origin-left bg-gradient-to-r from-[#1D6FE0] via-[#6D5DFC] to-[#22B8F0] transition-opacity duration-500 ${
            scrolled ? "opacity-100" : "opacity-0"
          }`}
        />
      </header>

      <MobileNavigation isOpen={isOpen} setIsOpen={setIsOpen} pathname={pathname} />
    </>
  );
}
