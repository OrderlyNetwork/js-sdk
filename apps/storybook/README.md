# Orderly Playground and Storybook

This app contains the Vite playground for testing application pages and Storybook for developing components and stories.

## Local Development

Follow the [repository setup instructions](../../README.md#getting-started) to install dependencies and run the initial `pnpm build` before starting either server. This generates workspace `dist` files, including the UI stylesheet required by the playground. Run development commands from the repository root:

| Command          | Purpose                    | Default URL                                    |
| ---------------- | -------------------------- | ---------------------------------------------- |
| `pnpm dev`       | Start the Vite playground. | [http://localhost:5173](http://localhost:5173) |
| `pnpm storybook` | Start Storybook.           | [http://localhost:6006](http://localhost:6006) |

Use the address printed in the terminal if the default port is unavailable.

## Local Environment

Create `apps/storybook/.env.local` for your local overrides. This file is ignored by Git. A minimal testnet configuration is:

```dotenv
VITE_ENV=staging
VITE_NETWORK_ID=testnet
VITE_BROKER_ID=demo
VITE_BROKER_NAME=Orderly
```

The `pnpm dev` and `pnpm storybook` scripts load `.env.local` before `.env` using `dotenv-cli`. Existing shell environment variables take precedence over both files, and values in `.env.local` take precedence over `.env`. Restart the development server after changing environment variables, package watch settings, or Storybook story filters.

The URL parameters below override the corresponding application settings. Package watch settings and Storybook filters are configured through environment variables only.

## Playground Configuration

Configure the Vite playground using URL query parameters:

| Parameter    | Description / Values                                  | Environment Variable | Fallback  |
| ------------ | ----------------------------------------------------- | -------------------- | --------- |
| `env`        | API environment: `dev`, `qa`, `staging`, or `prod`.   | `VITE_ENV`           | `staging` |
| `networkId`  | Network: `mainnet` or `testnet`.                      | `VITE_NETWORK_ID`    | `testnet` |
| `brokerId`   | Your broker ID.                                       | `VITE_BROKER_ID`     | `demo`    |
| `brokerName` | Your broker display name.                             | `VITE_BROKER_NAME`   | `Orderly` |
| `walletMode` | Wallet provider mode: `privy`, `wallet`, or `legacy`. | —                    | `privy`   |

For `env`, `networkId`, `brokerId`, and `brokerName`, non-empty URL parameters take precedence over the corresponding environment variables. When neither provides a non-empty value, the fallback above is used. See [Local Environment](#local-environment) for file loading and precedence.

`env=prod` selects mainnet API endpoints; pair it with `networkId=mainnet`. `env=staging` selects testnet API endpoints; pair it with `networkId=testnet`. The `dev` and `qa` values select their respective development and QA API endpoints.

For example, to use mainnet with external wallets only:

```text
http://localhost:5173/en/perp/PERP_ETH_USDC?env=prod&networkId=mainnet&brokerId=demo&brokerName=Orderly&walletMode=wallet
```

### Wallet Modes

The Vite playground reads the wallet mode from the URL when it first renders:

- `walletMode=privy` uses the current wallet provider with Privy login enabled.
- `walletMode=wallet` uses the current wallet provider with external wallets only.
- `walletMode=legacy` uses the legacy Web3 Onboard provider in development.

For example:

```text
http://localhost:5173/?walletMode=privy
http://localhost:5173/?walletMode=wallet
http://localhost:5173/?walletMode=legacy
```

Missing or invalid values default to `privy`. The `legacy` mode is only active
in the Vite development environment; production builds fall back to `privy`.
Reload the page after changing the mode. Switching modes does not clear sessions
persisted by Privy, WalletConnect, or browser wallets.

## Watching Local Packages

The development alias and watch configuration is defined in [`watchPackages.config.mts`](watchPackages.config.mts). With `VITE_WATCH_PACKAGES` unset, it uses each package's configured `watch` flag. Many UI and feature packages use source files directly; `core`, `net`, `perp`, and the default wallet adapters use built output by default.

To work on a package consumed from `dist`, rebuild it after edits, or run its watch script in a separate terminal if the package provides one:

```bash
pnpm --filter @orderly.network/core build
```

For continuous rebuilding instead:

```bash
pnpm --filter @orderly.network/core dev
```

To select packages for source development, set a comma-separated list in `apps/storybook/.env.local`:

```dotenv
VITE_WATCH_PACKAGES=react-app,hooks,core,ui,trading
```

Short names receive the `@orderly.network/` prefix; full names are also accepted. An explicit list replaces the default selection, so include all packages whose source you want to edit. Entries marked `alwaysWatch` remain enabled, including UI `dist` styles, locale resources, and the grid and split layout packages. Packages outside the selection require current build output.

For an additional local package that is not already in the predefined package list:

```dotenv
VITE_WATCH_PACKAGE_PATHS=@orderly.network/trading-points=/absolute/path/to/trading-points
```

Use the full package name here; no scope prefix is added. A path ending in `/src` or `/dist` uses that directory directly; a package root adds both its `src` and `dist` directories. Relative paths resolve from `apps/storybook/`. Entries for predefined packages are currently ignored, so this setting cannot override their paths. Install the additional package's dependencies before using its source.

These settings apply to development. Production builds resolve workspace packages through their normal package entries and require built dependencies.

## Storybook Filters

Set `STORYBOOK_PAGES` in `apps/storybook/.env.local` to load only selected groups of stories:

```dotenv
STORYBOOK_PAGES=trading,portfolio
```

Supported values are `trading`, `portfolio`, `markets`, `affiliate`, `rewards`, `leaderboard`, and `plugin`. Leave the variable unset to load all stories. This filter affects Storybook only.

Set `STORYBOOK_DISABLED_ADDONS=true` to reduce enabled addons. The themes addon remains enabled; MDX stories are omitted when loading the default story set with this setting.

## Troubleshooting

| Symptom                                                          | What to check                                                                                                                                |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Missing workspace entry or `@orderly.network/ui/dist/styles.css` | Run `pnpm build` from the repository root before starting the server.                                                                        |
| Changes in `core`, `net`, or `perp` do not appear                | Rebuild the affected package, run its watch script, or include it in `VITE_WATCH_PACKAGES`; restart the server after changing the selection. |
| `.env.local` changes have no effect                              | Restart the server, check for existing shell variables, and remove URL parameters that override the corresponding setting.                   |
| Expected Storybook stories are missing                           | Check `STORYBOOK_PAGES` and `STORYBOOK_DISABLED_ADDONS`, then restart Storybook.                                                             |

For linting, formatting, and package tests, see [Development Commands](../../README.md#development-commands).
