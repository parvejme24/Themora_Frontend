import type { LucideIcon } from "lucide-react";
import { Home, LayoutTemplate, BadgeDollarSign, Newspaper, Mail } from "lucide-react";

export interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

export const navigation: NavItem[] = [
  { name: "Home", href: "/", icon: Home },
  { name: "Template", href: "/template", icon: LayoutTemplate },
  { name: "Pricing", href: "/pricing", icon: BadgeDollarSign },
  { name: "Blogs", href: "/blogs", icon: Newspaper },
  { name: "Contact", href: "/contact", icon: Mail },
];

// Active when on the route itself or any nested page (e.g. /blogs/123)
export const isActivePath = (pathname: string, href: string) =>
  href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

export const menuVariants = {
  closed: {
    x: "100%",
    transition: { type: "spring" as const, stiffness: 400, damping: 40 },
  },
  open: {
    x: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 32 },
  },
};

export const menuItemVariants = {
  closed: { opacity: 0, x: 24 },
  open: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: 0.1 + i * 0.05, duration: 0.35, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

export const backdropVariants = {
  closed: { opacity: 0, transition: { duration: 0.25 } },
  open: { opacity: 1, transition: { duration: 0.25 } },
};
