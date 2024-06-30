import { defineConfig, devices } from "@playwright/test";
import { env } from "node:process";

const PORT = 5188;

const CI = !!env.CI;
const DEV = env.PLAYGROUND_ENV !== "preview";

console.info(
  `[playwright] Running in ${DEV ? "development" : "preview"} mode (${CI ? "CI" : "local"})`
);

const VITE_SERVER_ARGS = `--port ${PORT} --host`;

export default defineConfig({
  testDir: "tests",
  fullyParallel: true,
  forbidOnly: !!CI,
  retries: CI ? 2 : 0,
  workers: CI ? 1 : undefined,
  reporter: CI ? "github" : "list",
  use: {
    // see docker-compose.yml
    baseURL: `http://host.docker.internal:${PORT}`,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "remote",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 640, height: 360 },
        deviceScaleFactor: 1,
        connectOptions: {
          // see docker-compose.yml
          wsEndpoint: "ws://localhost:5375",
        },
      },
      // We don't want platform suffixes in snapshot paths
      snapshotPathTemplate:
        "{snapshotDir}/{testFileDir}/{testFileName}-snapshots/{arg}{ext}",
    },
  ],
  webServer: {
    command: DEV
      ? `pnpm dev ${VITE_SERVER_ARGS}`
      : `pnpm build && pnpm preview ${VITE_SERVER_ARGS}`,
    env: {
      MTW_PLUGIN: DEV ? "development" : "prebuilt",
    },
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !CI,
  },
});
