"use client";

import React from "react";
import ChatMessageItem from "./ChatMessageItem";
import { Message, ContextMode } from "./types";

interface ChatMessageListProps {
  messages: Message[];
  isTyping: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  onSelectSuggestion: (action: string, label: string, mode?: ContextMode) => void;
  onCloseChat: () => void;
}

export default function ChatMessageList({
  messages,
  isTyping,
  messagesEndRef,
  onSelectSuggestion,
  onCloseChat,
}: ChatMessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 [scrollbar-width:thin]">
      {messages.map((msg, msgIdx) => (
        <ChatMessageItem
          key={msg.id}
          msg={msg}
          msgIdx={msgIdx}
          onSelectSuggestion={onSelectSuggestion}
          onCloseChat={onCloseChat}
        />
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
  );
}
