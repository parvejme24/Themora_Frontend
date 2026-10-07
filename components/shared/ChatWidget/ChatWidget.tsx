"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ContextMode, Message, ProjectBriefData } from "./types";
import {
  INITIAL_MESSAGES,
  INITIAL_PROJECT_BRIEF,
  generateContextualResponse,
} from "./chatContextEngine";
import ChatHeader from "./ChatHeader";
import ChatModeTabs from "./ChatModeTabs";
import ChatMessageList from "./ChatMessageList";
import ProjectBriefModal from "./ProjectBriefModal";
import ChatInputForm from "./ChatInputForm";
import ChatTeaserNotification from "./ChatTeaserNotification";
import ChatWidgetButton from "./ChatWidgetButton";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [activeMode, setActiveMode] = useState<ContextMode>("all");
  const [isTyping, setIsTyping] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [isBriefModalOpen, setIsBriefModalOpen] = useState(false);
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
      <ChatTeaserNotification
        show={!isOpen && showNotification}
        onOpen={() => {
          setIsOpen(true);
          setShowNotification(false);
        }}
        onDismiss={() => setShowNotification(false)}
      />

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
            <ChatHeader onReset={handleReset} onClose={() => setIsOpen(false)} />

            {/* Scrollable Mode Tabs Bar */}
            <ChatModeTabs activeMode={activeMode} onSelectMode={handleModeChange} />

            {/* Message Stream */}
            <ChatMessageList
              messages={messages}
              isTyping={isTyping}
              messagesEndRef={messagesEndRef}
              onSelectSuggestion={handleSendAction}
              onCloseChat={() => setIsOpen(false)}
            />

            {/* Interactive Project Brief Builder Drawer */}
            <ProjectBriefModal
              isOpen={isBriefModalOpen}
              brief={brief}
              onChangeBrief={setBrief}
              onSubmit={handleSubmitBrief}
              onClose={() => setIsBriefModalOpen(false)}
            />

            {/* Input Form Footer */}
            <ChatInputForm
              input={input}
              onChangeInput={setInput}
              onSubmit={handleSend}
              onOpenBrief={() => setIsBriefModalOpen(true)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <ChatWidgetButton
        isOpen={isOpen}
        onToggle={() => {
          setIsOpen(!isOpen);
          setShowNotification(false);
        }}
      />
    </div>
  );
}
