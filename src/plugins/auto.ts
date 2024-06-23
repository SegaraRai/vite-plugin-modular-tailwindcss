import type { Plugin } from "vite";
import type { Options } from "../options";
import { modularTailwindCSSPluginBuild } from "./build";
import { modularTailwindCSSPluginServe } from "./serve";

/**
 * Modular TailwindCSS plugin, which includes both build and serve modes.
 *
 * This plugin is a combination of {@link modularTailwindCSSPluginBuild} and {@link modularTailwindCSSPluginServe}.
 */
export function modularTailwindCSSPlugin(options: Options): Plugin[] {
  return [
    modularTailwindCSSPluginBuild(options),
    modularTailwindCSSPluginServe(options),
  ];
}
