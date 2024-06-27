import type { InlineConfig } from "vite";
import type { Options } from "../src";

export type TestCase = [filename: string, content: string][];

export interface TestOptions extends Options {
  head?: string;
  body?: string;
  configure?: (config: InlineConfig) => InlineConfig;
}

export type TestResult = Record<string, string>;
