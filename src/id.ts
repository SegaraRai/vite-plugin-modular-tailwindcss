import type { CodegenFunctions, IdInfo } from "./codegen";
import { assertsNever } from "./utils";

export type CodegenFunctionsForId = Pick<
  CodegenFunctions,
  "parseId" | "stringifyId"
>;

export interface TailwindModuleIdTop {
  readonly mode: "top";
  readonly extension: "js";
  readonly shallow: boolean;
  readonly inject: boolean;
  readonly source: string;
}

/**
 * `global` and `globalFilesystem` layers are both represented by this type. \
 * They are distinguished after resolving the layer by `layerIndex`.
 */
export interface TailwindModuleIdGlobal {
  readonly mode: "global";
  readonly extension: "css";
  readonly layerIndex: number;
}

export interface TailwindModuleIdHoisted {
  readonly mode: "hoisted";
  readonly extension: "css";
  readonly layerIndex: number;
  readonly shallow: boolean;
  readonly source: string;
}

export interface TailwindModuleIdModuleJS {
  readonly mode: "module";
  readonly extension: "js";
  readonly layerIndex: number;
  readonly shallow: boolean;
  readonly inject: boolean;
  readonly source: string;
}

export interface TailwindModuleIdModuleCSS {
  readonly mode: "module";
  readonly extension: "css";
  readonly layerIndex: number;
  readonly source: string;
}

export type TailwindModuleId =
  | TailwindModuleIdTop
  | TailwindModuleIdGlobal
  | TailwindModuleIdHoisted
  | TailwindModuleIdModuleJS
  | TailwindModuleIdModuleCSS;

const TOP_IMPORT_SPEC_RE = /[#?]tailwindcss(?:\/([^/]*))?$/;

export function resolveId(
  source: string,
  importer: string | undefined,
  funcs: CodegenFunctionsForId
): string | undefined {
  if (isOurId(source, funcs)) {
    return source;
  }

  const match = TOP_IMPORT_SPEC_RE.exec(source);
  if (!match) {
    return;
  }

  const specs = (match?.[1] ?? "").split(/\b/);
  const shallow = specs.includes("shallow");
  const inject = specs.includes("inject");

  let path = source.slice(0, -match[0].length);
  if (!path) {
    if (!importer) {
      throw new Error(`${source} cannot be imported without an importer`);
    }

    path = importer;
  } else {
    const resolved = resolveId(path, importer, funcs);
    if (!resolved) {
      throw new Error(`Could not resolve ${path} from ${importer}`);
    }

    path = resolved;
  }

  return stringifyId(
    {
      mode: "top",
      extension: "js",
      shallow,
      inject,
      source: path,
    },
    inject,
    funcs
  );
}

export async function resolveIdFromURL(
  url: string,
  resolveIdFromPath: (path: string) => string | Promise<string>,
  funcs: CodegenFunctionsForId
): Promise<string | undefined> {
  const match = TOP_IMPORT_SPEC_RE.exec(url);
  if (!match) {
    return;
  }

  const specifier = (match?.[1] ?? "").split(/\b/);
  const shallow = specifier.includes("shallow");
  const inject = specifier.includes("inject");

  const source = await resolveIdFromPath(url.slice(0, -match[0].length));

  return stringifyId(
    {
      mode: "top",
      extension: "js",
      shallow,
      inject,
      source,
    },
    inject,
    funcs
  );
}

export function isOurId(
  resolvedId: string,
  { parseId }: CodegenFunctionsForId
): boolean {
  return !!parseId(resolvedId);
}

export function parseId(
  resolvedId: string,
  { parseId }: CodegenFunctionsForId
): TailwindModuleId | undefined {
  const [source, name] = parseId(resolvedId) ?? [];
  if (!name) {
    return;
  }

  if (!source) {
    const strLayerIndex = /\.layer(\d+)\./.exec(name)?.[1];
    if (!strLayerIndex) {
      throw new Error(
        `LogicError: Could not extract layer index from ${resolvedId}`
      );
    }

    return {
      mode: "global",
      extension: "css",
      layerIndex: Number(strLayerIndex),
    };
  }

  const [, topSpecifier] = /^top\.([a-z]+)\.js/.exec(name) ?? [];
  if (topSpecifier) {
    const shallow = topSpecifier.includes("s");
    const inject = topSpecifier.includes("j");

    return {
      mode: "top",
      extension: "js",
      shallow,
      inject,
      source,
    };
  }

  const [, mode, strLayerIndex, specifier, extension] =
    /^(hoisted|module)\.layer(\d+)\.([a-z]+)\.(js|css)/.exec(name) ?? [];

  if (!mode || !strLayerIndex || !extension) {
    throw new Error(
      `LogicError: Could not extract mode, layer index, or extension from ${name}`
    );
  }

  const layerIndex = Number(strLayerIndex);

  const shallow = specifier.includes("s");
  const inject = specifier.includes("j");

  switch (mode) {
    case "hoisted":
      if (extension === "css") {
        return {
          mode,
          extension,
          layerIndex,
          shallow,
          source,
        };
      }

      throw new Error(`LogicError: Hoisted layers must be a CSS file`);

    case "module":
      if (extension === "js") {
        return {
          mode,
          extension,
          layerIndex,
          shallow,
          inject,
          source,
        };
      }

      if (extension === "css") {
        if (shallow) {
          throw new Error(`LogicError: Module layers CSS cannot be shallow`);
        }

        return {
          mode,
          extension,
          layerIndex,
          source,
        };
      }

      throw new Error(`LogicError: Module layers must be a CSS or JS file`);

    default:
      throw new Error(`LogicError: Unknown mode ${mode}`);
  }
}

export function stringifyId(
  id: TailwindModuleId,
  inject: boolean,
  { stringifyId }: CodegenFunctionsForId
): string {
  const injectSpec = inject ? "j" : "l";
  const shallowSpec = "shallow" in id ? (id.shallow ? "s" : "d") : "";
  const spec = `${shallowSpec}${injectSpec}`;

  if (id.mode === "global") {
    return stringifyId(null, `global.layer${id.layerIndex}.${spec}.css`);
  }

  switch (id.mode) {
    case "top":
      if (inject !== id.inject) {
        throw new Error("LogicError: inject specifier mismatch for top code");
      }
      return stringifyId(id.source, `top.${spec}.js`);

    case "hoisted":
      return stringifyId(
        id.source,
        `hoisted.layer${id.layerIndex}.${spec}.css`
      );

    case "module":
      if (id.extension === "js" && inject !== id.inject) {
        throw new Error(
          `LogicError: inject specifier mismatch for module layer ${id.layerIndex}`
        );
      }
      return stringifyId(
        id.source,
        `module.layer${id.layerIndex}.${spec}.${id.extension}`
      );

    default:
      assertsNever(id);
  }
}

export function getIdInfo(id: string): IdInfo {
  const [, specifier, extension] = /\.([a-z]+)\.(js|css)$/.exec(id) ?? [];
  if (!specifier || !extension) {
    throw new Error(
      `LogicError: Could not extract specifier or extension from ${id}`
    );
  }

  return {
    mode: specifier.includes("j") ? "inject" : "inline",
    extension: extension as IdInfo["extension"],
  };
}
