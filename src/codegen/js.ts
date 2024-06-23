import {
  stringifyId,
  type TailwindModuleId,
  type TailwindModuleIdModuleJS,
  type TailwindModuleIdTop,
} from "../id";
import type { Layer } from "../options";
import { type PluginContext } from "../utils";
import type { CodegenContext } from "./context";
import { getFilteredModuleImports } from "./utils";

function createImportCodegen(inject: boolean) {
  const importCodes: string[] = [];
  const vars: string[] = [];

  const addImport = async (
    id: TailwindModuleId,
    varName: string
  ): Promise<void> => {
    const target = JSON.stringify(stringifyId(id, inject));
    if (inject) {
      importCodes.push(`import ${target};\n`);
    } else {
      importCodes.push(`import ${varName} from ${target};\n`);
      vars.push(varName);
    }
  };

  const getImportCode = (): string => importCodes.join("");

  const getExportCode = (): string =>
    inject ? "" : `export default ${vars.join(" + ") || '""'};`;

  return {
    addImport,
    getImportCode,
    getExportCode,
  };
}

export async function generateTopJSCode(
  { source, inject, shallow }: TailwindModuleIdTop,
  { options: { layers } }: CodegenContext,
  skipLayer: (layer: Layer, layerIndex: number) => boolean
): Promise<string> {
  const { addImport, getImportCode, getExportCode } =
    createImportCodegen(inject);

  for (const [layerIndex, layer] of layers.entries()) {
    if (skipLayer(layer, layerIndex)) {
      continue;
    }

    switch (layer.mode) {
      case "global":
        await addImport(
          { mode: "global", ext: "css", layerIndex, source: null },
          `l${layerIndex}g`
        );
        break;

      case "hoist":
        await addImport(
          { mode: "hoisted", ext: "css", layerIndex, source, shallow },
          `l${layerIndex}h`
        );
        break;

      case "module":
        await addImport(
          {
            mode: "module",
            ext: "js",
            layerIndex,
            shallow,
            inject,
            source,
          },
          `l${layerIndex}m`
        );
        break;
    }
  }

  return `${getImportCode()}${getExportCode()}`;
}

export async function generateModuleJSCode(
  ctx: PluginContext,
  { source, layerIndex, inject, shallow }: TailwindModuleIdModuleJS,
  { shouldIncludeImport }: CodegenContext
): Promise<string> {
  const importedIds = await getFilteredModuleImports(
    ctx,
    source,
    shouldIncludeImport
  );

  const { addImport, getImportCode, getExportCode } =
    createImportCodegen(inject);

  if (!shallow) {
    for (const [moduleIndex, id] of importedIds.entries()) {
      await addImport(
        { mode: "module", ext: "js", layerIndex, source: id, inject, shallow },
        `m${moduleIndex}`
      );
    }
  }

  await addImport({ mode: "module", ext: "css", layerIndex, source }, "s");

  return `${getImportCode()}${getExportCode()}`;
}
