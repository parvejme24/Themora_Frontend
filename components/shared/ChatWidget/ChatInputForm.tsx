"use client";

import React from "react";
import { FiSliders, FiSend, FiCode } from "react-icons/fi";

interface ChatInputFormProps {
  input: string;
  onChangeInput: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onOpenBrief: () => void;
}

export default function ChatInputForm({
  input,
  onChangeInput,
  onSubmit,
  onOpenBrief,
}: ChatInputFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="border-t border-slate-100 bg-slate-50/70 p-2.5 dark:border-white/10 dark:bg-[#070A24]/90"
    >
      <div className="flex items-center gap-1.5 rounded-xl border border-slate-200/90 bg-white p-1 shadow-2xs transition focus-within:border-[#1D6FE0] dark:border-white/10 dark:bg-white/[0.04]">
        <button
          type="button"
          onClick={onOpenBrief}
          title="Send custom project brief"
          aria-label="Open custom project brief form"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition hover:bg-[#1D6FE0]/15 hover:text-[#1D6FE0] dark:bg-white/10 dark:text-slate-300 cursor-pointer"
        >
          <FiSliders className="h-3.5 w-3.5" />
        </button>
        <input
          type="text"
          value={input}
          onChange={(e) => onChangeInput(e.target.value)}
          placeholder="Ask anything or describe your project..."
          className="min-w-0 flex-1 bg-transparent px-2.5 py-1.5 text-xs text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          aria-label="Send message"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-[#1D6FE0] to-[#6D5DFC] text-white shadow-xs transition hover:opacity-90 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
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
  );
}
