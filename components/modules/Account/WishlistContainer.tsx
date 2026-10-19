"use client";

import React from "react";
import { FiHeart } from "react-icons/fi";
import { useWishlist } from "@/hooks/useWishlistApi";
import PageHeader from "@/components/modules/DadhboardModules/dashboard/PageHeader";
import ErrorState from "@/components/shared/Feedback/ErrorState";
import EmptyState from "@/components/shared/Feedback/EmptyState";
import MarketplaceCard, { MarketplaceCardSkeleton } from "@/components/modules/Storefront/shared/MarketplaceCard";

export default function WishlistContainer() {
  const { data, isLoading, error, refetch } = useWishlist();
  return (
    <div className="space-y-6">
      <PageHeader title="Wishlist" description="Products you saved for later. Prices update live, including sales." />
      {error ? (
        <ErrorState error={error} subject="your wishlist" onRetry={refetch} />
      ) : isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <MarketplaceCardSkeleton key={i} />
          ))}
        </div>
      ) : !data?.length ? (
        <EmptyState icon={FiHeart} title="Nothing saved yet" message="Tap the heart on any product to keep it here." actionLabel="Browse products" actionHref="/products" />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {data.map((product) => (
            <MarketplaceCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
