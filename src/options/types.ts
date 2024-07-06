export type ContentSpec = string | { raw: string; extension: string };

export type LayerMode = "globalFilesystem" | "global" | "hoisted" | "module";

export interface LayerBase {
  mode: LayerMode;
  code: string;
  apply?: "build" | "serve" | null;
}

export interface LayerGlobal extends LayerBase {
  mode: "global";
  code: string;
}

export interface LayerGlobalFilesystem extends LayerBase {
  mode: "globalFilesystem";
  code: string;
  content?: readonly ContentSpec[];
}

export interface LayerHoisted extends LayerBase {
  mode: "hoisted";
}

export interface LayerModule extends LayerBase {
  mode: "module";
}

export type Layer =
  | LayerGlobal
  | LayerGlobalFilesystem
  | LayerHoisted
  | LayerModule;

/**
 * Defines which modules should be excluded from processing.
 *
 * For `hoisted` and `module` layers, `resolvedId` refers to the ID of a module that is transitively imported from the entry module, which contains `import "#tailwindcss";`.
 * In these layers, `importerId` is always provided, and the entry modules cannot be excluded.
 *
 * For `global` layers, `resolvedId` refers to the ID of a module that appears in the result of `getModuleIds()`, and `importerId` is always `null`.
 */
export type ExcludeSpec =
  | string
  | RegExp
  | ((resolvedId: string, importerId: string | null) => boolean);

export interface Options {
  /**
   * Variation for `serve` mode plugin.
   *
   * - `lite`: A simpler version of the plugin that does not modularize the TailwindCSS code. \
   *   Fast but does not support virtual modules.
   * - `strict`: An experimental stricter version of the plugin that modularizes the TailwindCSS code. \
   *   Slower but more compatible (but not fully compatible).
   *
   * @default "lite"
   */
  servePlugin?: "lite" | "strict";
  /**
   * The path to the TailwindCSS configuration file. \
   * If not provided, the plugin will automatically locate the configuration file.
   */
  configPath?: string;
  /**
   * The layers to generate.
   *
   * See {@link https://github.com/SegaraRai/vite-plugin-modular-tailwindcss?tab=readme-ov-file#layers|Layers} for details.
   *
   * @default
   * [
   *  {
   *    mode: "global",
   *    code: "@tailwind base;",
   *  },
   *  {
   *    mode: "hoisted",
   *    code: "@tailwind components;",
   *  },
   *  {
   *    mode: "module",
   *    code: "@tailwind utilities;",
   *  },
   * ]
   */
  layers?: readonly Layer[];
  /**
   * The Rollup IDs (filepaths and virtual modules) that should be excluded from processing.
   *
   * See {@link ExcludeSpec} for details.
   *
   * @default
   * [
   *   /^\0/,
   *   /^(?:browser-external|dep|virtual):/,
   *   /\bnode_modules\b/,
   *   /\.(?:css|scss|sass|less|styl|stylus|pcss|sss|svg)(?:\?|$)/,
   * ]
   */
  excludes?: readonly ExcludeSpec[];
  /**
   * The working directory for glob patterns in the `content` option. (`cwd` of fast-glob options) \
   * This option affects both the `content` in the layer options and the `content` in the TailwindCSS configuration file.
   *
   * @default process.cwd() // fast-glob's default
   */
  globCWD?: string;
  /**
   * Whether to allow circular dependencies in module mode layers. \
   * Enabling this option wraps the code in the `module` mode with a function to prevent runtime errors. \
   * However, this results in a larger bundle size and slower performance. \
   * If set to `false`, a runtime error will be thrown when a circular module is loaded. \
   * We recommend not enabling this option. Instead, consider fixing the circular dependency or using the `hoisted` mode.
   *
   * See {@link https://github.com/SegaraRai/vite-plugin-modular-tailwindcss?tab=readme-ov-file#handling-circular-dependencies|Handling Circular Dependencies} for details.
   *
   * @default false
   */
  allowCircularModules?: boolean;
}

export type ResolvedOptions = Required<Options>;
