import {
  chromium,
  type Browser,
  type BrowserContext,
  type Page,
} from "@playwright/test";
import { configureToMatchImageSnapshot } from "jest-image-snapshot";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, it, expect } from "vitest";

const ORIGIN = "http://localhost:5188";

const toMatchImageSnapshot = configureToMatchImageSnapshot({
  customSnapshotsDir: fileURLToPath(
    new URL("./__image_snapshots__", import.meta.url)
  ),
  failureThresholdType: "pixel",
  failureThreshold: 10,
});
expect.extend({ toMatchImageSnapshot });

let browser: Browser;
let context: BrowserContext;
let page: Page;
beforeAll(async () => {
  browser = await chromium.launch({
    args: [
      "--disable-gpu",
      "--disable-font-subpixel-positioning",
      "--disable-lcd-text",
      "--font-render-hinting=none",
      "--enable-font-antialiasing",
      "--force-color-profile=srgb",
    ],
  });
  context = await browser.newContext();
  page = await context.newPage();
  await page.setViewportSize({ width: 640, height: 360 });
});

afterAll(async () => {
  await browser.close();
});

it("index.html", async () => {
  await page.goto(`${ORIGIN}/`);

  const image = await page.screenshot();
  expect(image).toMatchImageSnapshot();
});

it("secondary.html", async () => {
  await page.goto(`${ORIGIN}/secondary`);

  const image = await page.screenshot();
  expect(image).toMatchImageSnapshot();
});
