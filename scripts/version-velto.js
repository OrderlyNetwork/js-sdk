const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { getPackages } = require("@manypkg/get-packages");

// Check for required environment variables
function checkEnvVars() {
  const required = ["NPM_TOKEN", "NPM_REGISTRY"];
  const missing = required.filter((varName) => !process.env[varName]);

  if (missing.length > 0) {
    console.error("❌ Missing required environment variables:");
    missing.forEach((varName) => console.error(`   - ${varName}`));
    console.error(
      "\nPlease set these environment variables before running this script.",
    );
    process.exit(1);
  }

  console.log("✓ All required environment variables are set\n");
}

// Authenticate with npm
function authNPM() {
  const npmToken = process.env.NPM_TOKEN;
  const npmRegistry = process.env.NPM_REGISTRY || "https://registry.npmjs.org";
  const registry = npmRegistry.replace("http://", "").replace("https://", "");

  const content = `\n//${registry}/:_authToken="${npmToken}"`;

  try {
    fs.appendFileSync(".npmrc", content);
    console.log("✓ NPM authentication configured\n");
  } catch (error) {
    console.error("❌ Failed to configure NPM authentication:", error.message);
    process.exit(1);
  }
}

// Restore .npmrc to original state
function restoreNpmrc() {
  try {
    execSync("git restore .npmrc", { stdio: "inherit" });
    console.log("\n✓ Restored .npmrc");
  } catch (error) {
    console.warn("⚠️  Could not restore .npmrc:", error.message);
  }
}

async function addPrereleaseTag() {
  const { packages } = await getPackages(process.cwd());

  for (const pkg of packages) {
    const pkgJsonPath = path.join(pkg.dir, "package.json");
    const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8"));

    const currentVersion = pkgJson.version;
    const prereleasePattern = /-velto-main\.(\d+)$/;
    const match = currentVersion.match(prereleasePattern);

    if (match) {
      // Increment existing prerelease number
      const currentNum = parseInt(match[1], 10);
      const newNum = currentNum + 1;
      pkgJson.version = currentVersion.replace(
        prereleasePattern,
        `-velto-main.${newNum}`,
      );
    } else {
      // Add new prerelease tag
      pkgJson.version = `${currentVersion}-velto-main.0`;
    }

    fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2) + "\n");
    console.log(`Updated ${pkgJson.name} to ${pkgJson.version}`);
  }
}

async function main() {
  try {
    console.log("🚀 Starting prerelease version and publish...\n");

    // Check environment variables
    checkEnvVars();

    // Update versions
    console.log("📝 Updating package versions...");
    await addPrereleaseTag();
    console.log("\n✓ Package versions updated\n");

    // Update version files
    console.log("📝 Updating version files...");
    execSync("pnpm version:g", { stdio: "inherit" });
    console.log("\n✓ Version files updated\n");

    // Build packages
    console.log("🔨 Building packages...");
    execSync("pnpm build", { stdio: "inherit" });
    console.log("\n✓ Build completed\n");

    // Authenticate with npm
    authNPM();

    // Publish packages
    console.log("📦 Publishing packages...");
    const npmRegistry = process.env.NPM_REGISTRY;
    const publishCmd = npmRegistry
      ? `npm_config_registry=${npmRegistry} pnpm -r publish --tag velto-main --no-git-checks`
      : "pnpm -r publish --tag velto-main --no-git-checks";

    execSync(publishCmd, { stdio: "inherit" });
    console.log("\n✓ Packages published successfully\n");

    // Restore .npmrc
    restoreNpmrc();

    console.log("✅ Prerelease complete!");
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    restoreNpmrc();
    process.exit(1);
  }
}

main();
