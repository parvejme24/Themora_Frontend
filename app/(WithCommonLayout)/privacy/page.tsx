import type { Metadata } from "next";
import LegalPage from "@/components/shared/Legal/LegalPage";

export const metadata: Metadata = { title: "Privacy & cookies | Themora" };

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

export default function Page() {
  return <LegalPage title="Privacy & cookies" effective="October 19, 2026" intro="How Themora collects, uses and protects your information, and what we store in your browser." sections={[...sections, {
      title: "Cookies and browser storage",
      id: "cookies",
      paragraphs: [
        "We only use what the site needs to work: a sign-in cookie that keeps you logged in, and browser storage for your theme (light or dark), a cart you build before signing in, products you pick to compare, and a referral code for 30 days if you arrived through an affiliate link.",
        "We don't use advertising or third-party tracking cookies. Payment pages are run by Stripe and SSLCommerz, which set their own cookies under their policies. Clearing your browser data removes everything we store.",
      ],
    }]} />;
}
