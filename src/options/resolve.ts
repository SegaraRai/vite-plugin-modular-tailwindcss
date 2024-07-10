import { resolveDefaultTailwindConfigPath } from "../tailwindcss";
import type { Options, ResolvedOptions } from "./types";

const DEFAULT_EXCLUDES = [
  /^\0/,
  /^(?:browser-external|dep|virtual):/,
  /\bnode_modules\b/,
  /\.(?:css|scss|sass|less|styl|stylus|pcss|sss|svg)(?:\?|$)/,
] as const;

const DEFAULT_LAYERS = [
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
] as const;

export function resolveOptions(options: Options): ResolvedOptions {
  return {
    servePlugin: options.servePlugin ?? "lite",
    excludes: options.excludes ?? [...DEFAULT_EXCLUDES],
    layers: options.layers ?? JSON.parse(JSON.stringify(DEFAULT_LAYERS)),
    configPath: options.configPath ?? resolveDefaultTailwindConfigPath(),
    globCWD: options.globCWD ?? process.cwd(),
    allowCircularModules: options.allowCircularModules ?? false,
  };
}
