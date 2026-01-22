import { expect, test } from "@playwright/test";

test("marketing flow navigates from landing to signup to founders checkout", async ({ page }) => {
  await page.route("**/api/onboarding/register", route =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ listenerId: "listener-1", status: "pending" })
    })
  );

  await page.goto("/");

  await page.getByRole("link", { name: "Start Founders checkout" }).click();
  await expect(page).toHaveURL(/\/founders/);

  await page.getByRole("link", { name: "Email onboarding" }).click();
  await expect(page).toHaveURL(/\/signup/);

  await expect(page.locator("form.studio-form")).toHaveAttribute(
    "data-hydrated",
    "true"
  );

  await page.getByLabel("Email address").fill("listener@example.com");
  await Promise.all([
    page.waitForResponse("**/api/onboarding/register"),
    page.getByRole("button", { name: "Join the Founders list" }).click()
  ]);

  await expect(page.getByText(/You are on the list\./)).toBeVisible();
  await page.getByRole("link", { name: "Continue to checkout" }).click();
  await expect(page).toHaveURL(/\/founders/);
});
