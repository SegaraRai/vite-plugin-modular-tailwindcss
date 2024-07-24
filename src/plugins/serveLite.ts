import type { Plugin, ResolvedConfig } from "vite";
import { fwVite } from "../frameworks";
import { parseId, resolveId, resolveIdFromURL } from "../id";
import { resolveOptions, type Options } from "../options";
import {
  getIndexHTMLModuleId,
  getModuleIdFromURLPath,
  getURLPathFromModuleId,
} from "../utils";

const DEV_GLOBAL_TAILWIND_CSS_ID = "tailwindcss.dev.global.css";

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
export function modularTailwindCSSPluginServeLite(options: Options): Plugin {
  const resolvedOptions = resolveOptions(options);
  const globalCSSCode = resolvedOptions.layers
    .filter((layer) => layer.apply !== "build")
    .map((layer) => layer.code + "\n")
    .join("");

  let seenFirstMessage = false;
  let resolvedConfig: ResolvedConfig | undefined;

  return {
    name: "vite-plugin-modular-tailwindcss-serve",
    apply: "serve",
    configResolved(config): void {
      resolvedConfig = config;
    },
    configureServer(server): void {
      // Redirect to enable importing `?tailwindcss/inject` and `?tailwindcss/inject-shallow` from HTML.
      server.middlewares.use((req, res, next): void => {
        (async (): Promise<void> => {
          if (!resolvedConfig) {
            next();
            return;
          }

          const resolvedId = await resolveIdFromURL(
            req.url ?? "",
            async (path: string): Promise<string> =>
              (await getModuleIdFromURLPath(path, server.moduleGraph)) ??
              (await (resolvedConfig
                ? getIndexHTMLModuleId(resolvedConfig)
                : Promise.reject(new Error("No resolved config.")))),
            fwVite.createIdFunctions(resolvedConfig)
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
    resolveId: {
      order: "pre",
      handler(source, importer): string | undefined {
        if (!seenFirstMessage) {
          seenFirstMessage = true;
          this.info(
            `Using global TailwindCSS for server mode. Content: ${JSON.stringify(globalCSSCode)}`
          );
        }

        if (source.startsWith(DEV_GLOBAL_TAILWIND_CSS_ID)) {
          return source;
        }

        if (!resolvedConfig) {
          throw new Error("LogicError: No resolved config.");
        }

        return resolveId(
          source,
          importer,
          fwVite.createIdFunctions(resolvedConfig)
        );
      },
    },
    load: {
      order: "pre",
      async handler(resolvedId) {
        if (resolvedId.startsWith(DEV_GLOBAL_TAILWIND_CSS_ID)) {
          return {
            code: globalCSSCode,
            moduleSideEffects: false,
          };
        }

        if (!resolvedConfig) {
          throw new Error("LogicError: No resolved config.");
        }

        const parsedId = parseId(
          resolvedId,
          fwVite.createIdFunctions(resolvedConfig)
        );
        if (!parsedId) {
          return;
        }

        if (parsedId.mode !== "entry") {
          throw new Error(
            `LogicError: ${parsedId.mode} code is not available in dev mode.`
          );
        }

        if (parsedId.inject) {
          return {
            code: `import ${JSON.stringify(DEV_GLOBAL_TAILWIND_CSS_ID)};\n`,
            moduleSideEffects: true,
          };
        } else {
          return {
            code: `import code from ${JSON.stringify(DEV_GLOBAL_TAILWIND_CSS_ID + "?inline")};\nexport default code;\n`,
            moduleSideEffects: false,
          };
        }
      },
    },
  };
}
