import type { Plugin } from "vite";

export type PluginContext = ThisParameterType<
  Extract<Plugin["load"], Function>
>;
