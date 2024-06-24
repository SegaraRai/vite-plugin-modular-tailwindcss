import { stringifyId, type TailwindModuleId } from "../id";
import type { Layer, LayerMode } from "../options";
import type { createTailwindCSSGenerator } from "../tailwind";
import { getModuleCode, type PluginContext } from "../utils";
import type { CodegenContext } from "./context";
import { generateHoistedCSSRawCode, jsToRaw, rawToJS } from "./css";
import { generateModuleJSCode, generateTopJSCode } from "./js";

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
      if (parsedId.ext === "css") {
        // Redirect to raw code
        const selfRawCode = jsToRaw(
          await getModuleCode(
            ctx,
            stringifyId({ ...parsedId, ext: "raw" }, false),
            stringifyId(parsedId, false)
          )
        );
        return [selfRawCode, false];
      }

      // Hoist all dependencies and generate the code
      // Since CSS processing order prevents direct hoisting, we create "raw" files for each CSS file and hoist them instead.
      const layer = getLayer(layers, parsedId.layerIndex, "hoisted");
      const hoistedCode = await generateHoistedCSSRawCode(
        ctx,
        parsedId,
        codegenContext
      );
      const selfCode = await generateTailwindCSS(layer.mode, layer.code, [
        {
          raw: await getTailwindCSSContent(parsedId.source),
          extension: getExtension(parsedId.source),
        },
      ]);
      return [rawToJS(hoistedCode + selfCode), false];
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
