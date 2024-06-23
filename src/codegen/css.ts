import { stringifyId, type TailwindModuleIdHoisted } from "../id";
import { getModuleCode, type PluginContext } from "../utils";
import type { CodegenContext } from "./context";
import { getFilteredModuleImports } from "./utils";

export function rawToJS(code: string): string {
  // We have to convert the raw text to a JS string, or Rollup will throw an error.
  return `export default ${JSON.stringify(code)};\n`;
}

export function jsToRaw(code: string): string {
  return JSON.parse(code.replace(/^export default /, "").replace(/;\s*$/, ""));
}

export async function generateHoistedCSSRawCode(
  ctx: PluginContext,
  { source, layerIndex, shallow }: TailwindModuleIdHoisted,
  { shouldIncludeImport }: CodegenContext
): Promise<string> {
  if (shallow) {
    return "";
  }

  const importedIds = await getFilteredModuleImports(
    ctx,
    source,
    shouldIncludeImport
  );

  let hoistedCode = "";
  for (const id of importedIds) {
    const code = jsToRaw(
      await getModuleCode(
        ctx,
        stringifyId(
          {
            mode: "hoisted",
            ext: "raw",
            layerIndex,
            shallow,
            source: id,
          },
          false
        ),
        source
      )
    );

    hoistedCode += code;
  }

  return hoistedCode;
}
