import {
  stringifyId,
  type TailwindModuleId,
  type TailwindModuleIdModuleJS,
  type TailwindModuleIdTop,
} from "../id";
import type { Layer } from "../options";
import { assertsNever, type PluginContext } from "../utils";
import type { CodegenContext } from "./context";
import { getFilteredModuleImports } from "./utils";

function createImportCodegen(inject: boolean) {
  const importCodes: string[] = [];
  const vars: [name: string, isFunction: boolean][] = [];

  const addImport = async (
    id: TailwindModuleId,
    varName: string,
    isFunction: boolean
  ): Promise<void> => {
    const target = JSON.stringify(stringifyId(id, inject));
    if (inject) {
      importCodes.push(`import ${target};\n`);
    } else {
      importCodes.push(`import ${varName} from ${target};\n`);
      vars.push([varName, isFunction]);
    }
  };

  const getImportCode = (): string => importCodes.join("");

  const getExportCode = (wrapWithFunction: boolean): string => {
    if (inject) {
      return "";
    }

    const callExpression = wrapWithFunction ? "(...p, f)" : "()";
    const content =
      vars
        .map(
          ([varName, isFunction]): string =>
            varName + (isFunction ? callExpression : "")
        )
        .join(" + ") || '""';

    return wrapWithFunction
      ? `const f = (...p) => p.includes(f) ? "" : ${content};\nexport default f;\n`
      : `export default ${content};\n`;
  };

  return {
    addImport,
    getImportCode,
    getExportCode,
  };
}

export async function generateTopJSCode(
  { source, inject, shallow }: TailwindModuleIdTop,
  { options: { allowCircularModules, layers } }: CodegenContext,
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
      case "globalFilesystem":
        await addImport(
          { mode: "global", ext: "css", layerIndex, source: null },
          `l${layerIndex}g`,
          false
        );
        break;

      case "hoisted":
        await addImport(
          { mode: "hoisted", ext: "css", layerIndex, source, shallow },
          `l${layerIndex}h`,
          false
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
          `l${layerIndex}m`,
          allowCircularModules
        );
        break;

      default:
        assertsNever(layer);
    }
  }

  return `${getImportCode()}${getExportCode(false)}`;
}

export async function generateModuleJSCode(
  ctx: PluginContext,
  { source, layerIndex, inject, shallow }: TailwindModuleIdModuleJS,
  { shouldIncludeImport, options: { allowCircularModules } }: CodegenContext
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
        `m${moduleIndex}`,
        allowCircularModules
      );
    }
  }

  await addImport(
    { mode: "module", ext: "css", layerIndex, source },
    "s",
    false
  );

  return `${getImportCode()}${getExportCode(allowCircularModules)}`;
}
