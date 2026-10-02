import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import AuthProvider from "@/Providers/AuthProvider";
import SessionProvider from "@/Providers/SessionProvider";
import { Toaster } from "sonner";
import QueryProvider from "@/Providers/QueryProvider";
import ReduxProvider from "@/Providers/ReduxProvider";
import ThemeInitializer from "@/components/ThemeInitializer";
import { ScrollbarFix } from "@/components/ui/scrollbar-fix";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Themora - Premium Template Collections",
  description:
    "Themora is a platform for selling premium templates and plugins.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReduxProvider>
          <QueryProvider>
            <SessionProvider>
              <AuthProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="light"
                enableSystem={false}
                disableTransitionOnChange
                storageKey="theme"
                themes={["light", "dark"]}
                forcedTheme={undefined}
              >
                <ThemeInitializer />
                <ScrollbarFix />
                <Toaster richColors position="top-right" />
                {children}
              </ThemeProvider>
            </AuthProvider>
          </SessionProvider>
        </QueryProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
