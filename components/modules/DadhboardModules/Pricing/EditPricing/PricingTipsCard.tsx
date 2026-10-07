import React from "react";
import { FiHelpCircle } from "react-icons/fi";

const TIPS = [
  {
    title: "Recommended Plan:",
    text: "Pick one signature plan as \u201cRecommended\u201d to guide buyers toward your best-value tier.",
  },
  {
    title: "Feature Bullet Points:",
    text: "Keep each point concise (under 8 words) highlighting concrete value.",
  },
];

export default function PricingTipsCard() {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-white/10 dark:bg-[#0B0F2E]">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-white">
        <FiHelpCircle className="h-4 w-4 text-[#1D6FE0]" />
        <span>Pricing Best Practices</span>
      </div>
      <ul className="mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-400">
        {TIPS.map((tip) => (
          <li key={tip.title} className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
            <span>
              <strong>{tip.title}</strong> {tip.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
