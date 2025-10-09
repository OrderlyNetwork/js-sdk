# Orderly SDKs

[![DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/OrderlyNetwork/js-sdk)
[![Hooks NPM Version](https://img.shields.io/npm/v/@orderly.network/hooks?label=@orderly.network/hooks&color=blue)](https://www.npmjs.com/package/@orderly.network/hooks)
[![Core NPM Version](https://img.shields.io/npm/v/@orderly.network/core?label=@orderly.network/core&color=blue)](https://www.npmjs.com/package/@orderly.network/core)
[![Perp NPM Version](https://img.shields.io/npm/v/@orderly.network/perp?label=@orderly.network/perp&color=blue)](https://www.npmjs.com/package/@orderly.network/perp)
[![Wallet connector privy NPM Version](https://img.shields.io/npm/v/@orderly.network/wallet-connector-privy?label=@orderly.network/wallet-connector-privy&color=blue)](https://www.npmjs.com/package/@orderly.network/wallet-connector-privy)
[![Wallet connector NPM Version](https://img.shields.io/npm/v/@orderly.network/wallet-connector?label=@orderly.network/wallet-connector&color=blue)](https://www.npmjs.com/package/@orderly.network/wallet-connector)
[![Types NPM Version](https://img.shields.io/npm/v/@orderly.network/types?label=@orderly.network/types&color=blue)](https://www.npmjs.com/package/@orderly.network/types)
[![UI NPM Version](https://img.shields.io/npm/v/@orderly.network/ui?label=@orderly.network/ui&color=blue)](https://www.npmjs.com/package/@orderly.network/ui)
[![Trading NPM Version](https://img.shields.io/npm/v/@orderly.network/trading?label=@orderly.network/trading&color=blue)](https://www.npmjs.com/package/@orderly.network/trading)
[![I18n NPM Version](https://img.shields.io/npm/v/@orderly.network/i18n?label=@orderly.network/i18n&color=blue)](https://www.npmjs.com/package/@orderly.network/i18n)

Monorepo for all Orderly SDKs. Please check out our [documentation](https://orderly.network/docs/sdks).

If you have any questions about the code in this repository, you can also ask [deepwiki](https://deepwiki.com/OrderlyNetwork/js-sdk).

## Getting Started

1. Install dependencies:

```bash
pnpm install
```

2. Start the development server:

```bash
pnpm dev
```

3. Start the Storybook development server:

```bash
pnpm storybook
```

## Integration Templates:

Start building with Orderly SDKs using these ready-to-use templates:

- [Vite Template](https://github.com/OrderlyNetwork/orderly-js-sdk-vite-template)

- [Next.js Template](https://github.com/OrderlyNetwork/orderly-js-sdk-nextjs-template)

- [Remix Template](https://github.com/OrderlyNetwork/orderly-js-sdk-remix-template)

- [Create React App Template](https://github.com/OrderlyNetwork/orderly-js-sdk-cra-template)

## Env config

- env

  config env: dev, qa, staging, prod

- networkId

  mainnet/testnet

- brokerId

  set your broker id

- brokerName

  set broker name

- theme

  orderly/custom

- usePrivy

  true/false

```
http://localhost:5173/en/perp/PERP_ETH_USDC?env=prod&networkId=mainnet&brokerId=demo&broderName=Orderly&theme=orderly&usePrivy=false
```
