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

export async function waitForModuleIdsToBeStable(
  ctx: PluginContext,
  shouldInclude: (resolvedId: string) => boolean
): Promise<void> {
  for (;;) {
    const moduleIds = Array.from(ctx.getModuleIds());
    for (const resolvedId of moduleIds) {
      if (!shouldInclude(resolvedId)) {
        continue;
      }

      await resolveModuleInfo(ctx, resolvedId, undefined, true);
    }

    const afterCount = Array.from(ctx.getModuleIds()).length;
    if (moduleIds.length === afterCount) {
      break;
    }
  }
}
