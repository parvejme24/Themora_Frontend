"use client";

import { useEffect, useState } from "react";
import { useMergeGuestCart } from "@/hooks/useCartApi";
import { captureReferral } from "@/lib/referral";
import dynamic from "next/dynamic";
import { useCartDrawerOpen } from "./cartDrawerStore";

const loadCartDrawer = () => import("./CartDrawer");
const CartDrawer = dynamic(loadCartDrawer, { ssr: false });
import CompareBar from "../compare/CompareBar";
import CookieNotice from "@/components/shared/Legal/CookieNotice";

/** Storefront-wide pieces: cart drawer, comparison bar, guest cart merge after sign-in, affiliate ?ref capture */
export default function StorefrontRoot() {
  useMergeGuestCart();
  useEffect(() => captureReferral(), []);
  // Fetch the drawer code while the browser is idle so the first "Add to cart" opens it instantly
  useEffect(() => {
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1500));
    idle(() => void loadCartDrawer());
  }, []);
  // Load the drawer the first time it opens, then keep it mounted for its close animation
  const open = useCartDrawerOpen();
  const [drawerLoaded, setDrawerLoaded] = useState(false);
  useEffect(() => {
    if (open) setDrawerLoaded(true);
  }, [open]);
  return (
    <>
      {drawerLoaded && <CartDrawer />}
      <CompareBar />
      <CookieNotice />
    </>
  );
}
