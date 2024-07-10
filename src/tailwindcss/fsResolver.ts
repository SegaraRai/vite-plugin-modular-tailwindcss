import fg from "fast-glob";
import fs from "node:fs";
import { extname } from "node:path";
import type { ContentSpec } from "../options";
import type { WarnCallback } from "./types";

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
  globs: readonly string[],
  cache: FilesystemCache,
  cwd: string | undefined,
  warn: WarnCallback
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
      warn(`Failed to read file: ${file}`);
      warn(String(e));
    }
  }

  return result;
}

export function resolveContentSpec(
  content: readonly ContentSpec[],
  cache: FilesystemCache,
  cwd: string | undefined,
  warn: WarnCallback
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
    ...resolveFilesystemContents(globs, cache, cwd, warn),
  ];
}
