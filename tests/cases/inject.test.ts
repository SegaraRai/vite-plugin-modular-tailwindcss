import { it } from "vitest";
import { runBuild } from "../runner";
import { getOutputCSS, getOutputHTML } from "../utils";

it("generates inject css with no used classes", async ({ expect }) => {
  const { files } = await runBuild([
    [
      "entry.js",
      'import "#tailwindcss/inject";\nconst X = "";\nconsole.log(X);\n',
    ],
  ]);

  expect(getOutputHTML(files)).toContain("stylesheet");

  const css = getOutputCSS(files);
  expect(css).not.toContain(".test-u-1");
  expect(css).not.toContain(".test-c-1");
  expect(css).not.toContain(".test-b-1");

  expect(files).toMatchInlineSnapshot(`
    {
      "[intermediate] tailwindcss/__x00__test/entry.js/entry.dj.js": "import "\\u0000tailwindcss/global.layer0.j.css";
    import "\\u0000tailwindcss/__x00__test/entry.js/hoisted.layer1.dj.css";
    import "\\u0000tailwindcss/__x00__test/entry.js/module.layer2.dj.js";
    ",
      "[intermediate] tailwindcss/__x00__test/entry.js/hoisted.layer1.dj.css": "",
      "[intermediate] tailwindcss/__x00__test/entry.js/module.layer2.dj.js": "import "\\u0000tailwindcss/__x00__test/entry.js/module.layer2.j.css";
    ",
      "[intermediate] tailwindcss/__x00__test/entry.js/module.layer2.j.css": "",
      "[intermediate] tailwindcss/global.layer0.j.css": "",
      "[output] _virtual/entry.js": "/* empty css                    */
    import "./hoisted.layer1.dj.css.js";
    import "./module.layer2.j.css.js";
    const X = "";
    console.log(X);
    ",
      "[output] _virtual/global.layer0.j.css": "/* TailwindCSS Base */
    /* TailwindCSS Base Backdrop */
    ",
      "[output] _virtual/hoisted.layer1.dj.css.js": "
    ",
      "[output] _virtual/module.layer2.j.css.js": "
    ",
      "[output] tests/entry.html": "<!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Test Entry File</title>  <script type="module" crossorigin src="/_virtual/hoisted.layer1.dj.css.js"></script>
      <script type="module" crossorigin src="/_virtual/module.layer2.j.css.js"></script>
      <script type="module" crossorigin src="/_virtual/entry.js"></script>
      <link rel="stylesheet" crossorigin href="/_virtual/global.layer0.j.css">
    </head>
      <body>
        Only for testing purposes.
      </body>
    </html>
    ",
    }
  `);
});

