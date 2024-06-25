import { env } from "node:process";

let gMessageSeen = false;

export async function loadPlugin() {
  const usePrebuilt = !!env.CI || env.MTW_PLUGIN === "prebuilt";

  if (!usePrebuilt) {
    if (!gMessageSeen) {
      console.info(`[test] Using development version of the plugin`);
    }
    gMessageSeen = true;
  }

  return usePrebuilt
    ? await import("vite-plugin-modular-tailwindcss")
    : await import("../src");
}
