import { resolveDefaultTailwindConfigPath } from "../tailwind";
import type { Options, ResolvedOptions } from "./types";

const DEFAULT_EXCLUDES = [/\bnode_modules\b/] as const;
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
    excludes: options.excludes ?? [...DEFAULT_EXCLUDES],
    layers: options.layers ?? JSON.parse(JSON.stringify(DEFAULT_LAYERS)),
    configPath: options.configPath ?? resolveDefaultTailwindConfigPath(),
  };
}
