import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 720 },
        launchOptions: {
          args: [
            "--disable-gpu",
            "--disable-font-subpixel-positioning",
            "--disable-lcd-text",
            "--font-render-hinting=none",
          ],
        },
      },
    },
  ],
});
