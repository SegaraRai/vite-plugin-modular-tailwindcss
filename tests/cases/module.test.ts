import { it } from "vitest";
import { runBuild } from "../runner";

it("creates css for each module on module mode", async ({ expect }) => {
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
export default x + " test-u-1";
`,
    ],
    [
      "b.js",
      `import x from "./x.js";
export default x + " test-u-2";
`,
    ],
    ["x.js", `export default "test-u-9";\n`],
  ]);

  const modA =
    files["[intermediate] tailwindcss/__x00__test/a.js/module.layer2.l.css?inline"];
  const modB =
    files["[intermediate] tailwindcss/__x00__test/b.js/module.layer2.l.css?inline"];
  const modX =
    files["[intermediate] tailwindcss/__x00__test/x.js/module.layer2.l.css?inline"];
  const modEntry =
    files["[intermediate] tailwindcss/__x00__test/entry.js/module.layer2.l.css?inline"];

  expect(modA).toContain(".test-u-1");
  expect(modA).not.toContain(".test-u-2");
  expect(modA).not.toContain(".test-u-9");

  expect(modB).not.toContain(".test-u-1");
  expect(modB).toContain(".test-u-2");
  expect(modB).not.toContain(".test-u-9");

  expect(modX).not.toContain(".test-u-1");
  expect(modX).not.toContain(".test-u-2");
  expect(modX).toContain(".test-u-9");

  expect(modEntry).not.toContain(".test-u-1");
  expect(modEntry).not.toContain(".test-u-2");
  expect(modEntry).not.toContain(".test-u-9");

  expect(files).toMatchInlineSnapshot(`
    {
      "[intermediate] tailwindcss/__x00__test/a.js/module.layer2.dl.js": "import m0 from "\\u0000tailwindcss/__x00__test/x.js/module.layer2.dl.js";
    import s from "\\u0000tailwindcss/__x00__test/a.js/module.layer2.l.css?inline";
    export default m0 + s;
    ",
      "[intermediate] tailwindcss/__x00__test/a.js/module.layer2.l.css?inline": "export default ".test-u-1 {\\n    --test-u: 1px\\n}\\n"",
      "[intermediate] tailwindcss/__x00__test/b.js/module.layer2.dl.js": "import m0 from "\\u0000tailwindcss/__x00__test/x.js/module.layer2.dl.js";
    import s from "\\u0000tailwindcss/__x00__test/b.js/module.layer2.l.css?inline";
    export default m0 + s;
    ",
      "[intermediate] tailwindcss/__x00__test/b.js/module.layer2.l.css?inline": "export default ".test-u-2 {\\n    --test-u: 2px\\n}\\n"",
      "[intermediate] tailwindcss/__x00__test/entry.js/hoisted.layer1.dl.css?inline": "export default """,
      "[intermediate] tailwindcss/__x00__test/entry.js/module.layer2.dl.js": "import m0 from "\\u0000tailwindcss/__x00__test/a.js/module.layer2.dl.js";
    import m1 from "\\u0000tailwindcss/__x00__test/b.js/module.layer2.dl.js";
    import s from "\\u0000tailwindcss/__x00__test/entry.js/module.layer2.l.css?inline";
    export default m0 + m1 + s;
    ",
      "[intermediate] tailwindcss/__x00__test/entry.js/module.layer2.l.css?inline": "export default """,
      "[intermediate] tailwindcss/__x00__test/entry.js/top.dl.js": "import l0g from "\\u0000tailwindcss/global.layer0.l.css?inline";
    import l1h from "\\u0000tailwindcss/__x00__test/entry.js/hoisted.layer1.dl.css?inline";
    import l2m from "\\u0000tailwindcss/__x00__test/entry.js/module.layer2.dl.js";
    export default l0g + l1h + l2m;
    ",
      "[intermediate] tailwindcss/__x00__test/x.js/module.layer2.dl.js": "import s from "\\u0000tailwindcss/__x00__test/x.js/module.layer2.l.css?inline";
    export default s;
    ",
      "[intermediate] tailwindcss/__x00__test/x.js/module.layer2.l.css?inline": "export default ".test-u-9 {\\n    --test-u: 9px\\n}\\n"",
      "[intermediate] tailwindcss/global.layer0.l.css?inline": "export default "/* TailwindCSS Base */\\n/* TailwindCSS Base Backdrop */\\n"",
      "[output] _virtual/a.js": "import x from "./x.js";
    const a = x + " test-u-1";
    export {
      a as default
    };
    ",
      "[output] _virtual/b.js": "import x from "./x.js";
    const b = x + " test-u-2";
    export {
      b as default
    };
    ",
      "[output] _virtual/entry.js": "import css from "./top.dl.js";
    import a from "./a.js";
    import b from "./b.js";
    console.log(a, b, css);
    ",
      "[output] _virtual/global.layer0.l.css.js": "const l0g = "/* TailwindCSS Base */\\n/* TailwindCSS Base Backdrop */\\n";
    export {
      l0g as default
    };
    ",
      "[output] _virtual/hoisted.layer1.dl.css.js": "const l1h = "";
    export {
      l1h as default
    };
    ",
      "[output] _virtual/module.layer2.dl.js": "import m0 from "./module.layer2.dl2.js";
    import m1 from "./module.layer2.dl3.js";
    import s from "./module.layer2.l.css.js";
    const l2m = m0 + m1 + s;
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
    import s$1 from "./module.layer2.l.css4.js";
    const m1 = s + s$1;
    export {
      m1 as default
    };
    ",
      "[output] _virtual/module.layer2.dl4.js": "import s from "./module.layer2.l.css2.js";
    export {
      s as default
    };
    ",
      "[output] _virtual/module.layer2.l.css.js": "const s = "";
    export {
      s as default
    };
    ",
      "[output] _virtual/module.layer2.l.css2.js": "const s = ".test-u-9 {\\n    --test-u: 9px\\n}\\n";
    export {
      s as default
    };
    ",
      "[output] _virtual/module.layer2.l.css3.js": "const s = ".test-u-1 {\\n    --test-u: 1px\\n}\\n";
    export {
      s as default
    };
    ",
      "[output] _virtual/module.layer2.l.css4.js": "const s = ".test-u-2 {\\n    --test-u: 2px\\n}\\n";
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
      "[output] _virtual/x.js": "const x = "test-u-9";
    export {
      x as default
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
      <script type="module" crossorigin src="/_virtual/module.layer2.l.css4.js"></script>
      <script type="module" crossorigin src="/_virtual/module.layer2.dl3.js"></script>
      <script type="module" crossorigin src="/_virtual/module.layer2.l.css.js"></script>
      <script type="module" crossorigin src="/_virtual/module.layer2.dl.js"></script>
      <script type="module" crossorigin src="/_virtual/top.dl.js"></script>
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
