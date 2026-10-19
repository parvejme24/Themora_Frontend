"use client";

import { useEffect } from "react";
import { useMergeGuestCart } from "@/hooks/useCartApi";
import { captureReferral } from "@/lib/referral";
import CartDrawer from "./CartDrawer";

/** Storefront-wide pieces: cart drawer, guest cart merge after sign-in, affiliate ?ref capture */
export default function StorefrontRoot() {
  useMergeGuestCart();
  useEffect(() => captureReferral(), []);
  return <CartDrawer />;
}
