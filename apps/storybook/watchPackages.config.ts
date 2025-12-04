import { resolve } from "path";

type Package = {
  package: string;
  path: string;
  watch: boolean;
  alwaysWatch?: boolean;
};

const base: Package[] = [
  {
    package: "@veltodefi/react-app",
    path: "../../packages/app/src",
    watch: true,
  },
  {
    package: "@veltodefi/hooks",
    path: "../../packages/hooks/src",
    watch: true,
  },
  {
    package: "@veltodefi/core",
    path: "../../packages/core/src",
    watch: false,
  },
  {
    package: "@veltodefi/net",
    path: "../../packages/net/src",
    watch: false,
  },
  {
    package: "@veltodefi/perp",
    path: "../../packages/perp/src",
    watch: false,
  },
  {
    package: "@veltodefi/utils",
    path: "../../packages/utils/src",
    watch: false,
  },
  {
    package: "@veltodefi/types",
    path: "../../packages/types/src",
    watch: false,
  },
  {
    package: "@veltodefi/default-evm-adapter",
    path: "../../packages/default-evm-adapter/src",
    watch: false,
  },
  {
    package: "@veltodefi/default-solana-adapter",
    path: "../../packages/default-solana-adapter/src",
    watch: false,
  },
  {
    package: "@veltodefi/web3-provider-ethers",
    path: "../../packages/web3-provider-ethers/src",
    watch: false,
  },
];

const ui: Package[] = [
  {
    package: "@veltodefi/ui/dist",
    path: "../../packages/ui/dist",
    watch: true,
    alwaysWatch: true,
  },
  {
    package: "@veltodefi/ui",
    path: "../../packages/ui/src",
    watch: true,
  },
  {
    package: "@veltodefi/ui-chain-selector",
    path: "../../packages/ui-chain-selector/src",
    watch: true,
  },
  {
    package: "@veltodefi/ui-connector",
    path: "../../packages/ui-connector/src",
    watch: true,
  },
  {
    package: "@veltodefi/ui-leverage",
    path: "../../packages/ui-leverage/src",
    watch: true,
  },
  {
    package: "@veltodefi/ui-order-entry",
    path: "../../packages/ui-order-entry/src",
    watch: true,
  },
  {
    package: "@veltodefi/ui-orders",
    path: "../../packages/ui-orders/src",
    watch: true,
  },
  {
    package: "@veltodefi/ui-positions",
    path: "../../packages/ui-positions/src",
    watch: true,
  },
  {
    package: "@veltodefi/ui-scaffold",
    path: "../../packages/ui-scaffold/src",
    watch: true,
  },
  {
    package: "@veltodefi/ui-share",
    path: "../../packages/ui-share/src",
    watch: true,
  },
  {
    package: "@veltodefi/ui-tpsl",
    path: "../../packages/ui-tpsl/src",
    watch: true,
  },
  {
    package: "@veltodefi/ui-tradingview",
    path: "../../packages/ui-tradingview/src",
    watch: true,
  },
  {
    package: "@veltodefi/ui-transfer",
    path: "../../packages/ui-transfer/src",
    watch: true,
  },
  {
    package: "@veltodefi/chart",
    path: "../../packages/chart/src",
    watch: true,
  },
  {
    package: "@veltodefi/ui-notification",
    path: "../../packages/ui-notification/src",
    watch: true,
  },
];

const page: Package[] = [
  {
    package: "@veltodefi/affiliate",
    path: "../../packages/affiliate/src",
    watch: true,
  },
  {
    package: "@veltodefi/markets",
    path: "../../packages/markets/src",
    watch: true,
  },
  {
    package: "@veltodefi/portfolio",
    path: "../../packages/portfolio/src",
    watch: true,
  },
  {
    package: "@veltodefi/trading",
    path: "../../packages/trading/src",
    watch: true,
  },
  {
    package: "@veltodefi/trading-leaderboard",
    path: "../../packages/trading-leaderboard/src",
    watch: true,
  },
  {
    package: "@veltodefi/trading-rewards",
    path: "../../packages/trading-rewards/src",
    watch: true,
  },
  {
    package: "@veltodefi/vaults",
    path: "../../packages/vaults/src",
    watch: true,
  },
];

const walletConnect: Package[] = [
  {
    package: "@veltodefi/wallet-connector",
    path: "../../packages/wallet-connector/src",
    watch: true,
  },
  {
    package: "@veltodefi/wallet-connector-privy",
    path: "../../packages/wallet-connector-privy/src",
    watch: true,
  },
];

const i18n: Package[] = [
  // need to before @veltodefi/i18n
  {
    package: "@veltodefi/i18n/locales",
    path: "../../packages/i18n/locales",
    watch: true,
  },
  {
    package: "@veltodefi/i18n",
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

export function getWatchPackages() {
  const watchPackages = process.env.VITE_WATCH_PACKAGES?.split(",").map(
    (item) => {
      const packageName = item.trim();
      if (packageName.startsWith("@veltodefi/")) {
        return packageName;
      }
      return `${"@veltodefi/"}${packageName}`;
    },
  );

  const watchs: Package[] = [];
  const unwatchs: Package[] = [];

  packages.forEach((item) => {
    // fill full path
    item.path = resolve(__dirname, item.path);

    if (
      (watchPackages && watchPackages.includes(item.package)) ||
      (!watchPackages && item.watch) ||
      item.alwaysWatch
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

export function getWatchIgnores() {
  /** base ignore */
  const base = [
    "**/node_modules/**",
    "**/dist/**",
    "**/build/**",
    "**/storybook-static/**",
    "**/.git/**",
    "**/.turbo/**",
    "**/__test__/**",
    "**/public/**",
  ];

  /** deprecated or private packages */
  const deprecatedPackages = [
    "**/apps/docs/**",
    "**/packages/cli/**",
    "**/packages/cli-codemod/**",
    "**/packages/eslint-config/**",
    "**/packages/create-orderly-app/**",
  ];

  const { unwatchs } = getWatchPackages();

  // ignore packages files
  const ignorePackages = unwatchs.map((item) => resolve(item.path, "../"));

  // watch packages dist
  const includeDist = unwatchs.map(
    (item) => `!${resolve(item.path, "../dist")}/**`,
  );

  return [...base, ...deprecatedPackages, ...ignorePackages, ...includeDist];
}
