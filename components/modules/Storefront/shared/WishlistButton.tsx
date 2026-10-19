"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useToggleWishlist, useWishlistIds } from "@/hooks/useWishlistApi";

/** Heart toggle; signed-out visitors are sent to sign in first */
export default function WishlistButton({ productId, className = "" }: { productId: string; className?: string }) {
  const { isAuthenticated } = useAuth();
  const { data: ids } = useWishlistIds();
  const toggle = useToggleWishlist();
  const router = useRouter();
  const pathname = usePathname();
  const wishlisted = ids?.has(productId) ?? false;

  const onClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!isAuthenticated) {
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
      return;
    }
    toggle.mutate(
      { productId, wishlisted },
      { onError: (error) => toast.error(error instanceof Error ? error.message : "Couldn't update your wishlist") }
    );
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={wishlisted}
      aria-label={wishlisted ? "Remove from wishlist" : "Save to wishlist"}
      className={`flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition hover:scale-110 dark:bg-slate-900/80 ${
        wishlisted ? "text-rose-500" : "text-slate-600 hover:text-rose-500 dark:text-slate-300"
      } ${className}`}
    >
      {wishlisted ? <FaHeart className="h-4 w-4" /> : <FaRegHeart className="h-4 w-4" />}
    </button>
  );
}
