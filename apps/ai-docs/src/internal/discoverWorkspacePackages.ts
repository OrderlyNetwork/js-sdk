import fs from "node:fs";
import path from "node:path";
import { REPO_ROOT } from "./paths.js";
import type { PackageTarget } from "./packageProgram.js";

/**
 * Auto-discover extractable workspace packages under `packages/*`.
 * Mirrors pnpm layout; avoids hand-maintaining one row per package in allowlist.
 */
export function discoverWorkspacePackages(opts: {
  excludePackages: Set<string>;
}): PackageTarget[] {
  const packagesDir = path.join(REPO_ROOT, "packages");
  const out: PackageTarget[] = [];

  for (const ent of fs.readdirSync(packagesDir, { withFileTypes: true })) {
    if (!ent.isDirectory()) continue;
    const dir = ent.name;
    const root = `packages/${dir}` as const;
    const abs = path.join(REPO_ROOT, root);
    const pjPath = path.join(abs, "package.json");
    if (!fs.existsSync(pjPath)) continue;

    const pkg = JSON.parse(fs.readFileSync(pjPath, "utf8")) as { name?: string };
    const name = pkg.name;
    if (!name || opts.excludePackages.has(name)) continue;

    /* Generator expects TS sources */
    if (!fs.existsSync(path.join(abs, "src"))) continue;

    const tsBuild = path.join(abs, "tsconfig.build.json");
    const ts = path.join(abs, "tsconfig.json");
    let tsconfig: string | null = null;
    if (fs.existsSync(tsBuild)) tsconfig = "tsconfig.build.json";
    else if (fs.existsSync(ts)) tsconfig = "tsconfig.json";
    if (!tsconfig) continue;

    out.push({ name, root, tsconfig });
  }

  out.sort((a, b) => a.name.localeCompare(b.name));
  return out;
}

/**
 * Merge discovered targets with explicit overrides from allowlist (explicit wins per `root`).
 */
export function mergePackageTargets(
  discovered: PackageTarget[],
  explicit: PackageTarget[],
): PackageTarget[] {
  const byRoot = new Map<string, PackageTarget>();
  for (const d of discovered) byRoot.set(d.root, d);
  for (const e of explicit) byRoot.set(e.root, e);
  return [...byRoot.values()].sort((a, b) => a.name.localeCompare(b.name));
}
