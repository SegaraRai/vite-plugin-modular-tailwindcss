import { runInNewContext } from "node:vm";
import { it } from "vitest";
import { runBuild } from "../runner";
import type { TestCase } from "../types";

const TEST_INPUT_COMPONENTS: TestCase = [
  [
    "entry.js",
    `import css from "#tailwindcss";
import { a1 } from "./a.js";
console.log(a1(), css);
`,
  ],
  [
    "a.js",
    `import { b1 } from "./b.js";
export const a1 = () => "test-c-1 " + b1();
export const a2 = () => "test-c-9";
`,
  ],
  [
    "b.js",
    `import { c1 } from "./c.js";
export const b1 = () => "test-c-2 " + c1();
`,
  ],
  [
    "c.js",
    `import { a2 } from "./a.js";
export const c1 = () => "test-c-3 " + a2();
`,
  ],
];

const TEST_INPUT_UTILITIES: TestCase = [
  [
    "entry.js",
    `import css from "#tailwindcss";
import { a1 } from "./a.js";
console.log(a1(), css);
`,
  ],
  [
    "a.js",
    `import { b1 } from "./b.js";
export const a1 = () => "test-u-1 " + b1();
export const a2 = () => "test-u-9";
`,
  ],
  [
    "b.js",
    `import { c1 } from "./c.js";
export const b1 = () => "test-u-2 " + c1();
`,
  ],
  [
    "c.js",
    `import { a2 } from "./a.js";
export const c1 = () => "test-u-3 " + a2();
`,
  ],
];

