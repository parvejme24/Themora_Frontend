"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQueries } from "@tanstack/react-query";
import { FiAlertCircle, FiLock, FiShoppingBag, FiTag, FiTrash2, FiX } from "react-icons/fi";
import { toast } from "sonner";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { effectivePrice, formatPrice } from "@/lib/format";
import { getReferralCode } from "@/lib/referral";
import { useApplyCoupon, useCartCheckout, useRemoveCoupon, useUpdateCartItem } from "@/hooks/useCartApi";
import { useStorefrontCart } from "@/hooks/useStorefrontCart";
import type { LicenseType, PaymentGateway, ProductCard, ProductDetail } from "@/types/marketplace";
import Spinner from "@/components/shared/Feedback/Spinner";
import { cartDrawer, useCartDrawerOpen } from "./cartDrawerStore";
import GatewayPicker from "./GatewayPicker";

interface Line {
  productId: string;
  licenseType: LicenseType;
  product?: ProductCard;
  total: number;
  discount: number;
}

const LineItem = ({
  line,
  onRemove,
  onLicense,
  busy,
}: {
  line: Line;
  onRemove: () => void;
  onLicense: (licenseType: LicenseType) => void;
  busy?: boolean;
}) => {
  const p = line.product;
  return (
    <li className="flex gap-3 py-4">
      <Link
        href={p ? `/products/${p.slug}` : "#"}
        onClick={() => cartDrawer.close()}
        className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-white/5"
      >
        {p?.imageUrl && <Image src={p.imageUrl} alt="" fill sizes="80px" className="object-cover" />}
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="line-clamp-2 text-sm font-semibold text-slate-900 dark:text-white">
            {p?.title ?? <span className="inline-block h-4 w-32 animate-pulse rounded bg-slate-200 dark:bg-white/10" />}
          </p>
          <button
            type="button"
            onClick={onRemove}
            disabled={busy}
            aria-label={`Remove ${p?.title ?? "item"}`}
            className="shrink-0 rounded-full p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-500/10"
          >
            <FiTrash2 className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-2 flex items-center justify-between gap-2">
          {p?.extendedPrice != null ? (
            <select
              value={line.licenseType}
              onChange={(e) => onLicense(e.target.value as LicenseType)}
              disabled={busy}
              aria-label="Licence"
              className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs font-medium text-slate-700 outline-none dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
            >
              <option value="SINGLE">Single licence</option>
              <option value="EXTENDED">Extended licence</option>
            </select>
          ) : (
            <span className="text-xs text-slate-500 dark:text-slate-400">Single licence</span>
          )}
          <span className="text-right">
            <span className="block text-sm font-semibold tabular-nums text-slate-900 dark:text-white">{formatPrice(line.total)}</span>
            {line.discount > 0 && (
              <span className="block text-[11px] tabular-nums text-emerald-600 dark:text-emerald-400">−{formatPrice(line.discount)} coupon</span>
            )}
          </span>
        </div>
      </div>
    </li>
  );
};

