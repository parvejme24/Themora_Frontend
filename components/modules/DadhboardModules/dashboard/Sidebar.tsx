"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen, ChevronDown, ChevronRight, CreditCard, FolderKanban, LayoutDashboard,
  Layers3, LifeBuoy, Mail, PackageCheck, PanelLeftClose, ShoppingBag, Tags, UsersRound, X,
} from "lucide-react";
import { ThemoraMark } from "@/components/shared/Logo/ThemoraLogo";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types/auth";

type NavLink = { label: string; href: string; icon: typeof LayoutDashboard };
type NavGroup = { label: string; icon: typeof LayoutDashboard; children: NavLink[] };
type NavItem = NavLink | NavGroup;

const adminNav: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Profile", href: "/dashboard/profile", icon: UsersRound },
  { label: "Themes", icon: Layers3, children: [
    { label: "All themes", href: "/dashboard/templates", icon: Layers3 },
    { label: "Categories", href: "/dashboard/templates-categories", icon: Tags },
  ] },
  { label: "Publishing", icon: BookOpen, children: [
    { label: "Blogs", href: "/dashboard/blogs", icon: BookOpen },
    { label: "Blog categories", href: "/dashboard/blog-categories", icon: FolderKanban },
  ] },
  { label: "Orders", href: "/dashboard/orders", icon: PackageCheck },
  { label: "Users", href: "/dashboard/users", icon: UsersRound },
  { label: "Pricing", href: "/dashboard/pricing", icon: CreditCard },
  { label: "Newsletter", href: "/dashboard/newsletter", icon: Mail },
  { label: "Service requests", href: "/dashboard/service-request", icon: LifeBuoy },
];

const userNav: NavLink[] = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Profile", href: "/dashboard/profile", icon: UsersRound },
  { label: "My purchases", href: "/dashboard/purchases", icon: ShoppingBag },
  { label: "My orders", href: "/dashboard/orders", icon: PackageCheck },
  { label: "Payment history", href: "/dashboard/payment", icon: CreditCard },
  { label: "Service requests", href: "/dashboard/service-request", icon: LifeBuoy },
];

// Same active / hover treatment as the public navbar pills
const activePill = "bg-white text-slate-900 shadow-[0_1px_2px_rgb(0_0_0/0.06),0_4px_12px_-4px_rgb(15_53_167/0.25)] ring-1 ring-slate-200/80 dark:bg-white/10 dark:text-white dark:ring-white/10";
const idleLink = "text-slate-500 hover:bg-slate-200/50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/[0.06] dark:hover:text-white";

function isGroup(item: NavItem): item is NavGroup {
  return "children" in item;
}

