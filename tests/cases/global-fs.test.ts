import { it } from "vitest";
import { runBuild } from "../runner";
import { getOutputCSS } from "../utils";

it("supports filesystem content", async ({ expect }) => {
  const { files } = await runBuild(
    [["entry.js", 'import "#tailwindcss/inject";\n']],
    {
      layers: [
        {
          mode: "global",
          code: "@tailwind base;",
          content: ["./fs-test-contents/*.ts", "!**/*-ignored.ts"],
        },
      ],
    }
  );

  const code = getOutputCSS(files);
  expect(code).not.toContain(".test-b-1");
  expect(code).toContain(".test-b-2");
  expect(code).toContain(".test-b-3");
  expect(code).toContain(".test-b-4");
  expect(code).not.toContain(".test-b-5");
  expect(code).not.toContain(".test-b-7");

  expect(files).toMatchInlineSnapshot(`
    {
      "[intermediate] tailwindcss.global.layer0.css": "",
      "[intermediate] tailwindcss:test/entry.js::index.inject.js": "import "\\u0000tailwindcss.global.layer0.css";
    ",
      "[output] _virtual/_tailwindcss.global.layer0.css": ".test-b-2 {
        --test-b: 2px
    }
    .test-b-3 {
        --test-b: 3px
    }
    .test-b-4 {
        --test-b: 4px
    }
    /* TailwindCSS Base */
    /* TailwindCSS Base Backdrop */
    ",
      "[output] _virtual/entry.js": "/* empty css                               */
    ",
      "[output] tests/entry.html": "<!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Test Entry File</title>  <script type="module" crossorigin src="/_virtual/entry.js"></script>
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
