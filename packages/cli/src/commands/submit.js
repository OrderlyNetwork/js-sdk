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
  getApiErrorInfo,
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
const UPLOADS_PATH_REGEX = /^\/uploads\/.+$/;
const MAX_TAGS = 5;
const MAX_COVER_IMAGES = 10;
const MAX_USAGE_PROMPT_LENGTH = 8192;
const SUBMIT_PROGRESS_TOTAL_STEPS = 7;

/**
 * Print a consistent progress message so users can track submit lifecycle.
 * @param {number} step
 * @param {string} message
 */
function printProgress(step, message) {
  info(`[${step}/${SUBMIT_PROGRESS_TOTAL_STEPS}] ${message}`);
}

/**
 * Render actionable submit failure hints while preserving server message.
 * @param {number} status
 * @param {string | null} errorCode
 * @param {string} serverMessage
 */
function printSubmitFailure(status, errorCode, serverMessage) {
  const normalizedCode = (errorCode || "").toUpperCase();
  const normalizedMessage = serverMessage || `HTTP ${status}`;

  // Keep conflict guidance explicit since duplicate plugin IDs are common.
  if (status === 409 || normalizedCode === "CONFLICT") {
    error(`Plugin registration conflict: ${normalizedMessage}`);
    info(
      "Try a different pluginId in your manifest, then rerun 'orderly submit'.",
    );
    return;
  }

  // Distinguish missing upstream resources from generic failures.
  if (status === 404 || normalizedCode === "NOT_FOUND") {
    error(`Resource not found: ${normalizedMessage}`);
    info(
      "Please verify npmName/repoUrl/pluginId in your manifest and try again.",
    );
    return;
  }

  // Bad request means user input can be fixed without retrying infrastructure.
  if (status === 400 || normalizedCode === "BAD_REQUEST") {
    error(`Invalid submission data: ${normalizedMessage}`);
    info("Please correct your manifest fields and run submit again.");
    return;
  }

  if (status === 401) {
    error("Unauthorized. Please run 'orderly login' again.");
    return;
  }

  if (status >= 500) {
    error(`Marketplace server error (HTTP ${status}): ${normalizedMessage}`);
    return;
  }

  error(`Submission failed (HTTP ${status}): ${normalizedMessage}`);
}

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

  if (!pluginId) {
    errors.push("pluginId is required (set in manifest or pass interactively)");
  } else if (!PLUGIN_ID_REGEX.test(pluginId)) {
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
  if (coverImages && coverImages.length > 0) {
    const invalidCoverImage = coverImages.find((image) => {
      if (typeof image !== "string" || image.length === 0) {
        return true;
      }

      // Keep parity with backend schema: each item must be a URL or /uploads/* path.
      return !URL.canParse(image) && !UPLOADS_PATH_REGEX.test(image);
    });

    if (invalidCoverImage) {
      errors.push(
        `coverImages contains an invalid value: ${invalidCoverImage}. Each value must be an absolute URL or a path that starts with /uploads/`,
      );
    }
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
    printProgress(1, "Checking authentication status...");

    // Check if user is logged in
    if (!isLoggedIn()) {
      warn("You are not logged in.");
      info("Please run 'orderly login' first to authenticate.");
      return;
    }

    const token = getToken();
    info(`Authenticated as: (token starts with ${token.substring(0, 8)}...)\n`);

    // Step 1: Path
    printProgress(2, "Resolving plugin path...");
    const targetPath = argv.path || (await input("Path to plugin:", "./"));
    const resolvedPath = path.resolve(targetPath);

    // Step 2: Resolve metadata (.orderly-manifest.json optional; package.json + git is enough)
    printProgress(3, `Reading plugin metadata from ${resolvedPath}...`);

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

    printProgress(4, "Preparing submission fields...");
    if (!manifest.pluginId) {
      manifest.pluginId = await input("Plugin ID (required):");
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
    printProgress(5, "Validating submission payload...");
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
    printProgress(
      6,
      `Submitting request to Orderly Marketplace (${MARKETPLACE_API_PLUGINS_URL})...`,
    );

    const payload = {
      npmName: manifest.npmName,
      repoUrl: manifest.repoUrl,
      pluginId: manifest.pluginId,
      tags,
      coverImages,
    };

    // Add optional fields if present
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
      const response = await authenticatedFetch(
        MARKETPLACE_API_PLUGINS_URL,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
        {
          // Expose auth refresh lifecycle so users can see why step [6/7] is taking longer.
          onAuthEvent: (event, details = {}) => {
            if (event === "request_unauthorized") {
              info(
                "[6/7] Access token expired (HTTP 401), attempting token refresh...",
              );
              return;
            }

            if (event === "refresh_started") {
              info(
                `[6/7] Refreshing CLI token via ${details.url || "refresh endpoint"}...`,
              );
              return;
            }

            if (event === "refresh_succeeded") {
              info("[6/7] Token refresh succeeded, retrying submit request...");
              return;
            }

            if (event === "refresh_missing") {
              warn(
                "[6/7] No refresh token found. Please run 'orderly login' again if submit fails.",
              );
              return;
            }

            if (event === "refresh_failed") {
              warn(
                `[6/7] Token refresh failed (HTTP ${details.status || "unknown"}).`,
              );
              return;
            }

            if (event === "refresh_error") {
              warn(
                `[6/7] Token refresh request error: ${details.message || "unknown error"}`,
              );
              return;
            }

            if (event === "request_retry_started") {
              info(
                "[6/7] Sending retried submit request with refreshed token...",
              );
            }
          },
        },
      );

      printProgress(
        7,
        `Received server response (HTTP ${response.status}), processing...`,
      );
      const responseData = await response.json().catch(() => ({}));

      if (response.status === 201) {
        success("\nSubmission successful!");
        info(`Plugin ID: ${responseData.id || "N/A"}`);
        info(`NPM Name: ${responseData.npmName || manifest.npmName}`);
        info(`Status: ${responseData.status || "under_review"}`);
        maybePrintOrderlyDevEnvironmentHints(resolvedPath);
      } else {
        const { code: errorCode, message: errorMessage } = getApiErrorInfo(
          responseData,
          response.status,
        );
        printSubmitFailure(response.status, errorCode, errorMessage);

        if (responseData.details) {
          info("Details:");
          console.log(JSON.stringify(responseData.details, null, 2));
        }

        if (errorCode) {
          info(`Error code: ${errorCode}`);
        }
      }
    } catch (e) {
      // Include endpoint context so publish users can diagnose non-local failures.
      const cause = e?.message || String(e);
      error(
        `Submission failed while calling ${MARKETPLACE_API_PLUGINS_URL}: ${cause}`,
      );
      info("Please verify network connectivity and API availability.");
    }
  },
};
