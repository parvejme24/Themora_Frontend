"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  ArrowLeft, ArrowRight, BookOpen, Clock3, CornerDownLeft, CreditCard, ExternalLink, FolderKanban, Layers3, LayoutDashboard, LifeBuoy, LogOut, Mail, Menu, PackageCheck, PenSquare, Plus, Search, ShoppingBag, Tags, UserRound, UsersRound, X,
} from "lucide-react";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types/auth";

type Item = { label: string; href: string; icon: typeof LayoutDashboard; keywords?: string; external?: boolean };
type Group = { title: string; items: Item[] };

const adminPages: Item[] = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard, keywords: "home stats revenue analytics" },
  { label: "Themes", href: "/dashboard/templates", icon: Layers3, keywords: "templates products catalog" },
  { label: "Theme categories", href: "/dashboard/templates-categories", icon: Tags, keywords: "template categories" },
  { label: "Blog", href: "/dashboard/blogs", icon: BookOpen, keywords: "posts articles drafts" },
  { label: "Blog categories", href: "/dashboard/blog-categories", icon: FolderKanban, keywords: "topics" },
  { label: "Orders", href: "/dashboard/orders", icon: PackageCheck, keywords: "sales purchases payments refunds" },
  { label: "Users", href: "/dashboard/users", icon: UsersRound, keywords: "customers accounts members admins ban" },
  { label: "Pricing", href: "/dashboard/pricing", icon: CreditCard, keywords: "plans subscriptions" },
  { label: "Newsletter", href: "/dashboard/newsletter", icon: Mail, keywords: "subscribers emails" },
  { label: "Service requests", href: "/dashboard/service-request", icon: LifeBuoy, keywords: "contact inbox leads support" },
  { label: "Profile", href: "/dashboard/profile", icon: UserRound, keywords: "account settings avatar" },
];
const adminActions: Item[] = [
  { label: "Add theme", href: "/dashboard/templates/create", icon: Plus, keywords: "new template create upload" },
  { label: "Write blog post", href: "/dashboard/blogs/create", icon: PenSquare, keywords: "new post article create" },
  { label: "New pricing plan", href: "/dashboard/pricing/create", icon: Plus, keywords: "create plan" },
];
const memberPages: Item[] = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard, keywords: "home" },
  { label: "My purchases", href: "/dashboard/purchases", icon: ShoppingBag, keywords: "downloads bought licenses" },
  { label: "My orders", href: "/dashboard/orders", icon: PackageCheck, keywords: "invoices receipts" },
  { label: "Payment history", href: "/dashboard/payment", icon: CreditCard, keywords: "billing payments" },
  { label: "Service requests", href: "/dashboard/service-request", icon: LifeBuoy, keywords: "support contact project" },
  { label: "Profile", href: "/dashboard/profile", icon: UserRound, keywords: "account settings avatar" },
];
const memberActions: Item[] = [
  { label: "Browse themes", href: "/template", icon: Layers3, keywords: "store marketplace shop" },
  { label: "Start a project request", href: "/contact", icon: Plus, keywords: "hire custom service" },
];

const pageTitles: Record<string, string> = {
  "/dashboard": "Overview", "/dashboard/profile": "Profile", "/dashboard/templates": "Themes",
  "/dashboard/templates-categories": "Theme categories", "/dashboard/blogs": "Blog",
  "/dashboard/blog-categories": "Blog categories", "/dashboard/orders": "Orders",
  "/dashboard/users": "Users", "/dashboard/pricing": "Pricing", "/dashboard/newsletter": "Newsletter",
  "/dashboard/service-request": "Service requests", "/dashboard/purchases": "My purchases",
  "/dashboard/payment": "Payment history", "/dashboard/templates/create": "Add theme",
  "/dashboard/blogs/create": "New post", "/dashboard/pricing/create": "New plan",
};

const RECENT_KEY = "themora:dashboard-recent";

