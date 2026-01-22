import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

async function focusViaTab(page: Page, locator: Locator) {
  await page.click("body");
  for (let step = 0; step < 12; step += 1) {
    if (await locator.evaluate(element => element === document.activeElement)) {
      return;
    }
    await page.keyboard.press("Tab");
  }
  throw new Error("Unable to focus target element via keyboard.");
}

async function expectVisibleFocus(page: Page, locator: Locator) {
  await focusViaTab(page, locator);
  const focusStyles = await locator.evaluate(element => {
    const style = window.getComputedStyle(element);
    return {
      outlineStyle: style.outlineStyle,
      outlineWidth: style.outlineWidth,
      boxShadow: style.boxShadow
    };
  });

  expect(
    focusStyles.outlineStyle !== "none" ||
      focusStyles.outlineWidth !== "0px" ||
      focusStyles.boxShadow !== "none"
  ).toBeTruthy();
}

test("focus indicators are visible for keyboard navigation", async ({ page }) => {
  await page.goto("/");
  await expectVisibleFocus(page, page.getByRole("link", { name: "Start Founders checkout" }));

  await page.goto("/signup");
  await expectVisibleFocus(page, page.getByLabel("Email address"));

  await page.goto("/founders");
  await expectVisibleFocus(page, page.getByRole("link", { name: "Back to overview" }));
});
