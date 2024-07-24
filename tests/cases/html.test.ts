import { it } from "vitest";
import { runBuild } from "../runner";
import { getDefaultHead, getOutputCSS } from "../utils";

it("generates css which only contains rules for HTML except global layer", async ({
  expect,
}) => {
  const { files } = await runBuild(
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
      body: '<div class="test-u-1 test-c-1 test-b-1">Use TailwindCSS in HTML</div>',
    }
  );

  const css = getOutputCSS(files);
  expect(css).toContain(".test-u-1");
  expect(css).toContain(".test-c-1");
  expect(css).toContain(".test-b-1");
  expect(css).not.toContain(".test-u-9");
  expect(css).not.toContain(".test-c-9");
  expect(css).toContain(".test-b-9");

  expect(files).toMatchInlineSnapshot(`
    {
      "[intermediate] tailwindcss/@@/tests/entry.html/entry.sj.js": "import "\\u0000tailwindcss/global.layer0.j.css";
    import "\\u0000tailwindcss/@@/tests/entry.html/hoisted.layer1.sj.css";
    import "\\u0000tailwindcss/@@/tests/entry.html/module.layer2.sj.js";
    ",
      "[intermediate] tailwindcss/@@/tests/entry.html/hoisted.layer1.sj.css": "",
      "[intermediate] tailwindcss/@@/tests/entry.html/module.layer2.j.css": "",
      "[intermediate] tailwindcss/@@/tests/entry.html/module.layer2.sj.js": "import "\\u0000tailwindcss/@@/tests/entry.html/module.layer2.j.css";
    ",
      "[intermediate] tailwindcss/__x00__test/entry.js/entry.dl.js": "import l0g from "\\u0000tailwindcss/global.layer0.l.css?inline";
    import l1h from "\\u0000tailwindcss/__x00__test/entry.js/hoisted.layer1.dl.css?inline";
    import l2m from "\\u0000tailwindcss/__x00__test/entry.js/module.layer2.dl.js";
    export default l0g + l1h + l2m;
    ",
      "[intermediate] tailwindcss/__x00__test/entry.js/hoisted.layer1.dl.css?inline": "export default ".test-c-9 {\\n    --test-c: 9px\\n}\\n"",
      "[intermediate] tailwindcss/__x00__test/entry.js/module.layer2.dl.js": "import s from "\\u0000tailwindcss/__x00__test/entry.js/module.layer2.l.css?inline";
    export default s;
    ",
      "[intermediate] tailwindcss/__x00__test/entry.js/module.layer2.l.css?inline": "export default ".test-u-9 {\\n    --test-u: 9px\\n}\\n"",
      "[intermediate] tailwindcss/global.layer0.j.css": "",
      "[intermediate] tailwindcss/global.layer0.l.css?inline": "export default ".test-b-1 {\\n    --test-b: 1px\\n}\\n.test-b-9 {\\n    --test-b: 9px\\n}\\n/* TailwindCSS Base */\\n/* TailwindCSS Base Backdrop */\\n"",
      "[output] _virtual/entry.dl.js": "import l0g from "./global.layer0.l.css.js";
    import l1h from "./hoisted.layer1.dl.css.js";
    import s from "./module.layer2.l.css.js";
    const css = l0g + l1h + s;
    export {
      css as default
    };
    ",
      "[output] _virtual/entry.js": "import css from "./entry.dl.js";
    const X = "test-u-9 test-c-9 test-b-9";
    console.log(X, css);
    ",
      "[output] _virtual/entry.sj.js": "/* empty css                    */
    /* empty css                      */
    /* empty css                    */
    ",
      "[output] _virtual/global.layer0.j.css": ".test-b-1 {
        --test-b: 1px
    }
    .test-b-9 {
        --test-b: 9px
    }
    /* TailwindCSS Base */
    /* TailwindCSS Base Backdrop */
    ",
      "[output] _virtual/global.layer0.l.css.js": "const l0g = ".test-b-1 {\\n    --test-b: 1px\\n}\\n.test-b-9 {\\n    --test-b: 9px\\n}\\n/* TailwindCSS Base */\\n/* TailwindCSS Base Backdrop */\\n";
    export {
      l0g as default
    };
    ",
      "[output] _virtual/hoisted.layer1.dl.css.js": "const l1h = ".test-c-9 {\\n    --test-c: 9px\\n}\\n";
    export {
      l1h as default
    };
    ",
      "[output] _virtual/hoisted.layer1.sj.css": ".test-c-1 {
        --test-c: 1px
    }
    ",
      "[output] _virtual/module.layer2.dl.js": "import s from "./module.layer2.l.css.js";
    export {
      s as default
    };
    ",
      "[output] _virtual/module.layer2.j.css": ".test-u-1 {
        --test-u: 1px
    }
    ",
      "[output] _virtual/module.layer2.l.css.js": "const s = ".test-u-9 {\\n    --test-u: 9px\\n}\\n";
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
      <script type="module" crossorigin src="/_virtual/module.layer2.l.css.js"></script>
      <script type="module" crossorigin src="/_virtual/entry.dl.js"></script>
      <script type="module" crossorigin src="/_virtual/entry.js"></script>
      <script type="module" crossorigin src="/_virtual/entry.sj.js"></script>
      <link rel="stylesheet" crossorigin href="/_virtual/global.layer0.j.css">
      <link rel="stylesheet" crossorigin href="/_virtual/hoisted.layer1.sj.css">
      <link rel="stylesheet" crossorigin href="/_virtual/module.layer2.j.css">
    </head>
      <body>
        Only for testing purposes.
      <div class="test-u-1 test-c-1 test-b-1">Use TailwindCSS in HTML</div></body>
    </html>
    ",
    }
  `);
});

