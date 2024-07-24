import { it } from "vitest";
import { runBuild } from "../runner";
import { getAllCode, getOutputCSS } from "../utils";

it("digs into all dependencies (inline)", async ({ expect }) => {
  const { files } = await runBuild([
    [
      "entry.js",
      `import css from "#tailwindcss";
import a from "./a.js";
const X = "test-u-1 test-c-1 test-b-1";
console.log(X, a, css);
`,
    ],
    [
      "a.js",
      `import "./b.js"; // even side-effect only import affects the output
export default "test-u-2 test-c-2 test-b-2";
`,
    ],
    ["b.js", `console.log("test-u-3 test-c-3 test-b-3");\n`],
    ["notReferenced.js", `export default "test-u-4 test-c-4 test-b-4";\n`],
  ]);

  const code = getAllCode(files);

  expect(code).toContain(".test-u-1");
  expect(code).toContain(".test-c-1");
  expect(code).toContain(".test-b-1");
  expect(code).toContain(".test-u-2");
  expect(code).toContain(".test-c-2");
  expect(code).toContain(".test-b-2");
  expect(code).toContain(".test-u-3");
  expect(code).toContain(".test-c-3");
  expect(code).toContain(".test-b-3");
  expect(code).not.toContain(".test-u-4");
  expect(code).not.toContain(".test-c-4");
  expect(code).not.toContain(".test-b-4");

  expect(files).toMatchInlineSnapshot(`
    {
      "[intermediate] tailwindcss/__x00__test/a.js/module.layer2.dl.js": "import m0 from "\\u0000tailwindcss/__x00__test/b.js/module.layer2.dl.js";
    import s from "\\u0000tailwindcss/__x00__test/a.js/module.layer2.l.css?inline";
    export default m0 + s;
    ",
      "[intermediate] tailwindcss/__x00__test/a.js/module.layer2.l.css?inline": "export default ".test-u-2 {\\n    --test-u: 2px\\n}\\n"",
      "[intermediate] tailwindcss/__x00__test/b.js/module.layer2.dl.js": "import s from "\\u0000tailwindcss/__x00__test/b.js/module.layer2.l.css?inline";
    export default s;
    ",
      "[intermediate] tailwindcss/__x00__test/b.js/module.layer2.l.css?inline": "export default ".test-u-3 {\\n    --test-u: 3px\\n}\\n"",
      "[intermediate] tailwindcss/__x00__test/entry.js/entry.dl.js": "import l0g from "\\u0000tailwindcss/global.layer0.l.css?inline";
    import l1h from "\\u0000tailwindcss/__x00__test/entry.js/hoisted.layer1.dl.css?inline";
    import l2m from "\\u0000tailwindcss/__x00__test/entry.js/module.layer2.dl.js";
    export default l0g + l1h + l2m;
    ",
      "[intermediate] tailwindcss/__x00__test/entry.js/hoisted.layer1.dl.css?inline": "export default ".test-c-1 {\\n    --test-c: 1px\\n}\\n.test-c-2 {\\n    --test-c: 2px\\n}\\n.test-c-3 {\\n    --test-c: 3px\\n}\\n"",
      "[intermediate] tailwindcss/__x00__test/entry.js/module.layer2.dl.js": "import m0 from "\\u0000tailwindcss/__x00__test/a.js/module.layer2.dl.js";
    import s from "\\u0000tailwindcss/__x00__test/entry.js/module.layer2.l.css?inline";
    export default m0 + s;
    ",
      "[intermediate] tailwindcss/__x00__test/entry.js/module.layer2.l.css?inline": "export default ".test-u-1 {\\n    --test-u: 1px\\n}\\n"",
      "[intermediate] tailwindcss/global.layer0.l.css?inline": "export default ".test-b-1 {\\n    --test-b: 1px\\n}\\n.test-b-2 {\\n    --test-b: 2px\\n}\\n.test-b-3 {\\n    --test-b: 3px\\n}\\n/* TailwindCSS Base */\\n/* TailwindCSS Base Backdrop */\\n"",
      "[output] _virtual/a.js": "import "./b.js";
    const a = "test-u-2 test-c-2 test-b-2";
    export {
      a as default
    };
    ",
      "[output] _virtual/b.js": "console.log("test-u-3 test-c-3 test-b-3");
    ",
      "[output] _virtual/entry.dl.js": "import l0g from "./global.layer0.l.css.js";
    import l1h from "./hoisted.layer1.dl.css.js";
    import l2m from "./module.layer2.dl.js";
    const css = l0g + l1h + l2m;
    export {
      css as default
    };
    ",
      "[output] _virtual/entry.js": "import css from "./entry.dl.js";
    import a from "./a.js";
    const X = "test-u-1 test-c-1 test-b-1";
    console.log(X, a, css);
    ",
      "[output] _virtual/global.layer0.l.css.js": "const l0g = ".test-b-1 {\\n    --test-b: 1px\\n}\\n.test-b-2 {\\n    --test-b: 2px\\n}\\n.test-b-3 {\\n    --test-b: 3px\\n}\\n/* TailwindCSS Base */\\n/* TailwindCSS Base Backdrop */\\n";
    export {
      l0g as default
    };
    ",
      "[output] _virtual/hoisted.layer1.dl.css.js": "const l1h = ".test-c-1 {\\n    --test-c: 1px\\n}\\n.test-c-2 {\\n    --test-c: 2px\\n}\\n.test-c-3 {\\n    --test-c: 3px\\n}\\n";
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
      "[output] _virtual/module.layer2.dl2.js": "import s from "./module.layer2.l.css2.js";
    import s$1 from "./module.layer2.l.css3.js";
    const m0 = s + s$1;
    export {
      m0 as default
    };
    ",
      "[output] _virtual/module.layer2.dl3.js": "import s from "./module.layer2.l.css2.js";
    export {
      s as default
    };
    ",
      "[output] _virtual/module.layer2.l.css.js": "const s = ".test-u-1 {\\n    --test-u: 1px\\n}\\n";
    export {
      s as default
    };
    ",
      "[output] _virtual/module.layer2.l.css2.js": "const s = ".test-u-3 {\\n    --test-u: 3px\\n}\\n";
    export {
      s as default
    };
    ",
      "[output] _virtual/module.layer2.l.css3.js": "const s = ".test-u-2 {\\n    --test-u: 2px\\n}\\n";
    export {
      s as default
    };
    ",
      "[output] tests/entry.html": "<!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Test Entry File</title>  <script type="module" crossorigin src="/_virtual/global.layer0.l.css.js"></script>
      <script type="module" crossorigin src="/_virtual/hoisted.layer1.dl.css.js"></script>
      <script type="module" crossorigin src="/_virtual/module.layer2.l.css2.js"></script>
      <script type="module" crossorigin src="/_virtual/module.layer2.l.css3.js"></script>
      <script type="module" crossorigin src="/_virtual/module.layer2.dl2.js"></script>
      <script type="module" crossorigin src="/_virtual/module.layer2.l.css.js"></script>
      <script type="module" crossorigin src="/_virtual/module.layer2.dl.js"></script>
      <script type="module" crossorigin src="/_virtual/entry.dl.js"></script>
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

it("digs into all dependencies (inject)", async ({ expect }) => {
  const { files } = await runBuild([
    [
      "entry.js",
      `import "#tailwindcss/inject";
import a from "./a.js";
const X = "test-u-1 test-c-1 test-b-1 test-b-9";
console.log(X, a, css);
`,
    ],
    [
      "a.js",
      `import "./b.js"; // even side-effect only import affects the output
export default "test-u-2 test-c-2 test-b-2";
`,
    ],
    ["b.js", `console.log("test-u-3 test-c-3 test-b-3");\n`],
    ["notReferenced.js", `export default "test-u-4 test-c-4 test-b-4";\n`],
  ]);

  const code = getOutputCSS(files);

  expect(code).toContain(".test-u-1");
  expect(code).toContain(".test-c-1");
  expect(code).toContain(".test-b-1");
  expect(code).toContain(".test-u-2");
  expect(code).toContain(".test-c-2");
  expect(code).toContain(".test-b-2");
  expect(code).toContain(".test-u-3");
  expect(code).toContain(".test-c-3");
  expect(code).toContain(".test-b-3");
  expect(code).not.toContain(".test-u-4");
  expect(code).not.toContain(".test-c-4");
  expect(code).not.toContain(".test-b-4");

  expect(files).toMatchInlineSnapshot(`
    {
      "[intermediate] tailwindcss/__x00__test/a.js/module.layer2.dj.js": "import "\\u0000tailwindcss/__x00__test/b.js/module.layer2.dj.js";
    import "\\u0000tailwindcss/__x00__test/a.js/module.layer2.j.css";
    ",
      "[intermediate] tailwindcss/__x00__test/a.js/module.layer2.j.css": "",
      "[intermediate] tailwindcss/__x00__test/b.js/module.layer2.dj.js": "import "\\u0000tailwindcss/__x00__test/b.js/module.layer2.j.css";
    ",
      "[intermediate] tailwindcss/__x00__test/b.js/module.layer2.j.css": "",
      "[intermediate] tailwindcss/__x00__test/entry.js/entry.dj.js": "import "\\u0000tailwindcss/global.layer0.j.css";
    import "\\u0000tailwindcss/__x00__test/entry.js/hoisted.layer1.dj.css";
    import "\\u0000tailwindcss/__x00__test/entry.js/module.layer2.dj.js";
    ",
      "[intermediate] tailwindcss/__x00__test/entry.js/hoisted.layer1.dj.css": "",
      "[intermediate] tailwindcss/__x00__test/entry.js/module.layer2.dj.js": "import "\\u0000tailwindcss/__x00__test/a.js/module.layer2.dj.js";
    import "\\u0000tailwindcss/__x00__test/entry.js/module.layer2.j.css";
    ",
      "[intermediate] tailwindcss/__x00__test/entry.js/module.layer2.j.css": "",
      "[intermediate] tailwindcss/global.layer0.j.css": "",
      "[output] _virtual/a.js": "import "./b.js";
    const a = "test-u-2 test-c-2 test-b-2";
    export {
      a as default
    };
    ",
      "[output] _virtual/b.js": "console.log("test-u-3 test-c-3 test-b-3");
    ",
      "[output] _virtual/entry.js": "/* empty css                    */
    /* empty css                      */
    /* empty css                    */
    /* empty css                     */
    /* empty css                     */
    import a from "./a.js";
    const X = "test-u-1 test-c-1 test-b-1 test-b-9";
    console.log(X, a, css);
    ",
      "[output] _virtual/global.layer0.j.css": ".test-b-1 {
        --test-b: 1px
    }
    .test-b-2 {
        --test-b: 2px
    }
    .test-b-3 {
        --test-b: 3px
    }
    .test-b-9 {
        --test-b: 9px
    }
    /* TailwindCSS Base */
    /* TailwindCSS Base Backdrop */
    ",
      "[output] _virtual/hoisted.layer1.dj.css": ".test-c-1 {
        --test-c: 1px
    }
    .test-c-2 {
        --test-c: 2px
    }
    .test-c-3 {
        --test-c: 3px
    }
    ",
      "[output] _virtual/module.layer2.j.css": ".test-u-1 {
        --test-u: 1px
    }
    ",
      "[output] _virtual/module.layer2.j2.css": ".test-u-2 {
        --test-u: 2px
    }
    ",
      "[output] _virtual/module.layer2.j3.css": ".test-u-3 {
        --test-u: 3px
    }
    ",
      "[output] tests/entry.html": "<!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Test Entry File</title>  <script type="module" crossorigin src="/_virtual/b.js"></script>
      <script type="module" crossorigin src="/_virtual/a.js"></script>
      <script type="module" crossorigin src="/_virtual/entry.js"></script>
      <link rel="stylesheet" crossorigin href="/_virtual/global.layer0.j.css">
      <link rel="stylesheet" crossorigin href="/_virtual/hoisted.layer1.dj.css">
      <link rel="stylesheet" crossorigin href="/_virtual/module.layer2.j3.css">
      <link rel="stylesheet" crossorigin href="/_virtual/module.layer2.j2.css">
      <link rel="stylesheet" crossorigin href="/_virtual/module.layer2.j.css">
    </head>
      <body>
        Only for testing purposes.
      </body>
    </html>
    ",
    }
  `);
});
