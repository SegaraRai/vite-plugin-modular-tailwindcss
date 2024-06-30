import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";

interface ChangesetStatus {
  changesets: unknown[];
  releases: { name: string; newVersion: string }[];
}

spawnSync("pnpm", ["changeset", "status", "--output", "changeset-status.json"]);

const changesetStatus = JSON.parse(
  await readFile("changeset-status.json", "utf8")
) as ChangesetStatus;
const release = changesetStatus.releases.find(
  (release) => release.name === "vite-plugin-modular-tailwindcss"
);

if (release) {
  console.log(release.newVersion);
} else {
  console.error("Not ready for release yet.");
}
