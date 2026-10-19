import React from "react";
import { FiCheck, FiCreditCard, FiSmartphone } from "react-icons/fi";
import type { PaymentGateway } from "@/types/marketplace";

const GATEWAYS: { value: PaymentGateway; title: string; detail: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: "stripe", title: "Card", detail: "Visa, Mastercard, Amex · charged in USD", icon: FiCreditCard },
  { value: "sslcommerz", title: "bKash, Nagad & local cards", detail: "Via SSLCommerz · charged in BDT", icon: FiSmartphone },
];

export default function GatewayPicker({ value, onChange }: { value: PaymentGateway; onChange: (value: PaymentGateway) => void }) {
  return (
    <fieldset>
      <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Pay with</legend>
      <div className="grid gap-2">
        {GATEWAYS.map(({ value: option, title, detail, icon: Icon }) => {
          const checked = value === option;
          return (
            <label
              key={option}
              className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${
                checked
                  ? "border-[#1D6FE0] bg-[#1D6FE0]/5 dark:border-[#8DB8FF] dark:bg-[#8DB8FF]/10"
                  : "border-slate-200 hover:border-slate-300 dark:border-white/10 dark:hover:border-white/20"
              }`}
            >
              <input type="radio" name="gateway" value={option} checked={checked} onChange={() => onChange(option)} className="sr-only" />
              <Icon className="h-5 w-5 shrink-0 text-slate-500 dark:text-slate-400" />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-slate-900 dark:text-white">{title}</span>
                <span className="block text-xs text-slate-500 dark:text-slate-400">{detail}</span>
              </span>
              {checked && <FiCheck className="h-4 w-4 text-[#1D6FE0] dark:text-[#8DB8FF]" />}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
