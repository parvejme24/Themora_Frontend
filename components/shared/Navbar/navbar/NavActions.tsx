import Link from "next/link";
import { ArrowRight, LayoutDashboard, LogOut, Menu, User as UserIcon } from "lucide-react";
import { motion } from "framer-motion";
import { ModeToggle } from "@/components/ui/mode-toggle";
import React, { useContext, useState } from "react";
import { AuthContext } from "@/Providers/AuthProvider";
import { useAuth, useCurrentUser } from "@/hooks/useAuth";
import { signOut } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import placeholderImage from "@/assets/common/placeholder.png";

interface NavActionsProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}

export const NavActions = ({ isOpen, setIsOpen }: NavActionsProps) => {
  const authContext = useContext(AuthContext);
  const { user: nextAuthUser, isAuthenticated } = useAuth();
  const { data: currentUserData } = useCurrentUser();
  
  // Prioritize fresh API data over cached data
  const user = currentUserData?.data?.user || nextAuthUser || authContext?.user;
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);


  const getPhotoUrl = () => {
    if (user && (user as any).avatarUrl) return (user as any).avatarUrl;
    if (user && user.profile?.avatarUrl) return user.profile.avatarUrl;
    return undefined;
  };

  const getDisplayName = () => {
    if (user && user.fullName) return user.fullName;
    if (user && (user as any).name) return (user as any).name;
    return 'User';
  };

  const getInitials = () => {
    const displayName = getDisplayName();
    if (displayName && displayName !== 'User') {
      const names = displayName.trim().split(' ');
      if (names.length >= 2) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
      }
      return displayName[0].toUpperCase();
    }
    return 'U';
  };

  const hasProfilePicture = () => {
    return !!(user && ((user as any).avatarUrl || user.profile?.avatarUrl));
  };

  function getImageUrl(imageUrl?: string) {
    if (!imageUrl) return placeholderImage;
    // For now, return the image URL as-is or use placeholder
    return imageUrl || placeholderImage;
  }

  const avatar = (size: number, textClass: string) =>
    hasProfilePicture() ? (
      <Image
        src={getImageUrl(getPhotoUrl())}
        alt={getDisplayName()}
        width={size}
        height={size}
        className="aspect-square rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    ) : (
      <span
        className={`flex items-center justify-center rounded-full bg-gradient-to-br from-[#1D6FE0] to-[#7C5CFC] font-semibold text-white ${textClass}`}
        style={{ width: size, height: size }}
      >
        {getInitials()}
      </span>
    );

  const iconButton =
    "flex h-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:text-white";

  return (
    <div className="flex items-center gap-2 sm:gap-2.5">
      <div className="relative z-[102]">
        <ModeToggle />
      </div>

      {(user || isAuthenticated) ? (
        <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen} modal={false}>
          <DropdownMenuTrigger asChild>
            <button
              aria-label="Account menu"
              className="rounded-full bg-gradient-to-br from-[#1D6FE0] via-[#6D5DFC] to-[#22B8F0] p-[2px] transition hover:shadow-lg hover:shadow-[#3F5BF0]/30"
            >
              <span className="block rounded-full bg-white p-[2px] dark:bg-[#05071A]">
                {avatar(32, "text-xs")}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={10}
            avoidCollisions={true}
            className="w-64 rounded-2xl border border-slate-200 bg-white/95 p-1.5 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-[#0B0F2E]/95"
          >
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-white/5">
              {avatar(40, "text-sm")}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{getDisplayName()}</p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user?.email || "No email"}</p>
              </div>
            </div>
            <DropdownMenuSeparator className="my-1.5" />
            <DropdownMenuItem onClick={() => router.push("/dashboard")} className="cursor-pointer gap-2.5 rounded-lg px-3 py-2">
              <LayoutDashboard className="h-4 w-4 text-slate-400" /> Dashboard
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/dashboard/profile")} className="cursor-pointer gap-2.5 rounded-lg px-3 py-2">
              <UserIcon className="h-4 w-4 text-slate-400" /> Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1.5" />
            <DropdownMenuItem
              className="cursor-pointer gap-2.5 rounded-lg px-3 py-2 text-red-600 focus:text-red-600 dark:text-red-400"
              onClick={async () => {
                await signOut({ callbackUrl: "/" });
              }}
            >
              <LogOut className="h-4 w-4" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <>
          <Link
            href="/login"
            className="hidden rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:text-slate-900 lg:inline-flex dark:text-slate-300 dark:hover:text-white"
          >
            Log in
          </Link>
          <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }} className="hidden lg:block">
            <Link
              href="/pricing"
              className="tf-shine group inline-flex h-10 items-center gap-1.5 rounded-full bg-slate-900 pl-5 pr-4 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:bg-gradient-to-r hover:from-[#1D6FE0] hover:to-[#6D5DFC] hover:shadow-[#3F5BF0]/30 dark:bg-white dark:text-slate-900 dark:hover:text-white"
            >
              Get Started
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.div>
        </>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open menu"
        aria-expanded={isOpen}
        className={`${iconButton} w-10 lg:hidden`}
      >
        <Menu className="h-5 w-5" />
      </button>
    </div>
  );
};
