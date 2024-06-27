import { it } from "vitest";
import { runBuild } from "../runner";

it("should handle circular dependencies with hoisted mode", async ({
  expect,
}) => {
  const result = await runBuild([
    [
      "entry.js",
      `import css from "#tailwindcss";
import { a1 } from "./a.js";
console.log(a1, css);
`,
    ],
    [
      "a.js",
      `import { b1 } from "./b.js";
export const a1 = "test-c-1 " + b1;
export const a2 = "test-c-9";
`,
    ],
    [
      "b.js",
      `import { c1 } from "./c.js";
export const b1 = "test-c-2 " + c1;
`,
    ],
    [
      "c.js",
      `import { a2 } from "./a.js";
export const c1 = "test-c-3 " + a2;
`,
    ],
  ]);

  expect(
    result[
      "[intermediate] tailwindcss:test/entry.js::hoisted.layer1.css?inline"
    ]
  ).toContain(".test-c-1");
  expect(
    result[
      "[intermediate] tailwindcss:test/entry.js::hoisted.layer1.css?inline"
    ]
  ).toContain(".test-c-2");
  expect(
    result[
      "[intermediate] tailwindcss:test/entry.js::hoisted.layer1.css?inline"
    ]
  ).toContain(".test-c-3");
  expect(
    result[
      "[intermediate] tailwindcss:test/entry.js::hoisted.layer1.css?inline"
    ]
  ).toContain(".test-c-9");

  expect(result).toMatchInlineSnapshot(`
    {
      "[intermediate] tailwindcss.global.layer0.css?inline": "export default "/* TailwindCSS Base */\\n/* TailwindCSS Base Backdrop */\\n"",
      "[intermediate] tailwindcss:test/a.js::module.layer2.css?inline": "export default """,
      "[intermediate] tailwindcss:test/a.js::module.layer2.js": "import m0 from "tailwindcss:\\u0000test/b.js::module.layer2.js";
    import s from "tailwindcss:\\u0000test/a.js::module.layer2.css?inline";
    export default m0 + s;
    ",
      "[intermediate] tailwindcss:test/b.js::module.layer2.css?inline": "export default """,
      "[intermediate] tailwindcss:test/b.js::module.layer2.js": "import m0 from "tailwindcss:\\u0000test/c.js::module.layer2.js";
    import s from "tailwindcss:\\u0000test/b.js::module.layer2.css?inline";
    export default m0 + s;
    ",
      "[intermediate] tailwindcss:test/c.js::module.layer2.css?inline": "export default """,
      "[intermediate] tailwindcss:test/c.js::module.layer2.js": "import m0 from "tailwindcss:\\u0000test/a.js::module.layer2.js";
    import s from "tailwindcss:\\u0000test/c.js::module.layer2.css?inline";
    export default m0 + s;
    ",
      "[intermediate] tailwindcss:test/entry.js::hoisted.layer1.css?inline": "export default ".test-c-1 {\\n    --test-c: 1px\\n}\\n.test-c-2 {\\n    --test-c: 2px\\n}\\n.test-c-3 {\\n    --test-c: 3px\\n}\\n.test-c-9 {\\n    --test-c: 9px\\n}\\n"",
      "[intermediate] tailwindcss:test/entry.js::index.inline.js": "import l0g from "tailwindcss.global.layer0.css?inline";
    import l1h from "tailwindcss:\\u0000test/entry.js::hoisted.layer1.css?inline";
    import l2m from "tailwindcss:\\u0000test/entry.js::module.layer2.js";
    export default l0g + l1h + l2m;
    ",
      "[intermediate] tailwindcss:test/entry.js::module.layer2.css?inline": "export default """,
      "[intermediate] tailwindcss:test/entry.js::module.layer2.js": "import m0 from "tailwindcss:\\u0000test/a.js::module.layer2.js";
    import s from "tailwindcss:\\u0000test/entry.js::module.layer2.css?inline";
    export default m0 + s;
    ",
      "[output] _virtual/a.js": "import { b1 } from "./b.js";
    const a1 = "test-c-1 " + b1;
    const a2 = "test-c-9";
    export {
      a1,
      a2
    };
    ",
      "[output] _virtual/a.js__module.layer2.css.js": "const s = "";
    export {
      s as default
    };
    ",
      "[output] _virtual/a.js__module.layer2.js": "import m0$1 from "./b.js__module.layer2.js";
    import s from "./a.js__module.layer2.css.js";
    const m0 = m0$1 + s;
    export {
      m0 as default
    };
    ",
      "[output] _virtual/b.js": "import { c1 } from "./c.js";
    const b1 = "test-c-2 " + c1;
    export {
      b1
    };
    ",
      "[output] _virtual/b.js__module.layer2.css.js": "const s = "";
    export {
      s as default
    };
    ",
      "[output] _virtual/b.js__module.layer2.js": "import m0$1 from "./c.js__module.layer2.js";
    import s from "./b.js__module.layer2.css.js";
    const m0 = m0$1 + s;
    export {
      m0 as default
    };
    ",
      "[output] _virtual/c.js": "import { a2 } from "./a.js";
    const c1 = "test-c-3 " + a2;
    export {
      c1
    };
    ",
      "[output] _virtual/c.js__module.layer2.css.js": "const s = "";
    export {
      s as default
    };
    ",
      "[output] _virtual/c.js__module.layer2.js": "import m0$1 from "./a.js__module.layer2.js";
    import s from "./c.js__module.layer2.css.js";
    const m0 = m0$1 + s;
    export {
      m0 as default
    };
    ",
      "[output] _virtual/entry.js": "import css from "./entry.js__index.inline.js";
    import { a1 } from "./a.js";
    console.log(a1, css);
    ",
      "[output] _virtual/entry.js__hoisted.layer1.css.js": "const l1h = ".test-c-1 {\\n    --test-c: 1px\\n}\\n.test-c-2 {\\n    --test-c: 2px\\n}\\n.test-c-3 {\\n    --test-c: 3px\\n}\\n.test-c-9 {\\n    --test-c: 9px\\n}\\n";
    export {
      l1h as default
    };
    ",
      "[output] _virtual/entry.js__index.inline.js": "import l0g from "./tailwindcss.global.layer0.css.js";
    import l1h from "./entry.js__hoisted.layer1.css.js";
    import l2m from "./entry.js__module.layer2.js";
    const css = l0g + l1h + l2m;
    export {
      css as default
    };
    ",
      "[output] _virtual/entry.js__module.layer2.css.js": "const s = "";
    export {
      s as default
    };
    ",
      "[output] _virtual/entry.js__module.layer2.js": "import m0 from "./a.js__module.layer2.js";
    import s from "./entry.js__module.layer2.css.js";
    const l2m = m0 + s;
    export {
      l2m as default
    };
    ",
      "[output] _virtual/tailwindcss.global.layer0.css.js": "const l0g = "/* TailwindCSS Base */\\n/* TailwindCSS Base Backdrop */\\n";
    export {
      l0g as default
    };
    ",
      "[output] tests/entry.html": "<!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Test Entry File</title>  <script type="module" crossorigin src="/_virtual/tailwindcss.global.layer0.css.js"></script>
      <script type="module" crossorigin src="/_virtual/entry.js__hoisted.layer1.css.js"></script>
      <script type="module" crossorigin src="/_virtual/c.js__module.layer2.css.js"></script>
      <script type="module" crossorigin src="/_virtual/c.js__module.layer2.js"></script>
      <script type="module" crossorigin src="/_virtual/b.js__module.layer2.css.js"></script>
      <script type="module" crossorigin src="/_virtual/b.js__module.layer2.js"></script>
      <script type="module" crossorigin src="/_virtual/a.js__module.layer2.css.js"></script>
      <script type="module" crossorigin src="/_virtual/a.js__module.layer2.js"></script>
      <script type="module" crossorigin src="/_virtual/entry.js__module.layer2.css.js"></script>
      <script type="module" crossorigin src="/_virtual/entry.js__module.layer2.js"></script>
      <script type="module" crossorigin src="/_virtual/entry.js__index.inline.js"></script>
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
  const result = await runBuild(
    [
      [
        "entry.js",
        `import css from "#tailwindcss";
import { a1 } from "./a.js";
console.log(a1, css);
`,
      ],
      [
        "a.js",
        `import { b1 } from "./b.js";
export const a1 = "test-u-1 " + b1;
export const a2 = "test-u-9";
`,
      ],
      [
        "b.js",
        `import { c1 } from "./c.js";
export const b1 = "test-u-2 " + c1;
`,
      ],
      [
        "c.js",
        `import { a2 } from "./a.js";
export const c1 = "test-u-3 " + a2;
`,
      ],
    ],
    {
      allowCircularModules: true,
      configure: (config) => {
        type OutputOptions = Exclude<
          Required<
            Required<Required<typeof config>["build"]>["rollupOptions"]
          >["output"],
          unknown[] | undefined
        >;
        (config.build!.rollupOptions!.output as OutputOptions).preserveModules =
          false;
        return config;
      },
    }
  );

  expect(
    result["[intermediate] tailwindcss:test/entry.js::module.layer2.css?inline"]
  ).not.toContain(".test-");
  expect(
    result["[intermediate] tailwindcss:test/a.js::module.layer2.css?inline"]
  ).toContain(".test-u-1");
  expect(
    result["[intermediate] tailwindcss:test/a.js::module.layer2.css?inline"]
  ).toContain(".test-u-9");
  expect(
    result["[intermediate] tailwindcss:test/b.js::module.layer2.css?inline"]
  ).toContain(".test-u-2");
  expect(
    result["[intermediate] tailwindcss:test/c.js::module.layer2.css?inline"]
  ).toContain(".test-u-3");

  expect(result).toMatchInlineSnapshot(`
    {
      "[intermediate] tailwindcss.global.layer0.css?inline": "export default "/* TailwindCSS Base */\\n/* TailwindCSS Base Backdrop */\\n"",
      "[intermediate] tailwindcss:test/a.js::module.layer2.css?inline": "export default ".test-u-1 {\\n    --test-u: 1px\\n}\\n.test-u-9 {\\n    --test-u: 9px\\n}\\n"",
      "[intermediate] tailwindcss:test/a.js::module.layer2.js": "import m0 from "tailwindcss:\\u0000test/b.js::module.layer2.js";
    import s from "tailwindcss:\\u0000test/a.js::module.layer2.css?inline";
    const f = (...p) => p.includes(f) ? "" : m0(...p, f) + s;
    export default f;
    ",
      "[intermediate] tailwindcss:test/b.js::module.layer2.css?inline": "export default ".test-u-2 {\\n    --test-u: 2px\\n}\\n"",
      "[intermediate] tailwindcss:test/b.js::module.layer2.js": "import m0 from "tailwindcss:\\u0000test/c.js::module.layer2.js";
    import s from "tailwindcss:\\u0000test/b.js::module.layer2.css?inline";
    const f = (...p) => p.includes(f) ? "" : m0(...p, f) + s;
    export default f;
    ",
      "[intermediate] tailwindcss:test/c.js::module.layer2.css?inline": "export default ".test-u-3 {\\n    --test-u: 3px\\n}\\n"",
      "[intermediate] tailwindcss:test/c.js::module.layer2.js": "import m0 from "tailwindcss:\\u0000test/a.js::module.layer2.js";
    import s from "tailwindcss:\\u0000test/c.js::module.layer2.css?inline";
    const f = (...p) => p.includes(f) ? "" : m0(...p, f) + s;
    export default f;
    ",
      "[intermediate] tailwindcss:test/entry.js::hoisted.layer1.css?inline": "export default """,
      "[intermediate] tailwindcss:test/entry.js::index.inline.js": "import l0g from "tailwindcss.global.layer0.css?inline";
    import l1h from "tailwindcss:\\u0000test/entry.js::hoisted.layer1.css?inline";
    import l2m from "tailwindcss:\\u0000test/entry.js::module.layer2.js";
    export default l0g + l1h + l2m();
    ",
      "[intermediate] tailwindcss:test/entry.js::module.layer2.css?inline": "export default """,
      "[intermediate] tailwindcss:test/entry.js::module.layer2.js": "import m0 from "tailwindcss:\\u0000test/a.js::module.layer2.js";
    import s from "tailwindcss:\\u0000test/entry.js::module.layer2.css?inline";
    const f = (...p) => p.includes(f) ? "" : m0(...p, f) + s;
    export default f;
    ",
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
    const c1 = "test-u-3 " + a2;
    const b1 = "test-u-2 " + c1;
    const a1 = "test-u-1 " + b1;
    const a2 = "test-u-9";
    console.log(a1, css);
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
});
