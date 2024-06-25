// Heavily using the internals of Tailwind CSS to generate the CSS, very hacky.
// Core code is from Tailwind CSS CLI (MIT License): https://github.com/tailwindlabs/tailwindcss/blob/v3.4.4/src/cli/build/plugin.js

// @ts-expect-error No types for this file
import pkgDeps from "tailwindcss/lib/cli/build/deps.js";
// @ts-expect-error No types for this file
import pkgTailwind from "tailwindcss/lib/processTailwindFeatures.js";
import loadConfig from "tailwindcss/loadConfig.js";
import resolveConfig from "tailwindcss/resolveConfig.js";
import type { ContentSpec, LayerMode } from "../options";
import type { PluginContext } from "../utils";
import { createFilesystemCache, resolveContentSpec } from "./fsResolver";

const { loadPostcss } = pkgDeps;
const tailwind =
  typeof pkgTailwind === "function" ? pkgTailwind : pkgTailwind.default;

interface Context {
  readonly layerMode: LayerMode;
  readonly content: readonly ContentSpec[] | null;
  readonly globCWD: string | undefined;
}

export function createTailwindCSSGenerator(
  ctx: PluginContext,
  configPath: string
) {
  const config = loadConfig(configPath);
  const resolvedConfig = resolveConfig(config);

  const postcss = loadPostcss();

  const fsCache = createFilesystemCache();

  // Not sure if this is the right way to go at all, though it appears to be working for now.
  // Please help.
  let gCurrentContext: Context | undefined;
  const processor = postcss([
    // We don't support additional postcss plugins as the CSS is processed by Vite after it is generated.
    {
      postcssPlugin: "tailwindcss",
      async Once(root: unknown, { result }: any) {
        await tailwind(({ createContext }: any) => {
          return (currentRoot: unknown) => {
            if (!gCurrentContext) {
              throw new Error("LogicError: Context not set");
            }

            const { layerMode, content, globCWD } = gCurrentContext;

            const newConfig = {
              ...resolvedConfig,
              content: { ...resolvedConfig.content },
            };
            if (content) {
              newConfig.content.files = content;
            }

            // Apparently we need to resolve the file system contents before creating the context.
            const resolvedContent = resolveContentSpec(
              ctx,
              newConfig.content.files,
              fsCache,
              globCWD
            );

            if (layerMode === "global" && resolvedContent.length === 0) {
              ctx.warn(
                "No content found for global layer. Make sure to specify `content` either in the `tailwind.config.js` or in the layer options."
              );
            }

            return createContext(newConfig, resolvedContent, currentRoot);
          };
        })(root, result);
      },
    },
  ]);

  return async function generateTailwindCSS(
    mode: LayerMode,
    css: string,
    content: readonly ContentSpec[] | null,
    globCWD: string | undefined
  ): Promise<string> {
    gCurrentContext = {
      layerMode: mode,
      content,
      globCWD,
    };
    const result = await processor.process(css, {
      from: undefined,
      to: undefined,
      map: false,
    });
    gCurrentContext = undefined;

    let resultCode = result.css.trim();
    if (resultCode) {
      resultCode += "\n";
    }
    return resultCode;
  };
}
