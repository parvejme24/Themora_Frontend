"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiHome,
  FiUser,
  FiMail,
  FiUsers,
  FiMenu,
  FiX,
  FiShoppingBag,
  FiCreditCard,
  FiBell,
  FiSettings,
  FiDollarSign,
  FiLayers,
  FiTag,
  FiBookOpen,
  FiFolder,
  FiChevronDown,
  FiChevronRight,
  FiPackage,
} from "react-icons/fi";
import { VscGitPullRequestGoToChanges } from "react-icons/vsc";

import { ThemoraMark } from "@/components/shared/Logo/ThemoraLogo";
import { AuthContext } from "@/Providers/AuthProvider";
import { useContext } from "react";
import { UserRole } from "@/types/user";

interface NavigationItem {
  name: string;
  href?: string;
  icon: any;
  isDropdown?: boolean;
  children?: NavigationItem[];
}

const adminNavigation: NavigationItem[] = [
  { name: "Overview", href: "/dashboard", icon: FiHome },
  { name: "Profile", href: "/dashboard/profile", icon: FiUser },
  {
    name: "Templates",
    icon: FiLayers,
    isDropdown: true,
    children: [
      {
        name: "Templates Categories",
        href: "/dashboard/templates-categories",
        icon: FiFolder,
      },
      { name: "Templates", href: "/dashboard/templates", icon: FiLayers },
    ],
  },
  {
    name: "Blogs",
    icon: FiBookOpen,
    isDropdown: true,
    children: [
      {
        name: "Blog Categories",
        href: "/dashboard/blog-categories",
        icon: FiTag,
      },
      { name: "Blogs", href: "/dashboard/blogs", icon: FiBookOpen },
    ],
  },
  { name: "Newsletter", href: "/dashboard/newsletter", icon: FiMail },
  { name: "Users", href: "/dashboard/users", icon: FiUsers },
  { name: "Orders", href: "/dashboard/orders", icon: FiPackage },
  {
    name: "Service Request",
    href: "/dashboard/service-request",
    icon: VscGitPullRequestGoToChanges,
  },
];

const userNavigation: NavigationItem[] = [
  { name: "Profile", href: "/dashboard/profile", icon: FiUser },
  { name: "My Orders", href: "/dashboard/orders", icon: FiPackage },
  { name: "My Purchases", href: "/dashboard/purchases", icon: FiShoppingBag },
  { name: "Payment History", href: "/dashboard/payment", icon: FiCreditCard },
  {
    name: "Service Request",
    href: "/dashboard/service-request",
    icon: VscGitPullRequestGoToChanges,
  },
  { name: "Notifications", href: "/dashboard/notifications", icon: FiBell },
  { name: "Settings", href: "/dashboard/settings", icon: FiSettings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState<string[]>([]);
  const { user, loading } = useContext(AuthContext) || {};
  const role = (user as { role?: UserRole })?.role;
  const isAdmin = role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN;
  const isUser = role === UserRole.USER;

  const toggleDropdown = (itemName: string) => {
    setOpenDropdowns((prev) =>
      prev.includes(itemName)
        ? prev.filter((name) => name !== itemName)
        : [...prev, itemName]
    );
  };

  const isDropdownOpen = (itemName: string) => {
    return openDropdowns.includes(itemName);
  };

  const isChildActive = (children: NavigationItem[] | undefined) => {
    return children?.some((child) => pathname === child.href) || false;
  };

  return (
    <>
      {/* Mobile menu button */}
      {loading ? (
        <div className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md animate-pulse">
          <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded"></div>
        </div>
      ) : (
        <button
          className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none cursor-pointer"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <FiX className="h-6 w-6" />
          ) : (
            <FiMenu className="h-6 w-6" />
          )}
        </button>
      )}

      {/* Backdrop overlay to close sidebar on outside click (mobile only) */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 backdrop-blur-[1px] lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } lg:static lg:inset-auto lg:z-auto bg-white dark:bg-[#000424] border-r border-gray-200 dark:border-gray-800`}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 border-b border-gray-200 dark:border-gray-800">
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-7 lg:w-9 h-7 lg:h-9 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
                <div
                  className="h-6 lg:h-8 w-24 lg:w-32 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"
                  style={{ animationDelay: "200ms" }}
                ></div>
              </div>
            ) : (
              <Link
                href="/dashboard"
                className="text-xl lg:text-2xl font-bold text-[#0F5BBD] dark:text-white flex items-center gap-2"
              >
                <ThemoraMark size={32} />
                Themora
              </Link>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {loading ? (
              // Skeleton loading for navigation items
              <>
                {[...Array(6)].map((_, index) => (
                  <div
                    key={index}
                    className="flex items-center px-4 py-3 rounded-lg"
                    style={{
                      animationDelay: `${index * 100}ms`,
                    }}
                  >
                    <div className="w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded mr-3 animate-pulse"></div>
                    <div
                      className={`h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse ${
                        index === 0
                          ? "w-20"
                          : index === 1
                          ? "w-16"
                          : index === 2
                          ? "w-24"
                          : index === 3
                          ? "w-12"
                          : index === 4
                          ? "w-28"
                          : "w-20"
                      }`}
                    ></div>
                  </div>
                ))}
              </>
            ) : (
              (isAdmin ? adminNavigation : isUser ? userNavigation : []).map(
                (item) => {
                  if (item.isDropdown) {
                    const isOpen = isDropdownOpen(item.name);
                    const hasActiveChild = isChildActive(item.children);

                    return (
                      <div key={item.name}>
                        <button
                          onClick={() => toggleDropdown(item.name)}
                          className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                            hasActiveChild
                              ? "bg-[#0F5BBD] text-white"
                              : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#718096]"
                          }`}
                        >
                          <div className="flex items-center">
                            <item.icon
                              className={`mr-3 h-5 w-5 ${
                                hasActiveChild
                                  ? "text-white"
                                  : "text-gray-400 dark:text-gray-300"
                              }`}
                            />
                            {item.name}
                          </div>
                          {isOpen ? (
                            <FiChevronDown className="h-4 w-4" />
                          ) : (
                            <FiChevronRight className="h-4 w-4" />
                          )}
                        </button>

                        {isOpen && item.children && (
                          <div className="ml-4 mt-1 space-y-1">
                            {item.children.map((child) => {
                              const isChildActive = pathname === child.href;
                              return (
                                <Link
                                  key={child.name}
                                  href={child.href || "#"}
                                  onClick={() => setIsMobileMenuOpen(false)}
                                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                    isChildActive
                                      ? "bg-[#0F5BBD] text-white"
                                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#718096]"
                                  }`}
                                >
                                  <child.icon
                                    className={`mr-3 h-4 w-4 ${
                                      isChildActive
                                        ? "text-white"
                                        : "text-gray-400 dark:text-gray-300"
                                    }`}
                                  />
                                  {child.name}
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  } else {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href || "#"}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                          isActive
                            ? "bg-[#0F5BBD] text-white"
                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#718096]"
                        }`}
                      >
                        <item.icon
                          className={`mr-3 h-5 w-5 ${
                            isActive
                              ? "text-white"
                              : "text-gray-400 dark:text-gray-300"
                          }`}
                        />
                        {item.name}
                      </Link>
                    );
                  }
                }
              )
            )}
          </nav>
        </div>
      </div>
    </>
  );
}
