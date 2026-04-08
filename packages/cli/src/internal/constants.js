// Known interceptor targets from the plugin system
const INTERCEPTOR_TARGETS = [
  "Trading.Layout.Desktop",
  "Trading.Layout.Mobile",
  "OrderBook.Desktop.Asks",
  "OrderBook.Desktop.Bids",
  "Deposit.DepositForm",
  "Deposit.WithdrawForm",
  "Account.AccountMenu",
  "Layout.MainMenus",
  "Table.EmptyDataIdentifier",
  "OrderEntry",
];

// Module types supported
const MODULE_TYPES = ["page", "component", "hook", "utils", "module"];

// DEX templates
const DEX_TEMPLATES = ["basic", "advanced"];

const MARKETPLACE_API_BASE_URL =
  process.env.ORDERLY_API_URL || "http://localhost:3030";
const MARKETPLACE_WEB_BASE_URL =
  process.env.ORDERLY_WEB_URL || "http://localhost:3000";

const MARKETPLACE_API_PLUGINS_URL = `${MARKETPLACE_API_BASE_URL}/plugins`;
const MARKETPLACE_API_MY_PLUGINS_URL = `${MARKETPLACE_API_BASE_URL}/my-plugins`;

const CLI_CALLBACK_PORT = 9876;
const CLI_LOGIN_TIMEOUT_MS = 3 * 60 * 1000; // 3 minutes
const MARKETPLACE_WEB_LOGIN_URL = `${MARKETPLACE_WEB_BASE_URL}/cli/login`;

module.exports = {
  INTERCEPTOR_TARGETS,
  MODULE_TYPES,
  DEX_TEMPLATES,
  MARKETPLACE_API_BASE_URL,
  MARKETPLACE_API_PLUGINS_URL,
  MARKETPLACE_API_MY_PLUGINS_URL,
  CLI_CALLBACK_PORT,
  CLI_LOGIN_TIMEOUT_MS,
  MARKETPLACE_WEB_LOGIN_URL,
};
