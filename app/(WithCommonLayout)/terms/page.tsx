const sections = [
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
      "Prices, product descriptions, and any purchase conditions are shown on the relevant product or checkout page. A purchase does not transfer ownership of a product's underlying intellectual property. Your permitted use is governed by the license or usage terms presented with that product at purchase.",
      "Do not resell, redistribute, or publicly share purchased files unless the applicable product license expressly allows it. Contact us before purchasing if you need clarification about a license.",
    ],
  },
  {
    title: "Payments and order issues",
    paragraphs: [
      "Payment options and any applicable taxes are displayed during checkout. Payment processing may be provided by a third party and is also subject to that provider's terms. If you have a problem with an order, contact us with the order details so we can look into it.",
      "Any cancellation or refund terms shown at checkout or for a specific product form part of that purchase. Nothing in these Terms limits rights that cannot be excluded under applicable consumer-protection law.",
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

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-4xl px-6 py-16 sm:py-24">
      <header className="border-b border-[#d9e1eb] pb-10 dark:border-[#293448]">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-[#1559a8] dark:text-[#8dbdff]">Legal</p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-[#10233f] sm:text-5xl dark:text-white">Terms &amp; Conditions</h1>
        <p className="mt-4 text-sm text-[#64748b] dark:text-[#a7b2c2]">Effective October 3, 2026</p>
        <p className="mt-6 max-w-2xl text-base leading-7 text-[#53647a] dark:text-[#b5c0cf]">
          These terms explain the rules for using Themora and purchasing products through the site.
        </p>
      </header>

      <div className="divide-y divide-[#d9e1eb] dark:divide-[#293448]">
        {sections.map((section, index) => (
          <section key={section.title} className="grid gap-3 py-8 sm:grid-cols-[3rem_1fr] sm:gap-6">
            <span className="pt-1 font-mono text-xs text-[#8a9aaf]">0{index + 1}</span>
            <div>
              <h2 className="text-xl font-semibold text-[#10233f] dark:text-white">{section.title}</h2>
              <div className="mt-3 space-y-4 text-[15px] leading-7 text-[#53647a] dark:text-[#b5c0cf]">
                {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>
            </div>
          </section>
        ))}
      </div>

      <p className="border-t border-[#d9e1eb] pt-7 text-sm leading-6 text-[#64748b] dark:border-[#293448] dark:text-[#a7b2c2]">
        Questions about these Terms? <a className="font-semibold text-[#1559a8] underline underline-offset-4 dark:text-[#8dbdff]" href="/contact">Contact our team</a>.
      </p>
    </article>
  );
}