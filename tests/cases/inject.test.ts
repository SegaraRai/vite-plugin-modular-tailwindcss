import { it } from "vitest";
import { runBuild } from "../runner";
import { createDefaultLayers, getOutputHTML } from "../utils";

it("generates inject css with no used classes", async ({ expect }) => {
  const result = await runBuild([
    [
      "entry.js",
      'import "#tailwindcss/inject";\nconst X = "";\nconsole.log(X);\n',
    ],
  ]);

  expect(getOutputHTML(result)).toContain("stylesheet");
  expect(result).toMatchInlineSnapshot(`
    {
      "[intermediate] tailwindcss.global.layer0.css": "",
      "[intermediate] tailwindcss:test/entry.js::hoisted.layer1.css": "",
      "[intermediate] tailwindcss:test/entry.js::index.inject.js": "import "\\u0000tailwindcss.global.layer0.css";
    import "\\u0000tailwindcss:\\u0000test/entry.js::hoisted.layer1.css";
    import "\\u0000tailwindcss:\\u0000test/entry.js::module.layer2.inject.js";
    ",
      "[intermediate] tailwindcss:test/entry.js::module.layer2.css": "",
      "[intermediate] tailwindcss:test/entry.js::module.layer2.inject.js": "import "\\u0000tailwindcss:\\u0000test/entry.js::module.layer2.css";
    ",
      "[output] _virtual/_tailwindcss.global.layer0.css": "/* TailwindCSS Base */
    /* TailwindCSS Base Backdrop */
    ",
      "[output] _virtual/entry.js": "/* empty css                               */
    import "./entry.js__hoisted.layer1.css.js";
    import "./entry.js__module.layer2.css.js";
    const X = "";
    console.log(X);
    ",
      "[output] _virtual/entry.js__hoisted.layer1.css.js": "
    ",
      "[output] _virtual/entry.js__module.layer2.css.js": "
    ",
      "[output] tests/entry.html": "<!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Test Entry File</title>  <script type="module" crossorigin src="/_virtual/entry.js__hoisted.layer1.css.js"></script>
      <script type="module" crossorigin src="/_virtual/entry.js__module.layer2.css.js"></script>
      <script type="module" crossorigin src="/_virtual/entry.js"></script>
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

it("generates inject css with an utility class", async ({ expect }) => {
  const result = await runBuild([
    [
      "entry.js",
      'import "#tailwindcss/inject";\nconst X = "test-u-1";\nconsole.log(X);\n',
    ],
  ]);

  expect(getOutputHTML(result)).toContain("stylesheet");
  expect(result).toMatchInlineSnapshot(`
    {
      "[intermediate] tailwindcss.global.layer0.css": "",
      "[intermediate] tailwindcss:test/entry.js::hoisted.layer1.css": "",
      "[intermediate] tailwindcss:test/entry.js::index.inject.js": "import "\\u0000tailwindcss.global.layer0.css";
    import "\\u0000tailwindcss:\\u0000test/entry.js::hoisted.layer1.css";
    import "\\u0000tailwindcss:\\u0000test/entry.js::module.layer2.inject.js";
    ",
      "[intermediate] tailwindcss:test/entry.js::module.layer2.css": "",
      "[intermediate] tailwindcss:test/entry.js::module.layer2.inject.js": "import "\\u0000tailwindcss:\\u0000test/entry.js::module.layer2.css";
    ",
      "[output] _virtual/_tailwindcss.global.layer0.css": "/* TailwindCSS Base */
    /* TailwindCSS Base Backdrop */
    ",
      "[output] _virtual/entry.js": "/* empty css                               */
    import "./entry.js__hoisted.layer1.css.js";
    /* empty css                            */
    const X = "test-u-1";
    console.log(X);
    ",
      "[output] _virtual/entry.js__hoisted.layer1.css.js": "
    ",
      "[output] _virtual/entry.js__module.layer2.css": ".test-u-1 {
        --test-u: 1px
    }
    ",
      "[output] tests/entry.html": "<!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Test Entry File</title>  <script type="module" crossorigin src="/_virtual/entry.js__hoisted.layer1.css.js"></script>
      <script type="module" crossorigin src="/_virtual/entry.js"></script>
      <link rel="stylesheet" crossorigin href="/_virtual/_tailwindcss.global.layer0.css">
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

it("generates inject css with an component class", async ({ expect }) => {
  const result = await runBuild([
    [
      "entry.js",
      'import "#tailwindcss/inject";\nconst X = "test-c-1";\nconsole.log(X);\n',
    ],
  ]);

  expect(getOutputHTML(result)).toContain("stylesheet");
  expect(result).toMatchInlineSnapshot(`
    {
      "[intermediate] tailwindcss.global.layer0.css": "",
      "[intermediate] tailwindcss:test/entry.js::hoisted.layer1.css": "",
      "[intermediate] tailwindcss:test/entry.js::index.inject.js": "import "\\u0000tailwindcss.global.layer0.css";
    import "\\u0000tailwindcss:\\u0000test/entry.js::hoisted.layer1.css";
    import "\\u0000tailwindcss:\\u0000test/entry.js::module.layer2.inject.js";
    ",
      "[intermediate] tailwindcss:test/entry.js::module.layer2.css": "",
      "[intermediate] tailwindcss:test/entry.js::module.layer2.inject.js": "import "\\u0000tailwindcss:\\u0000test/entry.js::module.layer2.css";
    ",
      "[output] _virtual/_tailwindcss.global.layer0.css": "/* TailwindCSS Base */
    /* TailwindCSS Base Backdrop */
    ",
      "[output] _virtual/entry.js": "/* empty css                               */
    /* empty css                             */
    import "./entry.js__module.layer2.css.js";
    const X = "test-c-1";
    console.log(X);
    ",
      "[output] _virtual/entry.js__hoisted.layer1.css": ".test-c-1 {
        --test-c: 1px
    }
    ",
      "[output] _virtual/entry.js__module.layer2.css.js": "
    ",
      "[output] tests/entry.html": "<!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Test Entry File</title>  <script type="module" crossorigin src="/_virtual/entry.js__module.layer2.css.js"></script>
      <script type="module" crossorigin src="/_virtual/entry.js"></script>
      <link rel="stylesheet" crossorigin href="/_virtual/_tailwindcss.global.layer0.css">
      <link rel="stylesheet" crossorigin href="/_virtual/entry.js__hoisted.layer1.css">
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
  const result = await runBuild(
    [
      [
        "entry.js",
        'import "#tailwindcss/inject";\nconst X = "---";\nconsole.log(X);\n',
      ],
    ],
    {
      layers: createDefaultLayers('"test-b-1"'),
    }
  );

  expect(getOutputHTML(result)).toContain("stylesheet");
  expect(result).toMatchInlineSnapshot(`
    {
      "[intermediate] tailwindcss.global.layer0.css": "",
      "[intermediate] tailwindcss:test/entry.js::hoisted.layer1.css": "",
      "[intermediate] tailwindcss:test/entry.js::index.inject.js": "import "\\u0000tailwindcss.global.layer0.css";
    import "\\u0000tailwindcss:\\u0000test/entry.js::hoisted.layer1.css";
    import "\\u0000tailwindcss:\\u0000test/entry.js::module.layer2.inject.js";
    ",
      "[intermediate] tailwindcss:test/entry.js::module.layer2.css": "",
      "[intermediate] tailwindcss:test/entry.js::module.layer2.inject.js": "import "\\u0000tailwindcss:\\u0000test/entry.js::module.layer2.css";
    ",
      "[output] _virtual/_tailwindcss.global.layer0.css": ".test-b-1 {
        --test-b: 1px
    }
    /* TailwindCSS Base */
    /* TailwindCSS Base Backdrop */
    ",
      "[output] _virtual/entry.js": "/* empty css                               */
    import "./entry.js__hoisted.layer1.css.js";
    import "./entry.js__module.layer2.css.js";
    const X = "---";
    console.log(X);
    ",
      "[output] _virtual/entry.js__hoisted.layer1.css.js": "
    ",
      "[output] _virtual/entry.js__module.layer2.css.js": "
    ",
      "[output] tests/entry.html": "<!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Test Entry File</title>  <script type="module" crossorigin src="/_virtual/entry.js__hoisted.layer1.css.js"></script>
      <script type="module" crossorigin src="/_virtual/entry.js__module.layer2.css.js"></script>
      <script type="module" crossorigin src="/_virtual/entry.js"></script>
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

it("generates inject css with all layers", async ({ expect }) => {
  const result = await runBuild(
    [
      [
        "entry.js",
        'import "#tailwindcss/inject";\nconst X = "test-u-1 test-c-1 ---";\nconsole.log(X);\n',
      ],
    ],
    {
      layers: createDefaultLayers('"test-b-1"'),
    }
  );

  expect(getOutputHTML(result)).toContain("stylesheet");
  expect(result).toMatchInlineSnapshot(`
    {
      "[intermediate] tailwindcss.global.layer0.css": "",
      "[intermediate] tailwindcss:test/entry.js::hoisted.layer1.css": "",
      "[intermediate] tailwindcss:test/entry.js::index.inject.js": "import "\\u0000tailwindcss.global.layer0.css";
    import "\\u0000tailwindcss:\\u0000test/entry.js::hoisted.layer1.css";
    import "\\u0000tailwindcss:\\u0000test/entry.js::module.layer2.inject.js";
    ",
      "[intermediate] tailwindcss:test/entry.js::module.layer2.css": "",
      "[intermediate] tailwindcss:test/entry.js::module.layer2.inject.js": "import "\\u0000tailwindcss:\\u0000test/entry.js::module.layer2.css";
    ",
      "[output] _virtual/_tailwindcss.global.layer0.css": ".test-b-1 {
        --test-b: 1px
    }
    /* TailwindCSS Base */
    /* TailwindCSS Base Backdrop */
    ",
      "[output] _virtual/entry.js": "/* empty css                               */
    /* empty css                             */
    /* empty css                            */
    const X = "test-u-1 test-c-1 ---";
    console.log(X);
    ",
      "[output] _virtual/entry.js__hoisted.layer1.css": ".test-c-1 {
        --test-c: 1px
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
        <title>Test Entry File</title>  <script type="module" crossorigin src="/_virtual/entry.js"></script>
      <link rel="stylesheet" crossorigin href="/_virtual/_tailwindcss.global.layer0.css">
      <link rel="stylesheet" crossorigin href="/_virtual/entry.js__hoisted.layer1.css">
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