function isActive(pathname: string, href: string) {
  return pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));
}

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const isAdmin = user?.role === UserRole.ADMIN;
  const items = isAdmin ? adminNav : userNav;
  const [expanded, setExpanded] = useState<string[]>([]);

  useEffect(() => {
    setExpanded((current) => {
      const activeGroups = adminNav.filter(isGroup).filter((group) => group.children.some((child) => isActive(pathname, child.href))).map((group) => group.label);
      return Array.from(new Set([...current, ...activeGroups]));
    });
  }, [pathname]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const displayName = user?.fullName || user?.email?.split("@")[0] || "Account";
  const initials = displayName.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase();

  return (
    <>
      {isOpen && <button aria-label="Close navigation" onClick={onClose} className="fixed inset-0 z-40 cursor-pointer bg-slate-900/40 backdrop-blur-[2px] lg:hidden" />}
      <aside aria-label="Dashboard navigation" className={`isolate overflow-hidden fixed inset-y-0 left-0 z-50 flex w-[264px] shrink-0 flex-col border-r border-slate-200/70 bg-[#F5F7FB] text-slate-600 transition-transform duration-200 lg:relative lg:z-auto lg:translate-x-0 dark:border-white/[0.06] dark:bg-[#05071A] dark:text-slate-300 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div aria-hidden="true" className="pointer-events-none absolute -left-24 -top-24 -z-10 h-64 w-64 rounded-full bg-[#3B82F6]/15 blur-[90px] dark:bg-[#2563EB]/20" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 -right-24 -z-10 h-64 w-64 rounded-full bg-[#8B5CF6]/10 blur-[90px] dark:bg-[#7C3AED]/20" />
        <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-slate-200/70 px-5 dark:border-white/[0.06]">
          <Link href="/dashboard" onClick={onClose} className="inline-flex items-center gap-2.5 rounded-full text-slate-900 dark:text-white">
            <ThemoraMark size={31} />
            <span className="text-lg font-semibold tracking-tight">Themora</span>
          </Link>
          <button type="button" onClick={onClose} aria-label="Close menu" className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:text-slate-900 lg:hidden dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:text-white">
            <X size={18} />
          </button>
          <span className="hidden text-slate-400 lg:block"><PanelLeftClose size={17} aria-hidden="true" /></span>
        </div>

        <div className="px-5 pb-2 pt-5">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#1D6FE0] dark:text-[#8DB8FF]">Workspace</p>
        </div>

        <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 pb-5" aria-label="Main">
          {items.map((item) => {
            if (isGroup(item)) {
              const open = expanded.includes(item.label);
              const groupActive = item.children.some((child) => isActive(pathname, child.href));
              const GroupIcon = item.icon;
              return (
                <div key={item.label}>
                  <button type="button" aria-expanded={open} onClick={() => setExpanded((current) => open ? current.filter((label) => label !== item.label) : [...current, item.label])} className={`flex min-h-10 w-full items-center gap-3 rounded-full px-3.5 text-left text-sm font-medium transition ${groupActive ? "text-slate-900 dark:text-white" : "text-slate-500 hover:bg-slate-200/50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/[0.06] dark:hover:text-white"}`}>
                    <GroupIcon size={17} aria-hidden="true" className={groupActive ? "text-[#1D6FE0] dark:text-[#8DB8FF]" : undefined} />
                    <span className="flex-1">{item.label}</span>
                    {open ? <ChevronDown size={15} aria-hidden="true" /> : <ChevronRight size={15} aria-hidden="true" />}
                  </button>
                  {open && <div className="ml-[23px] mt-1 space-y-1 border-l border-slate-200 pl-3 dark:border-white/10">
                    {item.children.map((child) => {
                      const ChildIcon = child.icon;
                      const active = isActive(pathname, child.href);
                      return <Link key={child.href} href={child.href} onClick={onClose} aria-current={active ? "page" : undefined} className={`flex min-h-9 items-center gap-2.5 rounded-full px-3 text-[13px] transition ${active ? activePill : idleLink}`}><ChildIcon size={15} aria-hidden="true" className={active ? "text-[#1D6FE0] dark:text-[#8DB8FF]" : undefined} />{child.label}</Link>;
                    })}
                  </div>}
                </div>
              );
            }

            const Icon = item.icon;
            const active = isActive(pathname, item.href);
            return <Link key={item.href} href={item.href} onClick={onClose} aria-current={active ? "page" : undefined} className={`relative flex min-h-10 items-center gap-3 rounded-full px-3.5 text-sm font-medium transition ${active ? activePill : idleLink}`}><Icon size={17} aria-hidden="true" className={active ? "text-[#1D6FE0] dark:text-[#8DB8FF]" : undefined} />{item.label}{active && <span aria-hidden="true" className="ml-auto h-1.5 w-1.5 rounded-full bg-gradient-to-r from-[#1D6FE0] to-[#7C5CFC]" />}</Link>;
          })}
        </nav>

        <div className="shrink-0 border-t border-slate-200/70 p-3 dark:border-white/[0.06]">
          <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-3 dark:border-white/10 dark:bg-white/[0.04]">
            <span className="shrink-0 rounded-full bg-gradient-to-br from-[#1D6FE0] via-[#6D5DFC] to-[#22B8F0] p-[2px]">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#1D6FE0] to-[#7C5CFC] text-xs font-bold text-white ring-2 ring-white dark:ring-[#05071A]">{initials}</span>
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-slate-900 dark:text-white">{displayName}</span>
              <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">{isAdmin ? "Administrator" : "Member"}</span>
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
