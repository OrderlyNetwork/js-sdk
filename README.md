# Orderly SDKs

This monorepo contains the Orderly TypeScript SDKs, React hooks, and UI components for building trading applications.

To integrate the SDKs into your application, start with the [SDK documentation](https://orderly.network/docs/sdks) and [integration templates](#integration-templates). To develop the SDKs locally, follow [Getting Started](#getting-started).

If you have any questions about the code in this repository, you can also ask [![DeepWiki](https://img.shields.io/badge/DeepWiki-Documentation-blue)](https://deepwiki.com/OrderlyNetwork/js-sdk).

## Integration Templates

Start building with Orderly SDKs using these ready-to-use templates:

- [Vite Template](https://github.com/OrderlyNetwork/orderly-js-sdk-vite-template)
- [Remix Template](https://github.com/OrderlyNetwork/orderly-js-sdk-remix-template)
- [Next.js Template](https://github.com/OrderlyNetwork/orderly-js-sdk-nextjs-template)

## Release Notes

See the [SDK release notes](https://orderly.network/docs/release-notes/sdk) for version updates, new features, bug fixes, and upgrade notices.

## Getting Started

### Prerequisites

- Node.js >= 20.19.0
- pnpm >= 12.0.0; this repository pins pnpm 12.15.0 in `package.json`.

Run the following commands from the repository root.

### Install Dependencies and Build

```bash
pnpm install
pnpm build
```

Build once before starting either development server. Some workspace packages resolve to their `dist` output, and the playground imports `@orderly.network/ui/dist/styles.css`. These generated files are not included in a fresh clone. Rebuild affected packages after changing code consumed from `dist`; see [Watching Local Packages](apps/storybook/README.md#watching-local-packages).

### Run the Vite Playground

Use the playground to develop and test application pages:

```bash
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173), or use the address printed in the terminal if the port is occupied. For URL parameters, environment settings, and wallet modes, see the [Playground Configuration](apps/storybook/README.md#playground-configuration).

### Run Storybook

Use Storybook to develop and inspect individual components and stories:

```bash
pnpm storybook
```

Open [http://localhost:6006](http://localhost:6006). Choose either the playground or Storybook for your task; running both is optional.

## Development Commands

Run these commands from the repository root:

| Command                                                         | Purpose                                                                      |
| --------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `pnpm build`                                                    | Build workspace packages and generate documentation artifacts through Turbo. |
| `pnpm build-storybook`                                          | Build the static Storybook site after building workspace dependencies.       |
| `pnpm lint`                                                     | Run workspace packages that define a `lint` script.                          |
| `pnpm lint:error`                                               | Run ESLint from the root and report errors only.                             |
| `pnpm exec prettier --write README.md apps/storybook/README.md` | Format selected files; replace the paths with the files you changed.         |
| `pnpm --filter @orderly.network/core build`                     | Rebuild one package whose dependencies have already been built.              |

### Tests

Check the target package's `package.json` before running tests: packages use different test runners, and some still have placeholder test scripts. For example:

```bash
pnpm --filter @orderly.network/react-app test
pnpm --filter @orderly.network/hooks test
pnpm --filter @orderly.network/devkit test
```

The root `pnpm test` command currently fails because `turbo.json` does not define a `test` task. Run the relevant package's test script directly.

## Repository Structure

| Directory         | Purpose                                                                                         |
| ----------------- | ----------------------------------------------------------------------------------------------- |
| `packages/`       | SDK packages, including `core`, `hooks`, `types`, `utils`, UI components, and trading features. |
| `apps/storybook/` | Vite playground and Storybook for local development.                                            |
| `apps/ai-docs/`   | Documentation generators for components and hooks.                                              |

## Packages

Packages do not all share the same version number: `perp`, layout packages, DevKit, and SDK Docs have different version series. When upgrading an application, follow the release notes and each package's dependency and peer dependency requirements; do not force every package to the same version number. The badges below show published versions, which may differ from the checked-out source.

<details>
<summary>All Packages</summary>

Public npm packages maintained in this repository. Version badges show the published npm `latest` version.

| Package                                                                                                          | Purpose                                                                         | Version                                                                                                                                                                                                                    |
| ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [@orderly.network/affiliate](https://www.npmjs.com/package/@orderly.network/affiliate)                           | Affiliate dashboards, referral programs, and rebate settings.                   | [![@orderly.network/affiliate npm version](https://img.shields.io/npm/v/@orderly.network/affiliate?label=npm&color=blue)](https://www.npmjs.com/package/@orderly.network/affiliate)                                        |
| [@orderly.network/chart](https://www.npmjs.com/package/@orderly.network/chart)                                   | Charts for PnL, assets, and trading volume.                                     | [![@orderly.network/chart npm version](https://img.shields.io/npm/v/@orderly.network/chart?label=npm&color=blue)](https://www.npmjs.com/package/@orderly.network/chart)                                                    |
| [@orderly.network/core](https://www.npmjs.com/package/@orderly.network/core)                                     | Account management, signing, key storage, and SDK configuration.                | [![@orderly.network/core npm version](https://img.shields.io/npm/v/@orderly.network/core?label=npm&color=blue)](https://www.npmjs.com/package/@orderly.network/core)                                                       |
| [@orderly.network/default-evm-adapter](https://www.npmjs.com/package/@orderly.network/default-evm-adapter)       | Default EVM wallet adapter.                                                     | [![@orderly.network/default-evm-adapter npm version](https://img.shields.io/npm/v/@orderly.network/default-evm-adapter?label=npm&color=blue)](https://www.npmjs.com/package/@orderly.network/default-evm-adapter)          |
| [@orderly.network/default-solana-adapter](https://www.npmjs.com/package/@orderly.network/default-solana-adapter) | Default Solana wallet adapter.                                                  | [![@orderly.network/default-solana-adapter npm version](https://img.shields.io/npm/v/@orderly.network/default-solana-adapter?label=npm&color=blue)](https://www.npmjs.com/package/@orderly.network/default-solana-adapter) |
| [@orderly.network/devkit](https://www.npmjs.com/package/@orderly.network/devkit)                                 | Plugin scaffolding, Marketplace management, and MCP / agent skill integrations. | [![@orderly.network/devkit npm version](https://img.shields.io/npm/v/@orderly.network/devkit?label=npm&color=blue)](https://www.npmjs.com/package/@orderly.network/devkit)                                                 |
| [@orderly.network/hooks](https://www.npmjs.com/package/@orderly.network/hooks)                                   | React hooks for account state, market data, and trading operations.             | [![@orderly.network/hooks npm version](https://img.shields.io/npm/v/@orderly.network/hooks?label=npm&color=blue)](https://www.npmjs.com/package/@orderly.network/hooks)                                                    |
| [@orderly.network/i18n](https://www.npmjs.com/package/@orderly.network/i18n)                                     | Translations, locale resources, and internationalization providers.             | [![@orderly.network/i18n npm version](https://img.shields.io/npm/v/@orderly.network/i18n?label=npm&color=blue)](https://www.npmjs.com/package/@orderly.network/i18n)                                                       |
| [@orderly.network/layout-core](https://www.npmjs.com/package/@orderly.network/layout-core)                       | Shared layout interfaces, runtime, and persistence helpers.                     | [![@orderly.network/layout-core npm version](https://img.shields.io/npm/v/@orderly.network/layout-core?label=npm&color=blue)](https://www.npmjs.com/package/@orderly.network/layout-core)                                  |
| [@orderly.network/layout-grid](https://www.npmjs.com/package/@orderly.network/layout-grid)                       | Resizable grid layouts and trading layout presets.                              | [![@orderly.network/layout-grid npm version](https://img.shields.io/npm/v/@orderly.network/layout-grid?label=npm&color=blue)](https://www.npmjs.com/package/@orderly.network/layout-grid)                                  |
| [@orderly.network/layout-split](https://www.npmjs.com/package/@orderly.network/layout-split)                     | Resizable split layouts and trading panel components.                           | [![@orderly.network/layout-split npm version](https://img.shields.io/npm/v/@orderly.network/layout-split?label=npm&color=blue)](https://www.npmjs.com/package/@orderly.network/layout-split)                               |
| [@orderly.network/markets](https://www.npmjs.com/package/@orderly.network/markets)                               | Market lists, favorites, symbol information, and funding views.                 | [![@orderly.network/markets npm version](https://img.shields.io/npm/v/@orderly.network/markets?label=npm&color=blue)](https://www.npmjs.com/package/@orderly.network/markets)                                              |
| [@orderly.network/net](https://www.npmjs.com/package/@orderly.network/net)                                       | REST request helpers and WebSocket connections.                                 | [![@orderly.network/net npm version](https://img.shields.io/npm/v/@orderly.network/net?label=npm&color=blue)](https://www.npmjs.com/package/@orderly.network/net)                                                          |
| [@orderly.network/perp](https://www.npmjs.com/package/@orderly.network/perp)                                     | Perpetual trading calculations for accounts, positions, and orders.             | [![@orderly.network/perp npm version](https://img.shields.io/npm/v/@orderly.network/perp?label=npm&color=blue)](https://www.npmjs.com/package/@orderly.network/perp)                                                       |
| [@orderly.network/plugin-core](https://www.npmjs.com/package/@orderly.network/plugin-core)                       | Plugin registration, extension slots, and component interceptors.               | [![@orderly.network/plugin-core npm version](https://img.shields.io/npm/v/@orderly.network/plugin-core?label=npm&color=blue)](https://www.npmjs.com/package/@orderly.network/plugin-core)                                  |
| [@orderly.network/portfolio](https://www.npmjs.com/package/@orderly.network/portfolio)                           | Portfolio pages for assets, performance, and account activity.                  | [![@orderly.network/portfolio npm version](https://img.shields.io/npm/v/@orderly.network/portfolio?label=npm&color=blue)](https://www.npmjs.com/package/@orderly.network/portfolio)                                        |
| [@orderly.network/react-app](https://www.npmjs.com/package/@orderly.network/react-app)                           | Application providers, shared configuration, and trading access helpers.        | [![@orderly.network/react-app npm version](https://img.shields.io/npm/v/@orderly.network/react-app?label=npm&color=blue)](https://www.npmjs.com/package/@orderly.network/react-app)                                        |
| [@orderly.network/sdk-docs](https://www.npmjs.com/package/@orderly.network/sdk-docs)                             | SDK documentation retrieval and MCP server.                                     | [![@orderly.network/sdk-docs npm version](https://img.shields.io/npm/v/@orderly.network/sdk-docs?label=npm&color=blue)](https://www.npmjs.com/package/@orderly.network/sdk-docs)                                           |
| [@orderly.network/trading](https://www.npmjs.com/package/@orderly.network/trading)                               | Trading pages, order books, trade feeds, and layout components.                 | [![@orderly.network/trading npm version](https://img.shields.io/npm/v/@orderly.network/trading?label=npm&color=blue)](https://www.npmjs.com/package/@orderly.network/trading)                                              |
| [@orderly.network/trading-leaderboard](https://www.npmjs.com/package/@orderly.network/trading-leaderboard)       | Trading leaderboard pages and ranking components.                               | [![@orderly.network/trading-leaderboard npm version](https://img.shields.io/npm/v/@orderly.network/trading-leaderboard?label=npm&color=blue)](https://www.npmjs.com/package/@orderly.network/trading-leaderboard)          |
| [@orderly.network/trading-next](https://www.npmjs.com/package/@orderly.network/trading-next)                     | Trading page implementation with additional layout controls.                    | [![@orderly.network/trading-next npm version](https://img.shields.io/npm/v/@orderly.network/trading-next?label=npm&color=blue)](https://www.npmjs.com/package/@orderly.network/trading-next)                               |
| [@orderly.network/trading-rewards](https://www.npmjs.com/package/@orderly.network/trading-rewards)               | Trading rewards pages and components.                                           | [![@orderly.network/trading-rewards npm version](https://img.shields.io/npm/v/@orderly.network/trading-rewards?label=npm&color=blue)](https://www.npmjs.com/package/@orderly.network/trading-rewards)                      |
| [@orderly.network/types](https://www.npmjs.com/package/@orderly.network/types)                                   | Shared TypeScript types, API models, and constants.                             | [![@orderly.network/types npm version](https://img.shields.io/npm/v/@orderly.network/types?label=npm&color=blue)](https://www.npmjs.com/package/@orderly.network/types)                                                    |
| [@orderly.network/ui](https://www.npmjs.com/package/@orderly.network/ui)                                         | Base UI components, themes, dialogs, and formatting primitives.                 | [![@orderly.network/ui npm version](https://img.shields.io/npm/v/@orderly.network/ui?label=npm&color=blue)](https://www.npmjs.com/package/@orderly.network/ui)                                                             |
| [@orderly.network/ui-chain-selector](https://www.npmjs.com/package/@orderly.network/ui-chain-selector)           | Chain selection widgets, dialogs, and sheets.                                   | [![@orderly.network/ui-chain-selector npm version](https://img.shields.io/npm/v/@orderly.network/ui-chain-selector?label=npm&color=blue)](https://www.npmjs.com/package/@orderly.network/ui-chain-selector)                |
| [@orderly.network/ui-connector](https://www.npmjs.com/package/@orderly.network/ui-connector)                     | Wallet connection UI, onboarding, and authentication guards.                    | [![@orderly.network/ui-connector npm version](https://img.shields.io/npm/v/@orderly.network/ui-connector?label=npm&color=blue)](https://www.npmjs.com/package/@orderly.network/ui-connector)                               |
| [@orderly.network/ui-leverage](https://www.npmjs.com/package/@orderly.network/ui-leverage)                       | Account and symbol leverage editors.                                            | [![@orderly.network/ui-leverage npm version](https://img.shields.io/npm/v/@orderly.network/ui-leverage?label=npm&color=blue)](https://www.npmjs.com/package/@orderly.network/ui-leverage)                                  |
| [@orderly.network/ui-notification](https://www.npmjs.com/package/@orderly.network/ui-notification)               | Notifications and announcement center components.                               | [![@orderly.network/ui-notification npm version](https://img.shields.io/npm/v/@orderly.network/ui-notification?label=npm&color=blue)](https://www.npmjs.com/package/@orderly.network/ui-notification)                      |
| [@orderly.network/ui-order-entry](https://www.npmjs.com/package/@orderly.network/ui-order-entry)                 | Order entry forms, validation feedback, and confirmation dialogs.               | [![@orderly.network/ui-order-entry npm version](https://img.shields.io/npm/v/@orderly.network/ui-order-entry?label=npm&color=blue)](https://www.npmjs.com/package/@orderly.network/ui-order-entry)                         |
| [@orderly.network/ui-orders](https://www.npmjs.com/package/@orderly.network/ui-orders)                           | Order lists and order management components.                                    | [![@orderly.network/ui-orders npm version](https://img.shields.io/npm/v/@orderly.network/ui-orders?label=npm&color=blue)](https://www.npmjs.com/package/@orderly.network/ui-orders)                                        |
| [@orderly.network/ui-positions](https://www.npmjs.com/package/@orderly.network/ui-positions)                     | Position lists, position actions, and funding fee history.                      | [![@orderly.network/ui-positions npm version](https://img.shields.io/npm/v/@orderly.network/ui-positions?label=npm&color=blue)](https://www.npmjs.com/package/@orderly.network/ui-positions)                               |
| [@orderly.network/ui-scaffold](https://www.npmjs.com/package/@orderly.network/ui-scaffold)                       | Application shell, navigation, account menus, and subaccount UI.                | [![@orderly.network/ui-scaffold npm version](https://img.shields.io/npm/v/@orderly.network/ui-scaffold?label=npm&color=blue)](https://www.npmjs.com/package/@orderly.network/ui-scaffold)                                  |
| [@orderly.network/ui-share](https://www.npmjs.com/package/@orderly.network/ui-share)                             | PnL sharing dialogs and components.                                             | [![@orderly.network/ui-share npm version](https://img.shields.io/npm/v/@orderly.network/ui-share?label=npm&color=blue)](https://www.npmjs.com/package/@orderly.network/ui-share)                                           |
| [@orderly.network/ui-tpsl](https://www.npmjs.com/package/@orderly.network/ui-tpsl)                               | Take-profit and stop-loss editors and position controls.                        | [![@orderly.network/ui-tpsl npm version](https://img.shields.io/npm/v/@orderly.network/ui-tpsl?label=npm&color=blue)](https://www.npmjs.com/package/@orderly.network/ui-tpsl)                                              |
| [@orderly.network/ui-tradingview](https://www.npmjs.com/package/@orderly.network/ui-tradingview)                 | TradingView chart integration and display controls.                             | [![@orderly.network/ui-tradingview npm version](https://img.shields.io/npm/v/@orderly.network/ui-tradingview?label=npm&color=blue)](https://www.npmjs.com/package/@orderly.network/ui-tradingview)                         |
| [@orderly.network/ui-transfer](https://www.npmjs.com/package/@orderly.network/ui-transfer)                       | Deposit, withdrawal, transfer, and asset conversion forms.                      | [![@orderly.network/ui-transfer npm version](https://img.shields.io/npm/v/@orderly.network/ui-transfer?label=npm&color=blue)](https://www.npmjs.com/package/@orderly.network/ui-transfer)                                  |
| [@orderly.network/utils](https://www.npmjs.com/package/@orderly.network/utils)                                   | Decimal arithmetic, date, formatting, and trading utilities.                    | [![@orderly.network/utils npm version](https://img.shields.io/npm/v/@orderly.network/utils?label=npm&color=blue)](https://www.npmjs.com/package/@orderly.network/utils)                                                    |
| [@orderly.network/vaults](https://www.npmjs.com/package/@orderly.network/vaults)                                 | Vault pages, components, and data access helpers.                               | [![@orderly.network/vaults npm version](https://img.shields.io/npm/v/@orderly.network/vaults?label=npm&color=blue)](https://www.npmjs.com/package/@orderly.network/vaults)                                                 |
| [@orderly.network/wallet-connector](https://www.npmjs.com/package/@orderly.network/wallet-connector)             | EVM and Solana wallet connection provider.                                      | [![@orderly.network/wallet-connector npm version](https://img.shields.io/npm/v/@orderly.network/wallet-connector?label=npm&color=blue)](https://www.npmjs.com/package/@orderly.network/wallet-connector)                   |
| [@orderly.network/wallet-connector-privy](https://www.npmjs.com/package/@orderly.network/wallet-connector-privy) | Wallet connection and user center with Privy integration.                       | [![@orderly.network/wallet-connector-privy npm version](https://img.shields.io/npm/v/@orderly.network/wallet-connector-privy?label=npm&color=blue)](https://www.npmjs.com/package/@orderly.network/wallet-connector-privy) |
| [@orderly.network/web3-provider-ethers](https://www.npmjs.com/package/@orderly.network/web3-provider-ethers)     | Ethers-backed Web3 provider for EVM integration.                                | [![@orderly.network/web3-provider-ethers npm version](https://img.shields.io/npm/v/@orderly.network/web3-provider-ethers?label=npm&color=blue)](https://www.npmjs.com/package/@orderly.network/web3-provider-ethers)       |

</details>
