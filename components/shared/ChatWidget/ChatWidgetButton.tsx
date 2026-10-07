"use client";

import React from "react";
import { motion } from "framer-motion";
import { FiMessageSquare, FiX } from "react-icons/fi";

interface ChatWidgetButtonProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function ChatWidgetButton({ isOpen, onToggle }: ChatWidgetButtonProps) {
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      onClick={onToggle}
      aria-label={isOpen ? "Close context assistant" : "Open context assistant"}
      className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-[#1D6FE0] via-[#5B4DF5] to-[#7C5CFC] text-white shadow-[0_12px_30px_-5px_rgba(29,111,224,0.5)] transition-all duration-300 hover:shadow-[0_16px_40px_-5px_rgba(29,111,224,0.7)] cursor-pointer"
    >
      {/* Glow ambient ring */}
      <span className="absolute -inset-1 -z-10 rounded-full bg-gradient-to-r from-[#1D6FE0] to-[#7C5CFC] opacity-40 blur-md transition group-hover:opacity-70" />

      {/* Live Active Status Dot */}
      <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500 dark:border-[#070A24]" />
      </span>

      {isOpen ? (
        <FiX className="h-6 w-6 transition-transform group-hover:rotate-90" />
      ) : (
        <FiMessageSquare className="h-6 w-6" />
      )}
    </motion.button>
  );
}
