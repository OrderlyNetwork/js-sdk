const {
  heading,
  info,
  warn,
  error,
  success,
  select,
  getApiErrorInfo,
} = require("../shared");
const {
  isLoggedIn,
  getToken,
  authenticatedFetch,
} = require("../internal/auth");
const {
  MARKETPLACE_API_BASE_URL,
  MARKETPLACE_API_MY_PLUGINS_URL,
  getMarketplaceApiPluginSelfStatusUrl,
} = require("../internal/constants");

/**
 * Normalize unknown list payloads into an array.
 * Keeps this command resilient to small response shape changes.
 * @param {unknown} data
 * @returns {Array<Record<string, unknown>>}
 */
function normalizePlugins(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.plugins)) {
    return data.plugins;
  }

  if (Array.isArray(data?.items)) {
    return data.items;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  if (Array.isArray(data?.data?.items)) {
    return data.data.items;
  }

  if (Array.isArray(data?.data?.plugins)) {
    return data.data.plugins;
  }

  if (Array.isArray(data?.data?.results)) {
    return data.data.results;
  }

  return [];
}

/**
 * Format a compact prompt label so users can identify the target plugin quickly.
 * @param {Record<string, unknown>} plugin
 * @returns {string}
 */
function toPluginChoiceLabel(plugin) {
  const name = plugin?.name || plugin?.npmName || "Unknown";
  const id = plugin?.id || plugin?.pluginId || "unknown-id";
  const status = plugin?.status || "unknown";
  return `${name} (${id}) [${status}]`;
}

module.exports = {
  command: "disable",
  describe: "Delist one of your submitted plugins from Marketplace",
  builder: (yargs) => {
    return yargs
      .option("pluginId", {
        type: "string",
        describe:
          "string; plugin ID to delist directly. If omitted, an interactive selector is shown",
        demandOption: false,
      })
      .example("orderly disable", "Select one of your plugins and delist it")
      .example(
        "orderly disable --pluginId my-plugin-id",
        "Delist a specific plugin directly without selection",
      )
      .example(
        "orderly disable --help",
        "Show command help and usage for plugin delisting",
      );
  },
  handler: async (argv) => {
    heading("Disable My Plugin");
    info("This command will delist one of your submitted plugins.\n");

    // Require login first because both listing and status update are owner-scoped operations.
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

    try {
      // Skip interactive selection when pluginId is provided explicitly.
      let selectedPluginId =
        typeof argv.pluginId === "string" ? argv.pluginId.trim() : "";
      if (!selectedPluginId) {
        info("Fetching your submitted plugins...");
        const listResponse = await authenticatedFetch(
          MARKETPLACE_API_MY_PLUGINS_URL,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const listData = await listResponse.json().catch(() => null);
        if (!listResponse.ok) {
          const { message } = getApiErrorInfo(listData, listResponse.status);
          error(`Failed to fetch plugins: ${message}`);
          process.exitCode = 1;
          return;
        }

        const plugins = normalizePlugins(listData);
        if (plugins.length === 0) {
          info("You have not submitted any plugins yet.");
          info(
            "If Marketplace Web shows records, run `orderly whoami` to confirm account consistency and `orderly list --json` to inspect the raw API response.",
          );
          return;
        }

        const choices = plugins
          .map((plugin) => ({
            name: String(plugin?.id || plugin?.pluginId || ""),
            message: toPluginChoiceLabel(plugin),
            value: String(plugin?.id || plugin?.pluginId || ""),
          }))
          .filter((choice) => Boolean(choice.value));

        if (choices.length === 0) {
          error("No valid plugin IDs found in marketplace response.");
          process.exitCode = 1;
          return;
        }

        selectedPluginId = await select(
          "Select a plugin to delist (set status to disabled):",
          choices,
          0,
        );
      } else {
        info(`Using pluginId from command argument: ${selectedPluginId}`);
      }

      if (!selectedPluginId) {
        warn("No plugin selected.");
        process.exitCode = 1;
        return;
      }

      const endpoint = getMarketplaceApiPluginSelfStatusUrl(selectedPluginId);
      info(`Submitting delist request to ${endpoint} ...`);
      const disableResponse = await authenticatedFetch(endpoint, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "disabled" }),
      });

      const disableData = await disableResponse.json().catch(() => null);
      if (!disableResponse.ok) {
        const { code, message } = getApiErrorInfo(
          disableData,
          disableResponse.status,
        );
        error(`Failed to delist plugin: ${message}`);
        if (code) {
          info(`Error code: ${code}`);
        }
        info(
          `Please verify plugin ownership and API availability. Current API base: ${MARKETPLACE_API_BASE_URL}`,
        );
        process.exitCode = 1;
        return;
      }

      const updatedName = disableData?.name || disableData?.npmName || "N/A";
      const updatedStatus = disableData?.status || "disabled";
      success("\nPlugin delisted successfully.");
      info(`Plugin ID: ${selectedPluginId}`);
      info(`Plugin Name: ${updatedName}`);
      info(`Status: ${updatedStatus}`);
    } catch (e) {
      // Include endpoint context so users can triage connectivity issues quickly.
      const cause = e?.message || String(e);
      error(`Request failed while calling marketplace APIs: ${cause}`);
      info(
        `Please verify network connectivity and API availability. You can override the API base URL with ORDERLY_API_URL (current: ${MARKETPLACE_API_BASE_URL}).`,
      );
      process.exitCode = 1;
    }
  },
};
