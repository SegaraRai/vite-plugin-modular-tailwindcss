import type { CodegenFunctions } from "./context";

export type ImportFilter = (resolvedId: string, importerId: string) => boolean;

function shouldIncludeImportAndNotOurs(
  { shouldIncludeImport, parseId }: CodegenFunctions,
  resolvedId: string,
  importerId: string | null
): boolean {
  return !parseId(resolvedId) && shouldIncludeImport(resolvedId, importerId);
}

export async function getFilteredModuleImports(
  functions: CodegenFunctions,
  resolvedId: string
): Promise<readonly string[]> {
  return (await functions.resolveModuleImports(resolvedId, null)).filter(
    (resolvedId) => shouldIncludeImportAndNotOurs(functions, resolvedId, null)
  );
}

/**
 * Recursively get all module imports from a source module that pass the filter. \
 * This function also handles circular dependencies. \
 * The source module will be included in the result.
 */
export async function getFilteredModuleImportsRecursive(
  functions: CodegenFunctions,
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

    const currentImports = await getFilteredModuleImports(functions, current);
    queue.push(...currentImports);
  }

  return Array.from(visited);
}

export async function hasCircularDependencies(
  functions: CodegenFunctions,
  source: string,
  visited: string[] = []
): Promise<boolean> {
  if (visited.includes(source)) {
    return true;
  }

  const newVisited = [...visited, source];

  for (const importId of await getFilteredModuleImports(functions, source)) {
    if (await hasCircularDependencies(functions, importId, newVisited)) {
      return true;
    }
  }

  return false;
}

export async function waitAndResolveAllModuleIds(
  functions: CodegenFunctions
): Promise<string[]> {
  const { getAllModuleIds } = functions;

  for (;;) {
    const moduleIds = await getAllModuleIds();
    for (const resolvedId of moduleIds) {
      if (!shouldIncludeImportAndNotOurs(functions, resolvedId, null)) {
        continue;
      }

      await functions.resolveModuleImports(resolvedId, null);
    }

    const afterCount = (await getAllModuleIds()).length;
    if (moduleIds.length === afterCount) {
      return moduleIds.filter((resolvedId) =>
        shouldIncludeImportAndNotOurs(functions, resolvedId, null)
      );
    }
  }
}
