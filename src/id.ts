import { assertsNever } from "./utils";

export interface TailwindModuleIdTop {
  readonly mode: "top";
  readonly ext: "js";
  readonly layerIndex: null;
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
  readonly ext: "css";
  readonly layerIndex: number;
  readonly source: null;
}

export interface TailwindModuleIdHoisted {
  readonly mode: "hoisted";
  readonly ext: "css";
  readonly layerIndex: number;
  readonly shallow: boolean;
  readonly source: string;
}

export interface TailwindModuleIdModuleJS {
  readonly mode: "module";
  readonly ext: "js";
  readonly layerIndex: number;
  readonly shallow: boolean;
  readonly inject: boolean;
  readonly source: string;
}

export interface TailwindModuleIdModuleCSS {
  readonly mode: "module";
  readonly ext: "css";
  readonly layerIndex: number;
  readonly source: string;
}

export type TailwindModuleId =
  | TailwindModuleIdTop
  | TailwindModuleIdGlobal
  | TailwindModuleIdHoisted
  | TailwindModuleIdModuleJS
  | TailwindModuleIdModuleCSS;

const ID_GLOBAL_PREFIX = "\0tailwindcss.global.layer";
const ID_COMMON_PREFIX = "\0tailwindcss:";
const ID_SOURCE_DELIMITER = "::";

const TOP_IMPORT_SPEC_RE = /[#?]tailwindcss(?:\/([^/]*))?$/;

export function resolveId(
  source: string,
  importer: string | undefined
): string | undefined {
  if (
    source.startsWith(ID_GLOBAL_PREFIX) ||
    source.startsWith(ID_COMMON_PREFIX)
  ) {
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
    const resolved = resolveId(path, importer);
    if (!resolved) {
      throw new Error(`Could not resolve ${path} from ${importer}`);
    }

    path = resolved;
  }

  return stringifyId(
    {
      mode: "top",
      ext: "js",
      layerIndex: null,
      shallow,
      inject,
      source: path,
    },
    inject
  );
}

export async function resolveIdFromURL(
  url: string,
  resolveIdFromPath: (path: string) => Promise<string>
): Promise<string | undefined> {
  const match = TOP_IMPORT_SPEC_RE.exec(url);
  if (!match) {
    return;
  }

  const specs = (match?.[1] ?? "").split(/\b/);
  const shallow = specs.includes("shallow");
  const inject = specs.includes("inject");

  const source = await resolveIdFromPath(url.slice(0, -match[0].length));

  return stringifyId(
    {
      mode: "top",
      ext: "js",
      layerIndex: null,
      shallow,
      inject,
      source,
    },
    inject
  );
}

export function isOurId(resolvedId: string): boolean {
  return (
    resolvedId.startsWith(ID_GLOBAL_PREFIX) ||
    resolvedId.startsWith(ID_COMMON_PREFIX)
  );
}

export function parseId(resolvedId: string): TailwindModuleId | undefined {
  if (resolvedId.startsWith(ID_GLOBAL_PREFIX)) {
    const layerIndex = /\.layer(\d+)\./.exec(resolvedId)?.[1];
    if (!layerIndex) {
      throw new Error(
        `LogicError: Could not extract layer index from ${resolvedId}`
      );
    }

    return {
      mode: "global",
      ext: "css",
      layerIndex: Number(layerIndex),
      source: null,
    };
  }

  if (!resolvedId.startsWith(ID_COMMON_PREFIX)) {
    return;
  }

  const [source, spec] = resolvedId
    .slice(ID_COMMON_PREFIX.length)
    .split(ID_SOURCE_DELIMITER);
  if (!source) {
    throw new Error(`LogicError: Could not extract source from ${resolvedId}`);
  }

  if (spec.startsWith("index.")) {
    const inject = spec.includes(".inject.");
    const shallow = spec.includes(".shallow.");

    return {
      mode: "top",
      ext: "js",
      layerIndex: null,
      shallow,
      inject,
      source,
    };
  }

  const [, mode, layerIndex, strShallow, compoundExtension] =
    /^(hoisted|module)\.layer(\d+)(\.shallow)?\.(css|(?:inject\.)?js|raw)/.exec(
      spec
    ) ?? [];

  if (!mode || !layerIndex || !compoundExtension) {
    throw new Error(
      `LogicError: Could not extract mode, layer index, or extension from ${spec}`
    );
  }

  const extension = compoundExtension.split(".").pop()!;
  const shallow = !!strShallow;
  const inject = compoundExtension.startsWith("inject.");

  switch (mode) {
    case "hoisted":
      if (extension === "css") {
        return {
          mode: "hoisted",
          ext: extension,
          layerIndex: Number(layerIndex),
          shallow,
          source,
        };
      }

      throw new Error(`LogicError: Hoisted layers must be a CSS file`);

    case "module":
      if (extension === "js") {
        return {
          mode: "module",
          ext: extension,
          layerIndex: Number(layerIndex),
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
          mode: "module",
          ext: extension,
          layerIndex: Number(layerIndex),
          source,
        };
      }

      throw new Error(`LogicError: Module layers must be a CSS or JS file`);

    default:
      throw new Error(`LogicError: Unknown mode ${mode}`);
  }
}

export function stringifyId(id: TailwindModuleId, inject: boolean): string {
  if (id.mode === "global") {
    return `${ID_GLOBAL_PREFIX}${id.layerIndex}.css${!inject ? "?inline" : ""}`;
  }

  const prefix = `${ID_COMMON_PREFIX}${id.source}${ID_SOURCE_DELIMITER}`;

  switch (id.mode) {
    case "top":
      if (inject !== id.inject) {
        throw new Error("LogicError: inject specifier mismatch for top code");
      }
      return `${prefix}index${id.shallow ? ".shallow" : ""}${!inject ? ".inline" : ".inject"}.js`;

    case "hoisted":
      return `${prefix}hoisted.layer${id.layerIndex}${id.shallow ? ".shallow" : ""}.css${!inject ? "?inline" : ""}`;

    case "module":
      if (id.ext === "js" && inject !== id.inject) {
        throw new Error(
          `LogicError: inject specifier mismatch for module layer ${id.layerIndex}`
        );
      }
      return id.ext === "js"
        ? `${prefix}module.layer${id.layerIndex}${id.shallow ? ".shallow" : ""}${inject ? ".inject" : ""}.js`
        : `${prefix}module.layer${id.layerIndex}.css${!inject ? "?inline" : ""}`;

    default:
      assertsNever(id);
  }
}
