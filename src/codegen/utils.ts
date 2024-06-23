import { getModuleImports, type PluginContext } from "../utils";

export async function getFilteredModuleImports(
  ctx: PluginContext,
  source: string,
  shouldIncludeImport: (resolvedId: string, importerId: string) => boolean
): Promise<readonly string[]> {
  return (await getModuleImports(ctx, source, undefined)).filter((resolvedId) =>
    shouldIncludeImport(resolvedId, source)
  );
}