it("should handle circular dependencies with hoisted mode", async ({
  expect,
}) => {
  const { files } = await runBuild(TEST_INPUT_COMPONENTS);

  expect(
    files["[intermediate] tailwindcss/__x00__test/entry.js/hoisted.layer1.dl.css?inline"]
  ).toContain(".test-c-1");
  expect(
    files["[intermediate] tailwindcss/__x00__test/entry.js/hoisted.layer1.dl.css?inline"]
  ).toContain(".test-c-2");
  expect(
    files["[intermediate] tailwindcss/__x00__test/entry.js/hoisted.layer1.dl.css?inline"]
  ).toContain(".test-c-3");
  expect(
    files["[intermediate] tailwindcss/__x00__test/entry.js/hoisted.layer1.dl.css?inline"]
  ).toContain(".test-c-9");

  expect(files).toMatchInlineSnapshot(`
    {
      "[intermediate] tailwindcss/__x00__test/a.js/module.layer2.dl.js": "import m0 from "\\u0000tailwindcss/__x00__test/b.js/module.layer2.dl.js";
    import s from "\\u0000tailwindcss/__x00__test/a.js/module.layer2.l.css?inline";
    export default m0 + s;
    ",
      "[intermediate] tailwindcss/__x00__test/a.js/module.layer2.l.css?inline": "export default """,
      "[intermediate] tailwindcss/__x00__test/b.js/module.layer2.dl.js": "import m0 from "\\u0000tailwindcss/__x00__test/c.js/module.layer2.dl.js";
    import s from "\\u0000tailwindcss/__x00__test/b.js/module.layer2.l.css?inline";
    export default m0 + s;
    ",
      "[intermediate] tailwindcss/__x00__test/b.js/module.layer2.l.css?inline": "export default """,
      "[intermediate] tailwindcss/__x00__test/c.js/module.layer2.dl.js": "import m0 from "\\u0000tailwindcss/__x00__test/a.js/module.layer2.dl.js";
    import s from "\\u0000tailwindcss/__x00__test/c.js/module.layer2.l.css?inline";
    export default m0 + s;
    ",
      "[intermediate] tailwindcss/__x00__test/c.js/module.layer2.l.css?inline": "export default """,
      "[intermediate] tailwindcss/__x00__test/entry.js/hoisted.layer1.dl.css?inline": "export default ".test-c-1 {\\n    --test-c: 1px\\n}\\n.test-c-2 {\\n    --test-c: 2px\\n}\\n.test-c-3 {\\n    --test-c: 3px\\n}\\n.test-c-9 {\\n    --test-c: 9px\\n}\\n"",
      "[intermediate] tailwindcss/__x00__test/entry.js/module.layer2.dl.js": "import m0 from "\\u0000tailwindcss/__x00__test/a.js/module.layer2.dl.js";
    import s from "\\u0000tailwindcss/__x00__test/entry.js/module.layer2.l.css?inline";
    export default m0 + s;
    ",
      "[intermediate] tailwindcss/__x00__test/entry.js/module.layer2.l.css?inline": "export default """,
      "[intermediate] tailwindcss/__x00__test/entry.js/top.dl.js": "import l0g from "\\u0000tailwindcss/global.layer0.l.css?inline";
    import l1h from "\\u0000tailwindcss/__x00__test/entry.js/hoisted.layer1.dl.css?inline";
    import l2m from "\\u0000tailwindcss/__x00__test/entry.js/module.layer2.dl.js";
    export default l0g + l1h + l2m;
    ",
      "[intermediate] tailwindcss/global.layer0.l.css?inline": "export default "/* TailwindCSS Base */\\n/* TailwindCSS Base Backdrop */\\n"",
      "[output] _virtual/a.js": "import { b1 } from "./b.js";
    const a1 = () => "test-c-1 " + b1();
    const a2 = () => "test-c-9";
    export {
      a1,
      a2
    };
    ",
      "[output] _virtual/b.js": "import { c1 } from "./c.js";
    const b1 = () => "test-c-2 " + c1();
    export {
      b1
    };
    ",
      "[output] _virtual/c.js": "import { a2 } from "./a.js";
    const c1 = () => "test-c-3 " + a2();
    export {
      c1
    };
    ",
      "[output] _virtual/entry.js": "import css from "./top.dl.js";
    import { a1 } from "./a.js";
    console.log(a1(), css);
    ",
      "[output] _virtual/global.layer0.l.css.js": "const l0g = "/* TailwindCSS Base */\\n/* TailwindCSS Base Backdrop */\\n";
    export {
      l0g as default
    };
    ",
      "[output] _virtual/hoisted.layer1.dl.css.js": "const l1h = ".test-c-1 {\\n    --test-c: 1px\\n}\\n.test-c-2 {\\n    --test-c: 2px\\n}\\n.test-c-3 {\\n    --test-c: 3px\\n}\\n.test-c-9 {\\n    --test-c: 9px\\n}\\n";
    export {
      l1h as default
    };
    ",
      "[output] _virtual/module.layer2.dl.js": "import m0 from "./module.layer2.dl2.js";
    import s from "./module.layer2.l.css.js";
    const l2m = m0 + s;
    export {
      l2m as default
    };
    ",
      "[output] _virtual/module.layer2.dl2.js": "import m0$1 from "./module.layer2.dl3.js";
    import s from "./module.layer2.l.css2.js";
    const m0 = m0$1 + s;
    export {
      m0 as default
    };
    ",
      "[output] _virtual/module.layer2.dl3.js": "import m0$1 from "./module.layer2.dl4.js";
    import s from "./module.layer2.l.css3.js";
    const m0 = m0$1 + s;
    export {
      m0 as default
    };
    ",
      "[output] _virtual/module.layer2.dl4.js": "import m0$1 from "./module.layer2.dl2.js";
    import s from "./module.layer2.l.css4.js";
    const m0 = m0$1 + s;
    export {
      m0 as default
    };
    ",
      "[output] _virtual/module.layer2.l.css.js": "const s = "";
    export {
      s as default
    };
    ",
      "[output] _virtual/module.layer2.l.css2.js": "const s = "";
    export {
      s as default
    };
    ",
      "[output] _virtual/module.layer2.l.css3.js": "const s = "";
    export {
      s as default
    };
    ",
      "[output] _virtual/module.layer2.l.css4.js": "const s = "";
    export {
      s as default
    };
    ",
      "[output] _virtual/top.dl.js": "import l0g from "./global.layer0.l.css.js";
    import l1h from "./hoisted.layer1.dl.css.js";
    import l2m from "./module.layer2.dl.js";
    const css = l0g + l1h + l2m;
    export {
      css as default
    };
    ",
      "[output] tests/entry.html": "<!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Test Entry File</title>  <script type="module" crossorigin src="/_virtual/global.layer0.l.css.js"></script>
      <script type="module" crossorigin src="/_virtual/hoisted.layer1.dl.css.js"></script>
      <script type="module" crossorigin src="/_virtual/module.layer2.l.css4.js"></script>
      <script type="module" crossorigin src="/_virtual/module.layer2.dl4.js"></script>
      <script type="module" crossorigin src="/_virtual/module.layer2.l.css3.js"></script>
      <script type="module" crossorigin src="/_virtual/module.layer2.dl3.js"></script>
      <script type="module" crossorigin src="/_virtual/module.layer2.l.css2.js"></script>
      <script type="module" crossorigin src="/_virtual/module.layer2.dl2.js"></script>
      <script type="module" crossorigin src="/_virtual/module.layer2.l.css.js"></script>
      <script type="module" crossorigin src="/_virtual/module.layer2.dl.js"></script>
      <script type="module" crossorigin src="/_virtual/top.dl.js"></script>
      <script type="module" crossorigin src="/_virtual/c.js"></script>
      <script type="module" crossorigin src="/_virtual/b.js"></script>
      <script type="module" crossorigin src="/_virtual/a.js"></script>
      <script type="module" crossorigin src="/_virtual/entry.js"></script>
    </head>
      <body>
        Only for testing purposes.
      </body>
    </html>
    ",
    }
  `);
});

