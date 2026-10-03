"use client";

import React from "react";
import { FiTrendingUp, FiShoppingBag, FiDollarSign } from "react-icons/fi";
import { useGetTopSellingTemplates } from "@/hooks/useOrderApi";
import Image from "next/image";
import Link from "next/link";

const TopSellingTemplates: React.FC = () => {
  const { data: topSelling, isLoading, error } = useGetTopSellingTemplates({ limit: 5 });

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-[#0B0F2E] rounded-2xl shadow-sm p-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
          Top Selling Templates
        </h2>
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-white/10 last:border-0 animate-pulse"
            >
              <div className="flex items-center space-x-4 flex-1">
                <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !topSelling || topSelling.length === 0) {
    return (
      <div className="bg-white dark:bg-[#0B0F2E] rounded-2xl shadow-sm p-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
          Top Selling Templates
        </h2>
        <div className="text-center py-8">
          <FiShoppingBag className="mx-auto h-12 w-12 text-slate-400 mb-4" />
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {error ? "Failed to load top selling templates" : "No sales data available"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#0B0F2E] rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          Top Selling Templates
        </h2>
        <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
          <FiTrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
        </div>
      </div>
      <div className="space-y-4">
        {topSelling.map((item, index) => (
          <Link
            key={item.template.id}
            href={`/dashboard/templates/${item.template.id}`}
            className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-white/10 last:border-0 hover:bg-slate-50 dark:hover:bg-[#05071A] transition-colors rounded-lg px-2 -mx-2 cursor-pointer"
          >
            <div className="flex items-center space-x-4 flex-1 min-w-0">
              <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100 dark:bg-white/[0.04]">
                {item.template.imageUrl ? (
                  <Image
                    src={item.template.imageUrl}
                    alt={item.template.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FiShoppingBag className="w-6 h-6 text-slate-400" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-[#0F5BBD] dark:text-[#0F5BBD] bg-blue-100 dark:bg-blue-900/20 px-2 py-0.5 rounded">
                    #{index + 1}
                  </span>
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                    {item.template.title}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <FiShoppingBag className="w-3 h-3" />
                    {item.totalOrders} {item.totalOrders === 1 ? 'order' : 'orders'}
                  </span>
                  <span className="flex items-center gap-1">
                    <FiDollarSign className="w-3 h-3" />
                    ${item.totalRevenue.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right flex-shrink-0 ml-4">
              <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                ${item.template.price.toFixed(2)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default TopSellingTemplates;
