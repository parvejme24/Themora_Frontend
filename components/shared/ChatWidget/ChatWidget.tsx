"use client";

import React, { useState, useEffect, useRef } from "react";
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
  FiSmile,
  FiRotateCcw,
  FiCheckCircle,
  FiStar,
} from "react-icons/fi";

interface Message {
  id: string;
  sender: "bot" | "user";
  text: string;
  timestamp: string;
  suggestions?: { label: string; action: string }[];
  cards?: {
    title: string;
    description: string;
    href: string;
    tag?: string;
    icon?: "theme" | "blog" | "pricing" | "contact";
  }[];
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: "welcome-1",
    sender: "bot",
    text: "👋 Hi there! Welcome to **Themora**. I'm your AI assistant. How can I help you today?",
    timestamp: "Just now",
    suggestions: [
      { label: "🎨 Find best templates", action: "find_templates" },
      { label: "✍️ Read latest blogs", action: "read_blogs" },
      { label: "💎 Pricing & licenses", action: "pricing_info" },
      { label: "🚀 Custom build request", action: "custom_build" },
    ],
  },
];

const BOT_RESPONSES: Record<string, Omit<Message, "id" | "sender" | "timestamp">> = {
  find_templates: {
    text: "We offer hand-crafted, production-ready templates across multiple modern frameworks and design tools. Here are our most popular collections:",
    cards: [
      {
        title: "Next.js & React Templates",
        description: "High-performance SaaS apps, landing pages & web apps.",
        href: "/template?search=React",
        tag: "Bestseller",
        icon: "theme",
      },
      {
        title: "Figma UI Kits & Source Files",
        description: "Pixel-perfect design systems with components & autolayout.",
        href: "/template?search=Figma",
        tag: "Design",
        icon: "theme",
      },
      {
        title: "Webflow & Framer Themes",
        description: "Interactive, fluid animations for modern agencies.",
        href: "/template?search=Webflow",
        tag: "No-Code",
        icon: "theme",
      },
    ],
    suggestions: [
      { label: "Browse All Templates", action: "browse_all_templates" },
      { label: "💎 Check Pricing Plans", action: "pricing_info" },
    ],
  },
  read_blogs: {
    text: "Explore our latest design guides, full-stack development tutorials, and UI/UX case studies:",
    cards: [
      {
        title: "Themora Blog & Guides",
        description: "Deep dives into Next.js 15, Tailwind design tokens, and modern web architectures.",
        href: "/blogs",
        tag: "Tutorials",
        icon: "blog",
      },
      {
        title: "Design System Best Practices",
        description: "How to build scalable Figma tokens and clean React components.",
        href: "/blogs",
        tag: "UI/UX",
        icon: "blog",
      },
    ],
    suggestions: [
      { label: "🎨 Explore Themes", action: "find_templates" },
      { label: "📩 Contact Support", action: "contact_support" },
    ],
  },
  pricing_info: {
    text: "Themora offers flexible plans with lifetime access, free updates, and Figma source files included:",
    cards: [
      {
        title: "Flexible Pricing Plans",
        description: "Individual, Professional, and Unlimited Agency tiers.",
        href: "/pricing",
        tag: "Lifetime Access",
        icon: "pricing",
      },
    ],
    suggestions: [
      { label: "🎨 Browse Templates", action: "find_templates" },
      { label: "🚀 Start a Custom Project", action: "custom_build" },
    ],
  },
  custom_build: {
    text: "Need a custom-tailored web app, mobile application, or design overhaul? Our engineering team builds bespoke solutions from concept to launch.",
    cards: [
      {
        title: "Custom Engineering & Design",
        description: "Talk to our product leads about your project requirements.",
        href: "/contact",
        tag: "Build With Us",
        icon: "contact",
      },
    ],
    suggestions: [
      { label: "🎨 View Our Templates", action: "find_templates" },
      { label: "✍️ Read Articles", action: "read_blogs" },
    ],
  },
  browse_all_templates: {
    text: "You can explore our complete catalog with search, category filtering, and live demos here:",
    cards: [
      {
        title: "Explore All Products",
        description: "Over 2,000+ hand-picked digital themes, plugins & templates.",
        href: "/template",
        tag: "All Products",
        icon: "theme",
      },
    ],
  },
  contact_support: {
    text: "Our dedicated support team is available 24/7 to answer questions, provide license guidance, or assist with integration.",
    cards: [
      {
        title: "Contact Support Team",
        description: "Send a message or reach us directly through our help center.",
        href: "/contact",
        tag: "24/7 Help",
        icon: "contact",
      },
    ],
  },
};

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, isOpen]);

  // Show floating teaser notification after 4s
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNotification(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  const handleAction = (actionKey: string, customLabel?: string) => {
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
      const botResponse = BOT_RESPONSES[actionKey] || {
        text: `Here is information regarding **${userText}**. Let us know if you need anything else!`,
        suggestions: [
          { label: "🎨 Browse Templates", action: "find_templates" },
          { label: "✍️ Read Blogs", action: "read_blogs" },
          { label: "💎 View Pricing", action: "pricing_info" },
        ],
      };

      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: botResponse.text,
        timestamp: "Just now",
        cards: botResponse.cards,
        suggestions: botResponse.suggestions,
      };

      setMessages((prev) => [...prev, botMsg]);
    }, 800);
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
      const lower = query.toLowerCase();
      let matchedKey = "";

      if (lower.includes("theme") || lower.includes("template") || lower.includes("next") || lower.includes("react") || lower.includes("framer") || lower.includes("webflow") || lower.includes("figma") || lower.includes("ui")) {
        matchedKey = "find_templates";
      } else if (lower.includes("blog") || lower.includes("article") || lower.includes("tutorial") || lower.includes("guide") || lower.includes("read") || lower.includes("learn")) {
        matchedKey = "read_blogs";
      } else if (lower.includes("price") || lower.includes("pricing") || lower.includes("plan") || lower.includes("cost") || lower.includes("license") || lower.includes("buy")) {
        matchedKey = "pricing_info";
      } else if (lower.includes("custom") || lower.includes("hire") || lower.includes("service") || lower.includes("build") || lower.includes("agency") || lower.includes("contact") || lower.includes("help") || lower.includes("support")) {
        matchedKey = "custom_build";
      }

      if (matchedKey && BOT_RESPONSES[matchedKey]) {
        const resp = BOT_RESPONSES[matchedKey];
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: "bot",
            text: resp.text,
            timestamp: "Just now",
            cards: resp.cards,
            suggestions: resp.suggestions,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: "bot",
            text: `I found some resources related to "${query}". You can browse our hand-curated templates, read insightful blogs, or talk with our team:`,
            timestamp: "Just now",
            cards: [
              {
                title: `Search "${query}" in Templates`,
                description: "Explore matching themes and components in our marketplace.",
                href: `/template?search=${encodeURIComponent(query)}`,
                tag: "Search",
                icon: "theme",
              },
              {
                title: "Browse Themora Articles",
                description: "Latest insights, tutorials, and UI engineering tips.",
                href: "/blogs",
                tag: "Blog",
                icon: "blog",
              },
            ],
            suggestions: [
              { label: "🎨 Browse All Templates", action: "browse_all_templates" },
              { label: "💎 View Pricing", action: "pricing_info" },
              { label: "🚀 Custom Project Request", action: "custom_build" },
            ],
          },
        ]);
      }
    }, 900);
  };

  const handleReset = () => {
    setMessages(INITIAL_MESSAGES);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end pointer-events-auto select-none">
      {/* Floating Teaser Notification (when closed) */}
      <AnimatePresence>
        {!isOpen && showNotification && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="mb-3 max-w-[280px] rounded-2xl border border-slate-200/90 bg-white/95 p-3.5 shadow-2xl backdrop-blur-xl dark:border-white/15 dark:bg-[#0D1130]/95"
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
                  <span>Themora Assistant</span>
                </div>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                  Looking for a template, design blog, or custom project?
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

      {/* Chat Window Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="mb-3 flex h-[540px] max-h-[82vh] w-[92vw] sm:w-[390px] flex-col overflow-hidden rounded-[26px] border border-slate-200/90 bg-white shadow-[0_25px_70px_-15px_rgba(15,23,42,0.4)] backdrop-blur-2xl dark:border-white/15 dark:bg-[#070A24]"
          >
            {/* Header */}
            <div className="relative flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-[#1D6FE0] via-[#5B4DF5] to-[#7C5CFC] px-4 py-3.5 text-white">
              <div className="flex items-center gap-2.5">
                <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 shadow-xs backdrop-blur">
                  <FiZap className="h-4 w-4 text-amber-300" />
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold leading-tight">Themora Assistant</h3>
                  <p className="text-[10px] text-blue-100">Themes · Blogs · Pricing · Support</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleReset}
                  title="Reset conversation"
                  aria-label="Reset chat"
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

            {/* Chat Body Message Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 [scrollbar-width:thin]">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                >
                  {/* Bubble */}
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-[13px] leading-relaxed shadow-xs ${
                      msg.sender === "user"
                        ? "bg-gradient-to-r from-[#1D6FE0] to-[#6D5DFC] text-white rounded-br-xs"
                        : "border border-slate-100 bg-slate-50 text-slate-800 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100 rounded-bl-xs"
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>
                  </div>

                  {/* Rich Cards (if any) */}
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

                  {/* Suggestion action pills */}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {msg.suggestions.map((sug, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleAction(sug.action, sug.label)}
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

            {/* Input Form */}
            <form
              onSubmit={handleSend}
              className="border-t border-slate-100 bg-slate-50/70 p-2.5 dark:border-white/10 dark:bg-[#070A24]/90"
            >
              <div className="flex items-center gap-1.5 rounded-xl border border-slate-200/90 bg-white p-1 shadow-2xs transition focus-within:border-[#1D6FE0] dark:border-white/10 dark:bg-white/[0.04]">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about themes, blogs, pricing..."
                  className="min-w-0 flex-1 bg-transparent px-2.5 py-1.5 text-xs text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
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
                <span>Themora AI Navigator</span>
                <span>Fast 24/7 Response</span>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => {
          setIsOpen(!isOpen);
          setShowNotification(false);
        }}
        aria-label={isOpen ? "Close chat widget" : "Open chat widget"}
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
