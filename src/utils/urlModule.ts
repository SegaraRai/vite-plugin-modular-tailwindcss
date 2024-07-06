import { normalizePath, type ModuleGraph, type ResolvedConfig } from "vite";

export function isPreservedPath(path: string): boolean {
  return path.startsWith("/node_modules/.vite/deps/");
}

export async function getModuleIdFromURLPath(
  path: string,
  moduleGraph: ModuleGraph
): Promise<string | null> {
  if (path.startsWith("/@fs/")) {
    const body = path.slice(5);
    return /^[A-Z]:\//.test(body) ? body : "/" + body;
  }

  if (path.startsWith("/@id/")) {
    const body = path.slice(5);
    return body.replaceAll("__x00__", "\0");
  }

  if (isPreservedPath(path)) {
    return path;
  }

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

export function getURLPathFromModuleId(
  resolvedId: string,
  root: string | null
): string {
  if (isPreservedPath(resolvedId)) {
    return resolvedId;
  }

  const normalized = normalizePath(resolvedId);
  if (root && /^(?:[A-Z]:)?\//i.test(normalized)) {
    if (normalized.startsWith(root)) {
      const relative = normalized.slice(root.length);
      return relative
        .replace(/\/index\.html(\?.*|$)/, "/")
        .replace(/\.html(\?.*|$)/, "");
    }
    return `/@fs/${normalized.replace(/^\//, "")}`;
  }

  // https://github.com/vitejs/vite/blob/v5.3.1/packages/vite/src/shared/utils.ts#L11
  return `/@id/${normalized.replaceAll("\0", "__x00__")}`;
}

export function getIndexHTMLModuleId(config: ResolvedConfig): string {
  return config.root + "/index.html";
}
