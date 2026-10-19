import { expect, test } from "@playwright/test";
import { signIn } from "./helpers";

test.describe("auth", () => {
  test("wrong password shows the backend's message", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("sarah.user@themora.test");
    await page.getByLabel("Password", { exact: true }).fill("definitely-wrong");
    await page.locator("form").getByRole("button", { name: /sign in/i }).click();
    await expect(page.getByText("Invalid email or password")).toBeVisible();
  });

  test("dashboard requires sign-in", async ({ page }) => {
    await page.goto("/dashboard/library");
    await expect(page).toHaveURL(/\/login\?callbackUrl=%2Fdashboard%2Flibrary/);
  });
});

test.describe("customer dashboard", () => {
  test("library, orders, invoice and settings", async ({ page }) => {
    await signIn(page, "customer", "/dashboard/library");
    await expect(page.getByRole("heading", { name: "My library" })).toBeVisible();
    await expect(page.locator("main ul > li").first()).toBeVisible();

    await page.goto("/dashboard/orders");
    await expect(page.locator("main ul > li").first()).toBeVisible();
    await page.getByRole("link", { name: "Invoice" }).first().click();
    await expect(page.locator(".tf-invoice")).toContainText("Invoice");

    await page.goto("/dashboard/security");
    await expect(page.getByText("Two-factor authentication")).toBeVisible();
  });

  test("customers can't open admin pages", async ({ page }) => {
    await signIn(page, "customer", "/dashboard");
    await page.goto("/dashboard/refunds");
    await expect(page.getByText("You don't have access to this page")).toBeVisible();
  });
});

test.describe("admin", () => {
  test("create a draft product, publish it, then delete it", async ({ page }) => {
    await signIn(page, "admin", "/dashboard/products/new");
    const title = `E2E product ${Date.now().toString(36)}`;
    await page.locator("#title").fill(title);
    await page.locator("#shortDescription").fill("Temporary product created by the end-to-end tests.");
    await page.locator("#categoryId option").nth(1).waitFor({ state: "attached" });
    await page.locator("#categoryId").selectOption({ index: 1 });
    await page.locator("#price").fill("39");
    await page.getByRole("button", { name: "Create" }).click();
    await page.waitForURL(/\/versions$/);
    await expect(page.getByText("Release history")).toBeVisible();

    await page.goto("/dashboard/products");
    await page.getByLabel("Search products").fill(title);
    const row = page.locator("main tbody tr", { hasText: title });
    await expect(row).toContainText("Draft");
    await row.getByRole("button", { name: "Publish" }).click();
    await expect(row).toContainText("Published");

    page.once("dialog", (dialog) => dialog.accept());
    await row.getByRole("button", { name: "Delete" }).click();
    await expect(page.locator("main tbody tr", { hasText: title })).toHaveCount(0);
  });

  test("analytics, queues and audit log load", async ({ page }) => {
    await signIn(page, "admin", "/dashboard/analytics");
    await expect(page.locator("main canvas")).toHaveCount(2);
    for (const [path, text] of [
      ["/dashboard/tickets", "Support queue"],
      ["/dashboard/refunds", "Refunds"],
      ["/dashboard/reviews", "Reviews"],
      ["/dashboard/coupons", "Coupons & sales"],
      ["/dashboard/affiliates", "Affiliates"],
      ["/dashboard/audit-log", "Audit log"],
    ]) {
      await page.goto(path);
      await expect(page.getByRole("heading", { name: text, level: 1 })).toBeVisible();
    }
  });
});
