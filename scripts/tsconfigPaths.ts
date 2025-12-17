import { getPackages, Package } from "@manypkg/get-packages";
import fs from "fs-extra";
import * as jsonc from "jsonc-parser";
import path from "path";
import { CompilerOptions } from "typescript";

/**
 * Interface representing the structure of a tsconfig.json file.
 * Supports extending other configs and compiler options.
 */
interface TsConfig {
  extends?: string;
  compilerOptions: CompilerOptions;
  [key: string]: any;
}

/**
 * Main function to update the "paths" field in tsconfig.json files
 * for all packages in the monorepo to correctly reference local dependencies.
 */
async function main() {
  const { packages, packagesMap } = await getAllPackages();

  for (const pkg of packages) {
    // Get dependencies that belong to the "@veltodefi" scope
    const deps = getOrderlyDependencies(pkg.packageJson);
    const paths: CompilerOptions["paths"] = {};
    for (const dep of deps) {
      // Compute relative path from the current package to the dependency's source code
      const relativeDir = getDependencyRelativePath(pkg, packagesMap[dep]);

      if (relativeDir) {
        paths[dep] = [relativeDir];
      }
    }

    // If any paths were computed, update the tsconfig.json file accordingly
    if (Object.keys(paths).length) {
      const cwd = process.cwd();
      const tsConfigPath = path.join(cwd, pkg.relativeDir, "tsconfig.json");
      await updateTsConfigPaths(tsConfigPath, paths, pkg.relativeDir);
    }
  }
  console.log("Successfully updated tsconfig.json paths");
}

/**
 * Determines the relative path from a source package to a dependency package's source directory.
 * Returns undefined if the dependency is not inside the "packages" directory.
 */
function getDependencyRelativePath(srcPackage: Package, depPackage?: Package) {
  if (!depPackage?.relativeDir.startsWith("packages")) {
    return;
  }

  // For apps, dependencies are two levels up in the directory structure
  if (srcPackage.relativeDir.startsWith("apps")) {
    return path.join("../../", depPackage.relativeDir, "src");
  }

  // For packages, dependencies are one level up in the directory structure
  if (srcPackage.relativeDir.startsWith("packages")) {
    const pkgDir = depPackage.relativeDir.replace("packages/", "");
    return path.join("../", pkgDir, "src");
  }
}

/**
 * Extracts dependencies from package.json that belong to the "@veltodefi" scope.
 */
function getOrderlyDependencies(packageJson: Package["packageJson"]) {
  const allDependencies = {
    ...(packageJson.dependencies || {}),
    ...(packageJson.devDependencies || {}),
  };

  return Object.keys(allDependencies).filter((name) =>
    name.startsWith("@veltodefi/"),
  );
}

/**
 * Retrieves all packages in the current working directory monorepo,
 * returning both the list of packages and a map from package name to package info.
 */
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

/**
 * Reads and parses a tsconfig.json file, returning its content as a TsConfig object.
 * Handles JSON with comments (jsonc).
 */
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

/**
 * Updates the "paths" field in a tsconfig.json file at the given path.
 * If the tsconfig extends or references other configs, it resolves the correct file to update.
 * Merges new paths with existing ones and writes the updated config back to disk.
 */
async function updateTsConfigPaths(
  filePath: string,
  paths: CompilerOptions["paths"],
  relativeDir: string,
) {
  try {
    const jsonContent = await readTsConfig(filePath);
    if (jsonContent?.references && jsonContent.references.length > 0) {
      // If the tsconfig has references, update the referenced tsconfig instead
      const cwd = process.cwd();
      filePath = path.join(cwd, relativeDir, jsonContent.references[0].path);
    }
    if (jsonContent) {
      const content = await fs.readFile(filePath, "utf8");
      // Merge existing paths with new paths
      const newPaths = {
        ...jsonContent.compilerOptions?.paths,
        ...paths,
      };

      // Generate edits to update the paths field in the JSON content
      const edits = jsonc.modify(
        content,
        ["compilerOptions", "paths"],
        newPaths,
        {
          formattingOptions: { tabSize: 2, insertSpaces: true },
        },
      );
      // Apply edits and write updated content back to the file
      const newContent = jsonc.applyEdits(content, edits);
      await fs.writeFile(filePath, newContent, "utf8");
    }
  } catch (error) {
    console.error("Error writing JSON:", error);
  }
}

main();
