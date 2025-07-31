import { resolve } from "path";

type Package = {
  package: string;
  path: string;
  watch: boolean;
};

const base: Package[] = [
  {
    package: "@orderly.network/react-app",
    path: "../../packages/app/src",
    watch: true,
  },
  {
    package: "@orderly.network/hooks",
    path: "../../packages/hooks/src",
    watch: true,
  },
  {
    package: "@orderly.network/core",
    path: "../../packages/core/src",
    watch: false,
  },
  {
    package: "@orderly.network/net",
    path: "../../packages/net/src",
    watch: false,
  },
  {
    package: "@orderly.network/perp",
    path: "../../packages/perp/src",
    watch: false,
  },
  {
    package: "@orderly.network/utils",
    path: "../../packages/utils/src",
    watch: false,
  },
  {
    package: "@orderly.network/types",
    path: "../../packages/types/src",
    watch: false,
  },
  {
    package: "@orderly.network/default-evm-adapter",
    path: "../../packages/default-evm-adapter/src",
    watch: false,
  },
  {
    package: "@orderly.network/default-solana-adapter",
    path: "../../packages/default-solana-adapter/src",
    watch: false,
  },
  {
    package: "@orderly.network/web3-provider-ethers",
    path: "../../packages/web3-provider-ethers/src",
    watch: false,
  },
];

const ui: Package[] = [
  {
    package: "@orderly.network/ui/dist",
    path: "../../packages/ui/dist",
    watch: true,
  },
  {
    package: "@orderly.network/ui",
    path: "../../packages/ui/src",
    watch: true,
  },
  {
    package: "@orderly.network/ui-chain-selector",
    path: "../../packages/ui-chain-selector/src",
    watch: true,
  },
  {
    package: "@orderly.network/ui-connector",
    path: "../../packages/ui-connector/src",
    watch: true,
  },
  {
    package: "@orderly.network/ui-leverage",
    path: "../../packages/ui-leverage/src",
    watch: true,
  },
  {
    package: "@orderly.network/ui-order-entry",
    path: "../../packages/ui-order-entry/src",
    watch: true,
  },
  {
    package: "@orderly.network/ui-orders",
    path: "../../packages/ui-orders/src",
    watch: true,
  },
  {
    package: "@orderly.network/ui-positions",
    path: "../../packages/ui-positions/src",
    watch: true,
  },
  {
    package: "@orderly.network/ui-scaffold",
    path: "../../packages/ui-scaffold/src",
    watch: true,
  },
  {
    package: "@orderly.network/ui-share",
    path: "../../packages/ui-share/src",
    watch: true,
  },
  {
    package: "@orderly.network/ui-tpsl",
    path: "../../packages/ui-tpsl/src",
    watch: true,
  },
  {
    package: "@orderly.network/ui-tradingview",
    path: "../../packages/ui-tradingview/src",
    watch: true,
  },
  {
    package: "@orderly.network/ui-transfer",
    path: "../../packages/ui-transfer/src",
    watch: true,
  },
  {
    package: "@orderly.network/chart",
    path: "../../packages/chart/src",
    watch: true,
  },
];

const page: Package[] = [
  {
    package: "@orderly.network/affiliate",
    path: "../../packages/affiliate/src",
    watch: true,
  },
  {
    package: "@orderly.network/markets",
    path: "../../packages/markets/src",
    watch: true,
  },
  {
    package: "@orderly.network/portfolio",
    path: "../../packages/portfolio/src",
    watch: true,
  },
  {
    package: "@orderly.network/trading",
    path: "../../packages/trading/src",
    watch: true,
  },
  {
    package: "@orderly.network/trading-leaderboard",
    path: "../../packages/trading-leaderboard/src",
    watch: true,
  },
  {
    package: "@orderly.network/trading-rewards",
    path: "../../packages/trading-rewards/src",
    watch: true,
  },
];

const walletConnect: Package[] = [
  {
    package: "@orderly.network/wallet-connector",
    path: "../../packages/wallet-connector/src",
    watch: true,
  },
  {
    package: "@orderly.network/wallet-connector-privy",
    path: "../../packages/wallet-connector-privy/src",
    watch: true,
  },
];

const i18n: Package[] = [
  // need to before @orderly.network/i18n
  {
    package: "@orderly.network/i18n/locales",
    path: "../../packages/i18n/locales",
    watch: true,
  },
  {
    package: "@orderly.network/i18n",
    path: "../../packages/i18n/src",
    watch: true,
  },
];

export const packages: Package[] = [
  ...base,
  ...ui,
  ...page,
  ...walletConnect,
  ...i18n,
];

export function getAllPackages() {
  return packages.map((item) => {
    return {
      ...item,
      path: resolve(__dirname, item.path),
    };
  });
}

export function getPackageConfig() {
  const watchPackages = process.env.VITE_WATCH_PACKAGES?.split(",").map(
    (item) => {
      const packageName = item.trim();
      if (packageName.startsWith("@orderly.network/")) {
        return packageName;
      }
      return `${"@orderly.network/"}${packageName}`;
    },
  );

  const watchs: Package[] = [];
  const unwatchs: Package[] = [];

  const allPackages = getAllPackages();

  allPackages.forEach((item) => {
    if (
      (watchPackages && watchPackages.includes(item.package)) ||
      (!watchPackages && item.watch)
    ) {
      watchs.push(item);
    } else {
      unwatchs.push(item);
    }
  });

  return {
    watchs,
    unwatchs,
  };
}
