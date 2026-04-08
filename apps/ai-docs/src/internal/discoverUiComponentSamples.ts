import fs from "node:fs";
import path from "node:path";
import fg from "fast-glob";
import type { ComponentSample } from "./extractComponents.js";

/**
 * Discover UI packages: `packages/ui` and every `packages/ui-*` folder, then collect TSX under `src/`.
 */
export function discoverUiComponentSamples(repoRoot: string): ComponentSample[] {
  const packagesDir = path.join(repoRoot, "packages");
  const out: ComponentSample[] = [];

  for (const ent of fs.readdirSync(packagesDir, { withFileTypes: true })) {
    if (!ent.isDirectory()) continue;
    const dirName = ent.name;
    if (dirName !== "ui" && !dirName.startsWith("ui-")) continue;

    const root = `packages/${dirName}`;
    const abs = path.join(repoRoot, root);
    const pjPath = path.join(abs, "package.json");
    if (!fs.existsSync(pjPath)) continue;

    const pkg = JSON.parse(fs.readFileSync(pjPath, "utf8")) as { name: string };
    const tsBuild = path.join(abs, "tsconfig.build.json");
    const tsDefault = path.join(abs, "tsconfig.json");
    const tsconfig = fs.existsSync(tsBuild)
      ? "tsconfig.build.json"
      : fs.existsSync(tsDefault)
        ? "tsconfig.json"
        : null;
    if (!tsconfig) continue;

    const files = fg.sync("src/**/*.tsx", {
      cwd: abs,
      absolute: false,
      ignore: [
        "**/*.stories.tsx",
        "**/*.test.tsx",
        "**/*.spec.tsx",
        "**/node_modules/**",
      ],
    }) as string[];

    if (!files.length) continue;

    out.push({
      name: pkg.name,
      root,
      tsconfig,
      files: files.sort(),
    });
  }

  out.sort((a, b) => a.name.localeCompare(b.name));
  return out;
}

/**
 * Merge auto UI samples with allowlist entries (union files per `root`, later wins on metadata from first occurrence).
 */
export function mergeComponentSamples(
  primary: ComponentSample[],
  extra: ComponentSample[],
): ComponentSample[] {
  const byRoot = new Map<string, ComponentSample>();

  const add = (s: ComponentSample) => {
    const cur = byRoot.get(s.root);
    if (!cur) {
      byRoot.set(s.root, {
        name: s.name,
        root: s.root,
        tsconfig: s.tsconfig,
        files: [...s.files],
      });
    } else {
      const set = new Set([...cur.files, ...s.files]);
      byRoot.set(s.root, {
        ...cur,
        files: [...set].sort(),
      });
    }
  };

  for (const s of primary) add(s);
  for (const s of extra) add(s);

  return [...byRoot.values()].sort((a, b) => a.name.localeCompare(b.name));
}
