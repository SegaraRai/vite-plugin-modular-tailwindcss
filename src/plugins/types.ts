import type { ViteIdOptions } from "../frameworks/vite";
import type { Options } from "../options";

export type ViteOptions = Options & {
  readonly idOptions?: ViteIdOptions;
};
