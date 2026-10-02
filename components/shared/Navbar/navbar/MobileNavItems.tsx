import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { navigation, menuItemVariants, isActivePath } from "./constants";

interface MobileNavItemsProps {
  pathname: string;
  setIsOpen: (value: boolean) => void;
}

export const MobileNavItems = ({ pathname, setIsOpen }: MobileNavItemsProps) => (
  <ul className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
    {navigation.map((item, i) => {
      const active = isActivePath(pathname, item.href);
      const Icon = item.icon;
      return (
        <motion.li key={item.name} custom={i} variants={menuItemVariants} initial="closed" animate="open" exit="closed">
          <Link
            href={item.href}
            onClick={() => setIsOpen(false)}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group flex items-center gap-3 rounded-2xl px-3 py-3 text-[15px] font-medium transition-colors",
              active
                ? "bg-gradient-to-r from-[#1D6FE0]/10 to-[#7C5CFC]/10 text-slate-900 dark:text-white"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white"
            )}
          >
            <span
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-xl border transition-colors",
                active
                  ? "border-transparent bg-gradient-to-br from-[#1D6FE0] to-[#7C5CFC] text-white shadow-md shadow-[#3F5BF0]/30"
                  : "border-slate-200 bg-white text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400"
              )}
            >
              <Icon className="h-4 w-4" />
            </span>
            {item.name}
            <ChevronRight className="ml-auto h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-0.5 dark:text-slate-600" />
          </Link>
        </motion.li>
      );
    })}
  </ul>
);
