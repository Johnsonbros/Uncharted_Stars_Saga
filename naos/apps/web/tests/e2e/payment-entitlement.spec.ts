import { expect, test } from "@playwright/test";

test("successful payment unlocks library access", async ({ page }) => {
  await page.route("**/api/checkout/start", route =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ url: "/library?email=listener@example.com" })
    })
  );

  await page.route(
    /\/api\/entitlements\?email=listener%40example.com/,
    route =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          entitlements: [{ id: "ent_123", status: "active", tier: "founder" }]
        })
      })
  );

  await page.goto("/founders");

  await page.getByLabel("Email address").fill("listener@example.com");
  await page.getByRole("button", { name: "Continue to payment" }).click();

  await expect(page).toHaveURL(/\/library\?email=listener@example.com/);
  await expect(page.getByTestId("library-access-status")).toContainText(
    "Library access unlocked"
  );
});
