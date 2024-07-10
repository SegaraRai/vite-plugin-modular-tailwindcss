import { normalizePath, type ResolvedConfig } from "vite";
import type { IdInfo } from "../../codegen";
import type { CodegenFunctionsForId } from "../../id";

const PREFIX = "\0tailwindcss/";
const RELATIVE_PREFIX = "@@/";

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
  { root }: ResolvedConfig,
  id: string
): readonly [sourceId: string | null, name: string] | null {
  if (!id.startsWith(PREFIX)) {
    return null;
  }

  const sliced = id.slice(PREFIX.length);
  const name = sliced.match(/[^/]+$/)?.[0] ?? "";
  if (!name) {
    return null;
  }

  const sourceId = restoreSourceId(sliced.slice(0, -name.length - 1), root);
  return [sourceId || null, name.replace(/\?.*$/, "")];
}

export function stringifyId(
  { root }: ResolvedConfig,
  sourceId: string | null,
  name: string
): string {
  if (!sourceId) {
    return `${PREFIX}${name}`;
  }

  return `${PREFIX}${stringifySourceId(sourceId, root)}/${name}`;
}

export function createIdFunctions(
  config: ResolvedConfig
): CodegenFunctionsForId {
  return {
    parseId: (id) => parseId(config, id),
    stringifyId: (sourceId, name) => stringifyId(config, sourceId, name),
  };
}
