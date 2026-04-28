const {
  heading,
  info,
  warn,
  error,
  success,
  getErrorMessage,
} = require("../shared");
const {
  isLoggedIn,
  getToken,
  authenticatedFetch,
} = require("../internal/auth");
const { MARKETPLACE_API_MY_PLUGINS_URL } = require("../internal/constants");

/**
 * Convert unknown plugin payload into a list shape safely.
 * This keeps CLI output stable across minor API response changes.
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
 * Keep table columns compact so terminal output stays readable.
 */
function truncate(value, maxLength = 64) {
  const text = String(value ?? "-");
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength - 3)}...`;
}

/**
 * Select common plugin fields with graceful fallbacks.
 */
function mapRow(plugin) {
  return {
    id: plugin?.id || plugin?.pluginId || "-",
    name: plugin?.name || plugin?.npmName || "-",
    version: plugin?.version || plugin?.latestVersion || "-",
    status: plugin?.status || "-",
    description: truncate(plugin?.description || "-", 72),
  };
}

/**
 * Render simple aligned table without extra dependencies.
 */
function renderTable(rows) {
  const headers = ["ID", "Name", "Version", "Status", "Description"];
  const keys = ["id", "name", "version", "status", "description"];

  const widths = keys.map((key, index) => {
    const headerWidth = headers[index].length;
    const maxValueWidth = rows.reduce((max, row) => {
      const width = String(row[key] ?? "-").length;
      return width > max ? width : max;
    }, 0);
    return Math.max(headerWidth, maxValueWidth);
  });

  const buildLine = (values) =>
    values
      .map((value, index) => String(value).padEnd(widths[index]))
      .join("  ");

  const headerLine = buildLine(headers);
  const dividerLine = widths.map((width) => "-".repeat(width)).join("  ");
  const rowLines = rows.map((row) =>
    buildLine(keys.map((key) => row[key] ?? "-")),
  );

  return [headerLine, dividerLine, ...rowLines].join("\n");
}

module.exports = {
  command: "list",
  describe: "List my submitted plugins from Marketplace",
  builder: (yargs) => {
    return yargs
      .option("json", {
        type: "boolean",
        describe:
          "boolean; when true, output the raw marketplace response as JSON (otherwise prints a compact table)",
        default: false,
      })
      .example("orderly list", "List your submitted plugins as a compact table")
      .example(
        "orderly list --json",
        "Output the raw JSON payload (useful for debugging/agents)",
      );
  },
  handler: async (argv) => {
    heading("My Plugins");

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
      // Use Headers to merge defaults safely and inject auth token consistently.
      const headers = new Headers({ Accept: "application/json" });
      headers.set("Authorization", `Bearer ${token}`);

      const response = await authenticatedFetch(
        MARKETPLACE_API_MY_PLUGINS_URL,
        {
          method: "GET",
          headers,
        },
      );

      const responseData = await response.json().catch(() => null);

      if (!response.ok) {
        const serverMessage = getErrorMessage(responseData, response.status);
        error(`Failed to fetch plugins: ${serverMessage}`);
        process.exitCode = 1;
        return;
      }

      const plugins = normalizePlugins(responseData);

      if (argv.json) {
        // Print real server payload for troubleshooting response shape mismatches.
        console.log(JSON.stringify(responseData, null, 2));
        return;
      }

      if (plugins.length === 0) {
        info("You have not submitted any plugins yet.");
        info(
          "If Marketplace Web shows records, run `orderly whoami` to confirm account consistency and `orderly list --json` to inspect the raw API response.",
        );
        return;
      }

      const rows = plugins.map(mapRow);
      console.log(renderTable(rows));
      success(`\nTotal: ${plugins.length} plugin(s)`);
    } catch (e) {
      // Surface target endpoint to make network/runtime failures actionable.
      const cause = e?.message || String(e);
      error(
        `Request failed while calling ${MARKETPLACE_API_MY_PLUGINS_URL}: ${cause}`,
      );
      info("Please verify network connectivity and API availability.");
      process.exitCode = 1;
    }
  },
};
