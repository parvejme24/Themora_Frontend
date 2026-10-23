import React, { useEffect } from "react";
import { FiCheck, FiCreditCard, FiSmartphone } from "react-icons/fi";
import type { PaymentGateway } from "@/types/marketplace";
import { usePaymentConfig } from "@/hooks/usePaymentConfig";

const GATEWAYS: { value: PaymentGateway; title: string; currency: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: "stripe", title: "Card", currency: "USD", icon: FiCreditCard },
  { value: "sslcommerz", title: "bKash · Nagad", currency: "BDT", icon: FiSmartphone },
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
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {GATEWAYS.map(({ value: option, title, currency, icon: Icon }) => {
          const checked = value === option;
          const enabled = isEnabled(option);
          return (
            <label
              key={option}
              title={!enabled ? "Not available yet" : undefined}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 transition ${
                !enabled
                  ? "cursor-not-allowed border-slate-200 opacity-50 dark:border-white/10"
                  : checked
                    ? "cursor-pointer border-[#1D6FE0] bg-[#1D6FE0]/5 dark:border-[#8DB8FF] dark:bg-[#8DB8FF]/10"
                    : "cursor-pointer border-slate-200 hover:border-slate-300 dark:border-white/10 dark:hover:border-white/20"
              }`}
            >
              <input type="radio" name="gateway" value={option} checked={checked} disabled={!enabled} onChange={() => onChange(option)} className="sr-only" />
              <Icon className={`h-4 w-4 shrink-0 ${checked ? "text-[#1D6FE0] dark:text-[#8DB8FF]" : "text-slate-500 dark:text-slate-400"}`} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-slate-900 dark:text-white">{title}</span>
                <span className="block text-[11px] text-slate-500 dark:text-slate-400">{currency}</span>
              </span>
              {checked && <FiCheck className="h-4 w-4 shrink-0 text-[#1D6FE0] dark:text-[#8DB8FF]" />}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
