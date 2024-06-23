export type ContentSpec = string | { raw: string; extension: string };

export type LayerMode = "global" | "hoist" | "module";

export interface LayerBase {
  mode: LayerMode;
  code: string;
  apply?: "build" | "serve" | null;
}

export interface LayerGlobal extends LayerBase {
  mode: "global";
  code: string;
  content?: readonly ContentSpec[];
}

export interface LayerHoist extends LayerBase {
  mode: "hoist";
}

export interface LayerModule extends LayerBase {
  mode: "module";
}

export type Layer = LayerGlobal | LayerHoist | LayerModule;

export type ExcludeSpec =
  | string
  | RegExp
  | ((resolvedId: string, importerId: string) => boolean);

export interface Options {
  configPath?: string;
  layers?: readonly Layer[];
  excludes?: readonly ExcludeSpec[];
}

export type ResolvedOptions = Required<Options>;
