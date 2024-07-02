import type { CodegenContext } from "./context";

export type ImportFilter = (resolvedId: string, importerId: string) => boolean;

export async function getFilteredModuleImports(
  { resolveModuleImports, shouldIncludeImport }: CodegenContext,
  resolvedId: string
): Promise<readonly string[]> {
  return (await resolveModuleImports(resolvedId, null)).filter((resolvedId) =>
    shouldIncludeImport(resolvedId, resolvedId)
  );
}

/**
 * Recursively get all module imports from a source module that pass the filter. \
 * This function also handles circular dependencies. \
 * The source module will be included in the result.
 */
export async function getFilteredModuleImportsRecursive(
  context: CodegenContext,
  resolvedId: string
): Promise<string[]> {
  const visited = new Set<string>();
  const queue = [resolvedId];

  while (true) {
    const current = queue.shift();
    if (current == null) {
      break;
    }

    if (visited.has(current)) {
      continue;
    }
    visited.add(current);

    const currentImports = await getFilteredModuleImports(context, current);
    queue.push(...currentImports);
  }

  return Array.from(visited);
}

export async function hasCircularDependencies(
  context: CodegenContext,
  source: string,
  visited: string[] = []
): Promise<boolean> {
  if (visited.includes(source)) {
    return true;
  }

  const newVisited = [...visited, source];

  for (const importId of await getFilteredModuleImports(context, source)) {
    if (await hasCircularDependencies(context, importId, newVisited)) {
      return true;
    }
  }

  return false;
}

export async function waitForModuleIdsToBeStable(
  { getAllModuleIds, resolveModuleImports }: CodegenContext,
  shouldInclude: (resolvedId: string) => boolean
): Promise<void> {
  for (;;) {
    const moduleIds = getAllModuleIds();
    for (const resolvedId of moduleIds) {
      if (!shouldInclude(resolvedId)) {
        continue;
      }

      await resolveModuleImports(resolvedId, null);
    }

    const afterCount = getAllModuleIds().length;
    if (moduleIds.length === afterCount) {
      break;
    }
  }
}
