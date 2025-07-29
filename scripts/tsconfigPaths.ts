import { getPackages, Package } from "@manypkg/get-packages";
import fs from "fs-extra";
import * as jsonc from "jsonc-parser";
import path from "path";
import { CompilerOptions } from "typescript";

interface TsConfig {
  extends?: string;
  compilerOptions: CompilerOptions;
  [key: string]: any;
}

async function main() {
  const { packages, packagesMap } = await getAllPackages();

  for (const pkg of packages) {
    const deps = getOrderlyDependencies(pkg.packageJson);
    const paths: CompilerOptions["paths"] = {};
    for (const dep of deps) {
      const relativeDir = getDependencyRelativePath(pkg, packagesMap[dep]);

      if (relativeDir) {
        paths[dep] = [relativeDir];
      }
    }

    if (Object.keys(paths).length) {
      const cwd = process.cwd();
      const tsConfigPath = path.join(cwd, pkg.relativeDir, "tsconfig.json");
      await updateTsConfigPaths(tsConfigPath, paths, pkg.relativeDir);
    }
  }
  console.log("Successfully updated tsconfig.json paths");
}

function getDependencyRelativePath(srcPackage: Package, depPackage?: Package) {
  if (!depPackage?.relativeDir.startsWith("packages")) {
    return;
  }

  if (srcPackage.relativeDir.startsWith("apps")) {
    return path.join("../../", depPackage.relativeDir, "src");
  }

  if (srcPackage.relativeDir.startsWith("packages")) {
    const pkgDir = depPackage.relativeDir.replace("packages/", "");
    return path.join("../", pkgDir, "src");
  }
}

function getOrderlyDependencies(packageJson: Package["packageJson"]) {
  const allDependencies = {
    ...(packageJson.dependencies || {}),
    ...(packageJson.devDependencies || {}),
  };

  return Object.keys(allDependencies).filter((name) =>
    name.startsWith("@orderly.network/"),
  );
}

async function getAllPackages() {
  const cwd = process.cwd();
  const packages = await getPackages(cwd);
  const pkgs = packages.packages;
  const packagesMap: Record<string, Package> = {};

  pkgs.forEach((pkg) => {
    packagesMap[pkg.packageJson.name] = pkg;
  });

  return { packages: pkgs, packagesMap };
}

async function readTsConfig(filePath: string) {
  try {
    if (!(await fs.exists(filePath))) {
      return;
    }
    const content = await fs.readFile(filePath, "utf8");
    const jsonContent = jsonc.parse(content) as TsConfig;
    return jsonContent;
  } catch (error) {
    console.error("Error reading JSON:", error);
  }
}

async function updateTsConfigPaths(
  filePath: string,
  paths: CompilerOptions["paths"],
  relativeDir: string,
) {
  try {
    const jsonContent = await readTsConfig(filePath);
    if (jsonContent?.references && jsonContent.references.length > 0) {
      const cwd = process.cwd();
      filePath = path.join(cwd, relativeDir, jsonContent.references[0].path);
    }
    if (jsonContent) {
      const content = await fs.readFile(filePath, "utf8");
      const newPaths = {
        ...jsonContent.compilerOptions?.paths,
        ...paths,
      };

      const edits = jsonc.modify(
        content,
        ["compilerOptions", "paths"],
        newPaths,
        {
          formattingOptions: { tabSize: 2, insertSpaces: true },
        },
      );
      const newContent = jsonc.applyEdits(content, edits);
      await fs.writeFile(filePath, newContent, "utf8");
    }
  } catch (error) {
    console.error("Error writing JSON:", error);
  }
}

main();
