// @ts-expect-error No types for this file
import pkgResolveConfigPath from "tailwindcss/lib/util/resolveConfigPath.js";

const { resolveDefaultConfigPath } = pkgResolveConfigPath;

export function resolveDefaultTailwindConfigPath(): string {
  const configPath = resolveDefaultConfigPath();
  if (!configPath) {
    throw new Error(
      "Could not resolve default Tailwind CSS config path. Please make sure that tailwind.config.js exists in the root directory of your project, or specify a path to the config file in the `configPath` option."
    );
  }

  return configPath;
}
