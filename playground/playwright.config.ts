import { env } from "node:process";
import { defineConfig, devices } from "@playwright/test";

const PORT = 5188;

const CI = !!env.CI;
const DEV = env.PLAYGROUND_ENV !== "preview";

const REMOTE_WS_ENDPOINT = env.PLAYWRIGHT_REMOTE_WS_ENDPOINT;
const REMOTE_HOSTNAME = env.PLAYWRIGHT_REMOTE_HOSTNAME;
const USE_REMOTE = !!REMOTE_WS_ENDPOINT && !!REMOTE_HOSTNAME;

console.info(
  `[playwright] Running in ${DEV ? "development" : "preview"} mode (${CI ? "CI" : "local"}, ${USE_REMOTE ? "remote" : "local"} browser)`
);

const VITE_SERVER_ARGS = `--port ${PORT}${USE_REMOTE ? " --host" : ""}`;

export default defineConfig({
  testDir: "tests",
  fullyParallel: true,
  forbidOnly: !!CI,
  retries: CI ? 2 : 0,
  workers: CI ? 1 : undefined,
  reporter: CI ? "github" : "list",
  use: {
    baseURL: USE_REMOTE
      ? `http://${REMOTE_HOSTNAME}:${PORT}`
      : `http://localhost:${PORT}`,
    trace: "on-first-retry",
  },
  projects: [
    USE_REMOTE
      ? {
          name: "remote",
          use: {
            ...devices["Desktop Chrome"],
            viewport: { width: 640, height: 360 },
            deviceScaleFactor: 1,
            connectOptions: {
              wsEndpoint: REMOTE_WS_ENDPOINT,
            },
          },
          // We don't want platform suffixes in snapshot paths
          snapshotPathTemplate:
            "{snapshotDir}/{testFileDir}/{testFileName}-snapshots/{arg}{-projectName}{ext}",
        }
      : {
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
      ? `pnpm dev ${VITE_SERVER_ARGS}`
      : `pnpm build && pnpm preview ${VITE_SERVER_ARGS}`,
    env: {
      MTW_PLUGIN: DEV ? "development" : "prebuilt",
    },
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !CI,
  },
});
