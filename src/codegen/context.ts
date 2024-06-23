import type { ResolvedOptions } from "../options";

export interface CodegenContext {
  readonly options: ResolvedOptions;
  readonly shouldIncludeImport: (
    resolvedId: string,
    importerId: string
  ) => boolean;
}
