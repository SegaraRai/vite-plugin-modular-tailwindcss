import { normalizePath, type Plugin } from "vite";
import {
  generateCode,
  hasCircularDependencies,
  type CodegenContext,
  type CodegenFunctions,
} from "../codegen";
import { fwVite } from "../frameworks";
import {
  DEFAULT_VITE_ID_OPTIONS,
  type ResolvedViteIdOptions,
} from "../frameworks/vite";
import { parseId, resolveId } from "../id";
import { resolveOptions, type ResolvedOptions } from "../options";
import { createTailwindCSSGenerator } from "../tailwindcss";
import {
  getModuleCode,
  getModuleImports,
  shouldExclude,
  type PluginContext,
} from "../utils";
import type { ViteOptions } from "./types";

// for documentation links
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { modularTailwindCSSPluginServeStrict } from "./serveStrict";

function createCodegenFunctions(
  resolvedOptions: ResolvedOptions,
  pluginContext: PluginContext,
  idOptions: ResolvedViteIdOptions
): CodegenFunctions {
  return {
    shouldIncludeImport: (
      resolvedId: string,
      importerId: string | null
    ): boolean =>
      !resolvedId.startsWith("\0vite/") &&
      !shouldExclude(resolvedId, importerId, resolvedOptions.excludes),
    getAllModuleIds: () => Array.from(pluginContext.getModuleIds()),
    resolveModuleImports: async (
      resolvedId: string,
      importerId: string | null
    ) => getModuleImports(pluginContext, resolvedId, importerId ?? undefined),
    toImportPath: fwVite.toImportPath,
    warn: pluginContext.warn.bind(pluginContext),
    ...fwVite.createIdFunctions(idOptions),
  };
}

/**
 * Modular TailwindCSS plugin.
 * Performs modularized TailwindCSS code generation.
 *
 * This plugin cannot be used in serve mode because it has limited support for `ModuleInfo`.
 * We require `importedIds` and `code` to generate TailwindCSS code, but they are not available in serve mode.
 * Use {@link modularTailwindCSSPluginServeStrict} for serve mode.
 */
export function modularTailwindCSSPluginBuild(options: ViteOptions): Plugin {
  const htmlMap = new Map<string, string>();
  let seenCircularDependencyWarning = false;

  const resolvedOptions = resolveOptions(options);

  const generateTailwindCSS = createTailwindCSSGenerator(
    resolvedOptions.configPath
  );

  const shouldWarnIfCircular =
    !resolvedOptions.allowCircularModules &&
    resolvedOptions.layers.some(({ mode }) => mode === "module");

  const codegenContextWeakMap = new WeakMap<PluginContext, CodegenContext>();
  const getCodegenContext = (
    pluginContext: PluginContext,
    resolvedIdOptions: ResolvedViteIdOptions
  ) => {
    let codegenContext = codegenContextWeakMap.get(pluginContext);
    if (!codegenContext) {
      codegenContext = {
        options: resolvedOptions,
        functions: createCodegenFunctions(
          resolvedOptions,
          pluginContext,
          resolvedIdOptions
        ),
      };
      codegenContextWeakMap.set(pluginContext, codegenContext);
    }

    return codegenContext;
  };

  let resolvedIdOptions: ResolvedViteIdOptions | undefined;

  return {
    name: "vite-plugin-modular-tailwindcss-build",
    apply: "build",
    enforce: "pre",
    configResolved(config): void {
      resolvedIdOptions = {
        ...DEFAULT_VITE_ID_OPTIONS,
        ...options.idOptions,
        root: config.root,
      };
    },
    buildStart(): void {
      htmlMap.clear();
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
        if (!resolvedIdOptions) {
          throw new Error("LogicError: No resolved config.");
        }

        const { functions } = getCodegenContext(this, resolvedIdOptions);
        return resolveId(source, importer, functions);
      },
    },
    load: {
      order: "pre",
      async handler(resolvedId) {
        if (!resolvedIdOptions) {
          throw new Error("LogicError: No resolved config.");
        }

        const codegenContext = getCodegenContext(this, resolvedIdOptions);
        const { functions } = codegenContext;

        const parsedId = parseId(resolvedId, functions);
        if (!parsedId) {
          return;
        }

        if (
          !seenCircularDependencyWarning &&
          shouldWarnIfCircular &&
          parsedId.mode === "entry"
        ) {
          if (await hasCircularDependencies(functions, parsedId.source)) {
            seenCircularDependencyWarning = true;

            this.warn({
              message: `Circular dependencies have been detected in the module graph. This can potentially lead to runtime errors. To handle circular dependencies and suppress this warning, set the \`allowCircularModules\` option to true in the plugin options.
See https://github.com/SegaraRai/vite-plugin-modular-tailwindcss?tab=readme-ov-file#handling-circular-dependencies for more information.`,
              id: parsedId.source,
            });
          }
        }

        const [code, moduleSideEffects] = await generateCode(
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
