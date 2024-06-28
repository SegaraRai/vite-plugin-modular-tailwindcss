import { it } from "vitest";
import { runBuild } from "../runner";

it("hoists and dedupe css with hoisted mode", async ({ expect }) => {
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
export default x + " test-c-1";
`,
    ],
    [
      "b.js",
      `import x from "./x.js";
export default x + " test-c-2";
`,
    ],
    ["x.js", `export default "test-c-9";\n`],
  ]);

  expect(
    files["[intermediate] tailwindcss:test/entry.js::hoisted.layer1.css?inline"]
  ).toContain(".test-c-1");
  expect(
    files["[intermediate] tailwindcss:test/entry.js::hoisted.layer1.css?inline"]
  ).toContain(".test-c-2");
  expect(
    files["[intermediate] tailwindcss:test/entry.js::hoisted.layer1.css?inline"]
  ).toMatch(/\.test-c-9/);
  expect(
    files["[intermediate] tailwindcss:test/entry.js::hoisted.layer1.css?inline"]
  ).not.toMatch(/\.test-c-9.+\.test-c-9/);

  expect(files).toMatchInlineSnapshot(`
    {
      "[intermediate] tailwindcss.global.layer0.css?inline": "export default "/* TailwindCSS Base */\\n/* TailwindCSS Base Backdrop */\\n"",
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
      "[intermediate] tailwindcss:test/entry.js::hoisted.layer1.css?inline": "export default ".test-c-1 {\\n    --test-c: 1px\\n}\\n.test-c-2 {\\n    --test-c: 2px\\n}\\n.test-c-9 {\\n    --test-c: 9px\\n}\\n"",
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
      "[output] _virtual/_tailwindcss.global.layer0.css.js": "const l0g = "/* TailwindCSS Base */\\n/* TailwindCSS Base Backdrop */\\n";
    export {
      l0g as default
    };
    ",
      "[output] _virtual/a.js": "import x from "./x.js";
    const a = x + " test-c-1";
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
    const b = x + " test-c-2";
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
      "[output] _virtual/entry.js__hoisted.layer1.css.js": "const l1h = ".test-c-1 {\\n    --test-c: 1px\\n}\\n.test-c-2 {\\n    --test-c: 2px\\n}\\n.test-c-9 {\\n    --test-c: 9px\\n}\\n";
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
      "[output] _virtual/x.js": "const x = "test-c-9";
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
