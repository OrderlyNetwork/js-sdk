# initEvm.tsx

## Overview

Initializes the EVM (Web3 Onboard) layer: fetches chain info from Orderly testnet and mainnet APIs, merges chains into options, calls `initConfig`, and registers the Onboard API in the DI container. Renders children only after initialization (or immediately if `skipInit` is true).

## Exports

### `ConnectorInitOptions`

Same as in [types](types.md): optional subset of `InitOptions`.

---

### `WalletConnectorProviderProps` (local)

Used by `InitEvm` only (not the root provider). Props for this component:

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `apiKey` | `string` | No | Passed to `initConfig`. |
| `options` | `ConnectorInitOptions` | No | Merged with fetched chains. |
| `skipInit` | `boolean` | No | If true, skip init and render children immediately. |
| `children` | `ReactNode` | Yes | App tree. |

---

### `InitEvm`

**Props:** `PropsWithChildren<WalletConnectorProviderProps>`

1. Sets `--onboard-modal-z-index: 88` on `document.body`.
2. If `skipInit`, sets initialized and renders children.
3. Otherwise gets `onboardAPI` from DI (`get("onboardAPI")`). If already present, marks initialized and renders children.
4. Fetches chain info from:
   - `https://testnet-api.orderly.org/v1/public/chain_info`
   - `https://api.orderly.org/v1/public/chain_info`
5. Maps response `data.rows` to `{ id, token, label, rpcUrl, blockExplorerUrl }`, merges into `options.chains`, calls `initConfig(apiKey, options)`, registers with `register('onboardAPI', onboardAPI)`, then renders children.
6. Until initialized, returns `null` (no children).

## Usage example

```tsx
// Used internally by WalletConnectorProvider via evmInitial

<InitEvm apiKey="…" options={{ theme: "light" }} skipInit={false}>
  <Main>{children}</Main>
</InitEvm>
```
