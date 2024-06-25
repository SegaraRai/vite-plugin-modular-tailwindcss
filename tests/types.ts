import type { Options } from "../src";

export type TestCase = [filename: string, content: string][];

export interface TestOptions extends Options {
  head?: string;
  body?: string;
}

export type TestResult = Record<string, string>;
