import { env } from "node:process";
import { defineConfig } from "vite";
import modularTailwindCSSPluginPrebuilt from "vite-plugin-modular-tailwindcss";
import modularTailwindCSSPluginDev from "../src/index";

const usePrebuilt =
  env.MTW_PLUGIN !== "development" &&
  (!!env.CI || env.NODE_ENV === "test" || env.MTW_PLUGIN === "prebuilt");

const modularTailwindCSSPlugin = usePrebuilt
  ? modularTailwindCSSPluginPrebuilt
  : modularTailwindCSSPluginDev;

console.info(
  `[playground] Using ${usePrebuilt ? "prebuilt" : "development"} version of the plugin`
);

export default defineConfig({
  build: {
    minify: false,
    rollupOptions: {
      preserveEntrySignatures: "strict",
      input: ["index.html", "secondary.html"],
      output: {
        assetFileNames: "[name][extname]",
        entryFileNames: "[name].js",
        preserveModules: true,
      },
    },
  },
  plugins: [
    modularTailwindCSSPlugin({
      layers: [
        {
          mode: "global",
          code: "@tailwind base;",
        },
        {
          mode: "hoisted",
          code: "@tailwind components;",
        },
        {
          mode: "module",
          code: "@tailwind utilities;",
        },
      ],
      excludes: [/\bnode_modules\b/],
    }),
  ],
});