export default function CartDrawer() {
  const open = useCartDrawerOpen();
  const pathname = usePathname();
  const cart = useStorefrontCart();
  const updateItem = useUpdateCartItem();
  const applyCoupon = useApplyCoupon();
  const removeCoupon = useRemoveCoupon();
  const checkout = useCartCheckout();
  const [couponInput, setCouponInput] = useState("");
  const [gateway, setGateway] = useState<PaymentGateway>("stripe");
  const [busyId, setBusyId] = useState<string | null>(null);

  // Guests only have product IDs, so details are fetched for display
  const guestProducts = useQueries({
    queries: cart.isAuthenticated
      ? []
      : cart.guestItems.map((item) => ({
          queryKey: queryKeys.products.detail(item.productId),
          queryFn: () => api.data<ProductDetail>(`/products/${item.productId}`),
          staleTime: 5 * 60_000,
        })),
  });

  const server = cart.serverCart;
  const lines: Line[] = cart.isAuthenticated
    ? (server?.items ?? []).map((item) => ({ ...item }))
    : cart.guestItems.map((item, i) => {
        const product = guestProducts[i]?.data;
        const licenseType = item.licenseType ?? "SINGLE";
        const total = !product ? 0 : licenseType === "EXTENDED" ? product.extendedPrice ?? 0 : effectivePrice(product);
        return { productId: item.productId, licenseType, product, total, discount: 0 };
      });

  const subtotal = cart.isAuthenticated ? server?.subtotal ?? 0 : lines.reduce((sum, l) => sum + l.total, 0);
  const discountTotal = cart.isAuthenticated ? server?.discountTotal ?? 0 : 0;
  const total = cart.isAuthenticated ? server?.totalAmount ?? 0 : subtotal;

  const withBusy = async (productId: string, action: () => Promise<unknown>) => {
    setBusyId(productId);
    try {
      await action();
    } finally {
      setBusyId(null);
    }
  };

  const changeLicense = (line: Line, licenseType: LicenseType) =>
    withBusy(line.productId, async () => {
      if (cart.isAuthenticated) {
        await updateItem.mutateAsync({ productId: line.productId, licenseType }).catch((error) => toast.error(error.message));
      } else {
        await cart.addItem(line.productId, licenseType, { openDrawer: false });
      }
    });

  const submitCoupon = (event: React.FormEvent) => {
    event.preventDefault();
    const code = couponInput.trim();
    if (!code) return;
    applyCoupon.mutate(code, {
      onSuccess: () => setCouponInput(""),
    });
  };

  const startCheckout = () => {
    checkout.mutate(
      { gateway, referralCode: getReferralCode() },
      {
        // Leave the page for Stripe / SSLCommerz (or the success page for free carts)
        onSuccess: (result) => window.location.assign(result.checkoutUrl),
        onError: (error) => toast.error(error.message),
      }
    );
  };

  return (
    <Drawer open={open} onOpenChange={cartDrawer.set} direction="right">
      <DrawerContent className="flex h-full w-full flex-col p-0 sm:!max-w-md dark:bg-[#0B0F2E]">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-white/10">
          <DrawerTitle className="flex items-center gap-2 text-base font-semibold">
            <FiShoppingBag className="h-5 w-5" /> Your cart
            {cart.count > 0 && <span className="text-sm font-normal text-slate-500">({cart.count})</span>}
          </DrawerTitle>
          <button type="button" onClick={() => cartDrawer.close()} aria-label="Close cart" className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5">
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {cart.isLoading ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3">
            <Spinner />
            {cart.merging && <p className="text-sm text-slate-500 dark:text-slate-400">Moving your cart to your account…</p>}
          </div>
        ) : lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-white/[0.06]">
              <FiShoppingBag className="h-6 w-6" />
            </span>
            <p className="mt-4 font-semibold text-slate-900 dark:text-white">Your cart is empty</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Find a template, app or UI kit you like and add it here.</p>
            <Link
              href="/products"
              onClick={() => cartDrawer.close()}
              className="mt-6 inline-flex h-10 items-center rounded-full bg-slate-900 px-5 text-sm font-semibold text-white dark:bg-white dark:text-slate-900"
            >
              Browse products
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5">
              {server?.unavailable && server.unavailable.length > 0 && (
                <p className="mt-4 flex gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
                  <FiAlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  {server.unavailable.map((u) => u.title).join(", ")} {server.unavailable.length === 1 ? "is" : "are"} no longer
                  available and won&apos;t be charged.
                </p>
              )}
              <ul className="divide-y divide-slate-200 dark:divide-white/10">
                {lines.map((line) => (
                  <LineItem
                    key={line.productId}
                    line={line}
                    busy={busyId === line.productId}
                    onRemove={() => withBusy(line.productId, () => cart.removeItem(line.productId))}
                    onLicense={(licenseType) => changeLicense(line, licenseType)}
                  />
                ))}
              </ul>
            </div>

            <div className="space-y-4 border-t border-slate-200 px-5 py-4 dark:border-white/10">
              {cart.isAuthenticated &&
                (server?.couponCode ? (
                  <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-3 py-2 text-sm dark:bg-emerald-500/10">
                    <span className="inline-flex items-center gap-2 font-medium text-emerald-700 dark:text-emerald-300">
                      <FiTag className="h-4 w-4" /> {server.couponCode}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeCoupon.mutate(undefined)}
                      disabled={removeCoupon.isPending}
                      className="text-xs font-medium text-emerald-700 hover:underline dark:text-emerald-300"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={submitCoupon} className="flex gap-2">
                    <input
                      value={couponInput}
                      onChange={(e) => {
                        setCouponInput(e.target.value.toUpperCase());
                        if (applyCoupon.error) applyCoupon.reset();
                      }}
                      placeholder="Coupon code"
                      aria-label="Coupon code"
                      className="h-10 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm uppercase outline-none focus:border-[#1D6FE0]/50 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    />
                    <button
                      type="submit"
                      disabled={applyCoupon.isPending || !couponInput.trim()}
                      className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5"
                    >
                      {applyCoupon.isPending ? <Spinner size="sm" /> : "Apply"}
                    </button>
                  </form>
                ))}
              {applyCoupon.error && !server?.couponCode && (
                <p role="alert" className="-mt-2 text-xs text-rose-600 dark:text-rose-400">
                  {applyCoupon.error.message}
                </p>
              )}
              {server?.couponError && (
                <p className="text-xs text-amber-700 dark:text-amber-300">Coupon removed: {server.couponError}</p>
              )}

              <dl className="space-y-1.5 text-sm">
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <dt>Subtotal</dt>
                  <dd className="tabular-nums">{formatPrice(subtotal)}</dd>
                </div>
                {discountTotal > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                    <dt>Discount</dt>
                    <dd className="tabular-nums">−{formatPrice(discountTotal)}</dd>
                  </div>
                )}
                <div className="flex justify-between pt-1 text-base font-semibold text-slate-900 dark:text-white">
                  <dt>Total</dt>
                  <dd className="tabular-nums">{formatPrice(total)}</dd>
                </div>
              </dl>

              {cart.isAuthenticated ? (
                <>
                  {total > 0 && <GatewayPicker value={gateway} onChange={setGateway} />}
                  <button
                    type="button"
                    onClick={startCheckout}
                    disabled={checkout.isPending || lines.length === 0}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#0F5BBD] to-[#0F35A7] text-sm font-semibold text-white shadow-lg shadow-[#0F5BBD]/30 transition hover:brightness-110 disabled:opacity-60"
                  >
                    {checkout.isPending ? <Spinner size="sm" tone="light" /> : <FiLock className="h-4 w-4" />}
                    {total > 0 ? `Pay ${formatPrice(total)}` : "Get for free"}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href={`/login?callbackUrl=${encodeURIComponent(pathname)}`}
                    onClick={() => cartDrawer.close()}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#0F5BBD] to-[#0F35A7] text-sm font-semibold text-white shadow-lg shadow-[#0F5BBD]/30"
                  >
                    <FiLock className="h-4 w-4" /> Sign in to check out
                  </Link>
                  <p className="text-center text-xs text-slate-500 dark:text-slate-400">
                    Your cart is saved and moves to your account when you sign in. Coupons apply at checkout.
                  </p>
                </>
              )}
            </div>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}
