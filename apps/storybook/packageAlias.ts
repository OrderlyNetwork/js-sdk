const base = [
  // {
  //   package: "@orderly.network/core",
  //   path: "../../packages/core/src",
  // },
  {
    package: "@orderly.network/net",
    path: "../../packages/net/src",
  },
  {
    package: "@orderly.network/perp",
    path: "../../packages/perp/src",
  },
  {
    package: "@orderly.network/utils",
    path: "../../packages/utils/src",
  },
  // {
  //   package: "@orderly.network/default-evm-adapter",
  //   path: "../../packages/default-evm-adapter/src",
  // },
  // {
  //   package: "@orderly.network/default-solana-adapter",
  //   path: "../../packages/default-solana-adapter/src",
  // },
  // {
  //   package: "@orderly.network/web3-provider-ethers",
  //   path: "../../packages/web3-provider-ethers/src",
  // },
];

const ui = [
  {
    package: "@orderly.network/ui",
    path: "../../packages/ui/src",
  },
  {
    package: "@orderly.network/ui-chain-selector",
    path: "../../packages/ui-chain-selector/src",
  },
  {
    package: "@orderly.network/ui-connector",
    path: "../../packages/ui-connector/src",
  },
  {
    package: "@orderly.network/ui-leverage",
    path: "../../packages/ui-leverage/src",
  },
  {
    package: "@orderly.network/ui-order-entry",
    path: "../../packages/ui-order-entry/src",
  },
  {
    package: "@orderly.network/ui-orders",
    path: "../../packages/ui-orders/src",
  },
  {
    package: "@orderly.network/ui-positions",
    path: "../../packages/ui-positions/src",
  },
  {
    package: "@orderly.network/ui-scaffold",
    path: "../../packages/ui-scaffold/src",
  },
  {
    package: "@orderly.network/ui-share",
    path: "../../packages/ui-share/src",
  },
  {
    package: "@orderly.network/ui-tpsl",
    path: "../../packages/ui-tpsl/src",
  },
  {
    package: "@orderly.network/ui-tradingview",
    path: "../../packages/ui-tradingview/src",
  },
  {
    package: "@orderly.network/ui-transfer",
    path: "../../packages/ui-transfer/src",
  },
  {
    package: "@orderly.network/chart",
    path: "../../packages/chart/src",
  },
];

const page = [
  {
    package: "@orderly.network/affiliate",
    path: "../../packages/affiliate/src",
  },
  {
    package: "@orderly.network/markets",
    path: "../../packages/markets/src",
  },
  {
    package: "@orderly.network/portfolio",
    path: "../../packages/portfolio/src",
  },
  {
    package: "@orderly.network/trading",
    path: "../../packages/trading/src",
  },
  {
    package: "@orderly.network/trading-leaderboard",
    path: "../../packages/trading-leaderboard/src",
  },
  {
    package: "@orderly.network/trading-rewards",
    path: "../../packages/trading-rewards/src",
  },
];

const walletConnect = [
  {
    package: "@orderly.network/wallet-connector",
    path: "../../packages/wallet-connector/src",
  },
  {
    package: "@orderly.network/wallet-connector-privy",
    path: "../../packages/wallet-connector-privy/src",
  },
];

export const packageAlias = [
  {
    package: "@orderly.network/react-app",
    path: "../../packages/app/src",
  },
  {
    package: "@orderly.network/hooks",
    path: "../../packages/hooks/src",
  },
  {
    package: "@orderly.network/types",
    path: "../../packages/types/src",
  },
  // need to before @orderly.network/i18n
  {
    package: "@orderly.network/i18n/locales",
    path: "../../packages/i18n/locales",
  },
  {
    package: "@orderly.network/i18n",
    path: "../../packages/i18n/src",
  },
  ...base,
  ...ui,
  ...page,
  ...walletConnect,
];
