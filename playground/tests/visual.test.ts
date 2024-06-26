import { expect, test } from "@playwright/test";

test("index.html", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveScreenshot();

  const menuButton = await page.locator("my-menu-button");
  const searchButton = await page.locator("my-search-button");

  await menuButton.hover();
  await expect(page).toHaveScreenshot();

  await menuButton.click();
  await expect(page).toHaveScreenshot();

  await searchButton.hover();
  await expect(page).toHaveScreenshot();

  await searchButton.click();
  await expect(page).toHaveScreenshot();
});

test("secondary.html", async ({ page }) => {
  await page.goto("/secondary");

  await expect(page).toHaveScreenshot();

  const searchButton = await page.locator("my-search-button");

  await searchButton.hover();
  await expect(page).toHaveScreenshot();

  await searchButton.click();
  await expect(page).toHaveScreenshot();
});
