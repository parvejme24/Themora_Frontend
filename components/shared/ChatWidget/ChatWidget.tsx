"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiMessageSquare,
  FiX,
  FiSend,
  FiArrowRight,
  FiZap,
  FiLayers,
  FiBookOpen,
  FiDollarSign,
  FiRotateCcw,
  FiCheckCircle,
  FiStar,
  FiSliders,
  FiCode,
  FiCpu,
  FiCopy,
  FiCheck,
  FiPlusCircle,
  FiInfo,
  FiTrash2,
} from "react-icons/fi";

type ContextMode = "all" | "theme_finder" | "blog_guide" | "project_brief" | "pricing_help";

interface MessageCard {
  title: string;
  description: string;
  href: string;
  tag?: string;
  icon?: "theme" | "blog" | "pricing" | "contact" | "code";
}

interface Message {
  id: string;
  sender: "bot" | "user";
  text: string;
  timestamp: string;
  mode?: ContextMode;
  codeSnippet?: { language: string; code: string };
  cards?: MessageCard[];
  suggestions?: { label: string; action: string; mode?: ContextMode }[];
}

interface ProjectBriefData {
  projectType: string;
  techStack: string;
  keyFeatures: string[];
  budget: string;
  customNotes: string;
}

const INITIAL_PROJECT_BRIEF: ProjectBriefData = {
  projectType: "SaaS Web Application",
  techStack: "Next.js & Tailwind CSS",
  keyFeatures: ["Authentication", "Stripe Checkout", "Dark Mode UI"],
  budget: "$500 - $2,500",
  customNotes: "",
};

const INITIAL_MESSAGES: Message[] = [
  {
    id: "welcome-1",
    sender: "bot",
    text: "👋 Hi! Welcome to **Themora Smart Assistant**.\n\nYou can ask any question, share your **own project context & requirements**, or use our quick modes below to get tailored recommendations for templates, blogs, and custom development.",
    timestamp: "Just now",
    suggestions: [
      { label: "📋 Send Custom Project Brief", action: "open_brief_modal" },
      { label: "🎨 Recommend Theme for My Project", action: "mode_theme_finder", mode: "theme_finder" },
      { label: "✍️ Ask Coding / Design Question", action: "mode_blog_guide", mode: "blog_guide" },
      { label: "💎 Licenses & Pricing Breakdown", action: "mode_pricing_help", mode: "pricing_help" },
    ],
  },
];

