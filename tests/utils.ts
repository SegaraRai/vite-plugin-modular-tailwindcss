import { fileURLToPath } from "node:url";
import type { Layer } from "../src";
import type { TestOptions, TestResultFiles } from "./types";
import { normalizePath } from "vite";

export function fromProjectRoot(path: string): string {
  return fileURLToPath(new URL("../" + path, import.meta.url));
}

export function redactProjectRoot(code: string): string {
  return code.replaceAll(
    normalizePath(fileURLToPath(new URL("..", import.meta.url))).replace(
      /\/+$/,
      ""
    ),
    "<projectRoot>"
  );
}

export function createDefaultLayers(globalContent: string = ""): Layer[] {
  return [
    {
      mode: "global",
      code: "@tailwind base;",
      content: [
        {
          raw: globalContent,
          extension: "html",
        },
      ],
    },
    {
      mode: "hoisted",
      code: "@tailwind components;",
    },
    {
      mode: "module",
      code: "@tailwind utilities;",
    },
  ];
}

const DEFAULT_HEAD = '<script type="module" src="/test/entry.js"></script>';
const DEFAULT_TEST_OPTIONS: TestOptions = {
  configPath: fromProjectRoot("./tests/test-tailwind-config.cjs"),
  layers: createDefaultLayers(),
  excludes: [],
  globCWD: fromProjectRoot("./tests"),
  head: DEFAULT_HEAD,
};

export function getDefaultHead(): string {
  return DEFAULT_HEAD;
}

export function getDefaultTestOptions(): TestOptions {
  return { ...DEFAULT_TEST_OPTIONS };
}

export function getOutput(files: TestResultFiles): string {
  return Object.entries(files)
    .filter(([key]) => key.startsWith("[output]"))
    .map(([, value]) => value)
    .join("");
}

export function getOutputHTML(files: TestResultFiles): string {
  return files["[output] tests/entry.html"];
}

export function getOutputCSS(files: TestResultFiles): string {
  return Object.entries(files)
    .filter(([key]) => key.startsWith("[output]") && key.endsWith(".css"))
    .map(([, value]) => value)
    .join("");
}

export function getAllCode(files: TestResultFiles): string {
  return Object.values(files).join("");
}