it("generates inject css with an utility class", async ({ expect }) => {
  const { files } = await runBuild([
    [
      "entry.js",
      'import "#tailwindcss/inject";\nconst X = "test-u-1";\nconsole.log(X);\n',
    ],
  ]);

  expect(getOutputHTML(files)).toContain("stylesheet");

  const css = getOutputCSS(files);
  expect(css).toContain(".test-u-1");
  expect(css).not.toContain(".test-c-1");
  expect(css).not.toContain(".test-b-1");
  expect(css).not.toContain(".test-u-2");
  expect(css).not.toContain(".test-c-2");
  expect(css).not.toContain(".test-b-2");

  expect(files).toMatchInlineSnapshot(`
    {
      "[intermediate] tailwindcss/__x00__test/entry.js/entry.dj.js": "import "\\u0000tailwindcss/global.layer0.j.css";
    import "\\u0000tailwindcss/__x00__test/entry.js/hoisted.layer1.dj.css";
    import "\\u0000tailwindcss/__x00__test/entry.js/module.layer2.dj.js";
    ",
      "[intermediate] tailwindcss/__x00__test/entry.js/hoisted.layer1.dj.css": "",
      "[intermediate] tailwindcss/__x00__test/entry.js/module.layer2.dj.js": "import "\\u0000tailwindcss/__x00__test/entry.js/module.layer2.j.css";
    ",
      "[intermediate] tailwindcss/__x00__test/entry.js/module.layer2.j.css": "",
      "[intermediate] tailwindcss/global.layer0.j.css": "",
      "[output] _virtual/entry.js": "/* empty css                    */
    import "./hoisted.layer1.dj.css.js";
    /* empty css                    */
    const X = "test-u-1";
    console.log(X);
    ",
      "[output] _virtual/global.layer0.j.css": "/* TailwindCSS Base */
    /* TailwindCSS Base Backdrop */
    ",
      "[output] _virtual/hoisted.layer1.dj.css.js": "
    ",
      "[output] _virtual/module.layer2.j.css": ".test-u-1 {
        --test-u: 1px
    }
    ",
      "[output] tests/entry.html": "<!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Test Entry File</title>  <script type="module" crossorigin src="/_virtual/hoisted.layer1.dj.css.js"></script>
      <script type="module" crossorigin src="/_virtual/entry.js"></script>
      <link rel="stylesheet" crossorigin href="/_virtual/global.layer0.j.css">
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

it("generates inject css with an component class", async ({ expect }) => {
  const { files } = await runBuild([
    [
      "entry.js",
      'import "#tailwindcss/inject";\nconst X = "test-c-1";\nconsole.log(X);\n',
    ],
  ]);

  expect(getOutputHTML(files)).toContain("stylesheet");

  const css = getOutputCSS(files);
  expect(css).not.toContain(".test-u-1");
  expect(css).toContain(".test-c-1");
  expect(css).not.toContain(".test-b-1");
  expect(css).not.toContain(".test-u-2");
  expect(css).not.toContain(".test-c-2");
  expect(css).not.toContain(".test-b-2");

  expect(files).toMatchInlineSnapshot(`
    {
      "[intermediate] tailwindcss/__x00__test/entry.js/entry.dj.js": "import "\\u0000tailwindcss/global.layer0.j.css";
    import "\\u0000tailwindcss/__x00__test/entry.js/hoisted.layer1.dj.css";
    import "\\u0000tailwindcss/__x00__test/entry.js/module.layer2.dj.js";
    ",
      "[intermediate] tailwindcss/__x00__test/entry.js/hoisted.layer1.dj.css": "",
      "[intermediate] tailwindcss/__x00__test/entry.js/module.layer2.dj.js": "import "\\u0000tailwindcss/__x00__test/entry.js/module.layer2.j.css";
    ",
      "[intermediate] tailwindcss/__x00__test/entry.js/module.layer2.j.css": "",
      "[intermediate] tailwindcss/global.layer0.j.css": "",
      "[output] _virtual/entry.js": "/* empty css                    */
    /* empty css                      */
    import "./module.layer2.j.css.js";
    const X = "test-c-1";
    console.log(X);
    ",
      "[output] _virtual/global.layer0.j.css": "/* TailwindCSS Base */
    /* TailwindCSS Base Backdrop */
    ",
      "[output] _virtual/hoisted.layer1.dj.css": ".test-c-1 {
        --test-c: 1px
    }
    ",
      "[output] _virtual/module.layer2.j.css.js": "
    ",
      "[output] tests/entry.html": "<!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Test Entry File</title>  <script type="module" crossorigin src="/_virtual/module.layer2.j.css.js"></script>
      <script type="module" crossorigin src="/_virtual/entry.js"></script>
      <link rel="stylesheet" crossorigin href="/_virtual/global.layer0.j.css">
      <link rel="stylesheet" crossorigin href="/_virtual/hoisted.layer1.dj.css">
    </head>
      <body>
        Only for testing purposes.
      </body>
    </html>
    ",
    }
  `);
});

it("generates inject css with an base class", async ({ expect }) => {
  const { files } = await runBuild([
    [
      "entry.js",
      'import "#tailwindcss/inject";\nconst X = "test-b-1";\nconsole.log(X);\n',
    ],
  ]);

  expect(getOutputHTML(files)).toContain("stylesheet");

  const css = getOutputCSS(files);
  expect(css).not.toContain(".test-u-1");
  expect(css).not.toContain(".test-c-1");
  expect(css).toContain(".test-b-1");
  expect(css).not.toContain(".test-u-2");
  expect(css).not.toContain(".test-c-2");
  expect(css).not.toContain(".test-b-2");

  expect(files).toMatchInlineSnapshot(`
    {
      "[intermediate] tailwindcss/__x00__test/entry.js/entry.dj.js": "import "\\u0000tailwindcss/global.layer0.j.css";
    import "\\u0000tailwindcss/__x00__test/entry.js/hoisted.layer1.dj.css";
    import "\\u0000tailwindcss/__x00__test/entry.js/module.layer2.dj.js";
    ",
      "[intermediate] tailwindcss/__x00__test/entry.js/hoisted.layer1.dj.css": "",
      "[intermediate] tailwindcss/__x00__test/entry.js/module.layer2.dj.js": "import "\\u0000tailwindcss/__x00__test/entry.js/module.layer2.j.css";
    ",
      "[intermediate] tailwindcss/__x00__test/entry.js/module.layer2.j.css": "",
      "[intermediate] tailwindcss/global.layer0.j.css": "",
      "[output] _virtual/entry.js": "/* empty css                    */
    import "./hoisted.layer1.dj.css.js";
    import "./module.layer2.j.css.js";
    const X = "test-b-1";
    console.log(X);
    ",
      "[output] _virtual/global.layer0.j.css": ".test-b-1 {
        --test-b: 1px
    }
    /* TailwindCSS Base */
    /* TailwindCSS Base Backdrop */
    ",
      "[output] _virtual/hoisted.layer1.dj.css.js": "
    ",
      "[output] _virtual/module.layer2.j.css.js": "
    ",
      "[output] tests/entry.html": "<!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Test Entry File</title>  <script type="module" crossorigin src="/_virtual/hoisted.layer1.dj.css.js"></script>
      <script type="module" crossorigin src="/_virtual/module.layer2.j.css.js"></script>
      <script type="module" crossorigin src="/_virtual/entry.js"></script>
      <link rel="stylesheet" crossorigin href="/_virtual/global.layer0.j.css">
    </head>
      <body>
        Only for testing purposes.
      </body>
    </html>
    ",
    }
  `);
});

it("generates inject css with all layers", async ({ expect }) => {
  const { files } = await runBuild([
    [
      "entry.js",
      'import "#tailwindcss/inject";\nconst X = "test-u-1 test-c-1 test-b-1";\nconsole.log(X);\n',
    ],
  ]);

  expect(getOutputHTML(files)).toContain("stylesheet");

  const css = getOutputCSS(files);
  expect(css).toContain(".test-u-1");
  expect(css).toContain(".test-c-1");
  expect(css).toContain(".test-b-1");
  expect(css).not.toContain(".test-u-2");
  expect(css).not.toContain(".test-c-2");
  expect(css).not.toContain(".test-b-2");

  expect(files).toMatchInlineSnapshot(`
    {
      "[intermediate] tailwindcss/__x00__test/entry.js/entry.dj.js": "import "\\u0000tailwindcss/global.layer0.j.css";
    import "\\u0000tailwindcss/__x00__test/entry.js/hoisted.layer1.dj.css";
    import "\\u0000tailwindcss/__x00__test/entry.js/module.layer2.dj.js";
    ",
      "[intermediate] tailwindcss/__x00__test/entry.js/hoisted.layer1.dj.css": "",
      "[intermediate] tailwindcss/__x00__test/entry.js/module.layer2.dj.js": "import "\\u0000tailwindcss/__x00__test/entry.js/module.layer2.j.css";
    ",
      "[intermediate] tailwindcss/__x00__test/entry.js/module.layer2.j.css": "",
      "[intermediate] tailwindcss/global.layer0.j.css": "",
      "[output] _virtual/entry.js": "/* empty css                    */
    /* empty css                      */
    /* empty css                    */
    const X = "test-u-1 test-c-1 test-b-1";
    console.log(X);
    ",
      "[output] _virtual/global.layer0.j.css": ".test-b-1 {
        --test-b: 1px
    }
    /* TailwindCSS Base */
    /* TailwindCSS Base Backdrop */
    ",
      "[output] _virtual/hoisted.layer1.dj.css": ".test-c-1 {
        --test-c: 1px
    }
    ",
      "[output] _virtual/module.layer2.j.css": ".test-u-1 {
        --test-u: 1px
    }
    ",
      "[output] tests/entry.html": "<!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Test Entry File</title>  <script type="module" crossorigin src="/_virtual/entry.js"></script>
      <link rel="stylesheet" crossorigin href="/_virtual/global.layer0.j.css">
      <link rel="stylesheet" crossorigin href="/_virtual/hoisted.layer1.dj.css">
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
