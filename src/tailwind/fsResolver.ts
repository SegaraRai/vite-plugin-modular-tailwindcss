import fg from "fast-glob";
import fs from "node:fs";
import { extname } from "node:path";
import type { ContentSpec } from "../options";
import type { PluginContext } from "../utils";

export interface ResolvedContent {
  content: string;
  extension: string;
}

export type FilesystemCache = Map<
  string,
  [mtime: number, content: ResolvedContent]
>;

export function createFilesystemCache(): FilesystemCache {
  return new Map();
}

export function resolveFilesystemContents(
  ctx: PluginContext,
  globs: readonly string[],
  cache: FilesystemCache,
  cwd: string | undefined
): ResolvedContent[] {
  const result: ResolvedContent[] = [];

  const files = fg
    .sync([...globs], {
      absolute: true,
      onlyFiles: true,
      cwd,
    })
    .sort();

  for (const file of files) {
    try {
      const mtime = fs.statSync(file).mtimeMs;
      let entry = cache.get(file);
      if (entry?.[0] !== mtime) {
        const content = fs.readFileSync(file, "utf-8");
        const extension = extname(file).replace(/^\./, "") || "html";
        entry = [mtime, { content, extension }];
        cache.set(file, entry);
      }

      result.push(entry[1]);
    } catch (e) {
      ctx.warn(`Failed to read file: ${file}`);
      ctx.warn(String(e));
    }
  }

  return result;
}

export function resolveContentSpec(
  ctx: PluginContext,
  content: readonly ContentSpec[],
  cache: FilesystemCache,
  cwd: string | undefined
): ResolvedContent[] {
  if (!content) {
    return [];
  }

  const rawContents = content.filter(
    (v): v is Extract<ContentSpec, object> => !!v && typeof v === "object"
  );
  const globs = content.filter(
    (v): v is string => !!v && typeof v === "string"
  );

  return [
    ...rawContents.map(({ raw: content, extension }) => ({
      content,
      extension,
    })),
    ...resolveFilesystemContents(ctx, globs, cache, cwd),
  ];
}
