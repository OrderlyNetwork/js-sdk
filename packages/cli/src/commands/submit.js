const fs = require("fs");
const path = require("path");
const {
  input,
  select,
  heading,
  info,
  success,
  warn,
  error,
} = require("../shared");
const {
  isLoggedIn,
  getToken,
  authenticatedFetch,
} = require("../internal/auth");
const { MARKETPLACE_API_PLUGINS_URL } = require("../internal/constants");
const { resolvePluginManifest, getRepoUrl } = require("../internal/manifest");
const {
  maybePrintOrderlyDevEnvironmentHints,
} = require("../internal/orderlySdkDocsMcpDetect");

// Valid tags from the API
const VALID_TAGS = [
  "UI",
  "Indicator",
  "Order Entry",
  "Trading",
  "Chart",
  "Portfolio",
  "Analytics",
  "Tool",
  "Widget",
];

// Regex patterns & limits matching backend createPluginSchema
const NPM_NAME_REGEX =
  /^(?:@[a-z0-9-*~][a-z0-9-*._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;
const GITHUB_URL_REGEX = /^https:\/\/github\.com\/[\w-]+\/[\w-]+$/;
// pluginId: first char letter, then letters, digits, or hyphens
const PLUGIN_ID_REGEX = /^[a-zA-Z][a-zA-Z0-9-]*$/;
const MAX_TAGS = 5;
const MAX_COVER_IMAGES = 10;
const MAX_USAGE_PROMPT_LENGTH = 8192;

/**
 * Validate submission payload against backend schema rules.
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateSubmission({
  npmName,
  repoUrl,
  pluginId,
  tags,
  coverImages,
  usagePrompt,
}) {
  const errors = [];

  if (!npmName) {
    errors.push("npmName is required (set in package.json)");
  } else if (!NPM_NAME_REGEX.test(npmName)) {
    errors.push(`npmName "${npmName}" is not a valid npm package name`);
  }

  if (!repoUrl) {
    errors.push(
      "repoUrl is required (configure git remote or set in manifest)",
    );
  } else if (!GITHUB_URL_REGEX.test(repoUrl)) {
    errors.push(
      `repoUrl must be a valid GitHub URL (https://github.com/<owner>/<repo>), got: ${repoUrl}`,
    );
  }

  if (pluginId && !PLUGIN_ID_REGEX.test(pluginId)) {
    errors.push(
      `pluginId must start with a letter and contain only letters, digits, or hyphens, got: ${pluginId}`,
    );
  }

  if (tags.length > MAX_TAGS) {
    errors.push(`Too many tags (${tags.length}), maximum is ${MAX_TAGS}`);
  }

  if (coverImages && coverImages.length > MAX_COVER_IMAGES) {
    errors.push(
      `Too many cover images (${coverImages.length}), maximum is ${MAX_COVER_IMAGES}`,
    );
  }

  if (usagePrompt && usagePrompt.length > MAX_USAGE_PROMPT_LENGTH) {
    errors.push(
      `usagePrompt is too long (${usagePrompt.length} chars), maximum is ${MAX_USAGE_PROMPT_LENGTH}`,
    );
  }

  return { valid: errors.length === 0, errors };
}

module.exports = {
  command: "submit",
  describe: "Submit a plugin to Orderly Marketplace",
  builder: (yargs) => {
    return yargs
      .option("path", {
        alias: "p",
        type: "string",
        describe:
          "string; path to the plugin directory. If omitted, you'll be prompted (default: ./)",
        demandOption: false,
      })
      .option("tags", {
        alias: "t",
        type: "string",
        describe:
          "string; comma-separated tag list (e.g., 'UI,Trading'). Values are trimmed; invalid tags are ignored with a warning",
        demandOption: false,
      })
      .option("storybook-url", {
        type: "string",
        describe:
          "string; optional Storybook base URL (for the plugin). Overrides manifest.storybookUrl when provided",
        demandOption: false,
      })
      .option("dry-run", {
        alias: "d",
        type: "boolean",
        describe:
          "boolean; validate the submission payload and print it without calling the marketplace API",
        default: false,
      })
      .example(
        "orderly submit --path ./my-plugin --dry-run",
        "Validate the plugin payload from a local folder",
      )
      .example(
        "orderly submit --path ./my-plugin --tags UI,Trading --storybook-url https://example.com/storybook",
        "Submit with tags and a Storybook URL",
      );
  },
  handler: async (argv) => {
    heading("Submit to Orderly Marketplace");
    info("This command will submit your plugin to the marketplace.\n");

    // Check if user is logged in
    if (!isLoggedIn()) {
      warn("You are not logged in.");
      info("Please run 'orderly login' first to authenticate.");
      return;
    }

    const token = getToken();
    info(`Authenticated as: (token starts with ${token.substring(0, 8)}...)\n`);

    // Step 1: Path
    const targetPath = argv.path || (await input("Path to plugin:", "./"));
    const resolvedPath = path.resolve(targetPath);

    // Step 2: Resolve metadata (.orderly-manifest.json optional; package.json + git is enough)
    info(`\nReading plugin from ${resolvedPath}...`);

    const manifest = resolvePluginManifest(resolvedPath);
    if (!manifest) {
      error("No plugin metadata found.");
      info(
        "Add a package.json with a valid \"name\" field, or create .orderly-manifest.json (e.g. via 'orderly create plugin').",
      );
      return;
    }

    // Step 3: Try to auto-fill repoUrl from git remote if missing
    if (!manifest.repoUrl) {
      const repoUrl = getRepoUrl();
      if (repoUrl) {
        info("Found repo URL from git remote, adding to manifest...");
        manifest.repoUrl = repoUrl;
      }
    }

    info(`Package: ${manifest.npmName}`);
    if (manifest.pluginId) {
      info(`Plugin ID: ${manifest.pluginId}`);
    }
    if (manifest.repoUrl) {
      info(`Repository: ${manifest.repoUrl}`);
    }

    // Step 4: Collect optional fields
    let tags = manifest.tags || [];
    if (argv.tags) {
      tags = argv.tags.split(",").map((t) => t.trim());
    }

    // Validate tag values
    const invalidTags = tags.filter((t) => !VALID_TAGS.includes(t));
    if (invalidTags.length > 0) {
      warn(`Invalid tags: ${invalidTags.join(", ")}`);
      info(`Valid tags: ${VALID_TAGS.join(", ")}`);
      tags = tags.filter((t) => VALID_TAGS.includes(t));
    }

    const storybookUrl = argv.storybookUrl || manifest.storybookUrl || null;
    const storybookTooltip = manifest.storybookTooltip || null;
    const usagePrompt = manifest.usagePrompt || null;
    const coverImages = manifest.coverImages || [];

    // Step 5: Validate all fields against backend schema
    const submission = validateSubmission({
      npmName: manifest.npmName,
      repoUrl: manifest.repoUrl,
      pluginId: manifest.pluginId,
      tags,
      coverImages,
      usagePrompt,
    });

    if (!submission.valid) {
      error("\nValidation failed. Please fix the following issues:");
      submission.errors.forEach((e) => info(`  - ${e}`));
      return;
    }

    if (argv["dry-run"]) {
      success("\nDry-run completed! Plugin is valid for submission.");
      info(`\nSubmission payload:`);
      console.log(
        JSON.stringify(
          {
            npmName: manifest.npmName,
            repoUrl: manifest.repoUrl,
            pluginId: manifest.pluginId,
            tags,
            coverImages,
            storybookUrl,
            storybookTooltip,
            usagePrompt,
          },
          null,
          2,
        ),
      );
      return;
    }

    // Step 6: Submit to marketplace
    info("\nSubmitting to Orderly Marketplace...");

    const payload = {
      npmName: manifest.npmName,
      repoUrl: manifest.repoUrl,
      tags,
      coverImages,
    };

    // Add optional fields if present
    if (manifest.pluginId) {
      payload.pluginId = manifest.pluginId;
    }
    if (storybookUrl) {
      payload.storybookUrl = storybookUrl;
    }
    if (storybookTooltip) {
      payload.storybookTooltip = storybookTooltip;
    }
    if (usagePrompt) {
      payload.usagePrompt = usagePrompt;
    }

    try {
      const response = await authenticatedFetch(MARKETPLACE_API_PLUGINS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json().catch(() => ({}));

      if (response.status === 201) {
        success("\nSubmission successful!");
        info(`Plugin ID: ${responseData.id || "N/A"}`);
        info(`NPM Name: ${responseData.npmName || manifest.npmName}`);
        info(`Status: ${responseData.status || "under_review"}`);
        maybePrintOrderlyDevEnvironmentHints(resolvedPath);
      } else if (response.status === 400) {
        error(
          `Validation error: ${responseData.message || responseData.error || "Invalid request"}`,
        );
        if (responseData.details) {
          info("Details:");
          console.log(JSON.stringify(responseData.details, null, 2));
        }
      } else if (response.status === 401) {
        error("Unauthorized. Please run 'orderly login' again.");
      } else {
        error(`Submission failed: HTTP ${response.status}`);
        if (responseData.message) {
          info(`Server message: ${responseData.message}`);
        }
      }
    } catch (e) {
      error(`Submission failed: ${e.message}`);
      info(
        "\nPlease check that the API server is running at http://localhost:3030",
      );
    }
  },
};
