const { getPackages } = require("@manypkg/get-packages");
const { shouldSkipPackage } = require("@changesets/should-skip-package");
const { getChangedPackagesSinceRef } = require("@changesets/git");
const writeChangeset = require("@changesets/write");
const { read } = require("@changesets/config");

function main() {
  generateChangeset();
}

async function generateChangeset() {
  const cwd = process.cwd();
  const config = await read(cwd);
  const packages = await getPackages(cwd);

  const versionablePackages = packages.packages.filter(
    (pkg) =>
      !shouldSkipPackage(pkg, {
        ignore: config.ignore,
        allowPrivatePackages: config.privatePackages.version,
      })
  );

  const changedPackagesNames = versionablePackages.map(
    (pkg) => pkg.packageJson.name
  );

  const releases = changedPackagesNames.map((name) => ({
    name,
    // Now only the patch version needs to be automatically
    type: "patch",
  }));

  const changesetID = await writeChangeset.default(
    {
      releases,
      summary: "publish",
    },
    cwd
  );

  console.log("\n=== Summary of changesets ===");
  console.log("patch:", changedPackagesNames.join(", "));
  console.log("generate changeset successfully:", changesetID);
}

// async function getVersionableChangedPackages(config, { cwd, ref }) {
//   const changedPackages = await getChangedPackagesSinceRef({
//     ref: ref ?? config.baseBranch,
//     changedFilePatterns: config.changedFilePatterns,
//     cwd,
//   });
//   return changedPackages.filter(
//     (pkg) =>
//       !shouldSkipPackage(pkg, {
//         ignore: config.ignore,
//         allowPrivatePackages: config.privatePackages.version,
//       })
//   );
// }

main();
