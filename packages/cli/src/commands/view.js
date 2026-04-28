const { heading, info, warn, error, getErrorMessage } = require("../shared");
const {
  isLoggedIn,
  getToken,
  authenticatedFetch,
} = require("../internal/auth");
const { MARKETPLACE_API_BASE_URL } = require("../internal/constants");

module.exports = {
  command: "view <id>",
  describe: "View plugin details by ID from Marketplace",
  builder: (yargs) => {
    return yargs
      .positional("id", {
        type: "string",
        describe:
          "string; plugin ID used to fetch details from Marketplace (required)",
        demandOption: true,
      })
      .option("json", {
        type: "boolean",
        describe:
          "boolean; currently does not change output (the command always prints the full JSON payload)",
        default: false,
      })
      .example(
        "orderly view trading-plugin-id",
        "Fetch and print plugin details",
      )
      .example(
        "orderly view trading-plugin-id --json",
        "Fetch and print plugin details as JSON (flag currently does not alter output)",
      );
  },
  handler: async (argv) => {
    heading("Marketplace Plugin Details");

    const pluginId = String(argv.id || "").trim();
    if (!pluginId) {
      error("Plugin ID is required.");
      process.exitCode = 1;
      return;
    }

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

    const url = `${MARKETPLACE_API_BASE_URL}/plugins/${encodeURIComponent(pluginId)}`;

    try {
      // Use explicit Accept header for consistent JSON responses across API gateways.
      const headers = new Headers({ Accept: "application/json" });
      headers.set("Authorization", `Bearer ${token}`);

      const response = await authenticatedFetch(url, {
        method: "GET",
        headers,
      });

      const responseData = await response.json().catch(() => null);

      if (response.status === 404) {
        error(`Plugin not found: ${pluginId}`);
        process.exitCode = 1;
        return;
      }

      if (!response.ok) {
        const serverMessage = getErrorMessage(responseData, response.status);
        error(`Failed to fetch plugin: ${serverMessage}`);
        process.exitCode = 1;
        return;
      }

      // Always print full payload to avoid losing fields in formatted output.
      console.log(JSON.stringify(responseData ?? {}, null, 2));
    } catch (e) {
      // Show the exact request target so operators can debug network/env issues quickly.
      const cause = e?.message || String(e);
      error(`Request failed while calling ${url}: ${cause}`);
      info("Please verify network connectivity and API availability.");
      process.exitCode = 1;
    }
  },
};
