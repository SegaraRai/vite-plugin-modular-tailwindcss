import { expect, test } from "@playwright/test";
import { env } from "node:process";

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
  await page.goto("/");

  const link = await page.locator("a");
  await link.click();

  await page.waitForURL("/secondary");

  await expect(page).toHaveScreenshot();

  const searchButton = await page.locator("my-search-button");

  await searchButton.hover();
  await expect(page).toHaveScreenshot();

  await searchButton.click();
  await expect(page).toHaveScreenshot();
});

test("virtual.html", async ({ page }) => {
  if (env.MTW_SERVE_PLUGIN === "lite") {
    test.fail();
  }

  await page.goto("/virtual");

  await expect(page).toHaveScreenshot();
});
