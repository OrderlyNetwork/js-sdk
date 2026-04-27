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

const MARKETPLACE_API_BASE_URL =
  process.env.ORDERLY_API_URL ||
  "https://orderly-plugin-marketplace-server.vercel.app";
const MARKETPLACE_WEB_BASE_URL =
  process.env.ORDERLY_WEB_URL ||
  "https://orderly-plugin-marketplace.vercel.app";

const MARKETPLACE_API_PLUGINS_URL = `${MARKETPLACE_API_BASE_URL}/plugins`;
const MARKETPLACE_API_MY_PLUGINS_URL = `${MARKETPLACE_API_BASE_URL}/my-plugins`;
/**
 * Build plugin self-status endpoint for author-owned status updates.
 * @param {string} pluginId
 * @returns {string}
 */
function getMarketplaceApiPluginSelfStatusUrl(pluginId) {
  return `${MARKETPLACE_API_PLUGINS_URL}/${encodeURIComponent(pluginId)}/self-status`;
}
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
const MARKETPLACE_WEB_LOGIN_URL = `${MARKETPLACE_WEB_BASE_URL}/cli/login`;

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
  INTERCEPTOR_TARGETS,
  MODULE_TYPES,
  MARKETPLACE_API_BASE_URL,
  MARKETPLACE_API_PLUGINS_URL,
  MARKETPLACE_API_MY_PLUGINS_URL,
  getMarketplaceApiPluginUrl,
  getMarketplaceApiPluginSelfStatusUrl,
  CLI_CALLBACK_PORT,
  CLI_LOGIN_TIMEOUT_MS,
  MARKETPLACE_WEB_LOGIN_URL,
  ORDERLY_SKILLS_REPO,
  ORDERLY_PLUGIN_SKILL_NAMES,
  DEFAULT_ORDERLY_SDK_DOCS_MCP_NAME,
};
