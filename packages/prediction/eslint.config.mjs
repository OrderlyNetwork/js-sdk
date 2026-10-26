import { fileURLToPath } from "node:url";
import rootConfig from "../../eslint.config.mjs";

// Package-local config — keep until the shared config supports per-package
// Tailwind settings, then fold this back into the root eslint.config.mjs and
// delete this file.
//
// Why this file must exist:
// - `pnpm lint` here runs ESLint with cwd = packages/prediction, and flat-config
//   resolution picks the nearest eslint.config.* — this file wins over the root
//   one. This is the only package in the monorepo with its own lint script, so
//   scoping the fix here affects nothing else.
// - The tailwind plugin's automatic config discovery returns a RELATIVE path,
//   which tailwind-api-utils fails to resolve (it resolves against "."), so any
//   tailwind rule that loads the class API crashes the whole lint run. Always
//   been broken; only surfaced here because no other package lints from its own
//   directory.
//
// Why the override cannot live in the root config:
// - Pinning this package's tailwind.config.cjs at the root would validate every
//   other package's classes against the wrong config (false "unknown class"
//   errors). And @orderly.network/eslint-config is installed from npm at a
//   fixed version (not a workspace package), so fixing it there means a release.
//
// How it stays in sync with the root config:
// - Rules are spread from the root config (`...rootConfig`) at runtime; only
//   the tailwind settings override is package-local.
export default [
  ...rootConfig,
  {
    settings: {
      tailwindcss: {
        config: fileURLToPath(
          new URL("./tailwind.config.cjs", import.meta.url),
        ),
      },
    },
  },
];