it("should handle circular dependencies with module mode", async ({
  expect,
}) => {
  const { files, warnings } = await runBuild(TEST_INPUT_UTILITIES, {
    allowCircularModules: true,
    noPreserveModules: true,
  });

  expect(
    files["[intermediate] tailwindcss/__x00__test/entry.js/module.layer2.l.css?inline"]
  ).not.toContain(".test-");
  expect(
    files["[intermediate] tailwindcss/__x00__test/a.js/module.layer2.l.css?inline"]
  ).toContain(".test-u-1");
  expect(
    files["[intermediate] tailwindcss/__x00__test/a.js/module.layer2.l.css?inline"]
  ).toContain(".test-u-9");
  expect(
    files["[intermediate] tailwindcss/__x00__test/b.js/module.layer2.l.css?inline"]
  ).toContain(".test-u-2");
  expect(
    files["[intermediate] tailwindcss/__x00__test/c.js/module.layer2.l.css?inline"]
  ).toContain(".test-u-3");

  expect(warnings).toHaveLength(0);

  expect(files).toMatchInlineSnapshot(`
    {
      "[intermediate] tailwindcss/__x00__test/a.js/module.layer2.dl.js": "import m0 from "\\u0000tailwindcss/__x00__test/b.js/module.layer2.dl.js";
    import s from "\\u0000tailwindcss/__x00__test/a.js/module.layer2.l.css?inline";
    const f = (...p) => p.includes(f) ? "" : m0(...p, f) + s;
    export default f;
    ",
      "[intermediate] tailwindcss/__x00__test/a.js/module.layer2.l.css?inline": "export default ".test-u-1 {\\n    --test-u: 1px\\n}\\n.test-u-9 {\\n    --test-u: 9px\\n}\\n"",
      "[intermediate] tailwindcss/__x00__test/b.js/module.layer2.dl.js": "import m0 from "\\u0000tailwindcss/__x00__test/c.js/module.layer2.dl.js";
    import s from "\\u0000tailwindcss/__x00__test/b.js/module.layer2.l.css?inline";
    const f = (...p) => p.includes(f) ? "" : m0(...p, f) + s;
    export default f;
    ",
      "[intermediate] tailwindcss/__x00__test/b.js/module.layer2.l.css?inline": "export default ".test-u-2 {\\n    --test-u: 2px\\n}\\n"",
      "[intermediate] tailwindcss/__x00__test/c.js/module.layer2.dl.js": "import m0 from "\\u0000tailwindcss/__x00__test/a.js/module.layer2.dl.js";
    import s from "\\u0000tailwindcss/__x00__test/c.js/module.layer2.l.css?inline";
    const f = (...p) => p.includes(f) ? "" : m0(...p, f) + s;
    export default f;
    ",
      "[intermediate] tailwindcss/__x00__test/c.js/module.layer2.l.css?inline": "export default ".test-u-3 {\\n    --test-u: 3px\\n}\\n"",
      "[intermediate] tailwindcss/__x00__test/entry.js/hoisted.layer1.dl.css?inline": "export default """,
      "[intermediate] tailwindcss/__x00__test/entry.js/module.layer2.dl.js": "import m0 from "\\u0000tailwindcss/__x00__test/a.js/module.layer2.dl.js";
    import s from "\\u0000tailwindcss/__x00__test/entry.js/module.layer2.l.css?inline";
    const f = (...p) => p.includes(f) ? "" : m0(...p, f) + s;
    export default f;
    ",
      "[intermediate] tailwindcss/__x00__test/entry.js/module.layer2.l.css?inline": "export default """,
      "[intermediate] tailwindcss/__x00__test/entry.js/top.dl.js": "import l0g from "\\u0000tailwindcss/global.layer0.l.css?inline";
    import l1h from "\\u0000tailwindcss/__x00__test/entry.js/hoisted.layer1.dl.css?inline";
    import l2m from "\\u0000tailwindcss/__x00__test/entry.js/module.layer2.dl.js";
    export default l0g + l1h + l2m();
    ",
      "[intermediate] tailwindcss/global.layer0.l.css?inline": "export default "/* TailwindCSS Base */\\n/* TailwindCSS Base Backdrop */\\n"",
      "[output] entry.js": "const l0g = "/* TailwindCSS Base */\\n/* TailwindCSS Base Backdrop */\\n";
    const l1h = "";
    const s$3 = ".test-u-3 {\\n    --test-u: 3px\\n}\\n";
    const f$3 = (...p) => p.includes(f$3) ? "" : f$1(...p, f$3) + s$3;
    const s$2 = ".test-u-2 {\\n    --test-u: 2px\\n}\\n";
    const f$2 = (...p) => p.includes(f$2) ? "" : f$3(...p, f$2) + s$2;
    const s$1 = ".test-u-1 {\\n    --test-u: 1px\\n}\\n.test-u-9 {\\n    --test-u: 9px\\n}\\n";
    const f$1 = (...p) => p.includes(f$1) ? "" : f$2(...p, f$1) + s$1;
    const s = "";
    const f = (...p) => p.includes(f) ? "" : f$1(...p, f) + s;
    const css = l0g + l1h + f();
    const c1 = () => "test-u-3 " + a2();
    const b1 = () => "test-u-2 " + c1();
    const a1 = () => "test-u-1 " + b1();
    const a2 = () => "test-u-9";
    console.log(a1(), css);
    ",
      "[output] tests/entry.html": "<!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Test Entry File</title>  <script type="module" crossorigin src="/entry.js"></script>
    </head>
      <body>
        Only for testing purposes.
      </body>
    </html>
    ",
    }
  `);

  // Run the code
  // This part must be executed after the snapshot test to avoid security issues

  const code = `
let __store;
const console = {
  log: (...args) => {
    __store = args;
  }
};

${files["[output] entry.js"]}

__store;
  `;

  const result = runInNewContext(code, undefined, {
    timeout: 1000,
  });

  expect(result).toHaveLength(2);
  expect(result[1]).toContain(".test-u-1");
  expect(result[1]).toContain(".test-u-2");
  expect(result[1]).toContain(".test-u-3");
  expect(result[1]).toContain(".test-u-9");
  expect(result[1]).not.toMatch(/\.test-u-1.+\.test-u-1/);
  expect(result[1]).not.toMatch(/\.test-u-2.+\.test-u-2/);
  expect(result[1]).not.toMatch(/\.test-u-3.+\.test-u-3/);
  expect(result[1]).not.toMatch(/\.test-u-9.+\.test-u-9/);

  expect(result).toMatchInlineSnapshot(`
    [
      "test-u-1 test-u-2 test-u-3 test-u-9",
      "/* TailwindCSS Base */
    /* TailwindCSS Base Backdrop */
    .test-u-3 {
        --test-u: 3px
    }
    .test-u-2 {
        --test-u: 2px
    }
    .test-u-1 {
        --test-u: 1px
    }
    .test-u-9 {
        --test-u: 9px
    }
    ",
    ]
  `);
});

