"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface PageHeaderProps {
  title: string;
  subTitle: string;
  value?: string;
}

const useCounter = (target: number, duration: number = 2000) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * target));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [target, duration]);

  return count;
};

export default function PageHeader({
  value,
  title,
  subTitle,
}: PageHeaderProps) {
  const count = useCounter(value ? parseInt(value) : 0);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const textVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      filter: "blur(10px)",
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="bg-gradient-to-r from-[#F5F7FB] via-[#EAF1FF] to-[#F5F7FB] dark:from-[#010103] dark:via-[#121B3A] dark:to-[#010103]">
      <div className="h-full relative before:content-[''] before:absolute before:inset-0 before:bg-[linear-gradient(to_right,#0F5BBD_1px,transparent_1px),linear-gradient(to_bottom,#0F5BBD_1px,transparent_1px)] before:bg-[size:50px_50px] before:opacity-10">
        <motion.div
          className="py-8 md:py-12 px-5 max-w-[550px] mx-auto space-y-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h2
            variants={textVariants}
            className="text-[#000000] dark:text-white text-center text-2xl md:text-[45px] font-bold leading-tight"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              backgroundPosition: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
            style={{
              background: "linear-gradient(90deg, #1f2937, #3b82f6, #8b5cf6, #1f2937)",
              backgroundSize: "200% 100%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text"
            }}
          >
            {value ? `${count.toLocaleString()}+ ` : ""}
            {title}
          </motion.h2>
          <motion.p
            variants={textVariants}
            className="text-[#000000] dark:text-gray-200 text-center text-[14px]"
          >
            {subTitle}
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
