"use client";

import React from "react";
import { motion } from "framer-motion";
import { FiSliders, FiX } from "react-icons/fi";
import { ProjectBriefData } from "./types";

interface ProjectBriefModalProps {
  isOpen: boolean;
  brief: ProjectBriefData;
  onChangeBrief: (brief: ProjectBriefData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export default function ProjectBriefModal({
  isOpen,
  brief,
  onChangeBrief,
  onSubmit,
  onClose,
}: ProjectBriefModalProps) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: "100%" }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: "100%" }}
      transition={{ type: "spring", stiffness: 350, damping: 30 }}
      className="absolute inset-x-0 bottom-0 z-40 max-h-[88%] overflow-y-auto rounded-t-[24px] border-t border-slate-200 bg-white p-4 shadow-2xl dark:border-white/15 dark:bg-[#0B0F2E]"
    >
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 dark:border-white/10">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#1D6FE0] text-white">
            <FiSliders className="h-3.5 w-3.5" />
          </span>
          <h4 className="text-xs font-bold text-slate-900 dark:text-white">Custom Project Brief</h4>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close project brief form"
          className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
        >
          <FiX className="h-4 w-4" />
        </button>
      </div>

      <form onSubmit={onSubmit} className="mt-3 space-y-3 text-xs">
        {/* Project Type */}
        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Project Type
          </label>
          <select
            value={brief.projectType}
            onChange={(e) => onChangeBrief({ ...brief, projectType: e.target.value })}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-900 outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
          >
            <option value="SaaS Web Application">SaaS Web Application</option>
            <option value="E-Commerce Store">E-Commerce Store</option>
            <option value="Agency & Portfolio">Agency & Portfolio</option>
            <option value="Mobile App (iOS & Android)">Mobile App (iOS & Android)</option>
            <option value="Custom Design System">Custom Design System</option>
          </select>
        </div>

        {/* Tech Stack */}
        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Preferred Tech Stack
          </label>
          <select
            value={brief.techStack}
            onChange={(e) => onChangeBrief({ ...brief, techStack: e.target.value })}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-900 outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
          >
            <option value="Next.js & Tailwind CSS">Next.js & Tailwind CSS</option>
            <option value="React & Node.js Full-Stack">React & Node.js Full-Stack</option>
            <option value="Figma UI Kit & Design Tokens">Figma UI Kit & Design Tokens</option>
            <option value="Framer / Webflow No-Code">Framer / Webflow No-Code</option>
            <option value="WordPress & PHP">WordPress & PHP</option>
          </select>
        </div>

        {/* Budget Tier */}
        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Estimated Budget / License Tier
          </label>
          <select
            value={brief.budget}
            onChange={(e) => onChangeBrief({ ...brief, budget: e.target.value })}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-900 outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
          >
            <option value="$50 - $199 (Template Purchase)">$50 - $199 (Template Purchase)</option>
            <option value="$500 - $2,500 (Custom MVP)">$500 - $2,500 (Custom MVP)</option>
            <option value="$2,500 - $10,000 (Full Platform)">$2,500 - $10,000 (Full Platform)</option>
            <option value="$10,000+ (Enterprise Overhaul)">$10,000+ (Enterprise Overhaul)</option>
          </select>
        </div>

        {/* Custom Notes */}
        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Specific Requirements / Context
          </label>
          <textarea
            rows={2}
            value={brief.customNotes}
            onChange={(e) => onChangeBrief({ ...brief, customNotes: e.target.value })}
            placeholder="e.g., Needs Stripe billing, dark mode, and multi-tenant admin dashboard..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-900 outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-xl bg-gradient-to-r from-[#1D6FE0] to-[#6D5DFC] py-2.5 font-bold text-white shadow-md transition hover:opacity-90 cursor-pointer"
        >
          Analyze My Brief with AI 🚀
        </button>
      </form>
    </motion.div>
  );
}
