import type { TailwindModuleId } from "../id";
import type { ContentSpec, Layer, LayerMode } from "../options";
import type { createTailwindCSSGenerator } from "../tailwind";
import { assertsNever } from "../utils";
import type { CodegenContext } from "./context";
import { generateModuleJSCode, generateTopJSCode } from "./js";
import {
  getFilteredModuleImportsRecursive,
  waitAndResolveAllModuleIds,
} from "./utils";

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
  parsedId: TailwindModuleId,
  codegenContext: CodegenContext,
  generateTailwindCSS: ReturnType<typeof createTailwindCSSGenerator>,
  skipLayer: (layer: Layer, layerIndex: number) => boolean,
  getTailwindCSSContent: (sourceId: string) => Promise<string>
): Promise<[code: string, hasSideEffects: boolean]> {
  const { mode } = parsedId;
  const {
    warn,
    options: { layers, globCWD },
  } = codegenContext;

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
        const selfJSCode = await generateModuleJSCode(codegenContext, parsedId);
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
        globCWD,
        warn
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
            codegenContext,
            parsedId.source
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
        globCWD,
        warn
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
          const allModuleIds = await waitAndResolveAllModuleIds(codegenContext);

          const allContents: ContentSpec[] = [];
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
            globCWD,
            warn
          );
          return [globalCode, false];
        }

        case "globalFilesystem": {
          const content = layer.content ?? null;
          const globalCode = await generateTailwindCSS(
            layer.mode,
            layer.code,
            content,
            globCWD,
            warn
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
