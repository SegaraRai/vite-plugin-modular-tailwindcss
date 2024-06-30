import type { ExcludeSpec } from "../options";

export function shouldExclude(
  resolvedId: string,
  importerId: string | null,
  excludes: readonly ExcludeSpec[]
): boolean {
  return excludes.some((exclude) => {
    if (typeof exclude === "string") {
      return resolvedId === exclude;
    }

    if (exclude instanceof RegExp) {
      return exclude.test(resolvedId);
    }

    return exclude(resolvedId, importerId);
  });
}
