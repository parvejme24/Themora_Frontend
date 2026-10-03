const sections = [
  {
    title: "Information we collect",
    paragraphs: [
      "Depending on how you use Themora, we may receive information you provide, such as your name, email address, account details, messages to support, and information needed to fulfill an order.",
      "When you browse the site, technical information such as your device, browser, approximate usage activity, and cookie preferences may also be collected by us or by services that help operate the site.",
    ],
  },
  {
    title: "How we use information",
    paragraphs: [
      "We use information to operate and improve the site, manage accounts and orders, provide customer support, send service-related messages, help protect against fraud or misuse, and meet legal obligations.",
      "We may send promotional messages where permitted. You can opt out of marketing communications using the unsubscribe option in the message; essential account and order updates may still be sent.",
    ],
  },
  {
    title: "When information is shared",
    paragraphs: [
      "We may share relevant information with providers that support site hosting, analytics, customer communications, and order or payment processing. Those providers may use information only as needed to provide their services to us, subject to their own terms and privacy practices.",
      "We may also disclose information where required by law, to protect rights and safety, or in connection with a business transfer. We do not sell personal information for money.",
    ],
  },
  {
    title: "Cookies, retention, and security",
    paragraphs: [
      "Cookies and similar technologies may be used to keep the site working, remember preferences, and understand site usage. You can manage cookies through your browser settings; blocking some cookies may affect site features.",
      "We keep information for as long as needed for the purposes described here, including service delivery, recordkeeping, and legal requirements. We use reasonable safeguards, but no online service can guarantee absolute security.",
    ],
  },
  {
    title: "Your choices and this policy",
    paragraphs: [
      "Depending on where you live, you may have rights to request access to, correction of, or deletion of your personal information, or to object to certain uses. Contact us to make a request; we may need to verify your identity before responding.",
      "This site is not intended for children who are not permitted to use online services under the laws that apply to them. We may update this policy from time to time and will post the current version here with its effective date.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-4xl px-6 py-16 sm:py-24">
      <header className="border-b border-[#d9e1eb] pb-10 dark:border-[#293448]">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-[#1559a8] dark:text-[#8dbdff]">Legal</p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-[#10233f] sm:text-5xl dark:text-white">Privacy Policy</h1>
        <p className="mt-4 text-sm text-[#64748b] dark:text-[#a7b2c2]">Effective October 3, 2026</p>
        <p className="mt-6 max-w-2xl text-base leading-7 text-[#53647a] dark:text-[#b5c0cf]">
          This policy describes the information Themora may collect, how it is used, and the choices available to you.
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
        Privacy questions or requests? <a className="font-semibold text-[#1559a8] underline underline-offset-4 dark:text-[#8dbdff]" href="/contact">Contact our team</a>.
      </p>
    </article>
  );
}