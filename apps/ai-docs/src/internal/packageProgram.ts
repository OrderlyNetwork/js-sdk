import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import { REPO_ROOT } from "./paths.js";

export type PackageTarget = {
  name: string;
  root: string;
  tsconfig: string;
};

/**
 * Create a TypeScript program for one package using strictest local tsconfig (§4.10 per-package boundary).
 */
export function createPackageProgram(target: PackageTarget): {
  program: ts.Program;
  packageAbs: string;
} {
  const packageAbs = path.join(REPO_ROOT, target.root);
  const configPath = ts.findConfigFile(packageAbs, ts.sys.fileExists, target.tsconfig);
  if (!configPath) {
    throw new Error(`No tsconfig at ${target.root}/${target.tsconfig}`);
  }
  const read = ts.readConfigFile(configPath, ts.sys.readFile.bind(ts.sys));
  if (read.error) {
    throw new Error(ts.flattenDiagnosticMessageText(read.error.messageText, "\n"));
  }
  const parsed = ts.parseJsonConfigFileContent(
    read.config,
    ts.sys,
    path.dirname(configPath),
    undefined,
    configPath,
  );
  const program = ts.createProgram({
    rootNames: parsed.fileNames.filter((f) => !f.includes("node_modules")),
    options: parsed.options,
    projectReferences: parsed.projectReferences,
  });
  return { program, packageAbs };
}

/**
 * Only source files belonging to this package's src tree.
 */
export function isPackageSourceFile(sf: ts.SourceFile, packageAbs: string) {
  const norm = sf.fileName.replace(/\\/g, "/");
  const root = packageAbs.replace(/\\/g, "/");
  return norm.startsWith(`${root}/src/`) && !norm.endsWith(".d.ts");
}

/**
 * Safely read package.json version for manifest.releaseVersion hint.
 */
export function readPackageVersion(packageAbs: string): string | null {
  try {
    const raw = fs.readFileSync(path.join(packageAbs, "package.json"), "utf8");
    const j = JSON.parse(raw) as { version?: string };
    return j.version ?? null;
  } catch {
    return null;
  }
}
