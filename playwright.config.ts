import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests for the critical flows. They run against a running stack:
 *   backend:  cd ../Themora_Backend && npm run dev      (port 5050)
 *   frontend: npm run build && npx next start -p 3000
 * Then: npm run e2e   (or E2E_BASE_URL=https://… npm run e2e for another environment)
 *
 * They use the demo accounts from the seed and clean up what they create.
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 90_000,
  expect: { timeout: 20_000 },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    // Uses the installed Chrome; run `npx playwright install chromium` to use Playwright's own
    channel: process.env.E2E_BROWSER_CHANNEL ?? "chrome",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], channel: process.env.E2E_BROWSER_CHANNEL ?? "chrome" } },
    { name: "mobile", use: { ...devices["Pixel 7"], channel: process.env.E2E_BROWSER_CHANNEL ?? "chrome" }, grep: /@mobile/ },
  ],
});
