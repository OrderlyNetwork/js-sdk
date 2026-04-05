---
name: migrate-package-to-standalone
description: Migrates a monorepo sub-package to a standalone package (copy with excludes, then apply config changes).
disable-model-invocation: true
---

# Migrate Subpackage to Standalone

**When to use:** This skill has `disable-model-invocation: true`; it is only run when the user explicitly invokes `/migrate-package-to-standalone`.

---

## Required inputs

Before running, obtain from the user or conversation:

| Input                     | Description                                                       | Example                                                               |
| ------------------------- | ----------------------------------------------------------------- | --------------------------------------------------------------------- |
| **Source directory**      | Subpackage root to migrate (monorepo path)                        | `packages/trading-leaderboard`                                        |
| **Destination directory** | Root where the standalone package will live; all rules apply here | Same as source = in-place; else e.g. `standalone/trading-leaderboard` |

All paths in the steps below are relative to the **destination (target)** directory.

---

## Workflow

### If source ≠ destination

1. **Copy phase:** Copy the source directory to the destination. While copying, **exclude** (do not copy):
   - `.git/`
   - `node_modules/`
   - `dist/`
   - `babel.config.js`
   - `CHANGELOG.md`
     (The destination is typically a new repo; the user can run `git init` there if needed.)
2. **Modify phase:** Apply rules 1–9 below in the destination directory.

### If source = destination (in-place)

1. Delete `babel.config.js` and `CHANGELOG.md` if they exist.
2. Apply rules 1–9 below in the destination directory.

---

## Rule 1: Add .gitignore

- In the destination root, add a `.gitignore` file.
- **Content:** Copy from this skill’s template. Read the file at **`.cursor/skills/migrate-package-to-standalone/templates/.gitignore`** (relative to the workspace root) and write its contents to the destination’s `.gitignore`.

---

## Rule 2: Move @orderly.network deps to peerDependencies

In `package.json`:

- Move every dependency whose name starts with `@orderly.network` from `dependencies` to `peerDependencies`.
- Replace `workspace:*` with a version range (e.g. `^x.y.z` or `>=x.y.z`) compatible with published versions. Get versions only from published npm (or your team’s published prerelease tags when applicable).
- Leave non-`@orderly.network` dependencies in `dependencies`.

Example:

```json
// Before (dependencies)
"@orderly.network/ui": "workspace:*",

// After: remove from dependencies, add to peerDependencies
"peerDependencies": {
  "@orderly.network/ui": "^2.0.0",
  ...
}
```

---

## Rule 3: package.json publish fields and Babel cleanup

When `babel.config.js` was removed (copy exclude or in-place delete):

- Remove from **devDependencies** any Babel packages that only existed for that file, typically: `@babel/core`, `@babel/preset-env`, `@babel/preset-typescript`.

Recommended for standalone publish flow:

- Add **`"prepublishOnly": "pnpm build"`** (or equivalent if the package uses a different package manager) so publishing always runs a fresh build.
- Expand **`files`** beyond `"dist"` when you want npm tarballs to include metadata consumers expect, e.g. `["dist", "package.json", "README.md"]`. Monorepo packages often list only `"dist"`; adjust as needed.

---

## Rule 4: TypeScript — single `tsconfig.json` and `tsup`

### Monorepo pattern (what you are leaving behind)

- **`tsconfig.json`** may only `extends` `./tsconfig.build.json` and add **`compilerOptions.paths`** pointing at sibling packages for local development.
- **`tsconfig.build.json`** may `extends` a workspace package such as `tsconfig/react-library.json` and include **`compilerOptions.typeRoots`**.

### Standalone target

- Use **one** root **`tsconfig.json`** that **`extends`**: `"@orderly.network/ts-config/react-library.json"`.
- Add to **devDependencies**: `"@orderly.network/ts-config": "<version>"`. Use a version from the monorepo root, other packages, or published npm.
- **Remove** from **devDependencies** the monorepo workspace **`tsconfig`** entry (e.g. `"tsconfig": "workspace:*"`). It is replaced by `@orderly.network/ts-config`.
- **Remove** the monorepo-only **`compilerOptions.paths`** (consumers resolve `@orderly.network/*` from `node_modules`).
- **`compilerOptions.typeRoots`:** Usually **drop** it when it only mirrored monorepo defaults (`./node_modules/@types` plus `./src/@types` with no real custom declarations). If the package relies on **custom ambient types** under e.g. **`./src/@types`**, **keep** or **re-add** `typeRoots` (e.g. `["./node_modules/@types", "./src/@types"]`) so TypeScript still resolves those files.
- **Delete `tsconfig.build.json`** after merging any still-needed `include` / `exclude` / `compilerOptions` into `tsconfig.json`.

