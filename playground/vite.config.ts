import { defineConfig } from "vite";
//import { modularTailwindCSSPlugin } from "vite-plugin-modular-tailwindcss";
import { modularTailwindCSSPlugin } from "../src/index";

// Dev Note: Import `../src/index` instead of `vite-plugin-modular-tailwindcss` to test without building the package.

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
          mode: "hoist",
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
