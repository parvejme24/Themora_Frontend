import React from "react";
import Link from "next/link";

export interface LegalSection {
  title: string;
  id?: string;
  paragraphs: React.ReactNode[];
}

/** Shared layout for Terms, Privacy, Refund policy and Licence terms */
export default function LegalPage({
  title,
  effective,
  intro,
  sections,
}: {
  title: string;
  effective: string;
  intro: React.ReactNode;
  sections: LegalSection[];
}) {
  return (
    <article className="mx-auto max-w-4xl px-6 py-16 sm:py-24">
      <header className="border-b border-[#d9e1eb] pb-10 dark:border-[#293448]">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-[#1559a8] dark:text-[#8dbdff]">Legal</p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-[#10233f] sm:text-5xl dark:text-white">{title}</h1>
        <p className="mt-4 text-sm text-[#64748b] dark:text-[#a7b2c2]">Effective {effective}</p>
        <p className="mt-6 max-w-2xl text-base leading-7 text-[#53647a] dark:text-[#b5c0cf]">{intro}</p>
        <nav aria-label="Legal pages" className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm">
          {[
            ["/terms", "Terms"],
            ["/license", "Licence terms"],
            ["/refund-policy", "Refund policy"],
            ["/privacy", "Privacy & cookies"],
          ].map(([href, label]) => (
            <Link key={href} href={href} className="font-medium text-[#1559a8] underline-offset-4 hover:underline dark:text-[#8dbdff]">
              {label}
            </Link>
          ))}
        </nav>
      </header>

      <div className="divide-y divide-[#d9e1eb] dark:divide-[#293448]">
        {sections.map((section, index) => (
          <section key={section.title} id={section.id} className="grid scroll-mt-24 gap-3 py-8 sm:grid-cols-[3rem_1fr] sm:gap-6">
            <span className="pt-1 font-mono text-xs text-[#8a9aaf]">{String(index + 1).padStart(2, "0")}</span>
            <div>
              <h2 className="text-xl font-semibold text-[#10233f] dark:text-white">{section.title}</h2>
              <div className="mt-3 space-y-4 text-[15px] leading-7 text-[#53647a] dark:text-[#b5c0cf]">
                {section.paragraphs.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </div>
          </section>
        ))}
      </div>

      <p className="border-t border-[#d9e1eb] pt-7 text-sm leading-6 text-[#64748b] dark:border-[#293448] dark:text-[#a7b2c2]">
        Questions?{" "}
        <Link className="font-semibold text-[#1559a8] underline underline-offset-4 dark:text-[#8dbdff]" href="/contact">
          Contact our team
        </Link>
        .
      </p>
    </article>
  );
}
