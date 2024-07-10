import { it } from "vitest";
import { runBuild } from "../runner";
import { getAllCode, getOutput, getOutputHTML } from "../utils";

it("generates inline css with no used classes", async ({ expect }) => {
  const { files } = await runBuild([
    [
      "entry.js",
      'import css from "#tailwindcss";\nconst X = "";\nconsole.log(X, css);\n',
    ],
  ]);

  expect(getOutputHTML(files)).not.toContain("stylesheet");

  const code = getAllCode(files);
  expect(code).not.toContain(".test-u-1");
  expect(code).not.toContain(".test-c-1");
  expect(code).not.toContain(".test-b-1");

  const output = getOutput(files);
  expect(output).not.toContain(".test-u-1");
  expect(output).not.toContain(".test-c-1");
  expect(output).not.toContain(".test-b-1");

  expect(files).toMatchInlineSnapshot(`
    {
      "[intermediate] tailwindcss/__x00__test/entry.js/hoisted.layer1.dl.css?inline": "export default """,
      "[intermediate] tailwindcss/__x00__test/entry.js/module.layer2.dl.js": "import s from "\\u0000tailwindcss/__x00__test/entry.js/module.layer2.l.css?inline";
    export default s;
    ",
      "[intermediate] tailwindcss/__x00__test/entry.js/module.layer2.l.css?inline": "export default """,
      "[intermediate] tailwindcss/__x00__test/entry.js/top.dl.js": "import l0g from "\\u0000tailwindcss/global.layer0.l.css?inline";
    import l1h from "\\u0000tailwindcss/__x00__test/entry.js/hoisted.layer1.dl.css?inline";
    import l2m from "\\u0000tailwindcss/__x00__test/entry.js/module.layer2.dl.js";
    export default l0g + l1h + l2m;
    ",
      "[intermediate] tailwindcss/global.layer0.l.css?inline": "export default "/* TailwindCSS Base */\\n/* TailwindCSS Base Backdrop */\\n"",
      "[output] _virtual/entry.js": "import css from "./top.dl.js";
    const X = "";
    console.log(X, css);
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
      "[output] _virtual/module.layer2.dl.js": "import s from "./module.layer2.l.css.js";
    export {
      s as default
    };
    ",
      "[output] _virtual/module.layer2.l.css.js": "const s = "";
    export {
      s as default
    };
    ",
      "[output] _virtual/top.dl.js": "import l0g from "./global.layer0.l.css.js";
    import l1h from "./hoisted.layer1.dl.css.js";
    import s from "./module.layer2.l.css.js";
    const css = l0g + l1h + s;
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
      <script type="module" crossorigin src="/_virtual/module.layer2.l.css.js"></script>
      <script type="module" crossorigin src="/_virtual/top.dl.js"></script>
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

it("generates inline css with an utility class", async ({ expect }) => {
  const { files } = await runBuild([
    [
      "entry.js",
      'import css from "#tailwindcss";\nconst X = "test-u-1";\nconsole.log(X, css);\n',
    ],
  ]);

  expect(getOutputHTML(files)).not.toContain("stylesheet");

  const code = getAllCode(files);
  expect(code).toContain(".test-u-1");
  expect(code).not.toContain(".test-c-1");
  expect(code).not.toContain(".test-b-1");

  const output = getOutput(files);
  expect(output).toContain(".test-u-1");
  expect(output).not.toContain(".test-c-1");
  expect(output).not.toContain(".test-b-1");

  expect(files).toMatchInlineSnapshot(`
    {
      "[intermediate] tailwindcss/__x00__test/entry.js/hoisted.layer1.dl.css?inline": "export default """,
      "[intermediate] tailwindcss/__x00__test/entry.js/module.layer2.dl.js": "import s from "\\u0000tailwindcss/__x00__test/entry.js/module.layer2.l.css?inline";
    export default s;
    ",
      "[intermediate] tailwindcss/__x00__test/entry.js/module.layer2.l.css?inline": "export default ".test-u-1 {\\n    --test-u: 1px\\n}\\n"",
      "[intermediate] tailwindcss/__x00__test/entry.js/top.dl.js": "import l0g from "\\u0000tailwindcss/global.layer0.l.css?inline";
    import l1h from "\\u0000tailwindcss/__x00__test/entry.js/hoisted.layer1.dl.css?inline";
    import l2m from "\\u0000tailwindcss/__x00__test/entry.js/module.layer2.dl.js";
    export default l0g + l1h + l2m;
    ",
      "[intermediate] tailwindcss/global.layer0.l.css?inline": "export default "/* TailwindCSS Base */\\n/* TailwindCSS Base Backdrop */\\n"",
      "[output] _virtual/entry.js": "import css from "./top.dl.js";
    const X = "test-u-1";
    console.log(X, css);
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
      "[output] _virtual/module.layer2.dl.js": "import s from "./module.layer2.l.css.js";
    export {
      s as default
    };
    ",
      "[output] _virtual/module.layer2.l.css.js": "const s = ".test-u-1 {\\n    --test-u: 1px\\n}\\n";
    export {
      s as default
    };
    ",
      "[output] _virtual/top.dl.js": "import l0g from "./global.layer0.l.css.js";
    import l1h from "./hoisted.layer1.dl.css.js";
    import s from "./module.layer2.l.css.js";
    const css = l0g + l1h + s;
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
      <script type="module" crossorigin src="/_virtual/module.layer2.l.css.js"></script>
      <script type="module" crossorigin src="/_virtual/top.dl.js"></script>
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

it("generates inline css with an component class", async ({ expect }) => {
  const { files } = await runBuild([
    [
      "entry.js",
      'import css from "#tailwindcss";\nconst X = "test-c-1";\nconsole.log(X, css);\n',
    ],
  ]);

  expect(getOutputHTML(files)).not.toContain("stylesheet");

  const code = getAllCode(files);
  expect(code).not.toContain(".test-u-1");
  expect(code).toContain(".test-c-1");
  expect(code).not.toContain(".test-b-1");

  const output = getOutput(files);
  expect(output).not.toContain(".test-u-1");
  expect(output).toContain(".test-c-1");
  expect(output).not.toContain(".test-b-1");

  expect(files).toMatchInlineSnapshot(`
    {
      "[intermediate] tailwindcss/__x00__test/entry.js/hoisted.layer1.dl.css?inline": "export default ".test-c-1 {\\n    --test-c: 1px\\n}\\n"",
      "[intermediate] tailwindcss/__x00__test/entry.js/module.layer2.dl.js": "import s from "\\u0000tailwindcss/__x00__test/entry.js/module.layer2.l.css?inline";
    export default s;
    ",
      "[intermediate] tailwindcss/__x00__test/entry.js/module.layer2.l.css?inline": "export default """,
      "[intermediate] tailwindcss/__x00__test/entry.js/top.dl.js": "import l0g from "\\u0000tailwindcss/global.layer0.l.css?inline";
    import l1h from "\\u0000tailwindcss/__x00__test/entry.js/hoisted.layer1.dl.css?inline";
    import l2m from "\\u0000tailwindcss/__x00__test/entry.js/module.layer2.dl.js";
    export default l0g + l1h + l2m;
    ",
      "[intermediate] tailwindcss/global.layer0.l.css?inline": "export default "/* TailwindCSS Base */\\n/* TailwindCSS Base Backdrop */\\n"",
      "[output] _virtual/entry.js": "import css from "./top.dl.js";
    const X = "test-c-1";
    console.log(X, css);
    ",
      "[output] _virtual/global.layer0.l.css.js": "const l0g = "/* TailwindCSS Base */\\n/* TailwindCSS Base Backdrop */\\n";
    export {
      l0g as default
    };
    ",
      "[output] _virtual/hoisted.layer1.dl.css.js": "const l1h = ".test-c-1 {\\n    --test-c: 1px\\n}\\n";
    export {
      l1h as default
    };
    ",
      "[output] _virtual/module.layer2.dl.js": "import s from "./module.layer2.l.css.js";
    export {
      s as default
    };
    ",
      "[output] _virtual/module.layer2.l.css.js": "const s = "";
    export {
      s as default
    };
    ",
      "[output] _virtual/top.dl.js": "import l0g from "./global.layer0.l.css.js";
    import l1h from "./hoisted.layer1.dl.css.js";
    import s from "./module.layer2.l.css.js";
    const css = l0g + l1h + s;
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
      <script type="module" crossorigin src="/_virtual/module.layer2.l.css.js"></script>
      <script type="module" crossorigin src="/_virtual/top.dl.js"></script>
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

it("generates inline css with an base class", async ({ expect }) => {
  const { files } = await runBuild([
    [
      "entry.js",
      'import css from "#tailwindcss";\nconst X = "test-b-1";\nconsole.log(X, css);\n',
    ],
  ]);

  expect(getOutputHTML(files)).not.toContain("stylesheet");

  const code = getAllCode(files);
  expect(code).not.toContain(".test-u-1");
  expect(code).not.toContain(".test-c-1");
  expect(code).toContain(".test-b-1");

  const output = getOutput(files);
  expect(output).not.toContain(".test-u-1");
  expect(output).not.toContain(".test-c-1");
  expect(output).toContain(".test-b-1");

  expect(files).toMatchInlineSnapshot(`
    {
      "[intermediate] tailwindcss/__x00__test/entry.js/hoisted.layer1.dl.css?inline": "export default """,
      "[intermediate] tailwindcss/__x00__test/entry.js/module.layer2.dl.js": "import s from "\\u0000tailwindcss/__x00__test/entry.js/module.layer2.l.css?inline";
    export default s;
    ",
      "[intermediate] tailwindcss/__x00__test/entry.js/module.layer2.l.css?inline": "export default """,
      "[intermediate] tailwindcss/__x00__test/entry.js/top.dl.js": "import l0g from "\\u0000tailwindcss/global.layer0.l.css?inline";
    import l1h from "\\u0000tailwindcss/__x00__test/entry.js/hoisted.layer1.dl.css?inline";
    import l2m from "\\u0000tailwindcss/__x00__test/entry.js/module.layer2.dl.js";
    export default l0g + l1h + l2m;
    ",
      "[intermediate] tailwindcss/global.layer0.l.css?inline": "export default ".test-b-1 {\\n    --test-b: 1px\\n}\\n/* TailwindCSS Base */\\n/* TailwindCSS Base Backdrop */\\n"",
      "[output] _virtual/entry.js": "import css from "./top.dl.js";
    const X = "test-b-1";
    console.log(X, css);
    ",
      "[output] _virtual/global.layer0.l.css.js": "const l0g = ".test-b-1 {\\n    --test-b: 1px\\n}\\n/* TailwindCSS Base */\\n/* TailwindCSS Base Backdrop */\\n";
    export {
      l0g as default
    };
    ",
      "[output] _virtual/hoisted.layer1.dl.css.js": "const l1h = "";
    export {
      l1h as default
    };
    ",
      "[output] _virtual/module.layer2.dl.js": "import s from "./module.layer2.l.css.js";
    export {
      s as default
    };
    ",
      "[output] _virtual/module.layer2.l.css.js": "const s = "";
    export {
      s as default
    };
    ",
      "[output] _virtual/top.dl.js": "import l0g from "./global.layer0.l.css.js";
    import l1h from "./hoisted.layer1.dl.css.js";
    import s from "./module.layer2.l.css.js";
    const css = l0g + l1h + s;
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
      <script type="module" crossorigin src="/_virtual/module.layer2.l.css.js"></script>
      <script type="module" crossorigin src="/_virtual/top.dl.js"></script>
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

it("generates inline css with all layers", async ({ expect }) => {
  const { files } = await runBuild([
    [
      "entry.js",
      'import css from "#tailwindcss";\nconst X = "test-u-1 test-c-1 test-b-1";\nconsole.log(X, css);\n',
    ],
  ]);

  expect(getOutputHTML(files)).not.toContain("stylesheet");

  const code = getAllCode(files);
  expect(code).toContain(".test-u-1");
  expect(code).toContain(".test-c-1");
  expect(code).toContain(".test-b-1");

  const output = getOutput(files);
  expect(output).toContain(".test-u-1");
  expect(output).toContain(".test-c-1");
  expect(output).toContain(".test-b-1");

  expect(files).toMatchInlineSnapshot(`
    {
      "[intermediate] tailwindcss/__x00__test/entry.js/hoisted.layer1.dl.css?inline": "export default ".test-c-1 {\\n    --test-c: 1px\\n}\\n"",
      "[intermediate] tailwindcss/__x00__test/entry.js/module.layer2.dl.js": "import s from "\\u0000tailwindcss/__x00__test/entry.js/module.layer2.l.css?inline";
    export default s;
    ",
      "[intermediate] tailwindcss/__x00__test/entry.js/module.layer2.l.css?inline": "export default ".test-u-1 {\\n    --test-u: 1px\\n}\\n"",
      "[intermediate] tailwindcss/__x00__test/entry.js/top.dl.js": "import l0g from "\\u0000tailwindcss/global.layer0.l.css?inline";
    import l1h from "\\u0000tailwindcss/__x00__test/entry.js/hoisted.layer1.dl.css?inline";
    import l2m from "\\u0000tailwindcss/__x00__test/entry.js/module.layer2.dl.js";
    export default l0g + l1h + l2m;
    ",
      "[intermediate] tailwindcss/global.layer0.l.css?inline": "export default ".test-b-1 {\\n    --test-b: 1px\\n}\\n/* TailwindCSS Base */\\n/* TailwindCSS Base Backdrop */\\n"",
      "[output] _virtual/entry.js": "import css from "./top.dl.js";
    const X = "test-u-1 test-c-1 test-b-1";
    console.log(X, css);
    ",
      "[output] _virtual/global.layer0.l.css.js": "const l0g = ".test-b-1 {\\n    --test-b: 1px\\n}\\n/* TailwindCSS Base */\\n/* TailwindCSS Base Backdrop */\\n";
    export {
      l0g as default
    };
    ",
      "[output] _virtual/hoisted.layer1.dl.css.js": "const l1h = ".test-c-1 {\\n    --test-c: 1px\\n}\\n";
    export {
      l1h as default
    };
    ",
      "[output] _virtual/module.layer2.dl.js": "import s from "./module.layer2.l.css.js";
    export {
      s as default
    };
    ",
      "[output] _virtual/module.layer2.l.css.js": "const s = ".test-u-1 {\\n    --test-u: 1px\\n}\\n";
    export {
      s as default
    };
    ",
      "[output] _virtual/top.dl.js": "import l0g from "./global.layer0.l.css.js";
    import l1h from "./hoisted.layer1.dl.css.js";
    import s from "./module.layer2.l.css.js";
    const css = l0g + l1h + s;
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
      <script type="module" crossorigin src="/_virtual/module.layer2.l.css.js"></script>
      <script type="module" crossorigin src="/_virtual/top.dl.js"></script>
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

it("works with side-effect only import", async ({ expect }) => {
  const { files } = await runBuild([
    ["entry.js", 'import "#tailwindcss";\n"test-u-1 test-c-1 test-b-1";\n'],
  ]);

  expect(getOutputHTML(files)).not.toContain("stylesheet");

  const code = getAllCode(files);
  expect(code).toContain(".test-u-1");
  expect(code).toContain(".test-c-1");
  expect(code).toContain(".test-b-1");

  const output = getOutput(files);
  expect(output).not.toContain(".test-u-1");
  expect(output).not.toContain(".test-c-1");
  expect(output).not.toContain(".test-b-1");

  expect(files).toMatchInlineSnapshot(`
    {
      "[intermediate] tailwindcss/__x00__test/entry.js/hoisted.layer1.dl.css?inline": "export default ".test-c-1 {\\n    --test-c: 1px\\n}\\n"",
      "[intermediate] tailwindcss/__x00__test/entry.js/module.layer2.dl.js": "import s from "\\u0000tailwindcss/__x00__test/entry.js/module.layer2.l.css?inline";
    export default s;
    ",
      "[intermediate] tailwindcss/__x00__test/entry.js/module.layer2.l.css?inline": "export default ".test-u-1 {\\n    --test-u: 1px\\n}\\n"",
      "[intermediate] tailwindcss/__x00__test/entry.js/top.dl.js": "import l0g from "\\u0000tailwindcss/global.layer0.l.css?inline";
    import l1h from "\\u0000tailwindcss/__x00__test/entry.js/hoisted.layer1.dl.css?inline";
    import l2m from "\\u0000tailwindcss/__x00__test/entry.js/module.layer2.dl.js";
    export default l0g + l1h + l2m;
    ",
      "[intermediate] tailwindcss/global.layer0.l.css?inline": "export default ".test-b-1 {\\n    --test-b: 1px\\n}\\n/* TailwindCSS Base */\\n/* TailwindCSS Base Backdrop */\\n"",
      "[output] _virtual/entry.js": "
    ",
      "[output] tests/entry.html": "<!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Test Entry File</title>  <script type="module" crossorigin src="/_virtual/entry.js"></script>
    </head>
      <body>
        Only for testing purposes.
      </body>
    </html>
    ",
    }
  `);
});
