import { getPackages } from "@manypkg/get-packages";
import fs from "fs-extra";
import path from "path";

// Template for the version file content that declares a global window property
// to store package version information, and exports the version as default.
const VERSION_TEMPLATE = `declare global {
  interface Window {
      __ORDERLY_VERSION__?: {
          [key: string]: string;
      };
  }
}
if (typeof window !== "undefined") {
  window.__ORDERLY_VERSION__ = window.__ORDERLY_VERSION__ || {};
  window.__ORDERLY_VERSION__["{{name}}"] = "{{version}}";
}

export default "{{version}}";
`;

// Generate the version file content by replacing placeholders with actual name and version.
function generateVersionFile(name: string, version: string) {
  return VERSION_TEMPLATE.replace(/{{name}}/g, name).replace(
    /{{version}}/g,
    version,
  );
}

// Retrieve all public (non-private) packages in the current working directory.
async function getPublicPackages() {
  const cwd = process.cwd();
  const packages = await getPackages(cwd);

  return packages.packages.filter((pkg) => !pkg.packageJson.private);
}

// generate version.ts files for each public package with a src directory.
async function main() {
  const publicPackages = await getPublicPackages();

  for (const pkg of publicPackages) {
    const versionContent = generateVersionFile(
      pkg.packageJson.name,
      pkg.packageJson.version,
    );

    const srcDir = path.join(pkg.dir, "src");
    // only write version file if src directory exists
    if (await fs.exists(srcDir)) {
      const versionFilePath = path.join(srcDir, "version.ts");
      await fs.writeFile(versionFilePath, versionContent);
    }
  }
}

main();
