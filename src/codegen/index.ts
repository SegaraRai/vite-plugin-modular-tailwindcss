import type { TailwindModuleId } from "../id";
import type { ContentSpec, Layer, LayerMode } from "../options";
import type { createTailwindCSSGenerator } from "../tailwind";
import {
  assertsNever,
  waitForModuleIdsToBeStable,
  type PluginContext,
} from "../utils";
import type { CodegenContext } from "./context";
import { generateModuleJSCode, generateTopJSCode } from "./js";
import { getFilteredModuleImportsRecursive } from "./utils";

export * from "./context";
export { hasCircularDependencies } from "./utils";

function getExtension(source: string): string {
  return source.split(".").pop() ?? "js";
}

function getLayer<T extends LayerMode>(
  layers: readonly Layer[],
  layerIndex: number,
  mode: T | readonly T[]
): Extract<Layer, { mode: T }> {
  const layer = layers[layerIndex];
  if (!layer) {
    throw new Error(`LogicError: Layer ${layerIndex} not found`);
  }

  const isModeCorrect =
    typeof mode === "string"
      ? layer.mode === mode
      : (mode as readonly string[]).includes(layer.mode);
  if (!isModeCorrect) {
    throw new Error(
      `LogicError: Layer ${layerIndex} is expected to be ${mode} mode but is ${layer.mode} mode`
    );
  }

  return layer as Extract<Layer, { mode: T }>;
}

export async function generateCode(
  ctx: PluginContext,
  parsedId: TailwindModuleId,
  codegenContext: CodegenContext,
  generateTailwindCSS: ReturnType<typeof createTailwindCSSGenerator>,
  skipLayer: (layer: Layer, layerIndex: number) => boolean,
  getTailwindCSSContent: (sourceId: string) => Promise<string>
): Promise<[code: string, hasSideEffects: boolean]> {
  const { mode } = parsedId;
  const { layers, globCWD } = codegenContext.options;

  switch (mode) {
    case "top": {
      const topJSCode = await generateTopJSCode(
        parsedId,
        codegenContext,
        skipLayer
      );
      return [topJSCode, parsedId.inject];
    }

    case "module": {
      if (parsedId.ext === "js") {
        const selfJSCode = await generateModuleJSCode(
          ctx,
          parsedId,
          codegenContext
        );
        return [selfJSCode, parsedId.inject];
      }

      const layer = getLayer(layers, parsedId.layerIndex, "module");
      const content: ContentSpec[] = [
        {
          raw: await getTailwindCSSContent(parsedId.source),
          extension: getExtension(parsedId.source),
        },
      ];
      const selfCode = await generateTailwindCSS(
        layer.mode,
        layer.code,
        content,
        globCWD
      );
      return [selfCode, false];
    }

    case "hoisted": {
      // Resolves the dependency graph and generates the hoisted CSS code.
      const layer = getLayer(layers, parsedId.layerIndex, "hoisted");
      const referencedContents: ContentSpec[] = [];
      const referencedIds = parsedId.shallow
        ? [parsedId.source]
        : await getFilteredModuleImportsRecursive(
            ctx,
            parsedId.source,
            codegenContext.shouldIncludeImport
          );
      for (const id of referencedIds) {
        referencedContents.push({
          raw: await getTailwindCSSContent(id),
          extension: getExtension(id),
        });
      }
      const allCode = await generateTailwindCSS(
        layer.mode,
        layer.code,
        referencedContents,
        globCWD
      );
      return [allCode, false];
    }

    case "global": {
      const layer = getLayer(layers, parsedId.layerIndex, [
        "global",
        "globalFilesystem",
      ]);

      switch (layer.mode) {
        case "global": {
          await waitForModuleIdsToBeStable(ctx, (resolvedId: string): boolean =>
            codegenContext.shouldIncludeImport(resolvedId, null)
          );

          const allContents: ContentSpec[] = [];
          const allModuleIds = Array.from(ctx.getModuleIds()).filter(
            (resolvedId) => codegenContext.shouldIncludeImport(resolvedId, null)
          );
          for (const id of allModuleIds) {
            allContents.push({
              raw: await getTailwindCSSContent(id),
              extension: getExtension(id),
            });
          }

          const globalCode = await generateTailwindCSS(
            layer.mode,
            layer.code,
            allContents,
            globCWD
          );
          return [globalCode, false];
        }

        case "globalFilesystem": {
          const content = layer.content ?? null;
          const globalCode = await generateTailwindCSS(
            layer.mode,
            layer.code,
            content,
            globCWD
          );
          return [globalCode, false];
        }

        default:
          assertsNever(layer);
      }

      throw new Error(`LogicError: Unknown global layer mode ${layer.mode}`);
    }

    default:
      assertsNever(mode);
  }
}
