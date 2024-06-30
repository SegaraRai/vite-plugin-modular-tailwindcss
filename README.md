# Vite Plugin Modular TailwindCSS

> [!WARNING]  
> **This plugin is currently experimental.**
> There are behavioral differences between build and development modes, and a breaking change is planned to address this issue (see issue [#17](https://github.com/SegaraRai/vite-plugin-modular-tailwindcss/issues/17)).
> While these differences should not affect typical projects, they may cause issues if your project depend on TailwindCSS classes exist in the virtual module.

This project offers a Vite plugin for integrating TailwindCSS in a modular manner, making it ideal for developing web components and UI libraries.

[![npm](https://img.shields.io/npm/v/vite-plugin-modular-tailwindcss)](https://www.npmjs.com/package/vite-plugin-modular-tailwindcss)
[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/SegaraRai/vite-plugin-modular-tailwindcss/publish.yaml?branch=main)](https://github.com/SegaraRai/vite-plugin-modular-tailwindcss/actions/workflows/publish.yaml)

## Table of Contents

1. [Motivation](#motivation)
2. [Features](#features)
3. [Quick Start](#quick-start)
4. [Advanced Configuration](#advanced-configuration)
   - [Layers](#layers)
     - [Layer Modes](#layer-modes)
       - [Global Mode](#global-mode)
       - [Hoisted Mode](#hoisted-mode)
       - [Module Mode](#module-mode)
       - [Global Filesystem Mode](#global-filesystem-mode)
   - [Handling Circular Dependencies](#handling-circular-dependencies)
5. [CSS Injection](#css-injection)
   - [Injection in JavaScript](#injection-in-javascript)
   - [Injection in HTML](#injection-in-html)
6. [Development Precautions](#development-precautions)
7. [Contributing](#contributing)
8. [License](#license)

## Motivation

TailwindCSS is a utility-first CSS framework that offers a vast array of utility classes for rapid prototyping and development.
When creating web components, each component must include its own stylesheets as per the encapsulation specification.
Directly importing TailwindCSS into components can result in a bloated CSS file that includes styles for all components in the project, leading to inefficiency.

A more efficient approach is to generate TailwindCSS styles on a per-component basis.
This method allows for a modular and tree-shakable design, optimizing performance and maintainability.
This plugin addresses this need by enabling the generation of TailwindCSS styles in a modular manner, making it ideal for creating web components and UI libraries.

To avoid duplication of common CSS such as `@tailwind base;`, the plugin supports three aggregation levels (global / globalFilesystem, hoist, and module) for each layer, ensuring efficient and organized style management.

Prior Art: [UnoCSS shadow-dom mode](https://unocss.dev/integrations/vite#shadow-dom)

## Features

- **Modular CSS Generation**: Generate TailwindCSS styles on a per-layer basis with four different modes (`global`, `globalFilesystem`, `hoisted`, and `module`), providing flexibility and efficiency.
- **Layer-aware Hierarchical Design**: Prevents order-dependent issues by generating and combining CSS layer by layer, ensuring consistent and predictable styling.
- **Optimized for Vite**: Supports minification and extraction of generated CSS into separate files, enhancing performance and maintainability.
- **Flexible Configuration**: Easily configure the plugin to include or exclude specific files or directories, allowing for precise control over which components generate TailwindCSS styles.
- **Virtual Module Loading**: Unlike regular TailwindCSS, this plugin can load virtual modules except for the `globalFilesystem` mode, enabling dynamic CSS handling and enhanced flexibility.

## Quick Start

Before you begin, ensure you have TailwindCSS installed in your project.
To install TailwindCSS, follow the instructions in the [TailwindCSS documentation](https://tailwindcss.com/docs/guides/vite).

Follow these steps to quickly set up and use the plugin in your project:

1. **Install the plugin:**

   Run one of the following commands in your project directory:

   ```sh
   # npm
   npm install vite-plugin-modular-tailwindcss --save-dev

   # yarn
   yarn add vite-plugin-modular-tailwindcss --dev

   # pnpm
   pnpm add vite-plugin-modular-tailwindcss --save-dev
   ```

2. **Add the plugin to your `vite.config.ts` file:**

   No configuration is needed for basic usage.

   ```ts
   // vite.config.ts

   import modularTailwindCSS from "vite-plugin-modular-tailwindcss";

   export default {
     plugins: [modularTailwindCSS()],
   };
   ```

3. **Add the type reference to your `vite-env.d.ts` file:**

   This step is only necessary if you are using TypeScript.

   ```ts
   // vite-env.d.ts

   /// <reference types="vite/client" />
   /// <reference types="vite-plugin-modular-tailwindcss/client" />
   ```

4. **Use TailwindCSS in your components:**

   Import the `#tailwindcss` module in your component files to generate TailwindCSS styles.

   ```ts
   // src/component.ts

   import css from "#tailwindcss";

   import { textBlack } from "./styles";
   // -> textBlack: "text-black"

   const styles = textBlack + " whitespace-nowrap";
   // -> styles: "text-black whitespace-nowrap"

   console.log(css);
   // -> Output: "/* ...reset css... */ .text-black{--tw-text-opacity:1;color:rgb(0 0 0 / var(--tw-text-opacity))}.whitespace-nowrap{white-space:nowrap}"
   ```

## Advanced Configuration

You can pass an optional configuration to the plugin to customize its behavior.

```ts
// vite.config.ts

import modularTailwindCSS from "vite-plugin-modular-tailwindcss";

export default {
  plugins: [
    modularTailwindCSS({
      configPath: "./tailwind.config.js",
      layers: [
        { mode: "global", code: "@tailwind base;" },
        { mode: "hoisted", code: "@tailwind components;" },
        { mode: "module", code: "@tailwind utilities;" },
      ],
      excludes: [
        /^\0/,
        /^(?:browser-external|dep|virtual):/,
        /\bnode_modules\b/,
        /\.(?:css|scss|sass|less|styl|stylus|pcss|sss|svg)(?:\?|$)/,
      ],
      globCWD: process.cwd(),
      allowCircularModules: false,
    }),
  ],
};
```

### Layers

A layer is a collection of CSS code that is generated and combined in a specific order. Each layer should have exactly one `@tailwind` directive, but it can also include other CSS code.

> [!CAUTION]  
> Avoid specifying multiple `@tailwind` directives in a single layer.
> Layers are generated on a per-file basis and then merged, so the ordering relationships within layers are not maintained.
> This can result in unexpected ordering of CSS rules.

You can specify whether a layer is included at build time or at development time.
Specify `apply: "build"` for layers to be included only at build time, and `apply: "serve"` for layers to be included only at development time.
If `apply` is not specified, the layer will be included at both build and development times.

### Layer Modes

A layer can be generated in one of four modes: `global`, `globalFilesystem`, `hoisted`, or `module`.

> [!IMPORTANT]  
> Layer modes are only available during the build process and are not available during development.
> Refer to the [Development Precautions](#development-precautions) section for more information.

### Global Mode

New in version 0.3.0.

The `global` mode scans the loaded modules (including virtual modules if not excluded) and generates the CSS for the specified layer.

By delaying the generation of CSS until the results of Rollup's [getModuleIds](https://rollupjs.org/plugin-development/#this-getmoduleids) become stable, a list of referenced modules can be obtained.
Rollup is asked to resolve the dependencies of all loaded modules (excluding those that are not in `excludes`), and the list of module IDs is retrieved again to check for changes.
By repeating this process until there are no changes, a complete list of referenced modules is obtained.

### Hoisted Mode

The `hoisted` mode resolves the dependency graph of the importer and collects all the code from the importer and its dependencies, generating CSS for the entire collection of code.

### Module Mode

The `module` mode scans the importer and generates the CSS for the specified layer, performing the same process recursively for the importer dependencies.
The CSS is then imported recursively, creating a dependency graph identical to the importer's dependency graph and concatenated at runtime.

The difference between the `hoisted` and `module` modes is that in the `module` mode, the module graph is maintained, and CSS is concatenated at runtime, while in the `hoisted` mode, the dependency graph is resolved, and the entire CSS is generated at build time.

> [!NOTE]  
> If you have circular dependencies, using the `module` mode may result in a `ReferenceError` during runtime.
> Refer to the [Handling Circular Dependencies](#handling-circular-dependencies) section for more information.

### Global Filesystem Mode

The `globalFilesystem` mode scans the files specified in the `content` option and generates the CSS for the specified layer.
This is similar to `import css from "./myTailwind.css";`, where `myTailwind.css` contains `@tailwind` directives.

The `content` can be set either in the layer options or in the TailwindCSS configuration file.

Prior to version 0.3.0, the `globalFilesystem` mode was named `global` mode.

> [!NOTE]  
> The `globalFilesystem` mode does not support loading virtual modules.

## Handling Circular Dependencies

While it's best to avoid circular dependencies, this plugin does support them.
If the module importing `#tailwindcss` or `#tailwindcss/inject` has no circular dependencies in its recursive dependencies, everything will work fine.

If circular dependencies do exist, the necessary action depends on the layer mode you're using:

- **Global or Hoisted Mode**: Dependencies are resolved at build time, so no action is needed.
- \*\*

Module Mode\*\*: Dependencies are resolved at runtime, which may lead to a `ReferenceError`.

Even one layer in `module` mode (which is the default configuration) can cause this issue.
To address circular dependency issues in module mode, set the `allowCircularModules` option to `true`.
This will wrap the export in a function, delaying the CSS combining. Be aware that enabling this option slightly increases bundle size and may impact performance.

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
Thus, we provide an alternative, lightweight plugin for development. This alternative plugin concatenates the contents of the layers into one and lets Vite's native PostCSS and TailwindCSS plugins handle it.
Users can still import `#tailwindcss` and `#tailwindcss/inject`, but their contents will be replaced with a reference to the global TailwindCSS styles.

Since it uses native PostCSS and TailwindCSS, `postcss.config.js` and `tailwind.config.js` must be configured for this plugin to function during development.

> [!TIP]  
> The `apply` option in the layer configuration specifies whether a layer is included at build time (`apply: "build"`) or at development time (`apply: "serve"`).
> If `apply` is not specified, the layer will be included at both build and development times.

## Contributing

Contributions are welcome!
Please feel free to open an issue for any bug or feature request.
Pull requests are also welcome.

## License

This project is licensed under the MIT License.
See the [LICENSE](https://github.com/SegaraRai/vite-plugin-modular-tailwindcss/blob/main/LICENSE) file for details.
