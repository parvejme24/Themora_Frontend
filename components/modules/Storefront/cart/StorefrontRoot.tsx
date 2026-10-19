"use client";

import { useEffect, useState } from "react";
import { useMergeGuestCart } from "@/hooks/useCartApi";
import { captureReferral } from "@/lib/referral";
import dynamic from "next/dynamic";
import { useCartDrawerOpen } from "./cartDrawerStore";

const CartDrawer = dynamic(() => import("./CartDrawer"), { ssr: false });
import CompareBar from "../compare/CompareBar";
import CookieNotice from "@/components/shared/Legal/CookieNotice";

/** Storefront-wide pieces: cart drawer, comparison bar, guest cart merge after sign-in, affiliate ?ref capture */
export default function StorefrontRoot() {
  useMergeGuestCart();
  useEffect(() => captureReferral(), []);
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
