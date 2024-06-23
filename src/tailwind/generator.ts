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

const { loadPostcss } = pkgDeps;
const { default: tailwind } = pkgTailwind;

export function createTailwindCSSGenerator(
  ctx: PluginContext,
  configPath: string
) {
  const config = loadConfig(configPath);
  const resolvedConfig = resolveConfig(config);

  const postcss = loadPostcss();

  // Not sure if this is the right way to go at all, though it appears to be working for now.
  // Please help.
  let gLayerMode: LayerMode | undefined;
  let gContent: readonly ContentSpec[] | null | undefined;
  const processor = postcss([
    // We don't support additional postcss plugins as the CSS is processed by Vite after it is generated.
    {
      postcssPlugin: "tailwindcss",
      async Once(root: unknown, { result }: any) {
        await tailwind(({ createContext }: any) => {
          return (currentRoot: unknown) => {
            const currentLayerMode = gLayerMode;
            const currentContent = gContent;

            const newConfig = {
              ...resolvedConfig,
              content: { ...resolvedConfig.content },
            };
            if (currentContent) {
              newConfig.content.files = currentContent;
            }

            if (
              currentLayerMode === "global" &&
              newConfig.content.files.length === 0
            ) {
              ctx.warn(
                "No content specified for global layer. Make sure to specify `content` either in the `tailwind.config.js` or in the layer options."
              );
            }

            return createContext(
              newConfig,
              currentContent
                ?.filter(
                  (v): v is Extract<ContentSpec, object> =>
                    !!v && typeof v === "object"
                )
                .map(({ raw: content, extension }) => ({
                  content,
                  extension,
                })) ?? [],
              currentRoot
            );
          };
        })(root, result);
      },
    },
  ]);

  return async function generateTailwindCSS(
    mode: LayerMode,
    css: string,
    content: readonly ContentSpec[] | null
  ): Promise<string> {
    gLayerMode = mode;
    gContent = content;
    const result = await processor.process(css, { map: false });
    gLayerMode = undefined;
    gContent = undefined;

    let resultCode = result.css.trim();
    if (resultCode) {
      resultCode += "\n";
    }
    return resultCode;
  };
}