### `tsup.config.ts`

- If it had **`tsconfig: "tsconfig.build.json"`**, remove that field (tsup defaults to **`tsconfig.json`**) or set **`tsconfig: "tsconfig.json"`** explicitly.

Example `tsconfig.json`:

```json
{
  "extends": "@orderly.network/ts-config/react-library.json",
  "include": ["./src/**/*.ts", "./src/**/*.tsx"],
  "exclude": [
    "dist",
    "build",
    "node_modules",
    "**/*.test.tsx",
    "**/*.test.ts",
    "**/*.test.js",
    "**/*.spec.tsx",
    "**/*.spec.ts",
    "**/*.spec.js",
    "**/*.stories.tsx"
  ],
  "compilerOptions": {
    "jsx": "react-jsx",
    "sourceMap": false,
    "module": "esnext",
    "outDir": "dist",
    "declarationDir": "types",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "moduleResolution": "node"
  }
}
```

(Default: omit `typeRoots` unless the package needs `./src/@types` or equivalent custom type roots.)

---

## Rule 5: tailwind.config.cjs presets

- **If** the package has a `tailwind.config.cjs` that references a local UI preset, replace that preset with the package reference:
  - From: `presets: [require(path.resolve(__dirname, "../ui/tailwind.config.js"))]`
  - To: `presets: [require("@orderly.network/ui/tailwind.config.js")]`
- If `const path = require("path");` is no longer used in the file, remove it.

Example:

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,js,tsx,jsx,mdx}"],
  presets: [require("@orderly.network/ui/tailwind.config.js")],
};
```

---

## Rule 6: Tailwind CSS build — extra devDependencies when needed

If **`pnpm run build:css`** (or equivalent) fails because a **plugin** required by `@orderly.network/ui`’s Tailwind preset is not installed in the standalone repo (e.g. missing module `tailwindcss-animate`), add that package to **devDependencies** so the CLI can resolve it.

---

## Rule 7: Optional — `tsup` code splitting

Some packages set **`splitting: true`** in `tsup` when the bundle uses **dynamic `import()`** or ships **separate chunks** (e.g. per-locale files). Others keep **`splitting: false`**. **Do not assume** the monorepo value is always correct for standalone—e.g. a package may move from **`splitting: false`** to **`true`** when adding locale chunks. Preserve the old value only when output layout should stay the same; enable splitting when chunking is required.

---

## Rule 8: Optional — in-package i18n

If a package stops relying solely on centralized locale data and **vendors translations** under something like **`src/i18n`** (locales + small provider glue), that is **package-specific**—not mandatory for every migration. Use prior art (e.g. a migrated `trading-leaderboard` standalone repo) only as a reference.

---

## Rule 9: Add .gitlab-ci.yml

- In the destination root, add a `.gitlab-ci.yml` file.
- **Content:** Copy from this skill’s template. Read the file at **`.cursor/skills/migrate-package-to-standalone/templates/.gitlab-ci.yml`** (relative to the workspace root) and write its contents to the destination’s `.gitlab-ci.yml`.

---

## Checklist

After migration, verify:

- [ ] Source and destination paths are confirmed.
- [ ] If source ≠ destination: copy was done with exclusions (.git, node_modules, dist, babel.config.js, CHANGELOG.md).
- [ ] If source = destination: babel.config.js and CHANGELOG.md were removed.
- [ ] `.gitignore` and `.gitlab-ci.yml` exist in the destination root.
- [ ] All `@orderly.network` deps are in peerDependencies with version ranges (no workspace:\*).
- [ ] devDependencies includes `@orderly.network/ts-config` and no longer lists workspace **`tsconfig`**.
- [ ] Single root `tsconfig.json` extends `@orderly.network/ts-config/react-library.json`, has no monorepo `paths`; `typeRoots` is removed unless custom `./src/@types` (or equivalent) still requires it.
- [ ] `tsconfig.build.json` removed (or not used); `tsup.config.ts` does not point at a removed `tsconfig.build.json`.
- [ ] Babel-only devDependencies removed if `babel.config.js` was dropped.
- [ ] `prepublishOnly` and `files` in `package.json` match your publish expectations.
- [ ] `tailwind.config.cjs` uses `presets: [require("@orderly.network/ui/tailwind.config.js")]`.
- [ ] If `build:css` failed on a missing Tailwind plugin, the plugin was added to devDependencies.
