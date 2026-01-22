import { expect, test } from "@playwright/test";

test("successful payment redirects to unlocked library", async ({ page }) => {
  await page.route("**/api/checkout/start", route =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        url: "/library?email=listener@example.com"
      })
    })
  );

  await page.route("**/api/entitlements?*", route => {
    const url = route.request().url();
    if (!url.includes("email=listener%40example.com")) {
      route.fallback();
      return;
    }

    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        entitlements: [
          {
            productId: "founders_lifetime"
          }
        ]
      })
    });
  });

  await page.goto("/founders");

  await page.getByLabel("Email address").fill("listener@example.com");
  await page.getByRole("button", { name: "Continue to payment" }).click();

  await expect(page).toHaveURL(/\/library\?email=listener%40example\.com/);
  await expect(page.getByText("Library unlocked")).toBeVisible();
});
