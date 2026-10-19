import type { Metadata } from "next";
import LegalPage from "@/components/shared/Legal/LegalPage";

export const metadata: Metadata = {
  title: "Licence terms | Themora",
  description: "What the Single and Extended licences allow you to build with Themora templates, apps and UI kits.",
};

export default function LicensePage() {
  return (
    <LegalPage
      title="Licence terms"
      effective="October 19, 2026"
      intro="Every purchase comes with a licence key. It lets you use the product in your projects; it doesn't transfer ownership of the product itself."
      sections={[
        {
          title: "Single licence",
          id: "single",
          paragraphs: [
            "Use the product to build one end product for yourself or one client, deployed on one domain (or published as one mobile app). The end product can be free or commercial.",
            "You can modify the code and designs as much as you like. Moving the end product to another domain is fine: remove the old domain from the licence in your dashboard to free the slot.",
          ],
        },
        {
          title: "Extended licence",
          id: "extended",
          paragraphs: [
            "Use the product in unlimited end products and domains, including SaaS applications where users pay to access the product, and work you deliver to multiple clients.",
            "You can upgrade a Single licence to Extended at any time from your library by paying the difference. The licence key stays the same.",
          ],
        },
        {
          title: "All-Access subscription",
          id: "all-access",
          paragraphs: [
            "While your subscription is active you can download every product and use each one under the Single licence terms. End products you launched while subscribed may stay online after the subscription ends; you can't start new projects with products downloaded under it.",
          ],
        },
        {
          title: "What no licence allows",
          paragraphs: [
            "You may not resell, sublicense, share or redistribute the product's source files, designs or assets on their own or as part of a template, theme, UI kit or starter product that competes with the original, even if modified.",
            "You may not use the product in anything unlawful, or claim the original work as your own outside your end product.",
          ],
        },
        {
          title: "Third-party assets",
          paragraphs: [
            "Some products include fonts, icons, images or libraries under their own licences (for example MIT or SIL Open Font Licence). Those terms are listed in the product's documentation and apply alongside this licence. Demo images shown in previews may not be included in the download.",
          ],
        },
        {
          title: "Licence keys and activation",
          paragraphs: [
            "Products that check their licence send the key and domain to Themora's licence API. No personal information is shared with the product. Single licences activate on one domain; Extended licences have no limit.",
            "Refunded or charged-back orders deactivate their licences.",
          ],
        },
      ]}
    />
  );
}
