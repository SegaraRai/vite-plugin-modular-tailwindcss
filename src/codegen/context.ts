import type { ResolvedOptions } from "../options";

export interface CodegenContext {
  readonly options: ResolvedOptions;
  readonly shouldIncludeImport: (
    resolvedId: string,
    importerId: string | null
  ) => boolean;
  readonly getAllModuleIds: () =>
    | readonly string[]
    | Promise<readonly string[]>;
  readonly resolveModuleImports: (
    resolvedId: string,
    importerId: string | null
  ) => readonly string[] | Promise<readonly string[]>;
  readonly warn: (message: string) => void;
}
