import { it } from "vitest";
import { runBuild } from "../runner";
import { getOutputCSS } from "../utils";

it("supports filesystem content", async ({ expect }) => {
  const result = await runBuild(
    [["entry.js", 'import "#tailwindcss/inject";\n']],
    {
      layers: [
        {
          mode: "global",
          code: "@tailwind base;",
          content: ["tests/fs-test-contents/*.ts"],
        },
      ],
    }
  );

  const code = getOutputCSS(result);
  expect(code).not.toContain(".test-b-1");
  expect(code).toContain(".test-b-2");
  expect(code).toContain(".test-b-3");
  expect(code).toContain(".test-b-4");
  expect(code).not.toContain(".test-b-4");

  expect(result).toMatchInlineSnapshot();
});
