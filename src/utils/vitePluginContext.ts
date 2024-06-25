import type { Plugin } from "vite";

export type PluginContext = ThisParameterType<
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  Extract<Plugin["load"], Function>
>;
