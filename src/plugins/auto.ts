import type { Plugin } from "vite";
import { resolveOptions, type Options } from "../options";
import { modularTailwindCSSPluginBuild } from "./build";
import { modularTailwindCSSPluginServeLite } from "./serveLite";
import { modularTailwindCSSPluginServeStrict } from "./serveStrict";

/**
 * Modular TailwindCSS plugin, which includes both build and serve modes.
 *
 * This plugin is a combination of {@link modularTailwindCSSPluginBuild} and {@link modularTailwindCSSPluginServeLite} or {@link modularTailwindCSSPluginServeStrict}.
 */
export function modularTailwindCSSPlugin(options: Options): Plugin[] {
  return [
    modularTailwindCSSPluginBuild(options),
    resolveOptions(options).servePlugin === "lite"
      ? modularTailwindCSSPluginServeLite(options)
      : modularTailwindCSSPluginServeStrict(options),
  ];
}
