"use client";

import React from "react";
import { motion } from "framer-motion";
import { FiSliders, FiX, FiLayers, FiCode, FiDollarSign } from "react-icons/fi";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ProjectBriefData } from "./types";

interface ProjectBriefModalProps {
  isOpen: boolean;
  brief: ProjectBriefData;
  onChangeBrief: (brief: ProjectBriefData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

const PROJECT_TYPES = [
  "SaaS Web Application",
  "E-Commerce Store",
  "Agency & Portfolio",
  "Mobile App (iOS & Android)",
  "Custom Design System",
];

const TECH_STACKS = [
  "Next.js & Tailwind CSS",
  "React & Node.js Full-Stack",
  "Figma UI Kit & Design Tokens",
  "Framer / Webflow No-Code",
  "WordPress & PHP",
];

const BUDGET_TIERS = [
  "$50 - $199 (Template Purchase)",
  "$500 - $2,500 (Custom MVP)",
  "$2,500 - $10,000 (Full Platform)",
  "$10,000+ (Enterprise Overhaul)",
];

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
      className="absolute inset-x-0 bottom-0 z-40 max-h-[92%] overflow-y-auto rounded-t-[26px] border-t border-slate-200/90 bg-white p-4 shadow-[0_-20px_50px_rgba(0,0,0,0.25)] backdrop-blur-2xl dark:border-white/15 dark:bg-[#0B0F2E]"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 dark:border-white/10">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-[#1D6FE0] to-[#7C5CFC] text-white shadow-xs">
            <FiSliders className="h-3.5 w-3.5" />
          </span>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Custom Project Brief</h4>
            <p className="text-[10px] text-slate-400">Configure your requirements for AI analysis</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close project brief form"
          className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/10 dark:hover:text-white transition cursor-pointer"
        >
          <FiX className="h-4 w-4" />
        </button>
      </div>

      <form onSubmit={onSubmit} className="mt-3.5 space-y-3 text-xs">
        {/* Project Type Dropdown (shadcn Select) */}
        <div>
          <label className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            <FiLayers className="h-3 w-3 text-[#1D6FE0]" />
            <span>Project Type</span>
          </label>
          <Select
            value={brief.projectType}
            onValueChange={(val) => onChangeBrief({ ...brief, projectType: val })}
          >
            <SelectTrigger className="w-full h-9 rounded-xl border border-slate-200/80 bg-slate-50/80 px-3 text-xs text-slate-900 shadow-2xs transition focus:border-[#1D6FE0] focus:ring-1 focus:ring-[#1D6FE0]/20 dark:border-white/10 dark:bg-white/5 dark:text-white">
              <SelectValue placeholder="Select project type" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border border-slate-200 bg-white/95 shadow-xl backdrop-blur-xl dark:border-white/15 dark:bg-[#0B0F2E] z-50">
              <SelectGroup>
                {PROJECT_TYPES.map((type) => (
                  <SelectItem
                    key={type}
                    value={type}
                    className="rounded-lg text-xs hover:bg-[#1D6FE0]/10 focus:bg-[#1D6FE0]/10 cursor-pointer"
                  >
                    {type}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Tech Stack Dropdown (shadcn Select) */}
        <div>
          <label className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            <FiCode className="h-3 w-3 text-[#7C5CFC]" />
            <span>Preferred Tech Stack</span>
          </label>
          <Select
            value={brief.techStack}
            onValueChange={(val) => onChangeBrief({ ...brief, techStack: val })}
          >
            <SelectTrigger className="w-full h-9 rounded-xl border border-slate-200/80 bg-slate-50/80 px-3 text-xs text-slate-900 shadow-2xs transition focus:border-[#1D6FE0] focus:ring-1 focus:ring-[#1D6FE0]/20 dark:border-white/10 dark:bg-white/5 dark:text-white">
              <SelectValue placeholder="Select tech stack" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border border-slate-200 bg-white/95 shadow-xl backdrop-blur-xl dark:border-white/15 dark:bg-[#0B0F2E] z-50">
              <SelectGroup>
                {TECH_STACKS.map((stack) => (
                  <SelectItem
                    key={stack}
                    value={stack}
                    className="rounded-lg text-xs hover:bg-[#7C5CFC]/10 focus:bg-[#7C5CFC]/10 cursor-pointer"
                  >
                    {stack}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Budget Tier Dropdown (shadcn Select) */}
        <div>
          <label className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            <FiDollarSign className="h-3 w-3 text-emerald-500" />
            <span>Estimated Budget / License Tier</span>
          </label>
          <Select
            value={brief.budget}
            onValueChange={(val) => onChangeBrief({ ...brief, budget: val })}
          >
            <SelectTrigger className="w-full h-9 rounded-xl border border-slate-200/80 bg-slate-50/80 px-3 text-xs text-slate-900 shadow-2xs transition focus:border-[#1D6FE0] focus:ring-1 focus:ring-[#1D6FE0]/20 dark:border-white/10 dark:bg-white/5 dark:text-white">
              <SelectValue placeholder="Select budget tier" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border border-slate-200 bg-white/95 shadow-xl backdrop-blur-xl dark:border-white/15 dark:bg-[#0B0F2E] z-50">
              <SelectGroup>
                {BUDGET_TIERS.map((tier) => (
                  <SelectItem
                    key={tier}
                    value={tier}
                    className="rounded-lg text-xs hover:bg-emerald-500/10 focus:bg-emerald-500/10 cursor-pointer"
                  >
                    {tier}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Custom Notes / Requirements (shadcn Textarea) */}
        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Specific Requirements / Context
          </label>
          <Textarea
            rows={2}
            value={brief.customNotes}
            onChange={(e) => onChangeBrief({ ...brief, customNotes: e.target.value })}
            placeholder="e.g., Needs Stripe billing, dark mode, and multi-tenant admin dashboard..."
            className="w-full rounded-xl border border-slate-200/80 bg-slate-50/80 p-2.5 text-xs text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#1D6FE0] focus:ring-1 focus:ring-[#1D6FE0]/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full rounded-xl bg-gradient-to-r from-[#1D6FE0] via-[#5B4DF5] to-[#7C5CFC] py-2.5 font-bold text-white shadow-md transition hover:opacity-90 active:scale-[0.99] cursor-pointer"
        >
          Analyze My Brief with AI 🚀
        </button>
      </form>
    </motion.div>
  );
}
