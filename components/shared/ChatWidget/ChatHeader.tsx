"use client";

import React from "react";
import { FiZap, FiRotateCcw, FiX } from "react-icons/fi";

interface ChatHeaderProps {
  onReset: () => void;
  onClose: () => void;
}

export default function ChatHeader({ onReset, onClose }: ChatHeaderProps) {
  return (
    <div className="relative flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-[#1D6FE0] via-[#5B4DF5] to-[#7C5CFC] px-4 py-3 text-white">
      <div className="flex items-center gap-2.5">
        <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 shadow-xs backdrop-blur">
          <FiZap className="h-4 w-4 text-amber-300" />
          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-white" />
        </div>
        <div>
          <h3 className="text-sm font-bold leading-tight">Themora Context Assistant</h3>
          <p className="text-[10px] text-blue-100">AI Navigator · Theme Advisor · Custom Briefs</p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onReset}
          title="Reset conversation"
          aria-label="Reset conversation"
          className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-white/80 transition hover:bg-white/20 hover:text-white"
        >
          <FiRotateCcw className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={onClose}
          title="Close chat"
          aria-label="Close chat"
          className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-white/80 transition hover:bg-white/20 hover:text-white"
        >
          <FiX className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
