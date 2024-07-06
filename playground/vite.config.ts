import { env } from "node:process";
import { defineConfig } from "vite";
import modularTailwindCSSPluginPrebuilt from "vite-plugin-modular-tailwindcss";
import modularTailwindCSSPluginDev from "../src/index";

const usePrebuilt =
  env.MTW_PLUGIN !== "development" &&
  (!!env.CI || env.NODE_ENV === "test" || env.MTW_PLUGIN === "prebuilt");

const servePlugin = env.MTW_SERVE_PLUGIN === "strict" ? "strict" : "lite";

const modularTailwindCSSPlugin = usePrebuilt
  ? modularTailwindCSSPluginPrebuilt
  : modularTailwindCSSPluginDev;

console.info(
  `[playground] Using ${usePrebuilt ? "prebuilt" : "development"} version of the plugin`
);

export default defineConfig({
  server: {
    preTransformRequests: false,
  },
  build: {
    minify: false,
    rollupOptions: {
      preserveEntrySignatures: "strict",
      input: ["index.html", "secondary.html", "virtual.html"],
      output: {
        assetFileNames: "[name][extname]",
        entryFileNames: "[name].js",
        preserveModules: true,
      },
    },
  },
  plugins: [
    modularTailwindCSSPlugin({
      servePlugin,
      layers: [
        {
          mode: "global",
          code: `
@tailwind base;

*, ::before, ::after {
  font-synthesis: none !important;
  text-rendering: geometricPrecision !important;
  -webkit-font-smoothing: antialiased !important;
  -moz-osx-font-smoothing: grayscale !important;
}
`,
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
    {
      name: "virtual-module-loader",
      resolveId(id) {
        if (id === "#virtual" || id === "\0virtual") {
          return "\0virtual";
        }
      },
      load(id) {
        if (id !== "\0virtual") {
          return;
        }

        return `
export { default as style } from "#tailwindcss";
export const cls = "text-<DEL>red<DEL>-500 bg-$red$-200/20".replaceAll("$", "");
`.replaceAll("<DEL>", "");
      },
    },
  ],
});
