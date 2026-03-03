# index.ts (package entry)

## Overview

Public entry point for `@orderly.network/wallet-connector`. Re-exports the root provider component used to enable EVM and Solana wallet connectivity.

## Exports

### `WalletConnectorProvider`

Re-exported from `./provider`. The React provider component that wraps the app and supplies wallet connector context (connect, disconnect, setChain, wallet, namespace, etc.) for both EVM and Solana.

## Usage example

```ts
import { WalletConnectorProvider } from "@orderly.network/wallet-connector";

// Use as root or subtree provider
<WalletConnectorProvider solanaInitial={{}} evmInitial={{}}>
  <App />
</WalletConnectorProvider>
```
