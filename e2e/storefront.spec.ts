import { expect, test } from "@playwright/test";
import { clearServerCart, drawer, openCart, signIn } from "./helpers";

test.describe("storefront", () => {
  test("browse, filter, search and open a product @mobile", async ({ page }) => {
    await page.goto("/products");
    await expect(page.locator("article").first()).toBeVisible();
    const count = page.locator('section[aria-label="Products"] p[aria-live]');
    const total = Number((await count.innerText()).split(" ")[0]);
    expect(total).toBeGreaterThan(0);

    await page.goto("/products?type=MOBILE_APP");
    await expect(page.locator("article").first()).toContainText("Mobile App");
    const filtered = Number((await count.innerText()).split(" ")[0]);
    expect(filtered).toBeLessThan(total);

    await page.getByRole("searchbox", { name: "Search products" }).fill("flutter");
    await expect(page).toHaveURL(/q=flutter/);
    await expect(count).toContainText("for “flutter”");

    await page.locator("article a.line-clamp-1").first().click();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("tab", { name: /Reviews/ })).toBeVisible();
  });

  test("product page shows structured data and reviews", async ({ page }) => {
    await page.goto("/products/nimbus-nextjs-saas-starter");
    const jsonLd = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent()) ?? "{}");
    expect(jsonLd["@type"]).toBe("Product");
    expect(Number(jsonLd.offers.price)).toBeGreaterThan(0);
    await page.getByRole("tab", { name: /Reviews/ }).click();
    await expect(page.locator('[role="tabpanel"] ul > li').first()).toBeVisible();
  });

  test("guest cart moves into the account after sign-in, coupons are checked", async ({ page }) => {
    await page.goto("/products?sort=bestselling");
    const add = page.locator('article button[aria-label$=" to cart"][aria-label^="Add "]').first();
    await add.click();
    await expect(drawer(page).locator("li")).toHaveCount(1);
    await expect(drawer(page).getByRole("link", { name: /Sign in to check out/ })).toBeVisible();

    await signIn(page, "customer", "/products");
    await openCart(page);
    await expect(drawer(page).locator("li")).toHaveCount(1, { timeout: 60_000 });
    expect(await page.evaluate(() => localStorage.getItem("themora-guest-cart"))).toBeNull();

    // A coupon that doesn't apply shows its reason inline
    await drawer(page).getByLabel("Coupon code").fill("SAVE15");
    await drawer(page).getByRole("button", { name: "Apply" }).click();
    await expect(drawer(page).getByRole("alert")).toContainText(/Spend at least|does not apply|not valid/i);
    await expect(drawer(page).getByRole("button", { name: /^Pay \$/ })).toBeVisible();

    await clearServerCart(page);
  });

  test("checkout redirects to Stripe", async ({ page }) => {
    test.skip(!process.env.E2E_STRIPE, "Set E2E_STRIPE=1 once the backend has Stripe test keys");
    await signIn(page, "customer", "/products");
    await page.locator('article button[aria-label$=" to cart"][aria-label^="Add "]').first().click();
    await drawer(page).getByRole("button", { name: /^Pay \$/ }).click();
    await page.waitForURL(/checkout\.stripe\.com/, { timeout: 60_000 });
    await page.goBack();
    await clearServerCart(page);
  });

  test("compare two products", async ({ page }) => {
    await page.goto("/products");
    const toggles = page.locator('article button[aria-label="Add to comparison"]');
    await toggles.nth(0).click();
    await toggles.nth(1).click();
    await page.getByRole("link", { name: "Compare" }).last().click();
    await expect(page.locator("table thead a.line-clamp-2")).toHaveCount(2);
    await page.getByRole("button", { name: "Clear all" }).click();
  });

  test("legal pages and SEO files are served", async ({ page, request }) => {
    for (const path of ["/terms", "/privacy", "/license", "/refund-policy"]) {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    }
    expect((await request.get("/robots.txt")).status()).toBe(200);
    expect(await (await request.get("/sitemap.xml")).text()).toContain("<urlset");
  });
});
