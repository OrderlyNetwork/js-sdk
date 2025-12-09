# Velto and Orderly Merge

```bash
# Clone this repo
git clone git@github.com:veltodefi/orderly-js-sdk.git
git checkout velto-main # velto's default branch

# 1. Add the Orderly repo as a remote (one-time setup)
git remote add upstream https://github.com/OrderlyNetwork/orderly-js-sdk.git

# 2. Fetch tags from upstream
git fetch upstream --tags

# 3. Merge latest tag to velto-main
git merge v2.8.6  # or whatever the latest tag is

# IMPORTANT: Generate a classic GitHub Personal Access Token with repo, write:packages and read:packages permissions.
https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens

# 4. Set environment variables
export GIT_TOKEN="your_github_pat"
export GIT_USERNAME="git-username"
export GIT_NAME="Your Name"
export GIT_EMAIL="your@email.com"
export NPM_TOKEN="your_github_pat"
export NPM_REGISTRY="https://npm.pkg.github.com"  # GitHub Packages

# 5. Run release:velto command (handles versioning, building, and publishing)
pnpm release:velto

# 6. Commit changes
git add .
git commit -m "Release velto-main version"

# 7. Push to remote
git push origin velto-main
```

# Orderly SDKs

[![DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/OrderlyNetwork/js-sdk)
[![Hooks NPM Version](https://img.shields.io/npm/v/@veltodefi/hooks?label=@veltodefi/hooks&color=blue)](https://www.npmjs.com/package/@veltodefi/hooks)
[![Core NPM Version](https://img.shields.io/npm/v/@veltodefi/core?label=@veltodefi/core&color=blue)](https://www.npmjs.com/package/@veltodefi/core)
[![Perp NPM Version](https://img.shields.io/npm/v/@veltodefi/perp?label=@veltodefi/perp&color=blue)](https://www.npmjs.com/package/@veltodefi/perp)
[![Wallet connector privy NPM Version](https://img.shields.io/npm/v/@veltodefi/wallet-connector-privy?label=@veltodefi/wallet-connector-privy&color=blue)](https://www.npmjs.com/package/@veltodefi/wallet-connector-privy)
[![Wallet connector NPM Version](https://img.shields.io/npm/v/@veltodefi/wallet-connector?label=@veltodefi/wallet-connector&color=blue)](https://www.npmjs.com/package/@veltodefi/wallet-connector)
[![Types NPM Version](https://img.shields.io/npm/v/@veltodefi/types?label=@veltodefi/types&color=blue)](https://www.npmjs.com/package/@veltodefi/types)
[![UI NPM Version](https://img.shields.io/npm/v/@veltodefi/ui?label=@veltodefi/ui&color=blue)](https://www.npmjs.com/package/@veltodefi/ui)
[![Trading NPM Version](https://img.shields.io/npm/v/@veltodefi/trading?label=@veltodefi/trading&color=blue)](https://www.npmjs.com/package/@veltodefi/trading)
[![I18n NPM Version](https://img.shields.io/npm/v/@veltodefi/i18n?label=@veltodefi/i18n&color=blue)](https://www.npmjs.com/package/@veltodefi/i18n)

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
