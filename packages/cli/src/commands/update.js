const path = require("path");
const {
  heading,
  info,
  success,
  warn,
  error,
  input,
  getErrorMessage,
} = require("../shared");
const {
  isLoggedIn,
  getToken,
  authenticatedFetch,
} = require("../internal/auth");
const { MARKETPLACE_API_PLUGINS_URL } = require("../internal/constants");
const { resolvePluginManifest } = require("../internal/manifest");

// Keep the same tag whitelist as submit to ensure local validation stays consistent.
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

const MAX_TAGS = 5;
const MAX_COVER_IMAGES = 10;
const MAX_USAGE_PROMPT_LENGTH = 8192;

/**
 * Validate update payload against marketplace schema constraints.
 * @param {object} payload
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateUpdatePayload(payload) {
  const errors = [];

  if (payload.tags && payload.tags.length > MAX_TAGS) {
    errors.push(
      `Too many tags (${payload.tags.length}), maximum is ${MAX_TAGS}`,
    );
  }

  if (payload.coverImages && payload.coverImages.length > MAX_COVER_IMAGES) {
    errors.push(
      `Too many cover images (${payload.coverImages.length}), maximum is ${MAX_COVER_IMAGES}`,
    );
  }

  if (
    payload.usagePrompt &&
    payload.usagePrompt.length > MAX_USAGE_PROMPT_LENGTH
  ) {
    errors.push(
      `usagePrompt is too long (${payload.usagePrompt.length} chars), maximum is ${MAX_USAGE_PROMPT_LENGTH}`,
    );
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Include only user-editable fields supported by PATCH /plugins/{id}.
 * Undefined/null/empty values are skipped to avoid accidental field clearing.
 * @param {object} manifest
 * @returns {object}
 */
function buildUpdatePayload(manifest) {
  const payload = {};

  const directFields = [
    "name",
    "description",
    "coverImages",
    "storybookUrl",
    "storybookTooltip",
    "usagePrompt",
  ];

  directFields.forEach((field) => {
    const value = manifest[field];
    if (value !== undefined && value !== null && value !== "") {
      payload[field] = value;
    }
  });

  const tags = Array.isArray(manifest.tags) ? manifest.tags : [];
  if (tags.length > 0) {
    // Filter unexpected values locally so users get clear feedback before request.
    const validTags = tags.filter((tag) => VALID_TAGS.includes(tag));
    const invalidTags = tags.filter((tag) => !VALID_TAGS.includes(tag));

    if (invalidTags.length > 0) {
      warn(`Ignored invalid tags from manifest: ${invalidTags.join(", ")}`);
      info(`Valid tags: ${VALID_TAGS.join(", ")}`);
    }

    if (validTags.length > 0) {
      payload.tags = validTags;
    }
  }

  return payload;
}

module.exports = {
  command: "update",
  describe: "Update plugin metadata in Orderly Marketplace",
  builder: (yargs) => {
    return yargs
      .option("path", {
        alias: "p",
        type: "string",
        describe:
          "string; path to the plugin directory (must contain .orderly-manifest.json with a pluginId, or package.json-derived metadata). If omitted, you will be prompted",
        demandOption: false,
      })
      .option("dry-run", {
        alias: "d",
        type: "boolean",
        describe:
          "boolean; validate and print the PATCH payload without calling the marketplace API",
        default: false,
      })
      .example(
        "orderly update --path ./my-plugin --dry-run",
        "Validate the update payload from a local plugin folder",
      );
  },
  handler: async (argv) => {
    heading("Update plugin on Orderly Marketplace");

    if (!isLoggedIn()) {
      warn("You are not logged in.");
      info("Please run 'orderly login' first to authenticate.");
      process.exitCode = 1;
      return;
    }

    const token = getToken();
    if (!token) {
      error("Authentication token not found.");
      info("Please run 'orderly login' again.");
      process.exitCode = 1;
      return;
    }

    const targetPath = argv.path || (await input("Path to plugin:", "./"));
    const resolvedPath = path.resolve(targetPath);
    info(`Reading plugin metadata from ${resolvedPath}...`);

    // Resolve metadata with manifest-first behavior for plugin projects.
    const manifest = resolvePluginManifest(resolvedPath);
    if (!manifest) {
      error("No plugin metadata found.");
      info(
        "Please ensure .orderly-manifest.json exists in your plugin project and contains pluginId.",
      );
      process.exitCode = 1;
      return;
    }

    const pluginId = String(manifest.pluginId || "").trim();
    if (!pluginId) {
      error("pluginId is required in .orderly-manifest.json for update.");
      process.exitCode = 1;
      return;
    }

    const payload = buildUpdatePayload(manifest);
    const validation = validateUpdatePayload(payload);

    if (!validation.valid) {
      error("Validation failed. Please fix the following issues:");
      validation.errors.forEach((validationError) =>
        info(`  - ${validationError}`),
      );
      process.exitCode = 1;
      return;
    }

    if (Object.keys(payload).length === 0) {
      warn("No updatable fields found in manifest.");
      info(
        "Supported fields: name, description, tags, coverImages, storybookUrl, storybookTooltip, usagePrompt.",
      );
      process.exitCode = 1;
      return;
    }

    const apiUrl = `${MARKETPLACE_API_PLUGINS_URL}/${encodeURIComponent(pluginId)}`;

    if (argv["dry-run"]) {
      success("Dry-run completed. Update payload is valid.");
      info("PATCH target:");
      console.log(apiUrl);
      info("\nPayload:");
      console.log(JSON.stringify(payload, null, 2));
      return;
    }

    info("Submitting update request...");

    try {
      const response = await authenticatedFetch(apiUrl, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json().catch(() => null);

      if (!response.ok) {
        const serverMessage = getErrorMessage(responseData, response.status);
        error(`Update failed: ${serverMessage}`);
        process.exitCode = 1;
        return;
      }

      success("Plugin updated successfully!");
      info(`Plugin ID: ${responseData?.id || pluginId}`);
      info(`Status: ${responseData?.status || "N/A"}`);
    } catch (requestError) {
      // Include request target so operators can triage connectivity issues.
      const cause = requestError?.message || String(requestError);
      error(`Request failed while calling ${apiUrl}: ${cause}`);
      info("Please verify network connectivity and API availability.");
      process.exitCode = 1;
    }
  },
};
