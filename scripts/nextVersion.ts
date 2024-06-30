import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";

spawnSync("pnpm", ["changeset", "status", "--output", "changeset-status.json"]);

const changesetStatus = JSON.parse(
  await readFile("changeset-status.json", "utf8")
) as { releases: { name: string; newVersion: string }[] };
const release = changesetStatus.releases.find(
  (release) => release.name === "vite-plugin-modular-tailwindcss"
);

if (!release) {
  console.error("Release not found in changeset status");
  process.exit(1);
}

console.log(release.newVersion);
