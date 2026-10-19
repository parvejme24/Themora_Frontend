"use client";
import { QueryClientProvider } from "@tanstack/react-query";
import React, { useState } from "react";
import { makeQueryClient } from "@/queryClient";

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  // One client per browser session; a module-level client would be shared across server renders
  const [queryClient] = useState(makeQueryClient);
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
