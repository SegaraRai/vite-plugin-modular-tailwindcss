import type { ResolvedOptions } from "../options";

export interface IdInfo {
  readonly extension: "js" | "css";
  readonly mode: "inject" | "inline";
}

export interface CodegenFunctions {
  /**
   * Checks if an id should be included in the plugin's build.
   *
   * @param id A fully qualified module id for the build system.
   * @param importerId A fully qualified module id for the build system (if any) that imports the module.
   * @returns `true` if the module should be included in the build.
   */
  readonly shouldIncludeImport: (
    id: string,
    importerId: string | null
  ) => boolean;
  /**
   * Retrieves all module ids in the build system.
   *
   * @returns An array of fully qualified module ids for the build system.
   */
  readonly getAllModuleIds: () =>
    | readonly string[]
    | Promise<readonly string[]>;
  /**
   * Resolves the imports of a module.
   * The resolved imports are fully qualified module ids.
   *
   * @param id A fully qualified module id for the build system.
   * @param importerId A fully qualified module id for the build system (if any) that imports the module.
   * @returns An array of fully qualified module ids of the imports.
   */
  readonly resolveModuleImports: (
    id: string,
    importerId: string | null
  ) => readonly string[] | Promise<readonly string[]>;
  /**
   * Creates a fully qualified module id from a source module id and a internal name.
   *
   * @param sourceId A fully qualified module id of the source module. `null` for global layers.
   * @param name Internal name of the virtual module in the form of `foo.bar.baz.js|css`. Does not include slashes or whitespace.
   * @returns A fully qualified module id for the build system.
   */
  readonly stringifyId: (sourceId: string | null, name: string) => string;
  /**
   * Parses a fully qualified module id into a source module id and a internal name.
   *
   * @param id A fully qualified module id for the build system, built by `stringifyId`.
   * @returns A tuple of the source module id (if any) and the internal name.
   */
  readonly parseId: (
    id: string
  ) => readonly [sourceId: string | null, name: string] | null;
  /**
   * Converts a fully qualified module id into an import path.
   *
   * @param stringifiedId A fully qualified module id for the build system, built by `stringifyId`.
   * @param idInfo module info
   * @returns An import path for the build system.
   */
  readonly toImportPath: (stringifiedId: string, idInfo: IdInfo) => string;
  /**
   * Emits a warning message.
   *
   * @param message The warning message.
   */
  readonly warn: (message: string) => void;
}

export interface CodegenContext {
  readonly options: ResolvedOptions;
  readonly functions: CodegenFunctions;
}
