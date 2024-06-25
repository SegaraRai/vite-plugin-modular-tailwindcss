export type ContentSpec = string | { raw: string; extension: string };

export type LayerMode = "global" | "hoisted" | "module";

export interface LayerBase {
  mode: LayerMode;
  code: string;
  apply?: "build" | "serve" | null;
}

export interface LayerGlobal extends LayerBase {
  mode: "global";
  code: string;
  content?: readonly ContentSpec[];
}

export interface LayerHoisted extends LayerBase {
  mode: "hoisted";
}

export interface LayerModule extends LayerBase {
  mode: "module";
}

/**
 * A layer to generate. \
 * See {@link https://github.com/SegaraRai/vite-plugin-modular-tailwindcss?tab=readme-ov-file#layer-modes|Layer Modes} for details.
 */
export type Layer = LayerGlobal | LayerHoisted | LayerModule;

export type ExcludeSpec =
  | string
  | RegExp
  | ((resolvedId: string, importerId: string) => boolean);

export interface Options {
  /**
   * The path to the Tailwind CSS config file. \
   * Automatically resolved if not specified.
   */
  configPath?: string;
  /**
   * The layers to generate. \
   * CSS will be loaded or concatenated in the order of the `layers` array.
   *
   * @default
   * ```ts
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
   *]
   * ```
   */
  layers?: readonly Layer[];
  /**
   * The ids (files) to exclude from processing.
   *
   * @default [/\bnode_modules\b/]
   */
  excludes?: readonly ExcludeSpec[];
  /**
   * The working directory for glob patterns. (`cwd` of fast-glob options)
   *
   * @default process.cwd() // fast-glob's default
   */
  globCWD?: string;
}

export type ResolvedOptions = Required<Options>;
