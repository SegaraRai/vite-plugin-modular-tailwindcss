import { fileURLToPath } from "node:url";
import type { Layer } from "../src";
import type { TestOptions, TestResult } from "./types";
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
  layers: createDefaultLayers(),
  configPath: fromProjectRoot("./tests/test-tailwind-config.cjs"),
  head: DEFAULT_HEAD,
  globCWD: fromProjectRoot("./tests"),
};

export function getDefaultHead(): string {
  return DEFAULT_HEAD;
}

export function getDefaultTestOptions(): TestOptions {
  return { ...DEFAULT_TEST_OPTIONS };
}

export function getOutput(result: TestResult): string {
  return Object.entries(result)
    .filter(([key]) => key.startsWith("[output]"))
    .map(([, value]) => value)
    .join("");
}

export function getOutputHTML(result: TestResult): string {
  return result["[output] tests/entry.html"];
}

export function getOutputCSS(result: TestResult): string {
  return Object.entries(result)
    .filter(([key]) => key.startsWith("[output]") && key.endsWith(".css"))
    .map(([, value]) => value)
    .join("");
}

export function getAllCode(result: TestResult): string {
  return Object.values(result).join("");
}
