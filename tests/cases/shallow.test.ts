import { it } from "vitest";
import { runBuild } from "../runner";
import { getAllCode, getOutputCSS } from "../utils";

it("only references direct code except global layer (inline)", async ({
  expect,
}) => {
  const { files } = await runBuild([
    [
      "entry.js",
      `import css from "#tailwindcss/shallow";
import a from "./a.js";
const X = "test-u-1 test-c-1 test-b-1";
console.log(X, a, css);
`,
    ],
    [
      "a.js",
      `import b from "./b.js";
export default b + " test-u-2 test-c-2 test-b-2";
`,
    ],
    ["b.js", `export default "test-u-3 test-c-3 test-b-3";\n`],
  ]);

  const code = getAllCode(files);

  expect(code).toContain(".test-u-1");
  expect(code).toContain(".test-c-1");
  expect(code).toContain(".test-b-1");
  expect(code).not.toContain(".test-u-2");
  expect(code).not.toContain(".test-c-2");
  expect(code).toContain(".test-b-2");
  expect(code).not.toContain(".test-u-3");
  expect(code).not.toContain(".test-c-3");
  expect(code).toContain(".test-b-3");
  expect(code).not.toContain(".test-b-4");

  expect(files).toMatchInlineSnapshot(`
    {
      "[intermediate] tailwindcss.global.layer0.css?inline": "export default ".test-b-1 {\\n    --test-b: 1px\\n}\\n.test-b-2 {\\n    --test-b: 2px\\n}\\n.test-b-3 {\\n    --test-b: 3px\\n}\\n/* TailwindCSS Base */\\n/* TailwindCSS Base Backdrop */\\n"",
      "[intermediate] tailwindcss:test/entry.js::hoisted.layer1.shallow.css?inline": "export default ".test-c-1 {\\n    --test-c: 1px\\n}\\n"",
      "[intermediate] tailwindcss:test/entry.js::index.shallow.inline.js": "import l0g from "\\u0000tailwindcss.global.layer0.css?inline";
    import l1h from "\\u0000tailwindcss:\\u0000test/entry.js::hoisted.layer1.shallow.css?inline";
    import l2m from "\\u0000tailwindcss:\\u0000test/entry.js::module.layer2.shallow.js";
    export default l0g + l1h + l2m;
    ",
      "[intermediate] tailwindcss:test/entry.js::module.layer2.css?inline": "export default ".test-u-1 {\\n    --test-u: 1px\\n}\\n"",
      "[intermediate] tailwindcss:test/entry.js::module.layer2.shallow.js": "import s from "\\u0000tailwindcss:\\u0000test/entry.js::module.layer2.css?inline";
    export default s;
    ",
      "[output] _virtual/_tailwindcss.global.layer0.css.js": "const l0g = ".test-b-1 {\\n    --test-b: 1px\\n}\\n.test-b-2 {\\n    --test-b: 2px\\n}\\n.test-b-3 {\\n    --test-b: 3px\\n}\\n/* TailwindCSS Base */\\n/* TailwindCSS Base Backdrop */\\n";
    export {
      l0g as default
    };
    ",
      "[output] _virtual/a.js": "import b from "./b.js";
    const a = b + " test-u-2 test-c-2 test-b-2";
    export {
      a as default
    };
    ",
      "[output] _virtual/b.js": "const b = "test-u-3 test-c-3 test-b-3";
    export {
      b as default
    };
    ",
      "[output] _virtual/entry.js": "import css from "./entry.js__index.shallow.inline.js";
    import a from "./a.js";
    const X = "test-u-1 test-c-1 test-b-1";
    console.log(X, a, css);
    ",
      "[output] _virtual/entry.js__hoisted.layer1.shallow.css.js": "const l1h = ".test-c-1 {\\n    --test-c: 1px\\n}\\n";
    export {
      l1h as default
    };
    ",
      "[output] _virtual/entry.js__index.shallow.inline.js": "import l0g from "./_tailwindcss.global.layer0.css.js";
    import l1h from "./entry.js__hoisted.layer1.shallow.css.js";
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
      "[output] _virtual/entry.js__module.layer2.shallow.js": "import s from "./entry.js__module.layer2.css.js";
    export {
      s as default
    };
    ",
      "[output] tests/entry.html": "<!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Test Entry File</title>  <script type="module" crossorigin src="/_virtual/_tailwindcss.global.layer0.css.js"></script>
      <script type="module" crossorigin src="/_virtual/entry.js__hoisted.layer1.shallow.css.js"></script>
      <script type="module" crossorigin src="/_virtual/entry.js__module.layer2.css.js"></script>
      <script type="module" crossorigin src="/_virtual/entry.js__index.shallow.inline.js"></script>
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

it("only references direct code except global layer (inject)", async ({
  expect,
}) => {
  const { files } = await runBuild([
    [
      "entry.js",
      `import "#tailwindcss/inject-shallow";
import a from "./a.js";
const X = "test-u-1 test-c-1 test-b-1";
console.log(X, a, css);
`,
    ],
    [
      "a.js",
      `import b from "./b.js";
export default b + " test-u-2 test-c-2 test-b-2";
`,
    ],
    ["b.js", `export default "test-u-3 test-c-3 test-b-3";\n`],
  ]);

  const code = getOutputCSS(files);

  expect(code).toContain(".test-u-1");
  expect(code).toContain(".test-c-1");
  expect(code).toContain(".test-b-1");
  expect(code).not.toContain(".test-u-2");
  expect(code).not.toContain(".test-c-2");
  expect(code).toContain(".test-b-2");
  expect(code).not.toContain(".test-u-3");
  expect(code).not.toContain(".test-c-3");
  expect(code).toContain(".test-b-3");
  expect(code).not.toContain(".test-b-4");

  expect(files).toMatchInlineSnapshot(`
    {
      "[intermediate] tailwindcss.global.layer0.css": "",
      "[intermediate] tailwindcss:test/entry.js::hoisted.layer1.shallow.css": "",
      "[intermediate] tailwindcss:test/entry.js::index.shallow.inject.js": "import "\\u0000tailwindcss.global.layer0.css";
    import "\\u0000tailwindcss:\\u0000test/entry.js::hoisted.layer1.shallow.css";
    import "\\u0000tailwindcss:\\u0000test/entry.js::module.layer2.shallow.inject.js";
    ",
      "[intermediate] tailwindcss:test/entry.js::module.layer2.css": "",
      "[intermediate] tailwindcss:test/entry.js::module.layer2.shallow.inject.js": "import "\\u0000tailwindcss:\\u0000test/entry.js::module.layer2.css";
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
    /* TailwindCSS Base */
    /* TailwindCSS Base Backdrop */
    ",
      "[output] _virtual/a.js": "import b from "./b.js";
    const a = b + " test-u-2 test-c-2 test-b-2";
    export {
      a as default
    };
    ",
      "[output] _virtual/b.js": "const b = "test-u-3 test-c-3 test-b-3";
    export {
      b as default
    };
    ",
      "[output] _virtual/entry.js": "/* empty css                               */
    /* empty css                                     */
    /* empty css                            */
    import a from "./a.js";
    const X = "test-u-1 test-c-1 test-b-1";
    console.log(X, a, css);
    ",
      "[output] _virtual/entry.js__hoisted.layer1.shallow.css": ".test-c-1 {
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
        <title>Test Entry File</title>  <script type="module" crossorigin src="/_virtual/b.js"></script>
      <script type="module" crossorigin src="/_virtual/a.js"></script>
      <script type="module" crossorigin src="/_virtual/entry.js"></script>
      <link rel="stylesheet" crossorigin href="/_virtual/_tailwindcss.global.layer0.css">
      <link rel="stylesheet" crossorigin href="/_virtual/entry.js__hoisted.layer1.shallow.css">
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
