# Strategy of implementation

## Basic Principles

- Generated CSS is provided in a form that Vite can handle, rather than directly in the form of a JS module.  
  This allows the CSS to be minified and optimized by Vite, and also allows the CSS to be extracted into a separate file.
- Allow CSS to be generated per layer  
  Converting to module format will cause CSS rules to be sorted in the order in which modules are loaded.
- Three modes are available: `global`, `hoisted`, and `module`, which can be changed on a layer-by-layer basis.  
  The `global` mode generates CSS globally.  
  `hoisted` generates CSS by rolling up transitive imports to a module that directly imports Tailwind CSS.  
  `module` generates Tailwind CSS on a module-by-module basis.

## Design

Allow users of the plugin to use it as follows:

```ts
// vite.config.ts
import modularTailwindCSS from "vite-plugin-modular-tailwindcss";

export default {
  plugins: [
    modularTailwindCSS({
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
      excludes: [
        /\bnode_modules\b/,
      ],
    }),
  ],
};
```

```ts
// /project/component.ts

import { baseStyles } from "./styles";

import css from "#tailwindcss";

const styles = baseStyles + " bg-red-500 text-white";
```

Here, the imported "#tailwindcss" outputs something like this code:

```ts
// /project/component.ts#tailwindcss

import gl0 from "tailwind.global.layer0.css?inline";
import ll1 from "/project/component.ts#tailwind.layer1.css?inline";
import f0l2 from "/project/styles.ts#tailwind.layer2.css?inline";
import ll2 from "/project/component.ts#tailwind.layer2.css?inline";

// sorted in the order of the layers
const c = gl0 + ll1 + f0l2 + ll2;

export default c;
```

And "/project/component.ts#tailwind.layer1.css" is generated as follows:

```css
/* component.ts#tailwind.layer1.css */
@import url("./styles.ts#tailwind.layer1.css");

/* ... */
```
