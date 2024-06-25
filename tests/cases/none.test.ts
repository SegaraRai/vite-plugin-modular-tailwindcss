import { it } from "vitest";
import { runBuild } from "../runner";

it("generates nothing if not imported", async ({ expect }) => {
  const result = await runBuild([
    ["entry.js", 'const X = "test-u-1";\nconsole.log(X);\n'],
  ]);

  for (const key of Object.keys(result)) {
    expect(key).not.toContain("[intermediate]");
    expect(key).not.toContain("tailwindcss");
  }
  expect(result).toMatchInlineSnapshot(`
    {
      "[output] _virtual/entry.js": "const X = "test-u-1";
    console.log(X);
    ",
      "[output] tests/entry.html": "<!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Test Entry File</title>  <script type="module" crossorigin src="/_virtual/modulepreload-polyfill.js"></script>
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