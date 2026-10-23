import React, { useEffect } from "react";
import { FiCheck, FiCreditCard, FiSmartphone } from "react-icons/fi";
import type { PaymentGateway } from "@/types/marketplace";
import { usePaymentConfig } from "@/hooks/usePaymentConfig";

const GATEWAYS: { value: PaymentGateway; title: string; detail: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: "stripe", title: "Card", detail: "Visa, Mastercard, Amex · charged in USD", icon: FiCreditCard },
  { value: "sslcommerz", title: "bKash, Nagad & local cards", detail: "Via SSLCommerz · charged in BDT", icon: FiSmartphone },
];

export default function GatewayPicker({ value, onChange }: { value: PaymentGateway; onChange: (value: PaymentGateway) => void }) {
  const { data: config } = usePaymentConfig();
  // A gateway without keys on the server can't take payments, so it can't be picked
  const isEnabled = (option: PaymentGateway) => !config || config.gateways[option].enabled;
  const fallback = GATEWAYS.find((g) => isEnabled(g.value))?.value;
  useEffect(() => {
    if (config && !config.gateways[value].enabled && fallback && fallback !== value) onChange(fallback);
  }, [config, value, fallback, onChange]);

  return (
    <fieldset>
      <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">Pay with</legend>
      <div className="grid gap-2">
        {GATEWAYS.map(({ value: option, title, detail, icon: Icon }) => {
          const checked = value === option;
          const enabled = isEnabled(option);
          return (
            <label
              key={option}
              className={`flex items-center gap-3 rounded-xl border p-3 transition ${
                !enabled
                  ? "cursor-not-allowed border-slate-200 opacity-50 dark:border-white/10"
                  : checked
                  ? "border-[#1D6FE0] bg-[#1D6FE0]/5 dark:border-[#8DB8FF] dark:bg-[#8DB8FF]/10"
                  : "cursor-pointer border-slate-200 hover:border-slate-300 dark:border-white/10 dark:hover:border-white/20"
              }`}
            >
              <input type="radio" name="gateway" value={option} checked={checked} disabled={!enabled} onChange={() => onChange(option)} className="sr-only" />
              <Icon className="h-5 w-5 shrink-0 text-slate-600 dark:text-slate-400" />
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold text-slate-900 dark:text-white">
                  {title}
                  {!enabled && (
                    <span className="whitespace-nowrap rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600 dark:bg-white/10 dark:text-slate-300">Not available yet</span>
                  )}
                  {option === "sslcommerz" && config?.gateways.sslcommerz.sandbox && (
                    <span className="whitespace-nowrap rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">Test mode</span>
                  )}
                </span>
                <span className="block text-xs text-slate-600 dark:text-slate-400">
                  {detail}
                  {option === "sslcommerz" && config && ` · $1 = ৳${config.usdToBdtRate}`}
                </span>
              </span>
              {checked && <FiCheck className="h-4 w-4 text-[#1D6FE0] dark:text-[#8DB8FF]" />}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
