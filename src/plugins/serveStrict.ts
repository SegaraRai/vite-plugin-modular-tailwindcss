import { join } from "node:path/posix";
import { parseImports } from "parse-imports";
import {
  normalizePath,
  type Plugin,
  type ResolvedConfig,
  type ViteDevServer,
} from "vite";
import {
  generateCode,
  hasCircularDependencies,
  type CodegenContext,
} from "../codegen";
import { isOurId, parseId, resolveId, resolveIdFromURL } from "../id";
import { resolveOptions, type Options } from "../options";
import { createTailwindCSSGenerator } from "../tailwind";
import {
  getModuleIdFromURLPath,
  getURLPathFromModuleId,
  isPreservedPath,
  shouldExclude,
  type PluginContext,
} from "../utils";

type CodegenContextBase = Pick<
  CodegenContext,
  "options" | "shouldIncludeImport"
>;

function decodeHTMLAttributeURL(code: string): string {
  return decodeURIComponent(code.replaceAll("&amp;", "&"));
}

function getHTML(
  resolvedId: string,
  htmlMap: ReadonlyMap<string, string>
): string | undefined {
  const normalizedId = normalizePath(resolvedId);
  for (const htmlSourceId of [
    normalizedId,
    normalizedId + ".html",
    normalizedId.replace(/\/$/, "/index.html"),
  ]) {
    const html = htmlMap.get(normalizePath(htmlSourceId));
    if (html) {
      return html;
    }
  }
}

async function getCode(server: ViteDevServer, path: string): Promise<string> {
  if (path.startsWith("/@id/")) {
    // We don't know why, but virtual modules cannot be retrieved by `server.transformRequest`.

    const address = server.httpServer?.address();
    if (!address || typeof address !== "object") {
      throw new Error("Could not get address of server");
    }

    const res = await fetch(`http://localhost:${address.port}${path}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch ${path}: ${res.statusText}`);
    }

    return await res.text();
  }

  const result = await server.transformRequest(path);
  if (!result) {
    throw new Error(`Failed to resolve module code for ${path}.`);
  }

  return result.code;
}

