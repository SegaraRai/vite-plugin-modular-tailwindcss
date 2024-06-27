import { build, normalizePath } from "vite";
import { loadPlugin } from "./loadPlugin";
import type { TestCase, TestOptions, TestResult } from "./types";
import { getDefaultTestOptions, redactProjectRoot } from "./utils";

function isMTWId(id: string): boolean {
  return id.includes("tailwindcss.") || id.includes("tailwindcss:");
}

function replaceTailwindCSSBase(code: string): string {
  return code
    .replace(/\*,\s*::before,\s*::after\s*\{[^}]+\}/g, "/* TailwindCSS Base */")
    .replace(/::backdrop\s*\{[^}]+\}/g, "/* TailwindCSS Base Backdrop */");
}

const TEST_ID_PREFIX = "\0test/";

export async function runBuild(
  testCase: TestCase,
  options: TestOptions = {}
): Promise<TestResult> {
  const { modularTailwindCSSPluginBuild } = await loadPlugin();

  const resolvedOptions = {
    ...getDefaultTestOptions(),
    ...options,
  };

  const configure = resolvedOptions.configure ?? ((config) => config);

  const resultMap = new Map<string, string>();
  await build(
    configure({
      configFile: false,
      envFile: false,
      build: {
        write: false,
        minify: false,
        modulePreload: false,
        rollupOptions: {
          preserveEntrySignatures: "strict",
          input: "./tests/entry.html",
          output: {
            assetFileNames: "[name][extname]",
            entryFileNames: "[name].js",
            preserveModules: true,
          },
        },
      },
      plugins: [
        {
          name: "test-case-provider",
          enforce: "pre",
          transformIndexHtml: {
            order: "pre",
            handler(html): string {
              return html
                .replace(
                  /<\/head>/,
                  () => `${resolvedOptions.head ?? ""}</head>`
                )
                .replace(
                  /<\/body>/,
                  () => `${resolvedOptions.body ?? ""}</body>`
                );
            },
          },
          resolveId: {
            order: "pre",
            handler(id, importer): string | undefined {
              if (isMTWId(id) || id.startsWith("#") || id.startsWith("?")) {
                return;
              }

              if (id.startsWith(TEST_ID_PREFIX)) {
                return id;
              }

              const normalized = normalizePath(id);
              if (normalized.includes("/test/")) {
                return `${TEST_ID_PREFIX}${normalized.split("/test/")[1]}`;
              }

              if (importer?.startsWith(TEST_ID_PREFIX)) {
                const match = id.match(/^\.\/([^/]+)$/);
                if (!match) {
                  throw new Error(`Invalid import: ${id}`);
                }
                return `${TEST_ID_PREFIX}${match[1]}`;
              }
            },
          },
          load: {
            order: "pre",
            handler(id): string | undefined {
              if (isMTWId(id)) {
                return;
              }

              const name = id.replace(TEST_ID_PREFIX, "");
              if (id === name) {
                return;
              }

              const entry = testCase.find(([filename]) => filename === name);
              if (!entry) {
                throw new Error(`Test case file not found: ${name}`);
              }

              return entry[1];
            },
          },
          transform: {
            order: "post",
            handler(code, id): void {
              if (isMTWId(id)) {
                resultMap.set(
                  `[intermediate] ${redactProjectRoot(id.replaceAll("\0", ""))}`,
                  redactProjectRoot(replaceTailwindCSSBase(code))
                );
              }
            },
          },
          generateBundle: {
            order: "post",
            handler(_, bundle): void {
              for (const [filename, data] of Object.entries(bundle)) {
                if (filename.includes("modulepreload-polyfill")) {
                  continue;
                }

                const code =
                  data.type === "asset" ? String(data.source) : data.code;
                resultMap.set(
                  `[output] ${redactProjectRoot(normalizePath(filename))}`,
                  redactProjectRoot(replaceTailwindCSSBase(code))
                );
              }
            },
          },
        },
        modularTailwindCSSPluginBuild({ ...resolvedOptions }),
      ],
    })
  );

  return Object.fromEntries(
    Array.from(resultMap).sort(([a], [b]) => a.localeCompare(b))
  );
}