// Context-aware NLP engine for user messages
function generateContextualResponse(
  query: string,
  mode: ContextMode,
  userBriefHistory?: ProjectBriefData
): Omit<Message, "id" | "sender" | "timestamp"> {
  const q = query.toLowerCase();

  // 1. Check for specific frameworks & stacks
  const mentionsNext = q.includes("next") || q.includes("nextjs") || q.includes("next.js");
  const mentionsReact = q.includes("react") || q.includes("reactjs");
  const mentionsFigma = q.includes("figma") || q.includes("ui kit") || q.includes("source file");
  const mentionsFramer = q.includes("framer");
  const mentionsWebflow = q.includes("webflow");
  const mentionsWordPress = q.includes("wordpress") || q.includes("wp");
  const mentionsSaas = q.includes("saas") || q.includes("dashboard") || q.includes("admin") || q.includes("analytics");
  const mentionsEcommerce = q.includes("ecommerce") || q.includes("shop") || q.includes("store") || q.includes("stripe");
  const mentionsAgency = q.includes("agency") || q.includes("portfolio") || q.includes("personal") || q.includes("freelance");

  // 2. Check for blog / coding / architectural queries
  const isCodingQuestion =
    q.includes("how to") ||
    q.includes("how do") ||
    q.includes("setup") ||
    q.includes("install") ||
    q.includes("code") ||
    q.includes("server action") ||
    q.includes("tailwind") ||
    q.includes("typescript") ||
    q.includes("auth") ||
    q.includes("best practice");

  // 3. Check for custom project / hiring queries
  const isCustomHire =
    q.includes("custom") ||
    q.includes("hire") ||
    q.includes("build for me") ||
    q.includes("agency service") ||
    q.includes("quote") ||
    q.includes("contract") ||
    q.includes("developer");

  // 4. Check for pricing / license queries
  const isPricingQuery =
    q.includes("price") ||
    q.includes("pricing") ||
    q.includes("plan") ||
    q.includes("license") ||
    q.includes("cost") ||
    q.includes("refund") ||
    q.includes("lifetime") ||
    q.includes("subscription");

  // --- Scenario A: User provides a custom Project Brief (structured context) ---
  if (q.includes("project brief") || q.includes("custom brief context")) {
    return {
      text: `🚀 **Project Context Analyzed!**\n\nHere is our architectural summary for your project:\n• **Type:** ${userBriefHistory?.projectType || "Custom Platform"}\n• **Recommended Stack:** ${userBriefHistory?.techStack || "Next.js + Tailwind + TypeScript"}\n• **Key Features:** ${userBriefHistory?.keyFeatures.join(", ") || "Full-Stack features"}\n• **Estimated Budget/Tier:** ${userBriefHistory?.budget || "Flexible"}\n\nWe have pre-built starter templates that can save you 100+ hours, or our engineering team can build it end-to-end:`,
      cards: [
        {
          title: `Matching ${userBriefHistory?.techStack || "Next.js"} Templates`,
          description: "Production-ready foundation with clean architecture and components.",
          href: `/template?search=${encodeURIComponent(userBriefHistory?.techStack.split(" ")[0] || "React")}`,
          tag: "Ready to Deploy",
          icon: "theme",
        },
        {
          title: "Book Custom Engineering Consultation",
          description: "Our leads will review your brief and provide a timeline & estimate.",
          href: "/contact",
          tag: "Talk to Us",
          icon: "contact",
        },
      ],
      suggestions: [
        { label: "🎨 Browse Recommended Templates", action: "browse_all_templates" },
        { label: "💎 View Pricing Plans", action: "mode_pricing_help", mode: "pricing_help" },
      ],
    };
  }

  // --- Scenario B: Coding or Tutorial Question (Blog / Guide Context) ---
  if (isCodingQuestion || mode === "blog_guide") {
    let snippet = undefined;
    if (mentionsNext || q.includes("server action") || q.includes("auth")) {
      snippet = {
        language: "typescript",
        code: `// app/actions/user.ts (Next.js 15 Server Action)\n"use server";\n\nexport async function createUser(data: { email: string; name: string }) {\n  // Validation & Database mutation\n  const res = await db.user.create({ data });\n  return { success: true, user: res };\n}`,
      };
    } else if (mentionsFigma || q.includes("token")) {
      snippet = {
        language: "css",
        code: `/* Figma Tokens in Tailwind CSS */\n:root {\n  --primary: 217 91% 60%;\n  --background: 232 47% 6%;\n  --card: 235 43% 10%;\n}`,
      };
    }

    return {
      text: `💡 **Technical Analysis & Guidance:**\n\nFor your question regarding **"${query}"**, we recommend following modern modular patterns:\n\n1. **Separation of Concerns:** Keep server actions, data hooks, and UI presentation components strictly isolated.\n2. **Type-Safety:** Use TypeScript Zod schemas for all client-to-server contracts.\n3. **Design Tokens:** Rely on consistent HSL color variables for seamless dark/light mode switches.\n\nHere are related in-depth articles and tutorials from the Themora Blog:`,
      codeSnippet: snippet,
      cards: [
        {
          title: "Next.js 15 & Full-Stack Best Practices",
          description: "Complete guide to server components, server actions, and caching.",
          href: "/blogs",
          tag: "Tutorial",
          icon: "blog",
        },
        {
          title: "Scalable Design Systems & UI Tokens",
          description: "Bridging the gap between Figma components and React codebases.",
          href: "/blogs",
          tag: "Design Guide",
          icon: "blog",
        },
      ],
      suggestions: [
        { label: "🎨 View Matching Code Templates", action: "find_templates" },
        { label: "📋 Send Custom Project Brief", action: "open_brief_modal" },
      ],
    };
  }

  // --- Scenario C: Theme & Template Search (Theme Finder Context) ---
  if (mentionsNext || mentionsReact || mentionsFigma || mentionsFramer || mentionsWebflow || mentionsWordPress || mentionsSaas || mentionsEcommerce || mentionsAgency || mode === "theme_finder") {
    let stackName = "Next.js & React";
    let searchParam = "React";
    if (mentionsFigma) {
      stackName = "Figma UI Kit";
      searchParam = "Figma";
    } else if (mentionsFramer) {
      stackName = "Framer";
      searchParam = "Framer";
    } else if (mentionsWebflow) {
      stackName = "Webflow";
      searchParam = "Webflow";
    } else if (mentionsWordPress) {
      stackName = "WordPress";
      searchParam = "WordPress";
    }

    return {
      text: `🎯 **Personalized Theme Recommendations:**\n\nBased on your context (${stackName} ${mentionsSaas ? "· SaaS/Dashboard" : mentionsEcommerce ? "· E-Commerce" : ""}), here are the top hand-curated templates that match your requirements:`,
      cards: [
        {
          title: `${stackName} Premium Collection`,
          description: "Fully responsive, optimized Lighthouse score, dark mode & source assets included.",
          href: `/template?search=${encodeURIComponent(searchParam)}`,
          tag: "Recommended",
          icon: "theme",
        },
        {
          title: "All Hand-Picked Templates",
          description: "Explore 2,000+ templates with live demos, ratings, and instant downloads.",
          href: "/template",
          tag: "Catalog",
          icon: "theme",
        },
      ],
      suggestions: [
        { label: "💎 View Pricing & Lifetime Access", action: "mode_pricing_help", mode: "pricing_help" },
        { label: "📋 Build Custom Project Brief", action: "open_brief_modal" },
      ],
    };
  }

  // --- Scenario D: Pricing & License Queries ---
  if (isPricingQuery || mode === "pricing_help") {
    return {
      text: `💎 **Themora Pricing & Licensing Details:**\n\nEvery template purchased includes **lifetime access**, **free future updates**, and **complete source files (Figma + Code)**.\n\n• **Single License:** Use on 1 personal or client production site.\n• **Pro/Agency License:** Use on unlimited client projects with priority VIP support.\n• **Refund Policy:** 14-day quality guarantee if any technical defect is verified.`,
      cards: [
        {
          title: "Compare All Pricing Plans",
          description: "Choose the plan that fits your business or agency needs.",
          href: "/pricing",
          tag: "Lifetime License",
          icon: "pricing",
        },
        {
          title: "Enterprise & Custom Inquiries",
          description: "Contact our enterprise team for custom licensing terms.",
          href: "/contact",
          tag: "Custom",
          icon: "contact",
        },
      ],
      suggestions: [
        { label: "🎨 Browse Top Templates", action: "find_templates" },
        { label: "📋 Build Custom Brief", action: "open_brief_modal" },
      ],
    };
  }

  // --- Scenario E: Custom Project Build / Agency Services ---
  if (isCustomHire) {
    return {
      text: `🚀 **Themora Custom Development Services:**\n\nOur creative engineering studio builds high-end digital products:\n• **UI/UX & Design Systems:** Figma design tokens, prototypes, brand identity.\n• **Full-Stack Web:** Next.js 15, React, Node.js, Tailwind, PostgreSQL/Prisma.\n• **Mobile Apps:** React Native (iOS & Android cross-platform).\n\nLet's discuss your project scope:`,
      cards: [
        {
          title: "Start a Project with Themora",
          description: "Share your scope, timeline, and budget directly with our team.",
          href: "/contact",
          tag: "Let's Talk",
          icon: "contact",
        },
      ],
      suggestions: [
        { label: "📋 Fill Project Brief Form", action: "open_brief_modal" },
        { label: "🎨 Browse Templates First", action: "find_templates" },
      ],
    };
  }

  // --- Fallback Natural Response ---
  return {
    text: `Thanks for sharing your context! Regarding **"${query}"**, I have gathered our best resources for you.\n\nFeel free to explore our curated template marketplace, read technical blog guides, or fill out a custom project brief below:`,
    cards: [
      {
        title: `Search "${query}" in Marketplace`,
        description: "Find matching themes, UI kits, and plugins.",
        href: `/template?search=${encodeURIComponent(query)}`,
        tag: "Search Results",
        icon: "theme",
      },
      {
        title: "Themora Engineering & Design Blog",
        description: "Tutorials, design system architectures, and framework guides.",
        href: "/blogs",
        tag: "Articles",
        icon: "blog",
      },
    ],
    suggestions: [
      { label: "📋 Send Custom Project Brief", action: "open_brief_modal" },
      { label: "🎨 Recommended Themes", action: "find_templates" },
      { label: "💎 View Pricing", action: "mode_pricing_help", mode: "pricing_help" },
    ],
  };
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [activeMode, setActiveMode] = useState<ContextMode>("all");
  const [isTyping, setIsTyping] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [isBriefModalOpen, setIsBriefModalOpen] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Project Brief Form State
  const [brief, setBrief] = useState<ProjectBriefData>(INITIAL_PROJECT_BRIEF);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, isOpen]);

  // Teaser notification after 4s
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNotification(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  const handleCopyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleModeChange = (mode: ContextMode) => {
    setActiveMode(mode);
    if (mode === "project_brief") {
      setIsBriefModalOpen(true);
      return;
    }

    const modeLabels: Record<ContextMode, string> = {
      all: "All-in-One Assistant",
      theme_finder: "Theme Advisor Mode",
      blog_guide: "Tech & Blog Guide Mode",
      project_brief: "Project Brief Builder",
      pricing_help: "Pricing & Licenses Help",
    };

    const sysMsg: Message = {
      id: `sys-${Date.now()}`,
      sender: "bot",
      text: `Switched to **${modeLabels[mode]}**. How can I assist with your current context?`,
      timestamp: "Just now",
      mode,
    };
    setMessages((prev) => [...prev, sysMsg]);
  };

  const handleSendAction = (actionKey: string, customLabel?: string, targetMode?: ContextMode) => {
    if (actionKey === "open_brief_modal") {
      setIsBriefModalOpen(true);
      return;
    }

    const userText = customLabel || actionKey;
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: userText,
      timestamp: "Just now",
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const response = generateContextualResponse(userText, targetMode || activeMode, brief);
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: response.text,
        timestamp: "Just now",
        codeSnippet: response.codeSnippet,
        cards: response.cards,
        suggestions: response.suggestions,
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 700);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const query = input.trim();
    setInput("");

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: "Just now",
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const response = generateContextualResponse(query, activeMode, brief);
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: response.text,
        timestamp: "Just now",
        codeSnippet: response.codeSnippet,
        cards: response.cards,
        suggestions: response.suggestions,
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 750);
  };

  const handleSubmitBrief = (e: React.FormEvent) => {
    e.preventDefault();
    setIsBriefModalOpen(false);

    const briefSummaryText = `📋 **My Custom Project Context:**\n• **Project Type:** ${brief.projectType}\n• **Tech Stack:** ${brief.techStack}\n• **Key Features:** ${brief.keyFeatures.join(", ")}\n• **Target Budget:** ${brief.budget}${brief.customNotes ? `\n• **Notes:** ${brief.customNotes}` : ""}`;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: briefSummaryText,
      timestamp: "Just now",
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const response = generateContextualResponse("custom brief context", "all", brief);
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: response.text,
        timestamp: "Just now",
        cards: response.cards,
        suggestions: response.suggestions,
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 850);
  };

  const handleReset = () => {
    setMessages(INITIAL_MESSAGES);
    setActiveMode("all");
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end pointer-events-auto select-none">
      {/* Floating Teaser Notification */}
      <AnimatePresence>
        {!isOpen && showNotification && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="mb-3 max-w-[290px] rounded-2xl border border-slate-200/90 bg-white/95 p-3.5 shadow-2xl backdrop-blur-xl dark:border-white/15 dark:bg-[#0D1130]/95"
          >
            <div className="flex items-start justify-between gap-2">
              <div
                onClick={() => {
                  setIsOpen(true);
                  setShowNotification(false);
                }}
                className="cursor-pointer"
              >
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
                onClick={() => setShowNotification(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
                aria-label="Close notification"
              >
                <FiX className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Window Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="relative mb-3 flex h-[580px] max-h-[85vh] w-[94vw] sm:w-[410px] flex-col overflow-hidden rounded-[26px] border border-slate-200/90 bg-white shadow-[0_25px_70px_-15px_rgba(15,23,42,0.4)] backdrop-blur-2xl dark:border-white/15 dark:bg-[#070A24]"
          >
            {/* Top Gradient Header */}
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
                  onClick={handleReset}
                  title="Reset conversation"
                  aria-label="Reset conversation"
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-white/80 transition hover:bg-white/20 hover:text-white"
                >
                  <FiRotateCcw className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  title="Close chat"
                  aria-label="Close chat"
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-white/80 transition hover:bg-white/20 hover:text-white"
                >
                  <FiX className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Context Mode Selector Bar */}
            <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-100 bg-slate-50/90 px-3 py-2 [scrollbar-width:none] dark:border-white/10 dark:bg-[#0B0F2E]/80 [&::-webkit-scrollbar]:hidden">
              {[
                { id: "all", label: "✨ All-in-One", icon: FiZap },
                { id: "project_brief", label: "📋 Send Project Brief", icon: FiSliders },
                { id: "theme_finder", label: "🎨 Theme Finder", icon: FiLayers },
                { id: "blog_guide", label: "✍️ Blogs & Guides", icon: FiBookOpen },
                { id: "pricing_help", label: "💎 Licenses", icon: FiDollarSign },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleModeChange(m.id as ContextMode)}
                  className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[10.5px] font-semibold transition-all ${
                    activeMode === m.id
                      ? "bg-[#1D6FE0] text-white shadow-xs"
                      : "border border-slate-200/80 bg-white text-slate-600 hover:border-[#1D6FE0]/40 hover:text-[#1D6FE0] dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
                  }`}
                >
                  <span>{m.label}</span>
                </button>
              ))}
            </div>

            {/* Message Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 [scrollbar-width:thin]">
              {messages.map((msg, msgIdx) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                >
                  {/* Bubble */}
                  <div
                    className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-[13px] leading-relaxed shadow-xs ${
                      msg.sender === "user"
                        ? "bg-gradient-to-r from-[#1D6FE0] to-[#6D5DFC] text-white rounded-br-xs"
                        : "border border-slate-100 bg-slate-50 text-slate-800 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100 rounded-bl-xs"
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>

                    {/* Optional Code Snippet Block */}
                    {msg.codeSnippet && (
                      <div className="mt-2.5 overflow-hidden rounded-xl border border-slate-200/80 bg-slate-900 text-slate-100 dark:border-white/15 dark:bg-black/80">
                        <div className="flex items-center justify-between bg-slate-800/80 px-3 py-1 text-[10px] text-slate-400">
                          <span className="font-mono uppercase">{msg.codeSnippet.language}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyCode(msg.codeSnippet!.code, msgIdx)}
                            className="flex items-center gap-1 hover:text-white transition"
                          >
                            {copiedIndex === msgIdx ? <FiCheck className="text-emerald-400" /> : <FiCopy />}
                            <span>{copiedIndex === msgIdx ? "Copied" : "Copy"}</span>
                          </button>
                        </div>
                        <pre className="p-3 text-[11px] font-mono leading-relaxed overflow-x-auto text-emerald-300">
                          <code>{msg.codeSnippet.code}</code>
                        </pre>
                      </div>
                    )}
                  </div>

                  {/* Context Resource Cards */}
                  {msg.cards && msg.cards.length > 0 && (
                    <div className="mt-2.5 w-full space-y-2">
                      {msg.cards.map((card, i) => (
                        <Link
                          key={i}
                          href={card.href}
                          onClick={() => setIsOpen(false)}
                          className="group flex items-center justify-between rounded-xl border border-slate-200/80 bg-white p-2.5 shadow-xs transition-all hover:border-[#1D6FE0]/40 hover:bg-slate-50/80 dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.07]"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#1D6FE0]/15 to-[#7C5CFC]/15 text-[#1D6FE0] dark:text-[#8DB8FF]">
                              {card.icon === "blog" ? (
                                <FiBookOpen className="h-3.5 w-3.5" />
                              ) : card.icon === "pricing" ? (
                                <FiDollarSign className="h-3.5 w-3.5" />
                              ) : card.icon === "contact" ? (
                                <FiCheckCircle className="h-3.5 w-3.5" />
                              ) : (
                                <FiLayers className="h-3.5 w-3.5" />
                              )}
                            </span>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="truncate text-xs font-bold text-slate-900 dark:text-white">
                                  {card.title}
                                </p>
                                {card.tag && (
                                  <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.2 text-[8px] font-semibold text-slate-600 dark:bg-white/10 dark:text-slate-300">
                                    {card.tag}
                                  </span>
                                )}
                              </div>
                              <p className="truncate text-[10px] text-slate-500 dark:text-slate-400">
                                {card.description}
                              </p>
                            </div>
                          </div>
                          <FiArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-[#1D6FE0]" />
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Context-aware suggestion pills */}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {msg.suggestions.map((sug, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleSendAction(sug.action, sug.label, sug.mode)}
                          className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10.5px] font-medium text-slate-700 shadow-2xs transition hover:border-[#1D6FE0]/40 hover:bg-slate-50 hover:text-[#1D6FE0] dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                        >
                          {sug.label}
                        </button>
                      ))}
                    </div>
                  )}

                  <span className="mt-1 text-[9px] text-slate-400 px-1">{msg.timestamp}</span>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-xs border border-slate-100 bg-slate-50 px-3.5 py-2 text-xs dark:border-white/10 dark:bg-white/[0.04]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#1D6FE0] animate-bounce" />
                  <span className="h-1.5 w-1.5 rounded-full bg-[#6D5DFC] animate-bounce [animation-delay:0.2s]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-bounce [animation-delay:0.4s]" />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Interactive Project Brief Builder Drawer (Overlay) */}
            <AnimatePresence>
              {isBriefModalOpen && (
                <motion.div
                  initial={{ opacity: 0, y: "100%" }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: "100%" }}
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  className="absolute inset-x-0 bottom-0 z-40 max-h-[85%] overflow-y-auto rounded-t-[24px] border-t border-slate-200 bg-white p-4 shadow-2xl dark:border-white/15 dark:bg-[#0B0F2E]"
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
                      onClick={() => setIsBriefModalOpen(false)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
                    >
                      <FiX className="h-4 w-4" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmitBrief} className="mt-3 space-y-3 text-xs">
                    {/* Project Type */}
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Project Type
                      </label>
                      <select
                        value={brief.projectType}
                        onChange={(e) => setBrief({ ...brief, projectType: e.target.value })}
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
                        onChange={(e) => setBrief({ ...brief, techStack: e.target.value })}
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
                        onChange={(e) => setBrief({ ...brief, budget: e.target.value })}
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
                        Specific Requirements / Questions
                      </label>
                      <textarea
                        rows={2}
                        value={brief.customNotes}
                        onChange={(e) => setBrief({ ...brief, customNotes: e.target.value })}
                        placeholder="e.g., Needs Stripe billing, dark mode, and multi-tenant admin dashboard..."
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-900 outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full rounded-xl bg-gradient-to-r from-[#1D6FE0] to-[#6D5DFC] py-2.5 font-bold text-white shadow-md transition hover:opacity-90"
                    >
                      Analyze My Brief with AI 🚀
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input Form Footer */}
            <form
              onSubmit={handleSend}
              className="border-t border-slate-100 bg-slate-50/70 p-2.5 dark:border-white/10 dark:bg-[#070A24]/90"
            >
              <div className="flex items-center gap-1.5 rounded-xl border border-slate-200/90 bg-white p-1 shadow-2xs transition focus-within:border-[#1D6FE0] dark:border-white/10 dark:bg-white/[0.04]">
                <button
                  type="button"
                  onClick={() => setIsBriefModalOpen(true)}
                  title="Attach project brief"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition hover:bg-[#1D6FE0]/15 hover:text-[#1D6FE0] dark:bg-white/10 dark:text-slate-300"
                >
                  <FiSliders className="h-3.5 w-3.5" />
                </button>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything or describe your project..."
                  className="min-w-0 flex-1 bg-transparent px-2 py-1.5 text-xs text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  aria-label="Send message"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-[#1D6FE0] to-[#6D5DFC] text-white shadow-xs transition hover:opacity-90 disabled:opacity-40 disabled:pointer-events-none"
                >
                  <FiSend className="h-3 w-3" />
                </button>
              </div>
              <div className="mt-1.5 flex items-center justify-between px-1 text-[8.5px] text-slate-400">
                <span className="flex items-center gap-1">
                  <FiCode className="h-2.5 w-2.5" />
                  Themora Context Engine
                </span>
                <span>Press Enter to send</span>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => {
          setIsOpen(!isOpen);
          setShowNotification(false);
        }}
        aria-label={isOpen ? "Close context assistant" : "Open context assistant"}
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-[#1D6FE0] via-[#5B4DF5] to-[#7C5CFC] text-white shadow-[0_12px_30px_-5px_rgba(29,111,224,0.5)] transition-all duration-300 hover:shadow-[0_16px_40px_-5px_rgba(29,111,224,0.7)]"
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
    </div>
  );
}
