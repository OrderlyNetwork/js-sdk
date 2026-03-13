import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

type Package = {
  package: string;
  path: string;
  watch: boolean;
  alwaysWatch?: boolean;
  includeCSS?: boolean;
};

const base: Package[] = [
  {
    package: "@orderly.network/react-app",
    path: "../../packages/app/src",
    watch: true,
    includeCSS: true,
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
    watch: true,
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
  {
    package: "@orderly.network/plugin-core",
    path: "../../packages/plugin-core/src",
    watch: true,
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
    includeCSS: true,
  },
  {
    package: "@orderly.network/ui-chain-selector",
    path: "../../packages/ui-chain-selector/src",
    watch: true,
    includeCSS: true,
  },
  {
    package: "@orderly.network/ui-connector",
    path: "../../packages/ui-connector/src",
    watch: true,
    includeCSS: true,
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
    includeCSS: true,
  },
  {
    package: "@orderly.network/ui-orders",
    path: "../../packages/ui-orders/src",
    watch: true,
    includeCSS: true,
  },
  {
    package: "@orderly.network/ui-positions",
    path: "../../packages/ui-positions/src",
    watch: true,
    includeCSS: true,
  },
  {
    package: "@orderly.network/ui-scaffold",
    path: "../../packages/ui-scaffold/src",
    watch: true,
    includeCSS: true,
  },
  {
    package: "@orderly.network/ui-share",
    path: "../../packages/ui-share/src",
    watch: true,
    includeCSS: true,
  },
  {
    package: "@orderly.network/ui-tpsl",
    path: "../../packages/ui-tpsl/src",
    watch: true,
    includeCSS: true,
  },
  {
    package: "@orderly.network/ui-tradingview",
    path: "../../packages/ui-tradingview/src",
    watch: true,
    includeCSS: true,
  },
  {
    package: "@orderly.network/ui-transfer",
    path: "../../packages/ui-transfer/src",
    watch: true,
    includeCSS: true,
  },
  {
    package: "@orderly.network/chart",
    path: "../../packages/chart/src",
    watch: true,
    includeCSS: true,
  },
  {
    package: "@orderly.network/ui-notification",
    path: "../../packages/ui-notification/src",
    watch: true,
    includeCSS: true,
  },
];

const page: Package[] = [
  {
    package: "@orderly.network/affiliate",
    path: "../../packages/affiliate/src",
    watch: true,
    includeCSS: true,
  },
  {
    package: "@orderly.network/markets",
    path: "../../packages/markets/src",
    watch: true,
    includeCSS: true,
  },
  {
    package: "@orderly.network/portfolio",
    path: "../../packages/portfolio/src",
    watch: true,
    includeCSS: true,
  },
  {
    package: "@orderly.network/trading",
    path: "../../packages/trading/src",
    watch: true,
    includeCSS: true,
  },
  {
    package: "@orderly.network/trading-leaderboard",
    path: "../../packages/trading-leaderboard/src",
    watch: true,
    includeCSS: true,
  },
  {
    package: "@orderly.network/trading-rewards",
    path: "../../packages/trading-rewards/src",
    watch: true,
    includeCSS: true,
  },
  {
    package: "@orderly.network/vaults",
    path: "../../packages/vaults/src",
    watch: true,
    includeCSS: true,
  },
];

const walletConnect: Package[] = [
  {
    package: "@orderly.network/wallet-connector",
    path: "../../packages/wallet-connector/src",
    watch: true,
    includeCSS: true,
  },
  {
    package: "@orderly.network/wallet-connector-privy",
    path: "../../packages/wallet-connector-privy/src",
    watch: true,
    includeCSS: true,
  },
];

const i18n: Package[] = [
  // need to before @orderly.network/i18n
  {
    package: "@orderly.network/i18n/locales",
    path: "../../packages/i18n/locales",
    watch: true,
    alwaysWatch: true,
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

/**
 * Parse VITE_WATCH_PACKAGES: comma-separated package names only.
 * Short names (e.g. "net") get @orderly.network/ prefix
 */
function parseWatchPackagesList(raw: string | undefined): string[] | undefined {
  if (!raw?.trim()) return undefined;
  const selectedNames: string[] = [];
  raw.split(",").forEach((entry) => {
    const trimmed = entry.trim();
    if (!trimmed) return;
    // Ignore path part: do not support pkg=path in VITE_WATCH_PACKAGES
    const namePart = trimmed.split("=", 2)[0].trim();
    if (!namePart) return;
    const normalizedName = namePart.startsWith("@orderly.network/")
      ? namePart
      : `@orderly.network/${namePart}`;
    selectedNames.push(normalizedName);
  });
  return selectedNames.length ? selectedNames : undefined;
}

/**
 * Parse VITE_WATCH_PACKAGE_PATHS: comma-separated "package=path" entries.
 * Package names are used as-is (no @orderly.network/ prefix).
 *
 * In getWatchPackages:
 * - if a custom path ends with "/dist" or "/src", that directory is watched as-is
 * - if a custom path does NOT end with "/dist" or "/src", both "<path>/dist" and "<path>/src"
 *   will be watched for that package.
 */
function parseWatchPackagePaths(
  raw: string | undefined,
): Record<string, string> {
  const pathOverrides: Record<string, string> = {};
  if (!raw?.trim()) return pathOverrides;
  raw.split(",").forEach((entry) => {
    const trimmed = entry.trim();
    if (!trimmed) return;
    const eq = trimmed.indexOf("=");
    if (eq === -1) return;
    const pkg = trimmed.slice(0, eq).trim();
    const pathPart = trimmed.slice(eq + 1).trim();
    if (!pkg || !pathPart) return;
    pathOverrides[pkg] = pathPart;
  });
  return pathOverrides;
}

export function getWatchPackages() {
  const watchPackages = parseWatchPackagesList(process.env.VITE_WATCH_PACKAGES);
  const pathOverrides = parseWatchPackagePaths(
    process.env.VITE_WATCH_PACKAGE_PATHS,
  );

  const watchs: Package[] = [];
  const unwatchs: Package[] = [];

  packages.forEach((item) => {
    const finalPath = item.path.startsWith("/")
      ? item.path
      : resolve(__dirname, item.path);

    item.path = finalPath;

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

  // Handle custom entries only from VITE_WATCH_PACKAGE_PATHS (not in predefined `packages`)
  Object.entries(pathOverrides).forEach(([pkgName, overridePath]) => {
    const exists = packages.some((item) => item.package === pkgName);
    if (exists) return;

    const basePath = overridePath.startsWith("/")
      ? overridePath
      : resolve(__dirname, overridePath);

    // Normalize to forward slashes so the suffix check works on all platforms
    const normalized = basePath.replace(/\\+/g, "/");
    const endsWithDistOrSrc = /\/(dist|src)\/?$/.test(normalized);

    if (endsWithDistOrSrc) {
      // Path already points to a specific dist/src directory: watch it as-is
      watchs.push({
        package: pkgName,
        path: basePath,
        watch: true,
        includeCSS: true,
      });
      return;
    }

    // Path is the package root: automatically watch both <path>/dist and <path>/src
    const distPath = resolve(basePath, "dist");
    const srcPath = resolve(basePath, "src");

    watchs.push({
      package: `${pkgName}/dist`,
      path: distPath,
      watch: true,
      includeCSS: true,
    });

    watchs.push({
      package: pkgName,
      path: srcPath,
      watch: true,
      includeCSS: true,
    });
  });

  // console.log("packages", packages);
  console.log("getWatchPackages watchs", watchs);
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
