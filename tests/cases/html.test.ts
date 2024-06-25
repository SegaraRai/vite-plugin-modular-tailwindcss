import { it } from "vitest";
import { runBuild } from "../runner";
import { createDefaultLayers, getDefaultHead, getOutputCSS } from "../utils";

it("generates css which only contains rules for HTML", async ({ expect }) => {
  const result = await runBuild(
    [
      [
        "entry.js",
        'import css from "#tailwindcss";\nconst X = "test-u-9 test-c-9 test-b-9";\nconsole.log(X, css);\n',
      ],
    ],
    {
      head:
        getDefaultHead() +
        '<script type="module" src="?tailwindcss/inject-shallow"></script>',
      body: '<div class="test-u-1 test-c-1 test-b-1 test-b-2">Use TailwindCSS in HTML</div>',
      layers: createDefaultLayers('"test-b-1"'),
    }
  );

  const css = getOutputCSS(result);
  expect(css).toContain(".test-u-1");
  expect(css).toContain(".test-c-1");
  expect(css).toContain(".test-b-1");
  expect(css).not.toContain(".test-b-2");
  expect(css).not.toContain(".test-u-9");
  expect(css).not.toContain(".test-c-9");
  expect(css).not.toContain(".test-b-9");

  expect(result).toMatchInlineSnapshot(`
    {
      "[intermediate] tailwindcss.global.layer0.css": "",
      "[intermediate] tailwindcss.global.layer0.css?inline": "export default ".test-b-1 {\\n    --test-b: 1px\\n}\\n/* TailwindCSS Base */\\n/* TailwindCSS Base Backdrop */\\n"",
      "[intermediate] tailwindcss:<projectRoot>/tests/entry.html::hoisted.layer1.shallow.css": "",
      "[intermediate] tailwindcss:<projectRoot>/tests/entry.html::index.shallow.inject.js": "import "tailwindcss.global.layer0.css";
    import "tailwindcss:<projectRoot>/tests/entry.html::hoisted.layer1.shallow.css";
    import "tailwindcss:<projectRoot>/tests/entry.html::module.layer2.shallow.inject.js";
    ",
      "[intermediate] tailwindcss:<projectRoot>/tests/entry.html::module.layer2.css": "",
      "[intermediate] tailwindcss:<projectRoot>/tests/entry.html::module.layer2.shallow.inject.js": "import "tailwindcss:<projectRoot>/tests/entry.html::module.layer2.css";
    ",
      "[intermediate] tailwindcss:test/entry.js::hoisted.layer1.css?inline": "export default ".test-c-9 {\\n    --test-c: 9px\\n}\\n"",
      "[intermediate] tailwindcss:test/entry.js::index.inline.js": "import l0g from "tailwindcss.global.layer0.css?inline";
    import l1h from "tailwindcss:\\u0000test/entry.js::hoisted.layer1.css?inline";
    import l2m from "tailwindcss:\\u0000test/entry.js::module.layer2.js";
    export default l0g + l1h + l2m;
    ",
      "[intermediate] tailwindcss:test/entry.js::module.layer2.css?inline": "export default ".test-u-9 {\\n    --test-u: 9px\\n}\\n"",
      "[intermediate] tailwindcss:test/entry.js::module.layer2.js": "import s from "tailwindcss:\\u0000test/entry.js::module.layer2.css?inline";
    export default s;
    ",
      "[output] _virtual/entry.html__hoisted.layer1.shallow.css": ".test-c-1 {
        --test-c: 1px
    }
    ",
      "[output] _virtual/entry.html__index.shallow.inject.js": "/* empty css                              */
    /* empty css                                       */
    /* empty css                              */
    ",
      "[output] _virtual/entry.html__module.layer2.css": ".test-u-1 {
        --test-u: 1px
    }
    ",
      "[output] _virtual/entry.js": "import css from "./entry.js__index.inline.js";
    const X = "test-u-9 test-c-9 test-b-9";
    console.log(X, css);
    ",
      "[output] _virtual/entry.js__hoisted.layer1.css.js": "const l1h = ".test-c-9 {\\n    --test-c: 9px\\n}\\n";
    export {
      l1h as default
    };
    ",
      "[output] _virtual/entry.js__index.inline.js": "import l0g from "./tailwindcss.global.layer0.css2.js";
    import l1h from "./entry.js__hoisted.layer1.css.js";
    import s from "./entry.js__module.layer2.css.js";
    const css = l0g + l1h + s;
    export {
      css as default
    };
    ",
      "[output] _virtual/entry.js__module.layer2.css.js": "const s = ".test-u-9 {\\n    --test-u: 9px\\n}\\n";
    export {
      s as default
    };
    ",
      "[output] _virtual/entry.js__module.layer2.js": "import s from "./entry.js__module.layer2.css.js";
    export {
      s as default
    };
    ",
      "[output] _virtual/tailwindcss.global.layer0.css": ".test-b-1 {
        --test-b: 1px
    }
    /* TailwindCSS Base */
    /* TailwindCSS Base Backdrop */
    ",
      "[output] _virtual/tailwindcss.global.layer0.css2.js": "const l0g = ".test-b-1 {\\n    --test-b: 1px\\n}\\n/* TailwindCSS Base */\\n/* TailwindCSS Base Backdrop */\\n";
    export {
      l0g as default
    };
    ",
      "[output] tests/entry.html": "<!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Test Entry File</title>  <script type="module" crossorigin src="/_virtual/modulepreload-polyfill.js"></script>
      <script type="module" crossorigin src="/_virtual/tailwindcss.global.layer0.css2.js"></script>
      <script type="module" crossorigin src="/_virtual/entry.js__hoisted.layer1.css.js"></script>
      <script type="module" crossorigin src="/_virtual/entry.js__module.layer2.css.js"></script>
      <script type="module" crossorigin src="/_virtual/entry.js__index.inline.js"></script>
      <script type="module" crossorigin src="/_virtual/entry.js"></script>
      <script type="module" crossorigin src="/_virtual/entry.html__index.shallow.inject.js"></script>
      <link rel="stylesheet" crossorigin href="/_virtual/tailwindcss.global.layer0.css">
      <link rel="stylesheet" crossorigin href="/_virtual/entry.html__hoisted.layer1.shallow.css">
      <link rel="stylesheet" crossorigin href="/_virtual/entry.html__module.layer2.css">
    </head>
      <body>
        Only for testing purposes.
      <div class="test-u-1 test-c-1 test-b-1 test-b-2">Use TailwindCSS in HTML</div></body>
    </html>
    ",
    }
  `);
});