function createCodegenContext(
  server: ViteDevServer,
  baseContext: CodegenContextBase,
  pluginContext: PluginContext,
  root: string,
  htmlMap: ReadonlyMap<string, string>
): CodegenContext {
  async function getImportSpecifiers(
    resolvedId: string,
    basePath: string
  ): Promise<string[]> {
    if (isPreservedPath(resolvedId)) {
      return [];
    }

    const html = getHTML(resolvedId, htmlMap);
    if (html) {
      const transformed = await server.transformIndexHtml(basePath, html);
      return Array.from(transformed.matchAll(/<script\s[^>]*>/g))
        .map((match) =>
          match[0].match(/src=("[^"]+"|'[^']+')/)?.[1].slice(1, -1)
        )
        .filter((src): src is string => src != null)
        .map(decodeHTMLAttributeURL);
    }

    const result = await getCode(server, basePath).catch(() => null);
    if (!result) {
      pluginContext.warn(`Failed to resolve module imports for ${resolvedId}.`);
      return [];
    }

    return Array.from(await parseImports(result))
      .map((entry) => entry.moduleSpecifier.value)
      .filter((value): value is string => value != null);
  }

  return {
    ...baseContext,
    getAllModuleIds: (): readonly string[] => {
      return Array.from(server.moduleGraph.idToModuleMap.keys());
    },
    resolveModuleImports: async (
      resolvedId: string
    ): Promise<readonly string[]> => {
      const basePath = getURLPathFromModuleId(resolvedId, root);
      const importSpecifiers = await getImportSpecifiers(resolvedId, basePath);

      const imports: string[] = [];
      for (const spec of importSpecifiers) {
        const url = new URL(spec, "https://tailwindcss.local" + basePath);
        if (url.hostname !== "tailwindcss.local") {
          pluginContext.info(
            `Skipping external import specifier ${JSON.stringify(spec)}.`
          );
          continue;
        }

        if (url.search.startsWith("?tailwindcss")) {
          pluginContext.info(
            `Skipping TailwindCSS import specifier ${JSON.stringify(spec)}.`
          );
          continue;
        }

        const path = url.pathname;
        const moduleId = await getModuleIdFromURLPath(path, server.moduleGraph);
        if (!moduleId) {
          pluginContext.warn(
            `Failed to resolve module ID for import specifier ${JSON.stringify(spec)}.`
          );
          continue;
        }

        imports.push(moduleId);
      }

      return imports;
    },
    warn: (message: string): void => {
      pluginContext.warn(message);
    },
  };
}

/**
 * An alternative TailwindCSS plugin for server mode.
 *
 * It does not modularize the TailwindCSS code; instead, it provides global TailwindCSS code for all modules.
 *
 * The method of importing CSS remains the same.
 * Use `import css from "#tailwindcss";` or `import "#tailwindcss/inject";`.
 *
 * This plugin utilizes the native PostCSS / TailwindCSS support in Vite.
 * To make this plugin work, you need to configure the `postcss.config.js` and `tailwind.config.js` files.
 */
export function modularTailwindCSSPluginServeStrict(options: Options): Plugin {
  const htmlMap = new Map<string, string>();
  let seenCircularDependencyWarning = false;

  const resolvedOptions = resolveOptions(options);

  const codegenContextBase: CodegenContextBase = {
    options: resolvedOptions,
    shouldIncludeImport: (
      resolvedId: string,
      importerId: string | null
    ): boolean =>
      !resolvedId.startsWith("\0vite/") &&
      !isOurId(resolvedId) &&
      !shouldExclude(resolvedId, importerId, resolvedOptions.excludes),
  };

  const generateTailwindCSS = createTailwindCSSGenerator(
    resolvedOptions.configPath
  );

  const shouldWarnIfCircular =
    !resolvedOptions.allowCircularModules &&
    resolvedOptions.layers.some(({ mode }) => mode === "module");

  let resolvedConfig: ResolvedConfig | undefined;
  let storedServer: ViteDevServer | undefined;

  return {
    name: "vite-plugin-modular-tailwindcss-serve",
    apply: "serve",
    enforce: "pre",
    configResolved(config): void {
      resolvedConfig = config;
    },
    configureServer(server): void {
      storedServer = server;

      // Redirect to enable importing `?tailwindcss/inject` and `?tailwindcss/inject-shallow` from HTML.
      server.middlewares.use((req, res, next): void => {
        (async (): Promise<void> => {
          const resolvedId = await resolveIdFromURL(
            req.url ?? "",
            (path: string): string =>
              join(`${resolvedConfig!.root}/`, path.slice(1))
          );
          if (!resolvedId) {
            next();
            return;
          }

          res.statusCode = 302;
          res.setHeader("Location", getURLPathFromModuleId(resolvedId, null));
          res.end();
        })().catch((err): void => {
          console.error(err);

          res.statusCode = 500;
          res.setHeader("Content-Type", "text/plain");
          res.end("Internal Server Error");
        });
      });
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

        const server = storedServer;
        if (!server) {
          this.error("LogicError: Server not set");
        }

        if (!resolvedConfig) {
          this.error("LogicError: Resolved config not set");
        }
        const { root } = resolvedConfig;

        const codegenContext = createCodegenContext(
          server,
          codegenContextBase,
          this,
          root,
          htmlMap
        );

        if (
          !seenCircularDependencyWarning &&
          shouldWarnIfCircular &&
          parsedId.mode === "top"
        ) {
          if (await hasCircularDependencies(codegenContext, parsedId.source)) {
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
          (layer) => layer.apply === "build",
          async (sourceId): Promise<string> => {
            const html = getHTML(sourceId, htmlMap);
            if (html) {
              return html;
            }

            const result = await getCode(
              server,
              getURLPathFromModuleId(sourceId, root)
            ).catch(() => null);
            if (!result) {
              this.warn(`Failed to resolve module code for ${sourceId}.`);
              return "";
            }

            return result;
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
