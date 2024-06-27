import { it } from "vitest";
import { runBuild } from "../runner";
import {
  createDefaultLayers,
  getAllCode,
  getOutput,
  getOutputHTML,
} from "../utils";

it("generates inline css with no used classes", async ({ expect }) => {
  const result = await runBuild([
    [
      "entry.js",
      'import css from "#tailwindcss";\nconst X = "";\nconsole.log(X, css);\n',
    ],
  ]);

  expect(getOutputHTML(result)).not.toContain("stylesheet");

  const code = getAllCode(result);
  expect(code).not.toContain(".test-u-1");
  expect(code).not.toContain(".test-c-1");
  expect(code).not.toContain(".test-b-1");

  const output = getOutput(result);
  expect(output).not.toContain(".test-u-1");
  expect(output).not.toContain(".test-c-1");
  expect(output).not.toContain(".test-b-1");

  expect(result).toMatchInlineSnapshot(`
    {
      "[intermediate] tailwindcss.global.layer0.css?inline": "export default "/* TailwindCSS Base */\\n/* TailwindCSS Base Backdrop */\\n"",
      "[intermediate] tailwindcss:test/entry.js::hoisted.layer1.css?inline": "export default """,
      "[intermediate] tailwindcss:test/entry.js::index.inline.js": "import l0g from "tailwindcss.global.layer0.css?inline";
    import l1h from "tailwindcss:\\u0000test/entry.js::hoisted.layer1.css?inline";
    import l2m from "tailwindcss:\\u0000test/entry.js::module.layer2.js";
    export default l0g + l1h + l2m;
    ",
      "[intermediate] tailwindcss:test/entry.js::module.layer2.css?inline": "export default """,
      "[intermediate] tailwindcss:test/entry.js::module.layer2.js": "import s from "tailwindcss:\\u0000test/entry.js::module.layer2.css?inline";
    export default s;
    ",
      "[output] _virtual/entry.js": "import css from "./entry.js__index.inline.js";
    const X = "";
    console.log(X, css);
    ",
      "[output] _virtual/entry.js__hoisted.layer1.css.js": "const l1h = "";
    export {
      l1h as default
    };
    ",
      "[output] _virtual/entry.js__index.inline.js": "import l0g from "./tailwindcss.global.layer0.css.js";
    import l1h from "./entry.js__hoisted.layer1.css.js";
    import s from "./entry.js__module.layer2.css.js";
    const css = l0g + l1h + s;
    export {
      css as default
    };
    ",
      "[output] _virtual/entry.js__module.layer2.css.js": "const s = "";
    export {
      s as default
    };
    ",
      "[output] _virtual/entry.js__module.layer2.js": "import s from "./entry.js__module.layer2.css.js";
    export {
      s as default
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
      <script type="module" crossorigin src="/_virtual/entry.js__module.layer2.css.js"></script>
      <script type="module" crossorigin src="/_virtual/entry.js__index.inline.js"></script>
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
  const result = await runBuild([
    [
      "entry.js",
      'import css from "#tailwindcss";\nconst X = "test-u-1";\nconsole.log(X, css);\n',
    ],
  ]);

  expect(getOutputHTML(result)).not.toContain("stylesheet");

  const code = getAllCode(result);
  expect(code).toContain(".test-u-1");
  expect(code).not.toContain(".test-c-1");
  expect(code).not.toContain(".test-b-1");

  const output = getOutput(result);
  expect(output).toContain(".test-u-1");
  expect(output).not.toContain(".test-c-1");
  expect(output).not.toContain(".test-b-1");

  expect(result).toMatchInlineSnapshot(`
    {
      "[intermediate] tailwindcss.global.layer0.css?inline": "export default "/* TailwindCSS Base */\\n/* TailwindCSS Base Backdrop */\\n"",
      "[intermediate] tailwindcss:test/entry.js::hoisted.layer1.css?inline": "export default """,
      "[intermediate] tailwindcss:test/entry.js::index.inline.js": "import l0g from "tailwindcss.global.layer0.css?inline";
    import l1h from "tailwindcss:\\u0000test/entry.js::hoisted.layer1.css?inline";
    import l2m from "tailwindcss:\\u0000test/entry.js::module.layer2.js";
    export default l0g + l1h + l2m;
    ",
      "[intermediate] tailwindcss:test/entry.js::module.layer2.css?inline": "export default ".test-u-1 {\\n    --test-u: 1px\\n}\\n"",
      "[intermediate] tailwindcss:test/entry.js::module.layer2.js": "import s from "tailwindcss:\\u0000test/entry.js::module.layer2.css?inline";
    export default s;
    ",
      "[output] _virtual/entry.js": "import css from "./entry.js__index.inline.js";
    const X = "test-u-1";
    console.log(X, css);
    ",
      "[output] _virtual/entry.js__hoisted.layer1.css.js": "const l1h = "";
    export {
      l1h as default
    };
    ",
      "[output] _virtual/entry.js__index.inline.js": "import l0g from "./tailwindcss.global.layer0.css.js";
    import l1h from "./entry.js__hoisted.layer1.css.js";
    import s from "./entry.js__module.layer2.css.js";
    const css = l0g + l1h + s;
    export {
      css as default
    };
    ",
      "[output] _virtual/entry.js__module.layer2.css.js": "const s = ".test-u-1 {\\n    --test-u: 1px\\n}\\n";
    export {
      s as default
    };
    ",
      "[output] _virtual/entry.js__module.layer2.js": "import s from "./entry.js__module.layer2.css.js";
    export {
      s as default
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
      <script type="module" crossorigin src="/_virtual/entry.js__module.layer2.css.js"></script>
      <script type="module" crossorigin src="/_virtual/entry.js__index.inline.js"></script>
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
  const result = await runBuild([
    [
      "entry.js",
      'import css from "#tailwindcss";\nconst X = "test-c-1";\nconsole.log(X, css);\n',
    ],
  ]);

  expect(getOutputHTML(result)).not.toContain("stylesheet");

  const code = getAllCode(result);
  expect(code).not.toContain(".test-u-1");
  expect(code).toContain(".test-c-1");
  expect(code).not.toContain(".test-b-1");

  const output = getOutput(result);
  expect(output).not.toContain(".test-u-1");
  expect(output).toContain(".test-c-1");
  expect(output).not.toContain(".test-b-1");

  expect(result).toMatchInlineSnapshot(`
    {
      "[intermediate] tailwindcss.global.layer0.css?inline": "export default "/* TailwindCSS Base */\\n/* TailwindCSS Base Backdrop */\\n"",
      "[intermediate] tailwindcss:test/entry.js::hoisted.layer1.css?inline": "export default ".test-c-1 {\\n    --test-c: 1px\\n}\\n"",
      "[intermediate] tailwindcss:test/entry.js::index.inline.js": "import l0g from "tailwindcss.global.layer0.css?inline";
    import l1h from "tailwindcss:\\u0000test/entry.js::hoisted.layer1.css?inline";
    import l2m from "tailwindcss:\\u0000test/entry.js::module.layer2.js";
    export default l0g + l1h + l2m;
    ",
      "[intermediate] tailwindcss:test/entry.js::module.layer2.css?inline": "export default """,
      "[intermediate] tailwindcss:test/entry.js::module.layer2.js": "import s from "tailwindcss:\\u0000test/entry.js::module.layer2.css?inline";
    export default s;
    ",
      "[output] _virtual/entry.js": "import css from "./entry.js__index.inline.js";
    const X = "test-c-1";
    console.log(X, css);
    ",
      "[output] _virtual/entry.js__hoisted.layer1.css.js": "const l1h = ".test-c-1 {\\n    --test-c: 1px\\n}\\n";
    export {
      l1h as default
    };
    ",
      "[output] _virtual/entry.js__index.inline.js": "import l0g from "./tailwindcss.global.layer0.css.js";
    import l1h from "./entry.js__hoisted.layer1.css.js";
    import s from "./entry.js__module.layer2.css.js";
    const css = l0g + l1h + s;
    export {
      css as default
    };
    ",
      "[output] _virtual/entry.js__module.layer2.css.js": "const s = "";
    export {
      s as default
    };
    ",
      "[output] _virtual/entry.js__module.layer2.js": "import s from "./entry.js__module.layer2.css.js";
    export {
      s as default
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
      <script type="module" crossorigin src="/_virtual/entry.js__module.layer2.css.js"></script>
      <script type="module" crossorigin src="/_virtual/entry.js__index.inline.js"></script>
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
  const result = await runBuild(
    [
      [
        "entry.js",
        'import css from "#tailwindcss";\nconst X = "---";\nconsole.log(X, css);\n',
      ],
    ],
    {
      layers: createDefaultLayers('"test-b-1"'),
    }
  );

  expect(getOutputHTML(result)).not.toContain("stylesheet");

  const code = getAllCode(result);
  expect(code).not.toContain(".test-u-1");
  expect(code).not.toContain(".test-c-1");
  expect(code).toContain(".test-b-1");

  const output = getOutput(result);
  expect(output).not.toContain(".test-u-1");
  expect(output).not.toContain(".test-c-1");
  expect(output).toContain(".test-b-1");

  expect(result).toMatchInlineSnapshot(`
    {
      "[intermediate] tailwindcss.global.layer0.css?inline": "export default ".test-b-1 {\\n    --test-b: 1px\\n}\\n/* TailwindCSS Base */\\n/* TailwindCSS Base Backdrop */\\n"",
      "[intermediate] tailwindcss:test/entry.js::hoisted.layer1.css?inline": "export default """,
      "[intermediate] tailwindcss:test/entry.js::index.inline.js": "import l0g from "tailwindcss.global.layer0.css?inline";
    import l1h from "tailwindcss:\\u0000test/entry.js::hoisted.layer1.css?inline";
    import l2m from "tailwindcss:\\u0000test/entry.js::module.layer2.js";
    export default l0g + l1h + l2m;
    ",
      "[intermediate] tailwindcss:test/entry.js::module.layer2.css?inline": "export default """,
      "[intermediate] tailwindcss:test/entry.js::module.layer2.js": "import s from "tailwindcss:\\u0000test/entry.js::module.layer2.css?inline";
    export default s;
    ",
      "[output] _virtual/entry.js": "import css from "./entry.js__index.inline.js";
    const X = "---";
    console.log(X, css);
    ",
      "[output] _virtual/entry.js__hoisted.layer1.css.js": "const l1h = "";
    export {
      l1h as default
    };
    ",
      "[output] _virtual/entry.js__index.inline.js": "import l0g from "./tailwindcss.global.layer0.css.js";
    import l1h from "./entry.js__hoisted.layer1.css.js";
    import s from "./entry.js__module.layer2.css.js";
    const css = l0g + l1h + s;
    export {
      css as default
    };
    ",
      "[output] _virtual/entry.js__module.layer2.css.js": "const s = "";
    export {
      s as default
    };
    ",
      "[output] _virtual/entry.js__module.layer2.js": "import s from "./entry.js__module.layer2.css.js";
    export {
      s as default
    };
    ",
      "[output] _virtual/tailwindcss.global.layer0.css.js": "const l0g = ".test-b-1 {\\n    --test-b: 1px\\n}\\n/* TailwindCSS Base */\\n/* TailwindCSS Base Backdrop */\\n";
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
      <script type="module" crossorigin src="/_virtual/entry.js__module.layer2.css.js"></script>
      <script type="module" crossorigin src="/_virtual/entry.js__index.inline.js"></script>
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
  const result = await runBuild(
    [
      [
        "entry.js",
        'import css from "#tailwindcss";\nconst X = "test-u-1 test-c-1 ---";\nconsole.log(X, css);\n',
      ],
    ],
    {
      layers: createDefaultLayers('"test-b-1"'),
    }
  );

  expect(getOutputHTML(result)).not.toContain("stylesheet");

  const code = getAllCode(result);
  expect(code).toContain(".test-u-1");
  expect(code).toContain(".test-c-1");
  expect(code).toContain(".test-b-1");

  const output = getOutput(result);
  expect(output).toContain(".test-u-1");
  expect(output).toContain(".test-c-1");
  expect(output).toContain(".test-b-1");

  expect(result).toMatchInlineSnapshot(`
    {
      "[intermediate] tailwindcss.global.layer0.css?inline": "export default ".test-b-1 {\\n    --test-b: 1px\\n}\\n/* TailwindCSS Base */\\n/* TailwindCSS Base Backdrop */\\n"",
      "[intermediate] tailwindcss:test/entry.js::hoisted.layer1.css?inline": "export default ".test-c-1 {\\n    --test-c: 1px\\n}\\n"",
      "[intermediate] tailwindcss:test/entry.js::index.inline.js": "import l0g from "tailwindcss.global.layer0.css?inline";
    import l1h from "tailwindcss:\\u0000test/entry.js::hoisted.layer1.css?inline";
    import l2m from "tailwindcss:\\u0000test/entry.js::module.layer2.js";
    export default l0g + l1h + l2m;
    ",
      "[intermediate] tailwindcss:test/entry.js::module.layer2.css?inline": "export default ".test-u-1 {\\n    --test-u: 1px\\n}\\n"",
      "[intermediate] tailwindcss:test/entry.js::module.layer2.js": "import s from "tailwindcss:\\u0000test/entry.js::module.layer2.css?inline";
    export default s;
    ",
      "[output] _virtual/entry.js": "import css from "./entry.js__index.inline.js";
    const X = "test-u-1 test-c-1 ---";
    console.log(X, css);
    ",
      "[output] _virtual/entry.js__hoisted.layer1.css.js": "const l1h = ".test-c-1 {\\n    --test-c: 1px\\n}\\n";
    export {
      l1h as default
    };
    ",
      "[output] _virtual/entry.js__index.inline.js": "import l0g from "./tailwindcss.global.layer0.css.js";
    import l1h from "./entry.js__hoisted.layer1.css.js";
    import s from "./entry.js__module.layer2.css.js";
    const css = l0g + l1h + s;
    export {
      css as default
    };
    ",
      "[output] _virtual/entry.js__module.layer2.css.js": "const s = ".test-u-1 {\\n    --test-u: 1px\\n}\\n";
    export {
      s as default
    };
    ",
      "[output] _virtual/entry.js__module.layer2.js": "import s from "./entry.js__module.layer2.css.js";
    export {
      s as default
    };
    ",
      "[output] _virtual/tailwindcss.global.layer0.css.js": "const l0g = ".test-b-1 {\\n    --test-b: 1px\\n}\\n/* TailwindCSS Base */\\n/* TailwindCSS Base Backdrop */\\n";
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
      <script type="module" crossorigin src="/_virtual/entry.js__module.layer2.css.js"></script>
      <script type="module" crossorigin src="/_virtual/entry.js__index.inline.js"></script>
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
  const result = await runBuild(
    [["entry.js", 'import "#tailwindcss";\n"test-u-1 test-c-1 ---";\n']],
    {
      layers: createDefaultLayers('"test-b-1"'),
    }
  );

  expect(getOutputHTML(result)).not.toContain("stylesheet");

  const code = getAllCode(result);
  expect(code).toContain(".test-u-1");
  expect(code).toContain(".test-c-1");
  expect(code).toContain(".test-b-1");

  const output = getOutput(result);
  expect(output).not.toContain(".test-u-1");
  expect(output).not.toContain(".test-c-1");
  expect(output).not.toContain(".test-b-1");

  expect(result).toMatchInlineSnapshot(`
    {
      "[intermediate] tailwindcss.global.layer0.css?inline": "export default ".test-b-1 {\\n    --test-b: 1px\\n}\\n/* TailwindCSS Base */\\n/* TailwindCSS Base Backdrop */\\n"",
      "[intermediate] tailwindcss:test/entry.js::hoisted.layer1.css?inline": "export default ".test-c-1 {\\n    --test-c: 1px\\n}\\n"",
      "[intermediate] tailwindcss:test/entry.js::index.inline.js": "import l0g from "tailwindcss.global.layer0.css?inline";
    import l1h from "tailwindcss:\\u0000test/entry.js::hoisted.layer1.css?inline";
    import l2m from "tailwindcss:\\u0000test/entry.js::module.layer2.js";
    export default l0g + l1h + l2m;
    ",
      "[intermediate] tailwindcss:test/entry.js::module.layer2.css?inline": "export default ".test-u-1 {\\n    --test-u: 1px\\n}\\n"",
      "[intermediate] tailwindcss:test/entry.js::module.layer2.js": "import s from "tailwindcss:\\u0000test/entry.js::module.layer2.css?inline";
    export default s;
    ",
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
