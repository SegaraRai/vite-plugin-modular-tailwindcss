import { it } from "vitest";
import { runBuild } from "../runner";

it("generates nothing if not imported", async ({ expect }) => {
  const { files, warnings } = await runBuild([
    ["entry.js", 'const X = "test-u-1";\nconsole.log(X);\n'],
  ]);

  for (const key of Object.keys(files)) {
    expect(key).not.toContain("[intermediate]");
    expect(key).not.toContain("tailwindcss");
  }

  expect(warnings).toHaveLength(0);

  expect(files).toMatchInlineSnapshot(`
    {
      "[output] _virtual/entry.js": "const X = "test-u-1";
    console.log(X);
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
