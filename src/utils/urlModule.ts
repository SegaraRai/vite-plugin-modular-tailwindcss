import { normalizePath, type ModuleGraph, type ResolvedConfig } from "vite";

export async function getModuleIdFromURLPath(
  path: string,
  moduleGraph: ModuleGraph
): Promise<string | null> {
  const possiblePaths =
    !path || path === "/"
      ? ["/index.html"]
      : [path, path + ".html", "/index.html"];

  for (const possiblePath of possiblePaths) {
    const mod = await moduleGraph.getModuleByUrl(possiblePath);
    if (mod) {
      if (!mod.id) {
        throw new Error(`Module id not set: ${possiblePath}`);
      }
      return mod.id;
    }
  }

  return null;
}

export function getURLPathFromModuleId(resolvedId: string): string {
  // Not sure if this is correct
  return `/@id/${normalizePath(resolvedId)}`;
}

export function getIndexHTMLModuleId(config: ResolvedConfig): string {
  return config.root + "/index.html";
}
