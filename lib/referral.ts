import { api } from "@/lib/api";

// Affiliate attribution: a ?ref=CODE visit is remembered for 30 days and
// sent as `referralCode` at checkout. The backend ignores self-referrals.
const KEY = "themora-ref";
const TTL_MS = 30 * 24 * 60 * 60 * 1000;
const CODE_PATTERN = /^[A-Za-z0-9_-]{2,30}$/;

export const getReferralCode = (): string | undefined => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return undefined;
    const { code, expiresAt } = JSON.parse(raw) as { code: string; expiresAt: number };
    if (Date.now() > expiresAt) {
      localStorage.removeItem(KEY);
      return undefined;
    }
    return code;
  } catch {
    return undefined;
  }
};

/** Call once per page load; records the click when the URL carries ?ref= */
export const captureReferral = () => {
  const code = new URLSearchParams(window.location.search).get("ref")?.trim();
  if (!code || !CODE_PATTERN.test(code)) return;
  try {
    localStorage.setItem(KEY, JSON.stringify({ code, expiresAt: Date.now() + TTL_MS }));
  } catch {
    // Storage unavailable; attribution only works for this visit
  }
  api
    .post("/affiliates/click", {
      code,
      landingPath: window.location.pathname,
      referrer: document.referrer || undefined,
    })
    .catch(() => {
      // Unknown or suspended codes are ignored
    });
};