it("generates css without entry js", async ({ expect }) => {
  const result = await runBuild([], {
    head: '<script type="module" src="?tailwindcss/inject-shallow"></script>',
    body: '<div class="test-u-1 test-c-1 test-b-1 test-b-2">Use TailwindCSS in HTML</div>',
    layers: createDefaultLayers('"test-b-1"'),
  });

  const css = getOutputCSS(result);
  expect(css).toContain(".test-u-1");
  expect(css).toContain(".test-c-1");
  expect(css).toContain(".test-b-1");
  expect(css).not.toContain(".test-b-2");

  expect(result).toMatchInlineSnapshot(`
    {
      "[intermediate] tailwindcss.global.layer0.css": "",
      "[intermediate] tailwindcss:<projectRoot>/tests/entry.html::hoisted.layer1.shallow.css": "",
      "[intermediate] tailwindcss:<projectRoot>/tests/entry.html::index.shallow.inject.js": "import "tailwindcss.global.layer0.css";
    import "tailwindcss:<projectRoot>/tests/entry.html::hoisted.layer1.shallow.css";
    import "tailwindcss:<projectRoot>/tests/entry.html::module.layer2.shallow.inject.js";
    ",
      "[intermediate] tailwindcss:<projectRoot>/tests/entry.html::module.layer2.css": "",
      "[intermediate] tailwindcss:<projectRoot>/tests/entry.html::module.layer2.shallow.inject.js": "import "tailwindcss:<projectRoot>/tests/entry.html::module.layer2.css";
    ",
      "[output] _virtual/entry.html__hoisted.layer1.shallow.css": ".test-c-1 {
        --test-c: 1px
    }
    ",
      "[output] _virtual/entry.html__index.shallow.inject.js": "/* empty css                              */
    /* empty css                                       */
    /* empty css                              */
    ",
      "[output] _virtual/entry.html__module.layer2.css": ".test-u-1 {
        --test-u: 1px
    }
    ",
      "[output] _virtual/tailwindcss.global.layer0.css": ".test-b-1 {
        --test-b: 1px
    }
    /* TailwindCSS Base */
    /* TailwindCSS Base Backdrop */
    ",
      "[output] tests/entry.html": "<!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Test Entry File</title>  <script type="module" crossorigin src="/_virtual/modulepreload-polyfill.js"></script>
      <script type="module" crossorigin src="/_virtual/entry.html__index.shallow.inject.js"></script>
      <link rel="stylesheet" crossorigin href="/_virtual/tailwindcss.global.layer0.css">
      <link rel="stylesheet" crossorigin href="/_virtual/entry.html__hoisted.layer1.shallow.css">
      <link rel="stylesheet" crossorigin href="/_virtual/entry.html__module.layer2.css">
    </head>
      <body>
        Only for testing purposes.
      <div class="test-u-1 test-c-1 test-b-1 test-b-2">Use TailwindCSS in HTML</div></body>
    </html>
    ",
    }
  `);
});
