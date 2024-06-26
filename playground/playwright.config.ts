import { env } from "node:process";
import { defineConfig, devices } from "@playwright/test";

const PORT = 5188;

const CI = !!env.CI;
const DEV = env.PLAYGROUND_ENV !== "preview";

console.info(
  `[playwright] Running in ${DEV ? "development" : "preview"} mode (${CI ? "CI" : "local"})`
);

export default defineConfig({
  testDir: "tests",
  fullyParallel: true,
  forbidOnly: !!CI,
  retries: CI ? 2 : 0,
  workers: CI ? 1 : undefined,
  reporter: CI ? "github" : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 640, height: 360 },
        deviceScaleFactor: 1,
      },
    },
  ],
  webServer: {
    command: DEV
      ? `pnpm dev --port ${PORT}`
      : `pnpm build && pnpm preview --port ${PORT}`,
    env: {
      MTW_PLUGIN: DEV ? "development" : "prebuilt",
    },
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !CI,
  },
});
