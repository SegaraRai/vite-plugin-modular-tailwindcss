import { getModuleImports, type PluginContext } from "../utils";

export type ImportFilter = (resolvedId: string, importerId: string) => boolean;

export async function getFilteredModuleImports(
  ctx: PluginContext,
  source: string,
  shouldIncludeImport: ImportFilter
): Promise<readonly string[]> {
  return (await getModuleImports(ctx, source, undefined)).filter((resolvedId) =>
    shouldIncludeImport(resolvedId, source)
  );
}

/**
 * Recursively get all module imports from a source module that pass the filter. \
 * This function also handles circular dependencies. \
 * The source module will be included in the result.
 */
export async function getFilteredModuleImportsRecursive(
  ctx: PluginContext,
  source: string,
  shouldIncludeImport: ImportFilter
): Promise<string[]> {
  const visited = new Set<string>();
  const queue = [source];

  while (true) {
    const current = queue.shift();
    if (current == null) {
      break;
    }

    if (visited.has(current)) {
      continue;
    }
    visited.add(current);

    const currentImports = await getFilteredModuleImports(
      ctx,
      current,
      shouldIncludeImport
    );
    queue.push(...currentImports);
  }

  return Array.from(visited);
}
