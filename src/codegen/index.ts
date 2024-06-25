import type { TailwindModuleId } from "../id";
import type { ContentSpec, Layer, LayerMode } from "../options";
import type { createTailwindCSSGenerator } from "../tailwind";
import type { PluginContext } from "../utils";
import type { CodegenContext } from "./context";
import { generateModuleJSCode, generateTopJSCode } from "./js";
import { getFilteredModuleImportsRecursive } from "./utils";

export * from "./context";

function getExtension(source: string): string {
  return source.split(".").pop() ?? "js";
}

function getLayer<T extends LayerMode>(
  layers: readonly Layer[],
  layerIndex: number,
  mode: T
): Extract<Layer, { mode: T }> {
  const layer = layers[layerIndex];
  if (!layer) {
    throw new Error(`LogicError: Layer ${layerIndex} not found`);
  }

  if (layer.mode !== mode) {
    throw new Error(`LogicError: Layer ${layerIndex} is not a ${mode} layer`);
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
  const { layers } = codegenContext.options;

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
      const selfCode = await generateTailwindCSS(layer.mode, layer.code, [
        {
          raw: await getTailwindCSSContent(parsedId.source),
          extension: getExtension(parsedId.source),
        },
      ]);
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
        referencedContents
      );
      return [allCode, false];
    }

    case "global": {
      const layer = getLayer(layers, parsedId.layerIndex, "global");
      const globalCode = await generateTailwindCSS(
        layer.mode,
        layer.code,
        layer.content ?? null
      );
      return [globalCode, false];
    }
  }
}
