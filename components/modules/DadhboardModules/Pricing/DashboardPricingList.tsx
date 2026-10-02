"use client";

import React from "react";
// Mock pricing hook - in real app, this would be imported from your API hooks
const usePricing = () => {
  return {
    data: [
      { id: "1", name: "Basic Plan", price: 29, features: ["Feature 1", "Feature 2"] },
      { id: "2", name: "Pro Plan", price: 59, features: ["Feature 1", "Feature 2", "Feature 3"] }
    ] as any[], // Mock data for now
    isLoading: false,
    error: null,
  };
};
import { Button } from "@/components/ui/button";

import { FiPlus, FiDollarSign } from "react-icons/fi";
import Link from "next/link";
import PricingCard from "./PricingCard/PricingCard";
import DashboardPricingCardSkeleton from "../../CommonModules/pricing/pricingList/DashboardPricingCardSkeleton";
import ErrorState from "@/components/shared/Feedback/ErrorState";

export default function DashboardPricingList() {
  const { data: pricingPlans = [], isLoading, error } = usePricing();

  if (isLoading) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto max-w-6xl px-4">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Pricing Management
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Manage your pricing plans and subscriptions
                </p>
              </div>
              <Link href="/dashboard/ADMIN/pricing/create">
                <Button className="cursor-pointer flex items-center gap-2 bg-[#0F5BBD] hover:bg-blue-700 text-white py-5">
                  <FiPlus className="w-4 h-4" />
                  Create Pricing Plan
                </Button>
              </Link>
            </div>
          </div>

          {/* Skeleton Loading Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <DashboardPricingCardSkeleton key={item} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
        <ErrorState error={error} subject="pricing plans" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Pricing Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your pricing plans and subscriptions
              </p>
            </div>
            <Link href="/dashboard/pricing/create">
              <Button className="cursor-pointer flex items-center gap-2 bg-[#0F5BBD] hover:bg-blue-700 text-white py-5">
                <FiPlus className="w-4 h-4" />
                Create Pricing Plan
              </Button>
            </Link>
          </div>
        </div>

        {/* Pricing Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pricingPlans.length > 0 ? (
            pricingPlans.map((plan) => (
              <PricingCard key={plan.id} plan={plan} />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-500 dark:text-gray-400 mb-4">
                <FiDollarSign className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">
                  No pricing plans yet
                </h3>
                <p className="mb-6">
                  Create your first pricing plan to get started.
                </p>
              </div>
              <Link href="/dashboard/pricing/create">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <FiPlus className="w-4 h-4 mr-2" />
                  Create First Plan
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
