import { env } from "node:process";
import dts from "vite-plugin-dts";
import { externalizeDeps } from "vite-plugin-externalize-deps";
import { defineConfig } from "vitest/config";

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
    dts({
      exclude: ["tests/**"],
      tsconfigPath: "tsconfig.lib.json",
      compilerOptions: { baseUrl: "src" },
      rollupTypes: true,
    }),
  ],
  test: {
    include: ["tests/**/*.test.ts"],
    exclude: ["playground/**"],
    fileParallelism: !env.CI,
  },
});
