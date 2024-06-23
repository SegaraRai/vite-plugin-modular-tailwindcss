import { normalizePath, type Plugin } from "vite";
import { parseId, resolveId, resolveIdFromURL } from "../id";
import { resolveOptions, type Options } from "../options";

const GLOBAL_TAILWIND_CSS_ID = "tailwindcss.dev.global.css";

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
export function modularTailwindCSSPluginServe(options: Options): Plugin {
  const resolvedOptions = resolveOptions(options);
  const globalCSSCode = resolvedOptions.layers
    .filter((layer) => layer.apply !== "build")
    .map((layer) => layer.code + "\n")
    .join("");

  let seenFirstMessage = false;

  return {
    name: "vite-plugin-modular-tailwindcss-serve",
    apply: "serve",
    configureServer(server): void {
      // Redirect to enable importing `?tailwindcss/inject` and `?tailwindcss/inject-shallow` from HTML.
      server.middlewares.use((req, res, next): void => {
        (async (): Promise<void> => {
          const resolvedId = await resolveIdFromURL(
            req.url ?? "",
            async (path: string): Promise<string> => {
              const possiblePaths =
                !path || path === "/"
                  ? ["/index.html"]
                  : [path, path + ".html", "/index.html"];

              for (const possiblePath of possiblePaths) {
                let mod = await server.moduleGraph.getModuleByUrl(possiblePath);
                if (mod) {
                  if (!mod.id) {
                    throw new Error(`Module id not set: ${possiblePath}`);
                  }
                  return mod.id;
                }
              }

              throw new Error(`Module not found: ${path}`);
            }
          );
          if (!resolvedId) {
            next();
            return;
          }

          res.statusCode = 302;
          res.setHeader("Location", `/@id/${normalizePath(resolvedId)}`); // Not sure if this is the correct path
          res.end();
        })().catch((err): void => {
          console.error(err);
          res.statusCode = 500;
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

        if (source.startsWith(GLOBAL_TAILWIND_CSS_ID)) {
          return source;
        }
        return resolveId(source, importer);
      },
    },
    load: {
      order: "pre",
      async handler(resolvedId) {
        if (resolvedId.startsWith(GLOBAL_TAILWIND_CSS_ID)) {
          return {
            code: globalCSSCode,
            moduleSideEffects: false,
          };
        }

        const parsedId = parseId(resolvedId);
        if (!parsedId) {
          return;
        }

        if (parsedId.mode !== "top") {
          throw new Error(
            `LogicError: ${parsedId.mode} code is not available in dev mode.`
          );
        }

        if (parsedId.inject) {
          return {
            code: `import ${JSON.stringify(GLOBAL_TAILWIND_CSS_ID)};\n`,
            moduleSideEffects: true,
          };
        } else {
          return {
            code: `import code from ${JSON.stringify(GLOBAL_TAILWIND_CSS_ID + "?inline")};\nexport default code;\n`,
            moduleSideEffects: false,
          };
        }
      },
    },
  };
}