it("should warn if allowCircularModules is false", async ({ expect }) => {
  const { warnings } = await runBuild(TEST_INPUT_UTILITIES, {
    allowCircularModules: false,
    layers: [{ mode: "module", code: "@tailwind utilities;" }],
  });

  expect(warnings).toHaveLength(1);
  expect(warnings[0]).toMatchInlineSnapshot(`
    {
      "id": " test/entry.js",
      "message": "Circular dependencies have been detected in the module graph. This can potentially lead to runtime errors. To handle circular dependencies and suppress this warning, set the \`allowCircularModules\` option to true in the plugin options.
    See https://github.com/SegaraRai/vite-plugin-modular-tailwindcss?tab=readme-ov-file#handling-circular-dependencies for more information.",
    }
  `);
});

it("should not warn if there is no module layer", async ({ expect }) => {
  const { warnings } = await runBuild(TEST_INPUT_UTILITIES, {
    allowCircularModules: false,
    layers: [{ mode: "hoisted", code: "@tailwind utilities;" }],
  });

  expect(warnings).toHaveLength(0);
});

it("should not warn if ignored", async ({ expect }) => {
  const { warnings } = await runBuild(TEST_INPUT_UTILITIES, {
    allowCircularModules: false,
    layers: [{ mode: "hoisted", code: "@tailwind utilities;" }],
    excludes: [/c\.js/],
  });

  expect(warnings).toHaveLength(0);
});
