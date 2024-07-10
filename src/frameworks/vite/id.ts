import type { IdInfo } from "../../codegen";

const PREFIX = "\0tailwindcss/";

export function toImportPath(stringifiedId: string, idInfo: IdInfo): string {
  return `${stringifiedId}${idInfo.extension === "css" && idInfo.mode === "inline" ? "?inline" : ""}`;
}

export function parseId(
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

  const sourceId = sliced
    .slice(0, -name.length - 1)
    .replaceAll("__x00__", "\0");
  return [sourceId || null, name.replace(/\?.*$/, "")];
}

export function stringifyId(sourceId: string | null, name: string): string {
  if (!sourceId) {
    return `${PREFIX}${name}`;
  }

  return `${PREFIX}${sourceId.replaceAll("\0", "__x00__")}/${name}`;
}
