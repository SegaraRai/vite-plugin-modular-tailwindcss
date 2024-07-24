import { normalizePath } from "vite";
import type { IdInfo } from "../../codegen";
import type { CodegenFunctionsForId } from "../../id";

export interface ViteIdOptions {
  readonly delimiter?: string | undefined;
  readonly filenamePrefix?: string | undefined;
}

export interface ResolvedViteIdOptions extends Required<ViteIdOptions> {
  readonly root: string;
}

const PREFIX = "\0tailwindcss/";
const RELATIVE_PREFIX = "@@/";

export const DEFAULT_VITE_ID_OPTIONS = {
  delimiter: "/",
  filenamePrefix: "mtw.",
} as const satisfies Required<ViteIdOptions>;

function stringifySourceId(id: string, root: string): string {
  const normalizedId = normalizePath(id);
  if (normalizedId === root) {
    return RELATIVE_PREFIX.slice(0, -1);
  }

  const shortened = normalizePath(id).startsWith(root + "/")
    ? (RELATIVE_PREFIX + id.slice(root.length + 1)).replace(/\/$/, "")
    : id;
  return shortened.replaceAll("\0", "__x00__");
}

function restoreSourceId(id: string, root: string): string {
  const restored = id.replaceAll("__x00__", "\0");
  return restored.startsWith(RELATIVE_PREFIX) ||
    restored === RELATIVE_PREFIX.slice(0, -1)
    ? (root + "/" + restored.slice(RELATIVE_PREFIX.length)).replace(/\/$/, "")
    : restored;
}

export function toImportPath(stringifiedId: string, idInfo: IdInfo): string {
  return `${stringifiedId}${idInfo.extension === "css" && idInfo.mode === "inline" ? "?inline" : ""}`;
}

export function parseId(
  { root, delimiter, filenamePrefix }: ResolvedViteIdOptions,
  id: string
): readonly [sourceId: string | null, name: string] | null {
  if (!id.startsWith(PREFIX)) {
    return null;
  }

  const sliced = id.slice(PREFIX.length);
  const name = sliced.split(delimiter).pop()!;
  const sourceId =
    sliced !== name
      ? restoreSourceId(sliced.slice(0, -name.length - delimiter.length), root)
      : null;
  if (!name.startsWith(filenamePrefix)) {
    throw new Error(
      `LogicError: Invalid ID: "${id}". Expected name to start with "${filenamePrefix}"`
    );
  }
  return [sourceId, name.slice(filenamePrefix.length).replace(/\?.*$/, "")];
}

export function stringifyId(
  { root, delimiter, filenamePrefix }: ResolvedViteIdOptions,
  sourceId: string | null,
  name: string
): string {
  if (!sourceId) {
    return `${PREFIX}${filenamePrefix}${name}`;
  }

  return `${PREFIX}${stringifySourceId(sourceId, root)}${delimiter}${filenamePrefix}${name}`;
}

export function createIdFunctions(
  options: ResolvedViteIdOptions
): CodegenFunctionsForId {
  const { delimiter } = options;
  if (/^[a-z.]*$/i.test(delimiter) || /[\\?&#]/.test(delimiter)) {
    throw new Error(
      `Invalid delimiter: "${delimiter}". Parsing would be ambiguous.`
    );
  }

  return {
    parseId: (id) => parseId(options, id),
    stringifyId: (sourceId, name) => stringifyId(options, sourceId, name),
  };
}
