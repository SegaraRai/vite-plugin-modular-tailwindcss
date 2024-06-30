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
      "[intermediate] tailwindcss.global.layer0.css?inline": "export default ".test-b-1 {\\n    --test-b: 1px\\n}\\n.test-b-2 {\\n    --test-b: 2px\\n}\\n.test-b-3 {\\n    --test-b: 3px\\n}\\n/* TailwindCSS Base */\\n/* TailwindCSS Base Backdrop */\\n"",
      "[intermediate] tailwindcss:test/a.js::module.layer2.css?inline": "export default ".test-u-2 {\\n    --test-u: 2px\\n}\\n"",
      "[intermediate] tailwindcss:test/a.js::module.layer2.js": "import m0 from "\\u0000tailwindcss:\\u0000test/b.js::module.layer2.js";
    import s from "\\u0000tailwindcss:\\u0000test/a.js::module.layer2.css?inline";
    export default m0 + s;
    ",
      "[intermediate] tailwindcss:test/b.js::module.layer2.css?inline": "export default ".test-u-3 {\\n    --test-u: 3px\\n}\\n"",
      "[intermediate] tailwindcss:test/b.js::module.layer2.js": "import s from "\\u0000tailwindcss:\\u0000test/b.js::module.layer2.css?inline";
    export default s;
    ",
      "[intermediate] tailwindcss:test/entry.js::hoisted.layer1.css?inline": "export default ".test-c-1 {\\n    --test-c: 1px\\n}\\n.test-c-2 {\\n    --test-c: 2px\\n}\\n.test-c-3 {\\n    --test-c: 3px\\n}\\n"",
      "[intermediate] tailwindcss:test/entry.js::index.inline.js": "import l0g from "\\u0000tailwindcss.global.layer0.css?inline";
    import l1h from "\\u0000tailwindcss:\\u0000test/entry.js::hoisted.layer1.css?inline";
    import l2m from "\\u0000tailwindcss:\\u0000test/entry.js::module.layer2.js";
    export default l0g + l1h + l2m;
    ",
      "[intermediate] tailwindcss:test/entry.js::module.layer2.css?inline": "export default ".test-u-1 {\\n    --test-u: 1px\\n}\\n"",
      "[intermediate] tailwindcss:test/entry.js::module.layer2.js": "import m0 from "\\u0000tailwindcss:\\u0000test/a.js::module.layer2.js";
    import s from "\\u0000tailwindcss:\\u0000test/entry.js::module.layer2.css?inline";
    export default m0 + s;
    ",
      "[output] _virtual/_tailwindcss.global.layer0.css.js": "const l0g = ".test-b-1 {\\n    --test-b: 1px\\n}\\n.test-b-2 {\\n    --test-b: 2px\\n}\\n.test-b-3 {\\n    --test-b: 3px\\n}\\n/* TailwindCSS Base */\\n/* TailwindCSS Base Backdrop */\\n";
    export {
      l0g as default
    };
    ",
      "[output] _virtual/a.js": "import "./b.js";
    const a = "test-u-2 test-c-2 test-b-2";
    export {
      a as default
    };
    ",
      "[output] _virtual/a.js__module.layer2.css.js": "const s = ".test-u-2 {\\n    --test-u: 2px\\n}\\n";
    export {
      s as default
    };
    ",
      "[output] _virtual/a.js__module.layer2.js": "import s from "./b.js__module.layer2.css.js";
    import s$1 from "./a.js__module.layer2.css.js";
    const m0 = s + s$1;
    export {
      m0 as default
    };
    ",
      "[output] _virtual/b.js": "console.log("test-u-3 test-c-3 test-b-3");
    ",
      "[output] _virtual/b.js__module.layer2.css.js": "const s = ".test-u-3 {\\n    --test-u: 3px\\n}\\n";
    export {
      s as default
    };
    ",
      "[output] _virtual/b.js__module.layer2.js": "import s from "./b.js__module.layer2.css.js";
    export {
      s as default
    };
    ",
      "[output] _virtual/entry.js": "import css from "./entry.js__index.inline.js";
    import a from "./a.js";
    const X = "test-u-1 test-c-1 test-b-1";
    console.log(X, a, css);
    ",
      "[output] _virtual/entry.js__hoisted.layer1.css.js": "const l1h = ".test-c-1 {\\n    --test-c: 1px\\n}\\n.test-c-2 {\\n    --test-c: 2px\\n}\\n.test-c-3 {\\n    --test-c: 3px\\n}\\n";
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
      "[output] _virtual/entry.js__module.layer2.css.js": "const s = ".test-u-1 {\\n    --test-u: 1px\\n}\\n";
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
      "[output] tests/entry.html": "<!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Test Entry File</title>  <script type="module" crossorigin src="/_virtual/_tailwindcss.global.layer0.css.js"></script>
      <script type="module" crossorigin src="/_virtual/entry.js__hoisted.layer1.css.js"></script>
      <script type="module" crossorigin src="/_virtual/b.js__module.layer2.css.js"></script>
      <script type="module" crossorigin src="/_virtual/a.js__module.layer2.css.js"></script>
      <script type="module" crossorigin src="/_virtual/a.js__module.layer2.js"></script>
      <script type="module" crossorigin src="/_virtual/entry.js__module.layer2.css.js"></script>
      <script type="module" crossorigin src="/_virtual/entry.js__module.layer2.js"></script>
      <script type="module" crossorigin src="/_virtual/entry.js__index.inline.js"></script>
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
      "[intermediate] tailwindcss.global.layer0.css": "",
      "[intermediate] tailwindcss:test/a.js::module.layer2.css": "",
      "[intermediate] tailwindcss:test/a.js::module.layer2.inject.js": "import "\\u0000tailwindcss:\\u0000test/b.js::module.layer2.inject.js";
    import "\\u0000tailwindcss:\\u0000test/a.js::module.layer2.css";
    ",
      "[intermediate] tailwindcss:test/b.js::module.layer2.css": "",
      "[intermediate] tailwindcss:test/b.js::module.layer2.inject.js": "import "\\u0000tailwindcss:\\u0000test/b.js::module.layer2.css";
    ",
      "[intermediate] tailwindcss:test/entry.js::hoisted.layer1.css": "",
      "[intermediate] tailwindcss:test/entry.js::index.inject.js": "import "\\u0000tailwindcss.global.layer0.css";
    import "\\u0000tailwindcss:\\u0000test/entry.js::hoisted.layer1.css";
    import "\\u0000tailwindcss:\\u0000test/entry.js::module.layer2.inject.js";
    ",
      "[intermediate] tailwindcss:test/entry.js::module.layer2.css": "",
      "[intermediate] tailwindcss:test/entry.js::module.layer2.inject.js": "import "\\u0000tailwindcss:\\u0000test/a.js::module.layer2.inject.js";
    import "\\u0000tailwindcss:\\u0000test/entry.js::module.layer2.css";
    ",
      "[output] _virtual/_tailwindcss.global.layer0.css": ".test-b-1 {
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
      "[output] _virtual/a.js": "import "./b.js";
    const a = "test-u-2 test-c-2 test-b-2";
    export {
      a as default
    };
    ",
      "[output] _virtual/a.js__module.layer2.css": ".test-u-2 {
        --test-u: 2px
    }
    ",
      "[output] _virtual/b.js": "console.log("test-u-3 test-c-3 test-b-3");
    ",
      "[output] _virtual/b.js__module.layer2.css": ".test-u-3 {
        --test-u: 3px
    }
    ",
      "[output] _virtual/entry.js": "/* empty css                               */
    /* empty css                             */
    /* empty css                        */
    /* empty css                        */
    /* empty css                            */
    import a from "./a.js";
    const X = "test-u-1 test-c-1 test-b-1 test-b-9";
    console.log(X, a, css);
    ",
      "[output] _virtual/entry.js__hoisted.layer1.css": ".test-c-1 {
        --test-c: 1px
    }
    .test-c-2 {
        --test-c: 2px
    }
    .test-c-3 {
        --test-c: 3px
    }
    ",
      "[output] _virtual/entry.js__module.layer2.css": ".test-u-1 {
        --test-u: 1px
    }
    ",
      "[output] tests/entry.html": "<!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Test Entry File</title>  <script type="module" crossorigin src="/_virtual/b.js"></script>
      <script type="module" crossorigin src="/_virtual/a.js"></script>
      <script type="module" crossorigin src="/_virtual/entry.js"></script>
      <link rel="stylesheet" crossorigin href="/_virtual/_tailwindcss.global.layer0.css">
      <link rel="stylesheet" crossorigin href="/_virtual/entry.js__hoisted.layer1.css">
      <link rel="stylesheet" crossorigin href="/_virtual/b.js__module.layer2.css">
      <link rel="stylesheet" crossorigin href="/_virtual/a.js__module.layer2.css">
      <link rel="stylesheet" crossorigin href="/_virtual/entry.js__module.layer2.css">
    </head>
      <body>
        Only for testing purposes.
      </body>
    </html>
    ",
    }
  `);
});
