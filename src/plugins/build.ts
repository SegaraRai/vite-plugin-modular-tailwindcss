import { normalizePath, type Plugin } from "vite";
import { generateCode, type CodegenContext } from "../codegen";
import { isOurId, parseId, resolveId } from "../id";
import { resolveOptions, type Options } from "../options";
import { createTailwindCSSGenerator } from "../tailwind";
import { getModuleCode, shouldExclude, type PluginContext } from "../utils";

// for documentation links
import type { modularTailwindCSSPluginServe } from "./serve";

function createStore(ctx: PluginContext, options: Options) {
  const resolvedOptions = resolveOptions(options);

  const codegenContext: CodegenContext = {
    options: resolvedOptions,
    shouldIncludeImport: (resolvedId: string, importerId: string): boolean =>
      !resolvedId.startsWith("\0vite/") &&
      !isOurId(resolvedId) &&
      !shouldExclude(resolvedId, importerId, resolvedOptions.excludes),
  };

  const generateTailwindCSS = createTailwindCSSGenerator(
    ctx,
    resolvedOptions.configPath
  );

  return { codegenContext, generateTailwindCSS };
}

/**
 * Modular TailwindCSS plugin.
 * Performs modularized TailwindCSS code generation.
 *
 * This plugin cannot be used in serve mode because it has limited support for `ModuleInfo`.
 * We require `importedIds` and `code` to generate TailwindCSS code, but they are not available in serve mode.
 * Use {@link modularTailwindCSSPluginServe} for serve mode.
 */
export function modularTailwindCSSPluginBuild(options: Options): Plugin {
  const ctxWeakMap = new WeakMap<
    PluginContext,
    ReturnType<typeof createStore>
  >();

  const htmlMap = new Map<string, string>();

  return {
    name: "vite-plugin-modular-tailwindcss-build",
    apply: "build",
    enforce: "pre",
    buildStart(): void {
      htmlMap.clear();
      ctxWeakMap.set(this, createStore(this, options));
    },
    transformIndexHtml: {
      order: "pre",
      handler(html, ctx): void {
        htmlMap.set(normalizePath(ctx.filename), html);
      },
    },
    resolveId: {
      order: "pre",
      handler(source, importer): string | undefined {
        return resolveId(source, importer);
      },
    },
    load: {
      order: "pre",
      async handler(resolvedId) {
        const parsedId = parseId(resolvedId);
        if (!parsedId) {
          return;
        }

        let store = ctxWeakMap.get(this);
        if (!store) {
          this.warn("Store not found for current context. Recreating...");
          store = createStore(this, options);
          ctxWeakMap.set(this, store);
        }

        const { codegenContext, generateTailwindCSS } = store;

        const [code, moduleSideEffects] = await generateCode(
          this,
          parsedId,
          codegenContext,
          generateTailwindCSS,
          (layer) => layer.apply === "serve",
          async (sourceId): Promise<string> => {
            // Vite forces Rollup to treat HTML as JS code that only imports scripts and CSS.
            // Therefore we have to use `transformIndexHtml` hook to get the actual HTML content.
            const html = htmlMap.get(normalizePath(sourceId));
            if (html) {
              return html;
            }

            return await getModuleCode(this, sourceId, undefined);
          }
        );

        return {
          code,
          moduleSideEffects,
        };
      },
    },
  };
}
