"use client";

import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { FiCopy, FiDownload, FiShield, FiShieldOff } from "react-icons/fi";
import { toast } from "sonner";
import {
  useDisableTwoFactor,
  useEnableTwoFactor,
  usePreferences,
  useRegenerateRecoveryCodes,
  useStartTwoFactor,
  useUpdatePreferences,
} from "@/hooks/useAccountApi";
import PageHeader from "@/components/modules/DadhboardModules/dashboard/PageHeader";
import ErrorState from "@/components/shared/Feedback/ErrorState";
import Spinner, { LoadingState } from "@/components/shared/Feedback/Spinner";
import { Badge, Card, CardTitle, buttonClass, inputClass } from "./ui";

const RecoveryCodes = ({ codes, onDone }: { codes: string[]; onDone: () => void }) => {
  const text = codes.join("\n");
  const download = () => {
    const url = URL.createObjectURL(new Blob([`Themora recovery codes\n\n${text}\n`], { type: "text/plain" }));
    const link = Object.assign(document.createElement("a"), { href: url, download: "themora-recovery-codes.txt" });
    link.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="space-y-4">
      <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
        Save these recovery codes somewhere safe. Each one signs you in once if you lose your phone. They won&apos;t be shown again.
      </p>
      <ul className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-50 p-4 font-mono text-sm dark:bg-white/5">
        {codes.map((code) => (
          <li key={code}>{code}</li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(text);
            toast.success("Recovery codes copied");
          }}
          className={buttonClass.secondary}
        >
          <FiCopy className="h-4 w-4" /> Copy
        </button>
        <button type="button" onClick={download} className={buttonClass.secondary}>
          <FiDownload className="h-4 w-4" /> Download
        </button>
        <button type="button" onClick={onDone} className={buttonClass.primary}>
          I&apos;ve saved them
        </button>
      </div>
    </div>
  );
};

const TwoFactorCard = ({ enabled }: { enabled: boolean }) => {
  const start = useStartTwoFactor();
  const enable = useEnableTwoFactor();
  const disable = useDisableTwoFactor();
  const regenerate = useRegenerateRecoveryCodes();
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [codes, setCodes] = useState<string[] | null>(null);
  const [mode, setMode] = useState<"idle" | "disable" | "regenerate">("idle");

  if (codes) {
    return (
      <Card>
        <CardTitle title="Two-factor authentication" action={<Badge tone="green">On</Badge>} />
        <RecoveryCodes codes={codes} onDone={() => setCodes(null)} />
      </Card>
    );
  }

  // Setting up: scan, then confirm with a code
  if (!enabled && start.data) {
    return (
      <Card>
        <CardTitle title="Set up two-factor authentication" description="Scan the QR code with Google Authenticator, 1Password, Authy or a similar app." />
        <div className="flex flex-wrap items-start gap-6">
          <div className="rounded-2xl bg-white p-3 ring-1 ring-slate-200">
            <QRCodeSVG value={start.data.otpauthUrl} size={168} />
          </div>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              enable.mutate(
                { code: code.trim() },
                {
                  onSuccess: (result) => {
                    toast.success("Two-factor authentication is on");
                    setCode("");
                    start.reset();
                    if (result.recoveryCodes) setCodes(result.recoveryCodes);
                  },
                }
              );
            }}
            className="min-w-[240px] flex-1 space-y-3"
          >
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Can&apos;t scan? Enter this key manually:
              <code className="mt-1 block break-all rounded-lg bg-slate-50 px-2 py-1 font-mono text-xs dark:bg-white/5">{start.data.secret}</code>
            </p>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="6-digit code"
              aria-label="Code from your app"
              className={inputClass}
            />
            {enable.error && <p role="alert" className="text-sm text-rose-600 dark:text-rose-400">{enable.error.message}</p>}
            <div className="flex gap-2">
              <button type="button" onClick={() => start.reset()} className={buttonClass.secondary}>
                Cancel
              </button>
              <button type="submit" disabled={enable.isPending || code.trim().length < 6} className={buttonClass.primary}>
                {enable.isPending && <Spinner size="xs" tone="light" />} Turn on
              </button>
            </div>
          </form>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardTitle
        title="Two-factor authentication"
        description="Ask for a code from your phone when you sign in, so a stolen password isn't enough."
        action={<Badge tone={enabled ? "green" : "gray"}>{enabled ? "On" : "Off"}</Badge>}
      />
      {!enabled ? (
        <button type="button" onClick={() => start.mutate(undefined, { onError: (e) => toast.error(e.message) })} disabled={start.isPending} className={buttonClass.primary}>
          {start.isPending ? <Spinner size="xs" tone="light" /> : <FiShield className="h-4 w-4" />} Set up two-factor
        </button>
      ) : mode === "idle" ? (
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setMode("regenerate")} className={buttonClass.secondary}>
            New recovery codes
          </button>
          <button type="button" onClick={() => setMode("disable")} className={buttonClass.danger}>
            <FiShieldOff className="h-4 w-4" /> Turn off
          </button>
        </div>
      ) : (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const done = () => {
              setMode("idle");
              setCode("");
              setPassword("");
            };
            if (mode === "disable") {
              disable.mutate(code.trim() ? { code: code.trim() } : { password }, {
                onSuccess: () => {
                  toast.success("Two-factor authentication is off");
                  done();
                },
              });
            } else {
              regenerate.mutate({ code: code.trim() }, {
                onSuccess: (result) => {
                  done();
                  if (result.recoveryCodes) setCodes(result.recoveryCodes);
                },
              });
            }
          }}
          className="max-w-sm space-y-3"
        >
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {mode === "disable" ? "Confirm with a code from your app, or your password." : "Confirm with a code from your app. Your old recovery codes stop working."}
          </p>
          <input value={code} onChange={(e) => setCode(e.target.value)} autoComplete="one-time-code" placeholder="Code from your app" aria-label="Code" className={inputClass} />
          {mode === "disable" && (
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="current-password"
              placeholder="…or your password"
              aria-label="Password"
              className={inputClass}
            />
          )}
          {(disable.error || regenerate.error) && (
            <p role="alert" className="text-sm text-rose-600 dark:text-rose-400">
              {(disable.error ?? regenerate.error)?.message}
            </p>
          )}
          <div className="flex gap-2">
            <button type="button" onClick={() => setMode("idle")} className={buttonClass.secondary}>
              Cancel
            </button>
            <button type="submit" disabled={disable.isPending || regenerate.isPending} className={mode === "disable" ? buttonClass.danger : buttonClass.primary}>
              {mode === "disable" ? "Turn off" : "Create new codes"}
            </button>
          </div>
        </form>
      )}
    </Card>
  );
};

export default function SecurityContainer() {
  const { data: preferences, isLoading, error, refetch } = usePreferences();
  const update = useUpdatePreferences();

  if (isLoading) return <LoadingState className="min-h-[40vh]" />;
  if (!preferences) return <ErrorState error={error} subject="your settings" onRetry={refetch} />;

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader title="Security & email" description="Protect your account and choose which emails you get." />
      <TwoFactorCard enabled={preferences.twoFactorEnabled} />
      <Card>
        <CardTitle title="Email preferences" description="Receipts, security alerts and replies to your tickets are always sent." />
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={preferences.marketingEmails}
            disabled={update.isPending}
            onChange={(e) =>
              update.mutate({ marketingEmails: e.target.checked }, { onSuccess: () => toast.success("Preferences saved"), onError: (err) => toast.error(err.message) })
            }
            className="mt-1 h-4 w-4 accent-[#1D6FE0]"
          />
          <span>
            <span className="block text-sm font-medium text-slate-900 dark:text-white">Offers and reminders</span>
            <span className="block text-sm text-slate-500 dark:text-slate-400">Sales, new releases and a nudge when you leave something in your cart.</span>
          </span>
        </label>
      </Card>
    </div>
  );
}
