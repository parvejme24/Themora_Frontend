import { expect, type Page } from "@playwright/test";

export const accounts = {
  customer: { email: process.env.E2E_CUSTOMER_EMAIL ?? "sarah.user@themora.test", password: process.env.E2E_CUSTOMER_PASSWORD ?? "User@Themora2026!" },
  admin: { email: process.env.E2E_ADMIN_EMAIL ?? "admin@themora.test", password: process.env.E2E_ADMIN_PASSWORD ?? "Admin@Themora2026!" },
};

export const API_URL = process.env.E2E_API_URL ?? "http://localhost:5050/api/v1";

export async function signIn(page: Page, who: keyof typeof accounts, callbackUrl = "/dashboard") {
  const { email, password } = accounts[who];
  await page.goto(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.locator("form").getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL((url) => url.pathname === callbackUrl.split("?")[0], { timeout: 60_000 });
}

/** Empties the signed-in user's server cart through the API (test cleanup) */
export async function clearServerCart(page: Page) {
  await page.evaluate(async (api) => {
    const token = localStorage.getItem("nextAuthSecret");
    if (token) await fetch(`${api}/me/cart`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
  }, API_URL);
}

export const drawer = (page: Page) => page.locator('[data-vaul-drawer-direction="right"]');

export async function openCart(page: Page) {
  await page.getByRole("button", { name: /^Open cart/ }).click();
  await expect(drawer(page)).toBeVisible();
}
