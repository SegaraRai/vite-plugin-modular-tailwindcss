import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import { externalizeDeps } from "vite-plugin-externalize-deps";

export default defineConfig({
  build: {
    minify: false,
    lib: {
      entry: "./src/index.ts",
      name: "modular-tailwindcss",
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      output: {
        dir: "dist",
        entryFileNames: "index.[format].js",
        exports: "named",
      },
    },
  },
  plugins: [
    externalizeDeps(),
    dts({ tsconfigPath: "tsconfig.lib.json", rollupTypes: true }),
  ],
});
