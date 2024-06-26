# Vite Plugin Modular TailwindCSS

This project provides a Vite plugin for integrating TailwindCSS in a modular fashion, suitable for creating web components and UI libraries.

[![npm](https://img.shields.io/npm/v/vite-plugin-modular-tailwindcss)](https://www.npmjs.com/package/vite-plugin-modular-tailwindcss)
[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/SegaraRai/vite-plugin-modular-tailwindcss/publish.yaml?branch=main)](https://github.com/SegaraRai/vite-plugin-modular-tailwindcss/actions/workflows/publish.yaml)

## Table of Contents

1. [Motivation](#motivation)
2. [Features](#features)
3. [Installation](#installation)
4. [Usage](#usage)
   - [Basic Configuration](#basic-configuration)
   - [Example](#example)
5. [Layer Modes](#layer-modes)
   - [Global Mode](#global-mode)
   - [Hoisted Mode](#hoisted-mode)
   - [Module Mode](#module-mode)
6. [CSS Injection](#css-injection)
   - [Injection in JavaScript](#injection-in-javascript)
   - [Injection in HTML](#injection-in-html)
7. [Development Precautions](#development-precautions)
8. [Contributing](#contributing)
9. [License](#license)

## Motivation

TailwindCSS is a utility-first CSS framework that offers a wide range of utility classes for rapid prototyping and development.
When building web components, it is essential to encapsulate styles within the component itself.
Directly importing TailwindCSS into the component can lead to a bloated CSS file that includes styles for all components in the project.
A more efficient approach is to generate TailwindCSS styles on a per-component basis, allowing for a modular and tree-shakable design.
This plugin provides a solution for generating TailwindCSS styles in a modular manner, ideal for creating web components and UI libraries.
To prevent duplication of common CSS like `@tailwind base;`, three aggregation levels (`global`, `hoist`, and `module`) can be set for each layer.

Prior Art: [UnoCSS shadow-dom mode](https://unocss.dev/integrations/vite#shadow-dom)

## Features

- **Modular CSS Generation**: Generate TailwindCSS styles on a per-layer basis with different modes (`global`, `hoisted`, and `module`) for each layer.
- **Layer-aware Hierarchical Design**: Prevents order-dependent issues by generating and combining CSS on a layer-by-layer basis.
- **Optimized for Vite**: Supports minification and extraction of generated CSS into separate files.
- **Flexible Configuration**: Easily configure the plugin to include or exclude specific files or directories, and define custom TailwindCSS layers and modes.

## Installation

To install the plugin, run one of the following commands in your project directory:

```sh
# npm
npm install vite-plugin-modular-tailwindcss --save-dev

# yarn
yarn add vite-plugin-modular-tailwindcss --dev

# pnpm
pnpm add vite-plugin-modular-tailwindcss --save-dev
```

## Usage

### Basic Configuration

Add the plugin to your `vite.config.ts` file and configure it according to your needs:

```ts
// vite.config.ts
import modularTailwindCSS from "vite-plugin-modular-tailwindcss";

export default {
  plugins: [
    modularTailwindCSS({
      // layers: optional. The default configuration is shown below.
      layers: [
        {
          mode: "global",
          code: "@tailwind base;",
        },
        {
          mode: "hoisted",
          code: "@tailwind components;",
        },
        {
          mode: "module",
          code: "@tailwind utilities;",
        },
      ],
      // `excludes`: optional. The default configuration is shown below.
      // Specifies the files or directories to exclude from the CSS generation.
      excludes: [/\bnode_modules\b/],
    }),
  ],
};
```

### Example

Here's how you might use the plugin in your components:

```ts
// src/component.ts
import css from "#tailwindcss";

import { textWhite } from "./styles";
// -> textWhite: "text-white"

const styles = textWhite + " bg-red-500";
// -> styles: "text-white bg-red-500"

console.log(css);
// -> Output: "/* ...reset css... */ .text-white{--tw-text-opacity:1;color:#fff}.bg-red-500{background-color:#dc2626}"
```

## Layer Modes

The plugin supports three modes for generating TailwindCSS styles: `global`, `hoisted`, and `module`.

These modes are only available during the build process and are not available during development.
See the [Development Precautions](#development-precautions) section for more information.

### Global Mode

The `global` mode scans the files specified in the `content` option and generates the CSS for the specified layer.
This is similar to `import css from "./myTailwind.css";`, where `myTailwind.css` contains `@tailwind base;`.

`content` can be set either in the layer options or in the `tailwind.config.js` file.
It is not possible to set the `content` automatically, as it must be generated before the list of codes used by Vite becomes available.

### Hoisted Mode

The `hoisted` mode resolves the dependency graph of the importer and collects all the code from the importer and its dependencies, generating CSS for the entire collection of code.

### Module Mode

The `module` mode scans the importer and generates the CSS for the specified layer, performing the same process recursively for the importer dependencies.
The CSS is then imported recursively, creating a dependency graph identical to the importer's dependency graph and concatenated at runtime.

The difference between the `hoisted` and `module` modes is that in the `module` mode, the module graph is maintained, and CSS is concatenated at runtime, while in the `hoisted` mode, the dependency graph is resolved, and the entire CSS is generated at build time.

## CSS Injection

### Injection in JavaScript

This plugin is primarily for inlining rather than injecting CSS, but it can also be used to inject CSS into the document.
To do so, import the `#tailwindcss/inject` module in your script.

```ts
import "#tailwindcss/inject";
```

### Injection in HTML

To use TailwindCSS in HTML, you can use the `?tailwindcss/inject-shallow` import.

```html
<script type="module" src="?tailwindcss/inject-shallow"></script>
```

Here, `inject` means injecting CSS into the document instead of inlining it, and `shallow` means not tracing dependencies.
Since HTML usually loads the main script, not specifying `shallow` may unintentionally generate and inject TailwindCSS for the whole project.

## Development Precautions

During development (`serve` mode, when running `npm run vite`), some Vite features are restricted, preventing the real plugin from running.
Therefore, we provide an alternative, lightweight plugin for development.
This alternative plugin concatenates the contents of the layers into one and lets Vite's native PostCSS and TailwindCSS plugins handle it.
Users can still import `#tailwindcss` and `#tailwindcss/inject`, but their contents will be replaced with a reference to the global TailwindCSS styles.

Since it uses native PostCSS and TailwindCSS, `postcss.config.js` and `tailwind.config.js` must be configured for this plugin to function during development.

## Contributing

Contributions are welcome!
Please feel free to open an issue for any bug or feature request.
Pull requests are also welcome.

## License

This project is licensed under the MIT License.
See the [LICENSE](LICENSE) file for details.
