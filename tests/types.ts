import type { PluginOption } from "vite";
import type { Options } from "../src";

export type TestCase = [filename: string, content: string][];

export interface TestOptions extends Options {
  head?: string;
  body?: string;
  noPreserveModules?: boolean;
  prePlugins?: readonly PluginOption[];
  postPlugins?: readonly PluginOption[];
}

export type TestResultFiles = Record<string, string>;
export type TestResultLog = string | object;

export interface TestResult {
  files: TestResultFiles;
  warnings: TestResultLog[];
}
