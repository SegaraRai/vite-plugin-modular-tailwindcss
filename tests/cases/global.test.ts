import { it } from "vitest";
import { runBuild } from "../runner";
import { createDefaultLayers, getOutputCSS } from "../utils";

it("creates css for specified content", async ({ expect }) => {
  const result = await runBuild(
    [
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
    ],
    {
      layers: createDefaultLayers('"test-b-5"'),
    }
  );

  const code = result["[intermediate] tailwindcss.global.layer0.css?inline"];

  expect(code).toContain(".test-b-5");
  expect(code).not.toContain(".test-b-1");
  expect(code).not.toContain(".test-b-2");
  expect(code).not.toContain(".test-b-9");

  expect(result).toMatchInlineSnapshot(`
    {
      "[intermediate] tailwindcss.global.layer0.css?inline": "export default ".test-b-5 {\\n    --test-b: 5px\\n}\\n/* TailwindCSS Base */\\n/* TailwindCSS Base Backdrop */\\n"",
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
      "[output] _virtual/_tailwindcss.global.layer0.css.js": "const l0g = ".test-b-5 {\\n    --test-b: 5px\\n}\\n/* TailwindCSS Base */\\n/* TailwindCSS Base Backdrop */\\n";
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

it("creates css for specified content without entry js", async ({ expect }) => {
  const result = await runBuild([], {
    head: '<script type="module" src="?tailwindcss/inject"></script>',
    layers: createDefaultLayers('"test-b-5"'),
  });

  const code = getOutputCSS(result);
  expect(code).toContain(".test-b-5");
  expect(code).not.toContain(".test-b-1");

  expect(result).toMatchInlineSnapshot(`
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
      </body>
    </html>
    ",
    }
  `);
});
