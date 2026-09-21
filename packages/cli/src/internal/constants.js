/** Published CLI binary name (see package.json bin field). */
const CLI_BIN_NAME = "orderly-devkit";

// Known interceptor targets from the plugin system
const INTERCEPTOR_TARGETS = [
  "Trading.Layout.Desktop",
  "Trading.Layout.Mobile",
  "Trading.OrderEntry.TypeTabs",
  "Trading.OrderEntry.BuySellSwitch",
  "Trading.OrderEntry.Available",
  "Trading.OrderEntry.QuantitySlider",
  "Trading.OrderEntry.SubmitSection",
  "OrderBook.Desktop.Asks",
  "OrderBook.Desktop.Bids",
  "Deposit.DepositForm",
  "Deposit.WithdrawForm",
  "Account.AccountMenu",
  "Layout.MainMenus",
  "Table.EmptyDataIdentifier",
];

// Module types supported
const MODULE_TYPES = ["page", "component", "hook", "utils", "module"];

/**
 * Reduce ORDERLY_API_URL to the origin the CLI appends API paths to. Before
 * the dex.orderly.network migration this variable held a full API base, so an
 * existing `/api`, `/api/marketplace`, or `/api/auth` suffix is stripped
 * instead of being duplicated.
 * @param {string | undefined} value
 * @returns {string | null}
 */
function toApiOrigin(value) {
  const trimmed = String(value || "")
    .trim()
    .replace(/\/+$/, "");
  if (!trimmed) {
    return null;
  }
  return trimmed.replace(/\/api(?:\/marketplace|\/auth)?$/, "");
}

// New marketplace (Orderly One / dex-creator) endpoints. Auth routes live
// under /api/auth while marketplace routes live under /api/marketplace, so
// the two bases must be derived from the same origin separately.
const MARKETPLACE_API_ORIGIN =
  toApiOrigin(process.env.ORDERLY_API_URL) || "https://dex-api.orderly.network";
const MARKETPLACE_API_BASE_URL = `${MARKETPLACE_API_ORIGIN}/api/marketplace`;
const AUTH_API_BASE_URL = `${MARKETPLACE_API_ORIGIN}/api/auth`;

const MARKETPLACE_WEB_BASE_URL = (
  process.env.ORDERLY_WEB_URL || "https://dex.orderly.network"
).replace(/\/+$/, "");
// The web app forces a $lang prefix; the CLI always uses the default locale.
const MARKETPLACE_WEB_LOGIN_URL = `${MARKETPLACE_WEB_BASE_URL}/en/cli/login`;
const MARKETPLACE_WEB_BROWSE_URL = `${MARKETPLACE_WEB_BASE_URL}/en/marketplace`;
/** Owner-facing page for managing submitted plugins and submissions. */
const MARKETPLACE_WEB_LISTINGS_URL = `${MARKETPLACE_WEB_BASE_URL}/en/marketplace-listings`;

const MARKETPLACE_API_PLUGINS_URL = `${MARKETPLACE_API_BASE_URL}/plugins`;
const MARKETPLACE_API_PLUGINS_SUBMIT_URL = `${MARKETPLACE_API_PLUGINS_URL}/submit`;
const MARKETPLACE_API_MY_PLUGINS_URL = `${MARKETPLACE_API_BASE_URL}/my-plugins`;
/**
 * Build plugin detail endpoint for plugin-level operations.
 * @param {string} pluginId
 * @returns {string}
 */
function getMarketplaceApiPluginUrl(pluginId) {
  return `${MARKETPLACE_API_PLUGINS_URL}/${encodeURIComponent(pluginId)}`;
}

const CLI_CALLBACK_PORT = 9876;
const CLI_LOGIN_TIMEOUT_MS = 3 * 60 * 1000; // 3 minutes

/** GitHub shorthand for https://github.com/OrderlyNetwork/orderly-skills (Vercel skills CLI). */
const ORDERLY_SKILLS_REPO = "OrderlyNetwork/orderly-skills";

/** Default skill IDs from orderly-skills README (install all four non-interactively). */
const ORDERLY_PLUGIN_SKILL_NAMES = [
  "orderly-plugin-create",
  "orderly-plugin-write",
  "orderly-plugin-add",
  "orderly-plugin-submit",
];

/** Default MCP server key in mcpServers (matches @orderly.network/sdk-docs install --name default). */
const DEFAULT_ORDERLY_SDK_DOCS_MCP_NAME = "orderly-sdk-docs";

module.exports = {
  CLI_BIN_NAME,
  INTERCEPTOR_TARGETS,
  MODULE_TYPES,
  MARKETPLACE_API_ORIGIN,
  MARKETPLACE_API_BASE_URL,
  AUTH_API_BASE_URL,
  MARKETPLACE_WEB_BASE_URL,
  MARKETPLACE_WEB_LOGIN_URL,
  MARKETPLACE_WEB_BROWSE_URL,
  MARKETPLACE_WEB_LISTINGS_URL,
  MARKETPLACE_API_PLUGINS_URL,
  MARKETPLACE_API_PLUGINS_SUBMIT_URL,
  MARKETPLACE_API_MY_PLUGINS_URL,
  getMarketplaceApiPluginUrl,
  CLI_CALLBACK_PORT,
  CLI_LOGIN_TIMEOUT_MS,
  ORDERLY_SKILLS_REPO,
  ORDERLY_PLUGIN_SKILL_NAMES,
  DEFAULT_ORDERLY_SDK_DOCS_MCP_NAME,
};
