// Mock theme hook - in real app, this would be imported from your hooks
import React from "react";
import { useTheme } from "next-themes";

// Mock useThemeSafe hook implementation
const useThemeSafe = () => {
  const { theme, resolvedTheme } = useTheme();
  return {
    isDark: resolvedTheme === 'dark',
    mounted: true, // Assume mounted for simplicity
  };
};
import Image from "next/image";
import BannerImage from "@/assets/common/templates.png";
import Dot from "@/assets/common/dots.png";
import DotWhite from "@/assets/common/dots-white.png";
import { StatCard } from "../StatCard/StatCard,";
import { AnimatedDots } from "../AnimatedDots/AnimatedDots";

export const AuthBanner = () => {
  const { isDark, mounted } = useThemeSafe();

  return (
    <div
      className={`hidden lg:flex h-full relative before:content-[''] before:absolute before:inset-0 before:bg-[linear-gradient(to_right,#0F5BBD_1px,transparent_1px),linear-gradient(to_bottom,#0F5BBD_1px,transparent_1px)] before:bg-[size:60px_60px] before:opacity-10 transition-all duration-300 ${
        mounted && isDark
          ? 'bg-gradient-to-tl from-[#010102] via-[#111A39] to-[#010102]'
          : 'bg-gradient-to-tl from-[#F5F7FB] via-[#D4E3FF] to-[#F5F7FB]'
      }`}
    >
      <div className="flex flex-col items-center justify-center w-full relative z-10">
        <div className="max-w-[430px] mb-5">
          <h2 className="text-[30px] text-center dark:text-white leading-tight">
            Themora provides website templates for creative entrepreneurs
          </h2>
          <p className="text-center mt-2 dark:text-gray-300 text-[14px]">
            Explore the best premium themes and Templates <br /> available for
            sale.
          </p>
        </div>
        <div className="relative">
          <Image
            src={BannerImage}
            alt="Banner Image"
            className="h-fit relative z-10"
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full">
            <AnimatedDots
              src={Dot}
              alt="dot bg"
              className="dark:hidden max-w-[150px]"
            />
            <AnimatedDots
              src={DotWhite}
              alt="dot bg for dark mode"
              className="hidden dark:block max-w-[150px]"
            />
          </div>
          <StatCard index={0} />
          <StatCard index={1} />
        </div>
      </div>
    </div>
  );
};
