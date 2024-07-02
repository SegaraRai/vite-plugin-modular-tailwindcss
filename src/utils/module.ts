import type { PluginContext } from "./vitePluginContext";

export async function resolveModuleInfo(
  ctx: PluginContext,
  source: string,
  importer: string | undefined,
  resolveDependencies: boolean
) {
  const resolvedId = await ctx.resolve(source, importer, {
    skipSelf: false,
  });
  if (resolvedId == null) {
    throw new Error(`Could not resolve ${source}`);
  }

  const moduleInfo = await ctx.load({ ...resolvedId, resolveDependencies });
  if (!moduleInfo) {
    throw new Error(`Module info not found for ${source}`);
  }

  return moduleInfo;
}

export async function getModuleCode(
  ctx: PluginContext,
  source: string,
  importer: string | undefined
): Promise<string> {
  const moduleInfo = await resolveModuleInfo(ctx, source, importer, false);
  const moduleCode = moduleInfo.code;
  if (moduleCode == null) {
    throw new Error(`Module code not found for ${source}`);
  }

  return moduleCode;
}

export async function getModuleImports(
  ctx: PluginContext,
  source: string,
  importer: string | undefined
): Promise<readonly string[]> {
  const moduleInfo = await resolveModuleInfo(ctx, source, importer, true);
  return moduleInfo.importedIds;
}
