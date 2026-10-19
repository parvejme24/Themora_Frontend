import type { Metadata } from "next";
import Link from "next/link";
import LegalPage, { type LegalSection } from "@/components/shared/Legal/LegalPage";

export const metadata: Metadata = { title: "Terms & Conditions | Themora" };

const sections: LegalSection[] = [
  {
    title: "Using Themora",
    paragraphs: [
      "By accessing Themora, you agree to these Terms. You must use the site lawfully, provide accurate information when creating an account or placing an order, and keep your sign-in details secure. You are responsible for activity carried out through your account.",
      "You may not misuse the site, interfere with its operation, attempt unauthorized access, or use it to violate another person's rights or applicable law.",
    ],
  },
  {
    title: "Purchases and product licenses",
    paragraphs: [
      <>Prices, product descriptions, and any purchase conditions are shown on the relevant product or checkout page. A purchase does not transfer ownership of a product&apos;s underlying intellectual property. What you may build with it is set out in our <Link href="/license" className="font-medium text-[#1559a8] underline underline-offset-4 dark:text-[#8dbdff]">Licence terms</Link> for the Single or Extended licence you choose.</>,
      "Do not resell, redistribute, or publicly share purchased files unless the applicable product license expressly allows it. Contact us before purchasing if you need clarification about a license.",
    ],
  },
  {
    title: "Payments and order issues",
    paragraphs: [
      "Payment options and any applicable taxes are displayed during checkout. Payment processing may be provided by a third party and is also subject to that provider's terms. If you have a problem with an order, contact us with the order details so we can look into it.",
      <>Refunds follow our <Link href="/refund-policy" className="font-medium text-[#1559a8] underline underline-offset-4 dark:text-[#8dbdff]">Refund policy</Link>: requests within 14 days of payment are reviewed case by case. All-Access subscriptions can be cancelled at any time and run until the end of the paid period. Nothing in these Terms limits rights that cannot be excluded under applicable consumer-protection law.</>,
    ],
  },
  {
    title: "Site content and availability",
    paragraphs: [
      "Themora and its original site content are protected by intellectual-property laws. Except for rights expressly granted to you, we and our licensors retain ownership of that content.",
      "We may update, change, or discontinue parts of the site. The site is provided subject to applicable law, and we do not guarantee uninterrupted or error-free availability.",
    ],
  },
  {
    title: "Liability and changes to these Terms",
    paragraphs: [
      "To the extent permitted by law, Themora is not liable for indirect or consequential loss arising from use of the site. These Terms do not exclude liability where doing so would be unlawful, including any non-excludable consumer rights.",
      "We may revise these Terms as the service changes. The current version will appear on this page with its effective date. Continued use after an update means the updated Terms apply to future use.",
    ],
  },
];

export default function Page() {
  return <LegalPage title="Terms & Conditions" effective="October 19, 2026" intro="These terms explain the rules for using Themora and purchasing products through the site." sections={[...sections]} />;
}
