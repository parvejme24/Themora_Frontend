"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// The chat widget is large and rarely used straight away, so it loads after the page is idle
const ChatWidget = dynamic(() => import("./ChatWidget"), { ssr: false });

export default function LazyChatWidget() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const start = () => setReady(true);
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(start, { timeout: 4000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(start, 2500);
    return () => clearTimeout(id);
  }, []);
  return ready ? <ChatWidget /> : null;
}
