import { build, normalizePath } from "vite";
import type { PluginContext } from "../src/utils";
import { loadPlugin } from "./loadPlugin";
import type { TestCase, TestOptions, TestResult, TestResultLog } from "./types";
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

  const collectedWarnings: TestResultLog[] = [];

  const resolvedOptions = {
    ...getDefaultTestOptions(),
    ...options,
  };

  const plugin = modularTailwindCSSPluginBuild({ ...resolvedOptions });

  const tweakFunction = (
    fn: (this: unknown, ...args: unknown[]) => unknown
  ) => {
    return function (this: unknown, ...args: unknown[]) {
      if (!!this && "warn" in (this as PluginContext)) {
        (this as PluginContext).warn = (log): void => {
          collectedWarnings.push(typeof log === "function" ? log() : log);
        };
      }
      return fn.call(this, ...args);
    };
  };

  for (const [key, value] of Object.entries(plugin)) {
    if (typeof value === "function") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (plugin as any)[key] = tweakFunction(value);
    } else if (
      typeof value === "object" &&
      typeof value.handler === "function"
    ) {
      value.handler = tweakFunction(value.handler);
    }
  }

  const resultMap = new Map<string, string>();
  await build({
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
          preserveModules: !resolvedOptions.noPreserveModules,
        },
      },
    },
    plugins: [
      ...(resolvedOptions.prePlugins ?? []),
      {
        name: "test-case-provider",
        enforce: "pre",
        transformIndexHtml: {
          order: "pre",
          handler(html): string {
            return html
              .replace(/<\/head>/, () => `${resolvedOptions.head ?? ""}</head>`)
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
          async handler(id): Promise<string | undefined> {
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

            const strLoadDelay = /-l(\d+)\W/.exec(name)?.[1];
            if (strLoadDelay) {
              await new Promise((resolve) =>
                setTimeout(resolve, Number(strLoadDelay))
              );
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
      plugin,
      ...(resolvedOptions.postPlugins ?? []),
    ],
  });

  const files = Object.fromEntries(
    Array.from(resultMap).sort(([a], [b]) => a.localeCompare(b))
  );

  return { files, warnings: collectedWarnings };
}
