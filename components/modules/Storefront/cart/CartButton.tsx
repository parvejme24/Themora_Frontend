"use client";

import React from "react";
import { FiShoppingBag } from "react-icons/fi";
import { useStorefrontCart } from "@/hooks/useStorefrontCart";
import { cartDrawer } from "./cartDrawerStore";

export default function CartButton() {
  const { count } = useStorefrontCart();
  return (
    <button
      type="button"
      onClick={() => cartDrawer.open()}
      aria-label={count ? `Open cart, ${count} ${count === 1 ? "item" : "items"}` : "Open cart"}
      className="relative flex h-9 w-9 items-center justify-center rounded-full text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10"
    >
      <FiShoppingBag className="h-[18px] w-[18px]" />
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#1D6FE0] px-1 text-[10px] font-bold text-white">
          {count}
        </span>
      )}
    </button>
  );
}
