import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

type Package = {
  package: string;
  path: string;
  watch: boolean;
  alwaysWatch?: boolean;
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
    alwaysWatch: true,
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
  {
    package: "@orderly.network/ui-notification",
    path: "../../packages/ui-notification/src",
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
  {
    package: "@orderly.network/vaults",
    path: "../../packages/vaults/src",
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

export function getWatchPackages() {
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

  // console.log("packages", packages);
  // console.log("getWatchPackages watchs", watchs);
  // console.log("getWatchPackages unwatchs", unwatchs);

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
