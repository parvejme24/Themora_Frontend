"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function NotFound() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { when: "beforeChildren", staggerChildren: 0.12 },
    },
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const popIn = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
  };

  const buttonsParent = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.15 } },
  };

  const buttonItem = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  };
  return (
    <motion.div
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#F5F7FB] via-[#EBF3FF] to-[#E4EEFF] dark:from-[#05070f] dark:via-[#0b1433] dark:to-[#050a1f]"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* animated background orbs */}
      <motion.div
        className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-[#9CC2FF] blur-3xl opacity-30"
        initial={{ scale: 0.9, opacity: 0.2 }}
        animate={{ scale: 1, opacity: 0.3 }}
        transition={{ duration: 1.2, repeat: Infinity, repeatType: "reverse" }}
      />
      <motion.div
        className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-[#0F59BC] blur-3xl opacity-20"
        initial={{ scale: 0.9, opacity: 0.15 }}
        animate={{ scale: 1.05, opacity: 0.2 }}
        transition={{ duration: 1.6, repeat: Infinity, repeatType: "reverse" }}
      />

      {/* subtle grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #0F5BBD 1px, transparent 1px), linear-gradient(to bottom, #0F5BBD 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 text-center px-6">
        <motion.div
          className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#BBD8FC]/60 dark:border-[#2a4281] px-4 py-1 text-xs uppercase tracking-wider text-[#0F59BC] dark:text-[#9CC2FF] bg-white/60 dark:bg-white/5 backdrop-blur"
          variants={fadeUp}
        >
          Oops! Page not found
        </motion.div>

        <motion.h1
          className="text-[84px] md:text-[120px] font-extrabold leading-none bg-clip-text text-transparent bg-gradient-to-r from-[#0F59BC] to-[#0F35A7] drop-shadow-sm"
          variants={popIn}
        >
          404
        </motion.h1>
        <motion.h2
          className="mt-3 text-2xl md:text-3xl font-semibold text-[#0F1E3A] dark:text-white"
          variants={fadeUp}
        >
          We couldn’t find that page
        </motion.h2>
        <motion.p
          className="mt-3 max-w-xl mx-auto text-sm md:text-base text-gray-600 dark:text-gray-300"
          variants={fadeUp}
        >
          The link may be broken or the page may have been moved. Try going back
          or head to the homepage.
        </motion.p>

        <motion.div className="mt-8 flex items-center justify-center gap-2 md:gap-3" variants={buttonsParent}>
          <motion.div variants={buttonItem}>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm md:px-6 md:py-3 md:text-base text-white bg-gradient-to-r from-[#0F59BC] to-[#0F35A7] shadow-sm hover:opacity-90 transition"
            >
              Back to home
            </Link>
          </motion.div>
          <motion.div variants={buttonItem}>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm md:px-6 md:py-3 md:text-base border-2 border-[#0F5BBD] text-[#0F5BBD] dark:border-[#305aa8] dark:text-[#9CC2FF] hover:bg-[#0F59BC] hover:text-white transition"
            >
              Contact support
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
