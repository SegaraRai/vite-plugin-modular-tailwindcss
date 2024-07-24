# vite-plugin-modular-tailwindcss

## 0.4.0

### Minor Changes

- 42bcae0: New strict version for serve plugin

### Patch Changes

- 10d6a4d: Use relative paths for virtual module ids.
- 6c2d028: Allow changing the delimiter and filename prefix.
  Now the virtual modules are prefixed with "mtw." by default.

## 0.3.0

### Minor Changes

- 3b91ce6: BREAKING CHANGE: Introduce a new `global` mode that automatically retrieves content and rename the existing `global` mode to `globalFilesystem` mode.

### Patch Changes

- edec0ad: Set the `provenance` field in `package.json` to prevent accidentally publishing the package on a local machine.

## 0.2.4

### Patch Changes

- 2e1e634: Warn when circular dependencies found and may not handled correctly.

## 0.2.3

### Patch Changes

- dcdd024: Fix provenance not attached

## 0.2.1

### Patch Changes

- bfe2962: Fix publish script
- ff9b058: Publish package with provenance

## 0.2.0

### Minor Changes

- ddfbf1d: Handle circular dependencies in module mode layers.
- ced35ec: Changed default `excludes` option.

### Patch Changes

- 9f87d55: Prefixed virtual module ids with "\0".

## 0.1.2

### Patch Changes

- e6c0137: Fix tag not created

## 0.1.1

### Patch Changes

- bc3d8f5: Add keywords to package.json

## 0.1.0

### Minor Changes

- ac6fa26: Initial release
