"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX } from "react-icons/fi";

interface ChatTeaserNotificationProps {
  show: boolean;
  onOpen: () => void;
  onDismiss: () => void;
}

export default function ChatTeaserNotification({
  show,
  onOpen,
  onDismiss,
}: ChatTeaserNotificationProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.9 }}
          className="mb-3 max-w-[290px] rounded-2xl border border-slate-200/90 bg-white/95 p-3.5 shadow-2xl backdrop-blur-xl dark:border-white/15 dark:bg-[#0D1130]/95"
        >
          <div className="flex items-start justify-between gap-2">
            <div onClick={onOpen} className="cursor-pointer">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Themora Context Assistant</span>
              </div>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                Send your project requirements or get custom template recommendations!
              </p>
            </div>
            <button
              type="button"
              onClick={onDismiss}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              aria-label="Close notification"
            >
              <FiX className="h-3.5 w-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