it("generates css without entry js", async ({ expect }) => {
  const { files } = await runBuild([], {
    head: '<script type="module" src="?tailwindcss/inject-shallow"></script>',
    body: '<div class="test-u-1 test-c-1 test-b-1">Use TailwindCSS in HTML</div>',
  });

  const css = getOutputCSS(files);
  expect(css).toContain(".test-u-1");
  expect(css).toContain(".test-c-1");
  expect(css).toContain(".test-b-1");
  expect(css).not.toContain(".test-b-2");

  expect(files).toMatchInlineSnapshot(`
    {
      "[intermediate] tailwindcss/@@/tests/entry.html/entry.sj.js": "import "\\u0000tailwindcss/global.layer0.j.css";
    import "\\u0000tailwindcss/@@/tests/entry.html/hoisted.layer1.sj.css";
    import "\\u0000tailwindcss/@@/tests/entry.html/module.layer2.sj.js";
    ",
      "[intermediate] tailwindcss/@@/tests/entry.html/hoisted.layer1.sj.css": "",
      "[intermediate] tailwindcss/@@/tests/entry.html/module.layer2.j.css": "",
      "[intermediate] tailwindcss/@@/tests/entry.html/module.layer2.sj.js": "import "\\u0000tailwindcss/@@/tests/entry.html/module.layer2.j.css";
    ",
      "[intermediate] tailwindcss/global.layer0.j.css": "",
      "[output] _virtual/entry.sj.js": "/* empty css                    */
    /* empty css                      */
    /* empty css                    */
    ",
      "[output] _virtual/global.layer0.j.css": ".test-b-1 {
        --test-b: 1px
    }
    /* TailwindCSS Base */
    /* TailwindCSS Base Backdrop */
    ",
      "[output] _virtual/hoisted.layer1.sj.css": ".test-c-1 {
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
        <title>Test Entry File</title>  <script type="module" crossorigin src="/_virtual/entry.sj.js"></script>
      <link rel="stylesheet" crossorigin href="/_virtual/global.layer0.j.css">
      <link rel="stylesheet" crossorigin href="/_virtual/hoisted.layer1.sj.css">
      <link rel="stylesheet" crossorigin href="/_virtual/module.layer2.j.css">
    </head>
      <body>
        Only for testing purposes.
      <div class="test-u-1 test-c-1 test-b-1">Use TailwindCSS in HTML</div></body>
    </html>
    ",
    }
  `);
});
