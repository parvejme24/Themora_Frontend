import React from "react";
import { motion } from "framer-motion";

interface TemplateCardSkeletonProps {
  delay?: number;
}

export default function TemplateCardSkeleton({ delay = 0 }: TemplateCardSkeletonProps) {
  return (
    <motion.div 
      className="p-3 rounded-lg overflow-hidden shadow-md bg-white dark:bg-[#1A1D37]"
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.4, 
        delay: delay * 0.1,
        ease: "easeOut"
      }}
    >
      {/* Image Skeleton */}
      <div className="w-full h-[250px] bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-lg animate-pulse bg-[length:200%_100%]" />
      
      <div>
        {/* Title and Price Skeleton */}
        <div className="flex justify-between items-center py-3">
          <div className="flex-1 mr-2">
            <div className="h-4 w-3/4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded animate-pulse bg-[length:200%_100%]" />
          </div>
          <div className="h-5 w-16 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded animate-pulse bg-[length:200%_100%]" />
        </div>

        {/* Buttons Skeleton */}
        <div className="grid grid-cols-2 gap-5 border-t border-[#c5c5c5] dark:border-[#686868] pt-5">
          <div className="h-10 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-lg animate-pulse bg-[length:200%_100%]" />
          <div className="h-10 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-lg animate-pulse bg-[length:200%_100%]" />
        </div>
      </div>
    </motion.div>
  );
}
