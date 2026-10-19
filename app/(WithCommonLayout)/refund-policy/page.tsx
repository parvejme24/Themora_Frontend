import type { Metadata } from "next";
import LegalPage from "@/components/shared/Legal/LegalPage";

export const metadata: Metadata = {
  title: "Refund policy | Themora",
  description: "When and how you can get a refund for Themora products and subscriptions.",
};

// Keep in step with REFUND_WINDOW_DAYS on the backend (default 14)
const REFUND_DAYS = 14;

export default function RefundPolicyPage() {
  return (
    <LegalPage
      title="Refund policy"
      effective="October 19, 2026"
      intro={`Digital products can't be returned, so we review refunds case by case. If something isn't right, ask within ${REFUND_DAYS} days and we'll make it right.`}
      sections={[
        {
          title: "When you can ask for a refund",
          paragraphs: [
            `You can request a refund within ${REFUND_DAYS} days of payment if the product doesn't work as described, is missing files or features shown on its page, or has a problem our support team can't fix.`,
            "Before requesting a refund, consider opening a support ticket: most setup problems are solved quickly, and support is included with every purchase.",
          ],
        },
        {
          title: "When refunds aren't available",
          paragraphs: [
            "We don't usually refund purchases made by mistake after the files have been downloaded, products bought for a feature that isn't listed on the product page, or orders older than the refund window.",
            "Free products and orders paid entirely with a 100% coupon can't be refunded. Nothing in this policy limits rights you have under consumer-protection law.",
          ],
        },
        {
          title: "How to request a refund",
          paragraphs: [
            "Go to Dashboard → Orders and choose “Request refund” on the order. Tell us briefly what went wrong. You'll get an email with our decision, normally within two business days.",
          ],
        },
        {
          title: "What happens when a refund is approved",
          paragraphs: [
            "The money goes back to the original payment method: cards through Stripe, and bKash, Nagad or local cards through SSLCommerz. Banks and wallets usually show it within 5–10 business days.",
            "The licences issued with that order stop working and the files can no longer be downloaded. Please delete any copies you made.",
          ],
        },
        {
          title: "Subscriptions",
          paragraphs: [
            "All-Access card subscriptions can be cancelled at any time from Dashboard → Subscription; you keep access until the end of the period you paid for and won't be charged again.",
            `We normally refund a subscription payment requested within ${REFUND_DAYS} days if nothing was downloaded during that period. Refunding a subscription payment ends the subscription immediately.`,
          ],
        },
      ]}
    />
  );
}
