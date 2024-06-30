import { it } from "vitest";
import { runBuild } from "../runner";
import { getOutputCSS } from "../utils";

it("creates css for loaded modules", async ({ expect }) => {
  const { files } = await runBuild([
    [
      "entry.js",
      `import css from "#tailwindcss";
import a from "./a.js";
import b from "./b.js";
console.log(a, b, css);
`,
    ],
    [
      "a.js",
      `import x from "./x.js";
export default x + " test-b-1";
`,
    ],
    [
      "b.js",
      `import x from "./x.js";
export default x + " test-b-2";
`,
    ],
    ["x.js", `export default "test-b-9";\n`],
    ["notReferenced.js", `export default "test-b-3";\n`],
  ]);

  const code = files["[intermediate] tailwindcss.global.layer0.css?inline"];

  expect(code).toContain(".test-b-1");
  expect(code).toContain(".test-b-2");
  expect(code).toContain(".test-b-9");
  expect(code).not.toContain(".test-b-3");

  expect(files).toMatchInlineSnapshot(`
    {
      "[intermediate] tailwindcss.global.layer0.css?inline": "export default ".test-b-1 {\\n    --test-b: 1px\\n}\\n.test-b-2 {\\n    --test-b: 2px\\n}\\n.test-b-9 {\\n    --test-b: 9px\\n}\\n/* TailwindCSS Base */\\n/* TailwindCSS Base Backdrop */\\n"",
      "[intermediate] tailwindcss:test/a.js::module.layer2.css?inline": "export default """,
      "[intermediate] tailwindcss:test/a.js::module.layer2.js": "import m0 from "\\u0000tailwindcss:\\u0000test/x.js::module.layer2.js";
    import s from "\\u0000tailwindcss:\\u0000test/a.js::module.layer2.css?inline";
    export default m0 + s;
    ",
      "[intermediate] tailwindcss:test/b.js::module.layer2.css?inline": "export default """,
      "[intermediate] tailwindcss:test/b.js::module.layer2.js": "import m0 from "\\u0000tailwindcss:\\u0000test/x.js::module.layer2.js";
    import s from "\\u0000tailwindcss:\\u0000test/b.js::module.layer2.css?inline";
    export default m0 + s;
    ",
      "[intermediate] tailwindcss:test/entry.js::hoisted.layer1.css?inline": "export default """,
      "[intermediate] tailwindcss:test/entry.js::index.inline.js": "import l0g from "\\u0000tailwindcss.global.layer0.css?inline";
    import l1h from "\\u0000tailwindcss:\\u0000test/entry.js::hoisted.layer1.css?inline";
    import l2m from "\\u0000tailwindcss:\\u0000test/entry.js::module.layer2.js";
    export default l0g + l1h + l2m;
    ",
      "[intermediate] tailwindcss:test/entry.js::module.layer2.css?inline": "export default """,
      "[intermediate] tailwindcss:test/entry.js::module.layer2.js": "import m0 from "\\u0000tailwindcss:\\u0000test/a.js::module.layer2.js";
    import m1 from "\\u0000tailwindcss:\\u0000test/b.js::module.layer2.js";
    import s from "\\u0000tailwindcss:\\u0000test/entry.js::module.layer2.css?inline";
    export default m0 + m1 + s;
    ",
      "[intermediate] tailwindcss:test/x.js::module.layer2.css?inline": "export default """,
      "[intermediate] tailwindcss:test/x.js::module.layer2.js": "import s from "\\u0000tailwindcss:\\u0000test/x.js::module.layer2.css?inline";
    export default s;
    ",
      "[output] _virtual/_tailwindcss.global.layer0.css.js": "const l0g = ".test-b-1 {\\n    --test-b: 1px\\n}\\n.test-b-2 {\\n    --test-b: 2px\\n}\\n.test-b-9 {\\n    --test-b: 9px\\n}\\n/* TailwindCSS Base */\\n/* TailwindCSS Base Backdrop */\\n";
    export {
      l0g as default
    };
    ",
      "[output] _virtual/a.js": "import x from "./x.js";
    const a = x + " test-b-1";
    export {
      a as default
    };
    ",
      "[output] _virtual/a.js__module.layer2.css.js": "const s = "";
    export {
      s as default
    };
    ",
      "[output] _virtual/a.js__module.layer2.js": "import s from "./x.js__module.layer2.css.js";
    import s$1 from "./a.js__module.layer2.css.js";
    const m0 = s + s$1;
    export {
      m0 as default
    };
    ",
      "[output] _virtual/b.js": "import x from "./x.js";
    const b = x + " test-b-2";
    export {
      b as default
    };
    ",
      "[output] _virtual/b.js__module.layer2.css.js": "const s = "";
    export {
      s as default
    };
    ",
      "[output] _virtual/b.js__module.layer2.js": "import s from "./x.js__module.layer2.css.js";
    import s$1 from "./b.js__module.layer2.css.js";
    const m1 = s + s$1;
    export {
      m1 as default
    };
    ",
      "[output] _virtual/entry.js": "import css from "./entry.js__index.inline.js";
    import a from "./a.js";
    import b from "./b.js";
    console.log(a, b, css);
    ",
      "[output] _virtual/entry.js__hoisted.layer1.css.js": "const l1h = "";
    export {
      l1h as default
    };
    ",
      "[output] _virtual/entry.js__index.inline.js": "import l0g from "./_tailwindcss.global.layer0.css.js";
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
    import m1 from "./b.js__module.layer2.js";
    import s from "./entry.js__module.layer2.css.js";
    const l2m = m0 + m1 + s;
    export {
      l2m as default
    };
    ",
      "[output] _virtual/x.js": "const x = "test-b-9";
    export {
      x as default
    };
    ",
      "[output] _virtual/x.js__module.layer2.css.js": "const s = "";
    export {
      s as default
    };
    ",
      "[output] _virtual/x.js__module.layer2.js": "import s from "./x.js__module.layer2.css.js";
    export {
      s as default
    };
    ",
      "[output] tests/entry.html": "<!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Test Entry File</title>  <script type="module" crossorigin src="/_virtual/_tailwindcss.global.layer0.css.js"></script>
      <script type="module" crossorigin src="/_virtual/entry.js__hoisted.layer1.css.js"></script>
      <script type="module" crossorigin src="/_virtual/x.js__module.layer2.css.js"></script>
      <script type="module" crossorigin src="/_virtual/a.js__module.layer2.css.js"></script>
      <script type="module" crossorigin src="/_virtual/a.js__module.layer2.js"></script>
      <script type="module" crossorigin src="/_virtual/b.js__module.layer2.css.js"></script>
      <script type="module" crossorigin src="/_virtual/b.js__module.layer2.js"></script>
      <script type="module" crossorigin src="/_virtual/entry.js__module.layer2.css.js"></script>
      <script type="module" crossorigin src="/_virtual/entry.js__module.layer2.js"></script>
      <script type="module" crossorigin src="/_virtual/entry.js__index.inline.js"></script>
      <script type="module" crossorigin src="/_virtual/x.js"></script>
      <script type="module" crossorigin src="/_virtual/a.js"></script>
      <script type="module" crossorigin src="/_virtual/b.js"></script>
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

it("creates css for loaded modules without entry js", async ({ expect }) => {
  const { files } = await runBuild([], {
    head: '<script type="module" src="?tailwindcss/inject"></script>',
    body: '<div class="test-b-5"></div>',
  });

  const code = getOutputCSS(files);
  expect(code).toContain(".test-b-5");
  expect(code).not.toContain(".test-b-1");

  expect(files).toMatchInlineSnapshot(`
    {
      "[intermediate] tailwindcss.global.layer0.css": "",
      "[intermediate] tailwindcss:<projectRoot>/tests/entry.html::hoisted.layer1.css": "",
      "[intermediate] tailwindcss:<projectRoot>/tests/entry.html::index.inject.js": "import "\\u0000tailwindcss.global.layer0.css";
    import "\\u0000tailwindcss:<projectRoot>/tests/entry.html::hoisted.layer1.css";
    import "\\u0000tailwindcss:<projectRoot>/tests/entry.html::module.layer2.inject.js";
    ",
      "[intermediate] tailwindcss:<projectRoot>/tests/entry.html::module.layer2.css": "",
      "[intermediate] tailwindcss:<projectRoot>/tests/entry.html::module.layer2.inject.js": "import "\\u0000tailwindcss:<projectRoot>/tests/entry.html::module.layer2.css";
    ",
      "[output] _virtual/_tailwindcss.global.layer0.css": ".test-b-5 {
        --test-b: 5px
    }
    /* TailwindCSS Base */
    /* TailwindCSS Base Backdrop */
    ",
      "[output] _virtual/entry.html__hoisted.layer1.css.js": "
    ",
      "[output] _virtual/entry.html__index.inject.js": "/* empty css                               */
    import "./entry.html__hoisted.layer1.css.js";
    import "./entry.html__module.layer2.css.js";
    ",
      "[output] _virtual/entry.html__module.layer2.css.js": "
    ",
      "[output] tests/entry.html": "<!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Test Entry File</title>  <script type="module" crossorigin src="/_virtual/entry.html__hoisted.layer1.css.js"></script>
      <script type="module" crossorigin src="/_virtual/entry.html__module.layer2.css.js"></script>
      <script type="module" crossorigin src="/_virtual/entry.html__index.inject.js"></script>
      <link rel="stylesheet" crossorigin href="/_virtual/_tailwindcss.global.layer0.css">
    </head>
      <body>
        Only for testing purposes.
      <div class="test-b-5"></div></body>
    </html>
    ",
    }
  `);
});

it("creates css for loaded modules (delayed)", async ({ expect }) => {
  const { files } = await runBuild([
    [
      "entry.js",
      `import css from "#tailwindcss";
import a from "./a-l800.js";
import b from "./b-l1800.js";
import p from "./p-l5000.js";
console.log(a, b, p, css);
`,
    ],
    [
      "a-l800.js",
      `import x from "./x-l3000.js";
export default x + " test-b-1";
`,
    ],
    [
      "b-l1800.js",
      `import x from "./x-l3000.js";
export default x + " test-b-2";
`,
    ],
    ["x-l3000.js", `export default "test-b-9";\n`],
    [
      "p-l5000.js",
      `
import q from "./q-l8000.js";
export default "test-b-5";
`,
    ],
    ["q-l8000.js", `export default "test-b-6";\n`],
    ["notReferenced.js", `export default "test-b-3";\n`],
  ]);

  const code = files["[intermediate] tailwindcss.global.layer0.css?inline"];

  expect(code).toContain(".test-b-1");
  expect(code).toContain(".test-b-2");
  expect(code).toContain(".test-b-5");
  expect(code).toContain(".test-b-6");
  expect(code).toContain(".test-b-9");
  expect(code).not.toContain(".test-b-3");

  expect(files).toMatchInlineSnapshot(`
    {
      "[intermediate] tailwindcss.global.layer0.css?inline": "export default ".test-b-1 {\\n    --test-b: 1px\\n}\\n.test-b-2 {\\n    --test-b: 2px\\n}\\n.test-b-5 {\\n    --test-b: 5px\\n}\\n.test-b-6 {\\n    --test-b: 6px\\n}\\n.test-b-9 {\\n    --test-b: 9px\\n}\\n/* TailwindCSS Base */\\n/* TailwindCSS Base Backdrop */\\n"",
      "[intermediate] tailwindcss:test/a-l800.js::module.layer2.css?inline": "export default """,
      "[intermediate] tailwindcss:test/a-l800.js::module.layer2.js": "import m0 from "\\u0000tailwindcss:\\u0000test/x-l3000.js::module.layer2.js";
    import s from "\\u0000tailwindcss:\\u0000test/a-l800.js::module.layer2.css?inline";
    export default m0 + s;
    ",
      "[intermediate] tailwindcss:test/b-l1800.js::module.layer2.css?inline": "export default """,
      "[intermediate] tailwindcss:test/b-l1800.js::module.layer2.js": "import m0 from "\\u0000tailwindcss:\\u0000test/x-l3000.js::module.layer2.js";
    import s from "\\u0000tailwindcss:\\u0000test/b-l1800.js::module.layer2.css?inline";
    export default m0 + s;
    ",
      "[intermediate] tailwindcss:test/entry.js::hoisted.layer1.css?inline": "export default """,
      "[intermediate] tailwindcss:test/entry.js::index.inline.js": "import l0g from "\\u0000tailwindcss.global.layer0.css?inline";
    import l1h from "\\u0000tailwindcss:\\u0000test/entry.js::hoisted.layer1.css?inline";
    import l2m from "\\u0000tailwindcss:\\u0000test/entry.js::module.layer2.js";
    export default l0g + l1h + l2m;
    ",
      "[intermediate] tailwindcss:test/entry.js::module.layer2.css?inline": "export default """,
      "[intermediate] tailwindcss:test/entry.js::module.layer2.js": "import m0 from "\\u0000tailwindcss:\\u0000test/a-l800.js::module.layer2.js";
    import m1 from "\\u0000tailwindcss:\\u0000test/b-l1800.js::module.layer2.js";
    import m2 from "\\u0000tailwindcss:\\u0000test/p-l5000.js::module.layer2.js";
    import s from "\\u0000tailwindcss:\\u0000test/entry.js::module.layer2.css?inline";
    export default m0 + m1 + m2 + s;
    ",
      "[intermediate] tailwindcss:test/p-l5000.js::module.layer2.css?inline": "export default """,
      "[intermediate] tailwindcss:test/p-l5000.js::module.layer2.js": "import m0 from "\\u0000tailwindcss:\\u0000test/q-l8000.js::module.layer2.js";
    import s from "\\u0000tailwindcss:\\u0000test/p-l5000.js::module.layer2.css?inline";
    export default m0 + s;
    ",
      "[intermediate] tailwindcss:test/q-l8000.js::module.layer2.css?inline": "export default """,
      "[intermediate] tailwindcss:test/q-l8000.js::module.layer2.js": "import s from "\\u0000tailwindcss:\\u0000test/q-l8000.js::module.layer2.css?inline";
    export default s;
    ",
      "[intermediate] tailwindcss:test/x-l3000.js::module.layer2.css?inline": "export default """,
      "[intermediate] tailwindcss:test/x-l3000.js::module.layer2.js": "import s from "\\u0000tailwindcss:\\u0000test/x-l3000.js::module.layer2.css?inline";
    export default s;
    ",
      "[output] _virtual/_tailwindcss.global.layer0.css.js": "const l0g = ".test-b-1 {\\n    --test-b: 1px\\n}\\n.test-b-2 {\\n    --test-b: 2px\\n}\\n.test-b-5 {\\n    --test-b: 5px\\n}\\n.test-b-6 {\\n    --test-b: 6px\\n}\\n.test-b-9 {\\n    --test-b: 9px\\n}\\n/* TailwindCSS Base */\\n/* TailwindCSS Base Backdrop */\\n";
    export {
      l0g as default
    };
    ",
      "[output] _virtual/a-l800.js": "import x from "./x-l3000.js";
    const a = x + " test-b-1";
    export {
      a as default
    };
    ",
      "[output] _virtual/a-l800.js__module.layer2.css.js": "const s = "";
    export {
      s as default
    };
    ",
      "[output] _virtual/a-l800.js__module.layer2.js": "import s from "./x-l3000.js__module.layer2.css.js";
    import s$1 from "./a-l800.js__module.layer2.css.js";
    const m0 = s + s$1;
    export {
      m0 as default
    };
    ",
      "[output] _virtual/b-l1800.js": "import x from "./x-l3000.js";
    const b = x + " test-b-2";
    export {
      b as default
    };
    ",
      "[output] _virtual/b-l1800.js__module.layer2.css.js": "const s = "";
    export {
      s as default
    };
    ",
      "[output] _virtual/b-l1800.js__module.layer2.js": "import s from "./x-l3000.js__module.layer2.css.js";
    import s$1 from "./b-l1800.js__module.layer2.css.js";
    const m1 = s + s$1;
    export {
      m1 as default
    };
    ",
      "[output] _virtual/entry.js": "import css from "./entry.js__index.inline.js";
    import a from "./a-l800.js";
    import b from "./b-l1800.js";
    import p from "./p-l5000.js";
    console.log(a, b, p, css);
    ",
      "[output] _virtual/entry.js__hoisted.layer1.css.js": "const l1h = "";
    export {
      l1h as default
    };
    ",
      "[output] _virtual/entry.js__index.inline.js": "import l0g from "./_tailwindcss.global.layer0.css.js";
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
      "[output] _virtual/entry.js__module.layer2.js": "import m0 from "./a-l800.js__module.layer2.js";
    import m1 from "./b-l1800.js__module.layer2.js";
    import m2 from "./p-l5000.js__module.layer2.js";
    import s from "./entry.js__module.layer2.css.js";
    const l2m = m0 + m1 + m2 + s;
    export {
      l2m as default
    };
    ",
      "[output] _virtual/p-l5000.js": "const p = "test-b-5";
    export {
      p as default
    };
    ",
      "[output] _virtual/p-l5000.js__module.layer2.css.js": "const s = "";
    export {
      s as default
    };
    ",
      "[output] _virtual/p-l5000.js__module.layer2.js": "import s from "./q-l8000.js__module.layer2.css.js";
    import s$1 from "./p-l5000.js__module.layer2.css.js";
    const m2 = s + s$1;
    export {
      m2 as default
    };
    ",
      "[output] _virtual/q-l8000.js__module.layer2.css.js": "const s = "";
    export {
      s as default
    };
    ",
      "[output] _virtual/q-l8000.js__module.layer2.js": "import s from "./q-l8000.js__module.layer2.css.js";
    export {
      s as default
    };
    ",
      "[output] _virtual/x-l3000.js": "const x = "test-b-9";
    export {
      x as default
    };
    ",
      "[output] _virtual/x-l3000.js__module.layer2.css.js": "const s = "";
    export {
      s as default
    };
    ",
      "[output] _virtual/x-l3000.js__module.layer2.js": "import s from "./x-l3000.js__module.layer2.css.js";
    export {
      s as default
    };
    ",
      "[output] tests/entry.html": "<!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Test Entry File</title>  <script type="module" crossorigin src="/_virtual/_tailwindcss.global.layer0.css.js"></script>
      <script type="module" crossorigin src="/_virtual/entry.js__hoisted.layer1.css.js"></script>
      <script type="module" crossorigin src="/_virtual/x-l3000.js__module.layer2.css.js"></script>
      <script type="module" crossorigin src="/_virtual/a-l800.js__module.layer2.css.js"></script>
      <script type="module" crossorigin src="/_virtual/a-l800.js__module.layer2.js"></script>
      <script type="module" crossorigin src="/_virtual/b-l1800.js__module.layer2.css.js"></script>
      <script type="module" crossorigin src="/_virtual/b-l1800.js__module.layer2.js"></script>
      <script type="module" crossorigin src="/_virtual/q-l8000.js__module.layer2.css.js"></script>
      <script type="module" crossorigin src="/_virtual/p-l5000.js__module.layer2.css.js"></script>
      <script type="module" crossorigin src="/_virtual/p-l5000.js__module.layer2.js"></script>
      <script type="module" crossorigin src="/_virtual/entry.js__module.layer2.css.js"></script>
      <script type="module" crossorigin src="/_virtual/entry.js__module.layer2.js"></script>
      <script type="module" crossorigin src="/_virtual/entry.js__index.inline.js"></script>
      <script type="module" crossorigin src="/_virtual/x-l3000.js"></script>
      <script type="module" crossorigin src="/_virtual/a-l800.js"></script>
      <script type="module" crossorigin src="/_virtual/b-l1800.js"></script>
      <script type="module" crossorigin src="/_virtual/p-l5000.js"></script>
      <script type="module" crossorigin src="/_virtual/entry.js"></script>
    </head>
      <body>
        Only for testing purposes.
      </body>
    </html>
    ",
    }
  `);
}, 20_000);
