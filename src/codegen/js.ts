import {
  stringifyId,
  type TailwindModuleId,
  type TailwindModuleIdModuleJS,
  type TailwindModuleIdTop,
} from "../id";
import type { Layer } from "../options";
import { assertsNever } from "../utils";
import type { CodegenContext, CodegenFunctions } from "./context";
import { getFilteredModuleImports } from "./utils";

function createImportCodegen(inject: boolean, functions: CodegenFunctions) {
  const { toImportPath } = functions;

  const importCodes: string[] = [];
  const vars: [name: string, isFunction: boolean][] = [];

  const addImport = async (
    id: TailwindModuleId,
    varName: string,
    isFunction: boolean
  ): Promise<void> => {
    const target = JSON.stringify(
      toImportPath(stringifyId(id, inject, functions), {
        extension: id.extension,
        mode: inject ? "inject" : "inline",
      })
    );
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
  { functions, options: { allowCircularModules, layers } }: CodegenContext,
  skipLayer: (layer: Layer, layerIndex: number) => boolean
): Promise<string> {
  const { addImport, getImportCode, getExportCode } = createImportCodegen(
    inject,
    functions
  );

  for (const [layerIndex, layer] of layers.entries()) {
    if (skipLayer(layer, layerIndex)) {
      continue;
    }

    switch (layer.mode) {
      case "global":
      case "globalFilesystem":
        await addImport(
          { mode: "global", extension: "css", layerIndex },
          `l${layerIndex}g`,
          false
        );
        break;

      case "hoisted":
        await addImport(
          { mode: "hoisted", extension: "css", layerIndex, source, shallow },
          `l${layerIndex}h`,
          false
        );
        break;

      case "module":
        await addImport(
          {
            mode: "module",
            extension: "js",
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
  context: CodegenContext,
  { source, layerIndex, inject, shallow }: TailwindModuleIdModuleJS
): Promise<string> {
  const {
    functions,
    options: { allowCircularModules },
  } = context;
  const importedIds = await getFilteredModuleImports(functions, source);

  const { addImport, getImportCode, getExportCode } = createImportCodegen(
    inject,
    functions
  );

  if (!shallow) {
    for (const [moduleIndex, id] of importedIds.entries()) {
      await addImport(
        {
          mode: "module",
          extension: "js",
          layerIndex,
          source: id,
          inject,
          shallow,
        },
        `m${moduleIndex}`,
        allowCircularModules
      );
    }
  }

  await addImport(
    { mode: "module", extension: "css", layerIndex, source },
    "s",
    false
  );

  return `${getImportCode()}${getExportCode(allowCircularModules)}`;
}
