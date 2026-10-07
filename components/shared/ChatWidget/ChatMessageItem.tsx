"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FiBookOpen,
  FiDollarSign,
  FiCheckCircle,
  FiLayers,
  FiArrowRight,
  FiCheck,
  FiCopy,
} from "react-icons/fi";
import { Message, ContextMode } from "./types";

interface ChatMessageItemProps {
  msg: Message;
  msgIdx: number;
  onSelectSuggestion: (action: string, label: string, mode?: ContextMode) => void;
  onCloseChat: () => void;
}

export default function ChatMessageItem({
  msg,
  msgIdx,
  onSelectSuggestion,
  onCloseChat,
}: ChatMessageItemProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isUser = msg.sender === "user";

  return (
    <div className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
      {/* Text bubble */}
      <div
        className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-[13px] leading-relaxed shadow-xs ${
          isUser
            ? "bg-gradient-to-r from-[#1D6FE0] to-[#6D5DFC] text-white rounded-br-xs"
            : "border border-slate-100 bg-slate-50 text-slate-800 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100 rounded-bl-xs"
        }`}
      >
        <p className="whitespace-pre-line">{msg.text}</p>

        {/* Code Snippet */}
        {msg.codeSnippet && (
          <div className="mt-2.5 overflow-hidden rounded-xl border border-slate-200/80 bg-slate-900 text-slate-100 dark:border-white/15 dark:bg-black/80">
            <div className="flex items-center justify-between bg-slate-800/80 px-3 py-1 text-[10px] text-slate-400">
              <span className="font-mono uppercase">{msg.codeSnippet.language}</span>
              <button
                type="button"
                onClick={() => handleCopy(msg.codeSnippet!.code)}
                className="flex items-center gap-1 hover:text-white transition cursor-pointer"
              >
                {copied ? <FiCheck className="text-emerald-400" /> : <FiCopy />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
            <pre className="p-3 text-[11px] font-mono leading-relaxed overflow-x-auto text-emerald-300">
              <code>{msg.codeSnippet.code}</code>
            </pre>
          </div>
        )}
      </div>

      {/* Resource Cards */}
      {msg.cards && msg.cards.length > 0 && (
        <div className="mt-2.5 w-full space-y-2">
          {msg.cards.map((card, i) => (
            <Link
              key={i}
              href={card.href}
              onClick={onCloseChat}
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

      {/* Suggestion Chips */}
      {msg.suggestions && msg.suggestions.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {msg.suggestions.map((sug, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onSelectSuggestion(sug.action, sug.label, sug.mode)}
              className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10.5px] font-medium text-slate-700 shadow-2xs transition hover:border-[#1D6FE0]/40 hover:bg-slate-50 hover:text-[#1D6FE0] dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10 cursor-pointer"
            >
              {sug.label}
            </button>
          ))}
        </div>
      )}

      <span className="mt-1 text-[9px] text-slate-400 px-1">{msg.timestamp}</span>
    </div>
  );
}