function readRecent(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"); } catch { return []; }
}
function writeRecent(href: string) {
  try { localStorage.setItem(RECENT_KEY, JSON.stringify([href, ...readRecent().filter((h) => h !== href)].slice(0, 4))); } catch { /* storage unavailable */ }
}

export default function Topbar({ onMenuToggle }: { onMenuToggle: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const isAdmin = user?.role === UserRole.ADMIN;
  const pages = isAdmin ? adminPages : memberPages;
  const actions = isAdmin ? adminActions : memberActions;

  const [accountOpen, setAccountOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  const title = pageTitles[pathname] || (pathname.includes("/orders/") ? "Order details" : pathname.includes("/blogs/") ? "Blog editor" : pathname.includes("/templates/") ? "Theme editor" : pathname.includes("/pricing/") ? "Edit plan" : "Workspace");
  const displayName = user?.fullName || user?.email?.split("@")[0] || "Account";
  const initials = displayName.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase();

  // Remember visited dashboard pages for the "Recent" suggestions
  useEffect(() => {
    if (pageTitles[pathname]) writeRecent(pathname);
    setRecent(readRecent());
    setAccountOpen(false);
  }, [pathname]);

  const groups: Group[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      const recentItems = recent.filter((href) => href !== pathname).map((href) => [...pages, ...actions].find((i) => i.href === href)).filter(Boolean) as Item[];
      return [
        ...(recentItems.length ? [{ title: "Recent", items: recentItems.slice(0, 3).map((i) => ({ ...i, icon: Clock3 })) }] : []),
        { title: "Quick actions", items: actions },
        { title: "Pages", items: pages.filter((p) => !recentItems.slice(0, 3).some((r) => r.href === p.href)) },
      ];
    }
    const match = (i: Item) => `${i.label} ${i.keywords ?? ""}`.toLowerCase().includes(q);
    const result: Group[] = [];
    const pageHits = pages.filter(match);
    const actionHits = actions.filter(match);
    if (pageHits.length) result.push({ title: "Pages", items: pageHits });
    if (actionHits.length) result.push({ title: "Actions", items: actionHits });
    result.push({ title: "Store", items: [{ label: `Search themes for “${query.trim()}”`, href: `/template?search=${encodeURIComponent(query.trim())}`, icon: ExternalLink, external: true }] });
    return result;
  }, [query, pages, actions, recent, pathname]);

  const flat = useMemo(() => groups.flatMap((g) => g.items), [groups]);
  useEffect(() => setActiveIndex(0), [query, searchOpen]);

  const closeSearch = useCallback(() => { setSearchOpen(false); setMobileSearch(false); setQuery(""); }, []);
  const go = useCallback((item: Item) => {
    closeSearch();
    inputRef.current?.blur();
    router.push(item.href);
  }, [closeSearch, router]);

  // ⌘K / Ctrl+K opens search from anywhere in the dashboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (window.matchMedia("(min-width: 768px)").matches) inputRef.current?.focus();
        else setMobileSearch(true);
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => { if (mobileSearch) requestAnimationFrame(() => mobileInputRef.current?.focus()); }, [mobileSearch]);

  // Close the account menu on outside click or Escape
  useEffect(() => {
    if (!accountOpen) return;
    const onPointer = (e: PointerEvent) => { if (!accountRef.current?.contains(e.target as Node)) setAccountOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setAccountOpen(false); };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("pointerdown", onPointer); document.removeEventListener("keydown", onKey); };
  }, [accountOpen]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIndex((i) => (i + 1) % Math.max(flat.length, 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActiveIndex((i) => (i - 1 + flat.length) % Math.max(flat.length, 1)); }
    else if (e.key === "Enter" && flat[activeIndex]) { e.preventDefault(); go(flat[activeIndex]); }
    else if (e.key === "Escape") { closeSearch(); (e.target as HTMLInputElement).blur(); }
  };

  const suggestions = (
    <div role="listbox" id="dashboard-search-results" className="max-h-[min(70vh,440px)] overflow-y-auto p-1.5">
      {groups.map((group) => (
        <div key={group.title} className="py-1">
          <p className="px-2.5 pb-1 pt-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-400">{group.title}</p>
          {group.items.map((item) => {
            const index = flat.indexOf(item);
            const active = index === activeIndex;
            const Icon = item.icon;
            return (
              <button
                key={`${group.title}-${item.href}`}
                type="button"
                role="option"
                aria-selected={active}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => go(item)}
                className={`flex w-full cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm transition ${active ? "bg-slate-100 text-slate-900 dark:bg-white/[0.07] dark:text-white" : "text-slate-600 dark:text-slate-300"}`}
              >
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${active ? "bg-white text-[#1D6FE0] shadow-sm dark:bg-white/10 dark:text-[#8DB8FF]" : "bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400"}`}>
                  <Icon size={14} aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                {item.href === pathname && <span className="text-[11px] text-slate-400">Current</span>}
                {active && (item.external ? <ExternalLink size={13} className="text-slate-400" /> : <CornerDownLeft size={13} className="text-slate-400" />)}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );

  const searchFooter = (
    <div className="hidden items-center gap-3 border-t border-slate-100 px-3 py-2 text-[11px] text-slate-400 sm:flex dark:border-white/[0.06]">
      <span><kbd className="rounded border border-slate-200 px-1 font-sans dark:border-white/10">↑</kbd> <kbd className="rounded border border-slate-200 px-1 font-sans dark:border-white/10">↓</kbd> to move</span>
      <span><kbd className="rounded border border-slate-200 px-1 font-sans dark:border-white/10">↵</kbd> to open</span>
      <span><kbd className="rounded border border-slate-200 px-1 font-sans dark:border-white/10">esc</kbd> to close</span>
    </div>
  );

  return (
    <header className="sticky top-0 z-30 flex h-[72px] shrink-0 items-center justify-between gap-3 border-b border-slate-200/70 bg-white/75 px-3 backdrop-blur-xl backdrop-saturate-150 sm:px-5 lg:px-7 dark:border-white/[0.06] dark:bg-[#05071A]/75">
      <div className="flex min-w-0 items-center gap-3">
        <button type="button" onClick={onMenuToggle} aria-label="Open dashboard navigation" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:text-slate-900 lg:hidden dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:text-white">
          <Menu size={19} aria-hidden="true" />
        </button>
        <div className="min-w-0">
          <p className="hidden truncate font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#1D6FE0] sm:block dark:text-[#8DB8FF]">Themora / Workspace</p>
          <h1 className="truncate text-base font-semibold tracking-tight text-slate-900 sm:mt-0.5 sm:text-lg dark:text-white">{title}</h1>
        </div>
      </div>

      <div className="flex min-w-0 items-center gap-2 sm:gap-2.5">
        {/* Search (tablet / desktop) */}
        <div className="relative hidden w-[clamp(220px,28vw,360px)] md:block">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input
            ref={inputRef}
            role="combobox"
            aria-expanded={searchOpen}
            aria-controls="dashboard-search-results"
            aria-label="Search the dashboard"
            placeholder="Search pages and actions…"
            value={query}
            onFocus={() => setSearchOpen(true)}
            onBlur={() => setSearchOpen(false)}
            onChange={(e) => { setQuery(e.target.value); setSearchOpen(true); }}
            onKeyDown={onKeyDown}
            className="h-10 w-full rounded-full border border-slate-200 bg-white pl-10 pr-14 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#1D6FE0] focus:ring-[3px] focus:ring-[#1D6FE0]/15 dark:border-white/10 dark:bg-white/5 dark:text-white"
          />
          <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-sans text-[10px] text-slate-400 dark:border-white/10 dark:bg-white/5">⌘K</kbd>
          {searchOpen && (
            <div className="absolute right-0 top-12 z-40 w-full min-w-[320px] overflow-hidden rounded-2xl border border-slate-200 bg-white/95 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-[#0B0F2E]/95">
              {suggestions}
              {searchFooter}
            </div>
          )}
        </div>

        {/* Search (phone) */}
        <button type="button" onClick={() => { setMobileSearch(true); setSearchOpen(true); }} aria-label="Search" className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:text-slate-900 md:hidden dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:text-white">
          <Search size={17} aria-hidden="true" />
        </button>
        {mobileSearch && createPortal(
          <div className="tf-dashboard fixed inset-0 z-[60] md:hidden">
            <button type="button" aria-label="Close search" onClick={closeSearch} className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" />
            <div className="relative border-b border-slate-200 bg-white dark:border-white/10 dark:bg-[#0B0F2E]">
              <div className="flex h-[72px] items-center gap-2 px-3">
                <button type="button" onClick={closeSearch} aria-label="Back" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10"><ArrowLeft size={18} /></button>
                <div className="relative min-w-0 flex-1">
                  <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                  <input ref={mobileInputRef} role="combobox" aria-expanded aria-controls="dashboard-search-results" aria-label="Search the dashboard" placeholder="Search pages and actions…" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={onKeyDown} className="h-10 w-full rounded-full border border-slate-200 bg-slate-50 pl-10 pr-9 text-sm text-slate-900 outline-none focus:border-[#1D6FE0] dark:border-white/10 dark:bg-white/5 dark:text-white" />
                  {query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-slate-400"><X size={14} /></button>}
                </div>
              </div>
              <div className="border-t border-slate-100 dark:border-white/[0.06]">{suggestions}</div>
            </div>
          </div>,
          document.body
        )}

        <ModeToggle />

        {/* Account: avatar only; details live in the menu */}
        <div ref={accountRef} className="relative">
          <button type="button" aria-label="Account menu" aria-expanded={accountOpen} onClick={() => setAccountOpen((open) => !open)} className="cursor-pointer rounded-full bg-gradient-to-br from-[#1D6FE0] via-[#6D5DFC] to-[#22B8F0] p-[2px] transition hover:shadow-lg hover:shadow-[#3F5BF0]/30">
            <span className="block rounded-full bg-white p-[2px] dark:bg-[#05071A]">
              <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#1D6FE0] to-[#7C5CFC] text-xs font-bold text-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {user?.profile?.avatarUrl ? <img src={user.profile.avatarUrl} alt="" className="h-full w-full object-cover" /> : initials}
              </span>
            </span>
          </button>
          {accountOpen && (
            <>
              <div className="absolute right-0 top-14 z-40 w-64 rounded-2xl border border-slate-200 bg-white/95 p-1.5 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-[#0B0F2E]/95">
                <div className="rounded-xl bg-slate-50 p-3 dark:bg-white/5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{displayName}</p>
                    <span className="shrink-0 rounded-full bg-[#EAF1FF] px-2 py-0.5 text-[10px] font-medium text-[#0F5BBD] dark:bg-[#1D6FE0]/15 dark:text-[#8DB8FF]">{isAdmin ? "Admin" : "Member"}</span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
                </div>
                <div className="my-1.5 h-px bg-slate-200 dark:bg-white/10" />
                <button type="button" onClick={() => { setAccountOpen(false); router.push("/dashboard/profile"); }} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/5"><UserRound size={16} className="text-slate-400" aria-hidden="true" /> Profile</button>
                <button type="button" onClick={() => { setAccountOpen(false); router.push("/"); }} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/5"><ArrowRight size={16} className="text-slate-400" aria-hidden="true" /> Back to site</button>
                <div className="my-1.5 h-px bg-slate-200 dark:bg-white/10" />
                <button type="button" onClick={() => signOut({ callbackUrl: "/" })} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-white/5"><LogOut size={16} aria-hidden="true" /> Logout</button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
