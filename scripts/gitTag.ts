import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";

async function gitTagExists(tag: string, remote: boolean): Promise<boolean> {
  const { stdout } = spawnSync(
    "git",
    remote ? ["ls-remote", "--tags", "origin", "-l", tag] : ["tag", "-l", tag]
  );

  return !!stdout.toString().trim();
}

const packageJson = JSON.parse(await readFile("package.json", "utf8"));
const tagName = `v${packageJson.version}`;

if (
  (await gitTagExists(tagName, false)) ||
  (await gitTagExists(tagName, true))
) {
  console.log(`git tag ${tagName} [already exists]`);
} else {
  console.log(`git tag ${tagName}`);
  spawnSync("git", ["tag", tagName]);
}
