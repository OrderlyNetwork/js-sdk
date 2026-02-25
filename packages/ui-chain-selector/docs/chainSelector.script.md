# chainSelector.script.ts

## Overview

Implements the chain selector logic: hook `useChainSelectorScript` and internal helpers for chain data, recent chains, and tab state. Uses `@orderly.network/hooks` (config, storage chain, chains, wallet connector), `@orderly.network/types` (NetworkId), and `@orderly.network/react-app` (onChainChanged, currentChainId, wrongNetwork).

## Exports

### UseChainSelectorScriptReturn

Return type of `useChainSelectorScript`. Contains the state and handlers passed to the UI component.

### UseChainSelectorScriptOptions

Options for `useChainSelectorScript`.

| Property               | Type | Required | Description |
|------------------------|------|----------|-------------|
| `networkId`            | `NetworkId` | No  | Network context. |
| `bridgeLessOnly`       | `boolean`  | No  | If true, only show bridgeless mainnet chains. |
| `close`                | `() => void` | No | Callback to close dialog/sheet. |
| `resolve`              | `(isSuccess: boolean) => void` | No | Resolve promise with success flag. |
| `reject`               | `() => void` | No | Reject promise. |
| `onChainChangeBefore`  | `(chainId: number, state: { isTestnet: boolean }) => void` | No | Called before switching chain. |
| `onChainChangeAfter`   | `(chainId: number, state: { isTestnet: boolean; isWalletConnected: boolean }) => void` | No | Called after switch attempt. |

### useChainSelectorScript(options)

Hook that:

- Builds `chains` (mainnet/testnet) from config, optionally filtered by `bridgeLessOnly`.
- Derives `showTestnet` from theme overrides and testnet list length.
- Manages `selectChainId`, recent chains (local storage, max 6), and mainnet/testnet tab.
- Exposes `onChainClick`: switches chain via wallet or storage, then calls `resolve`/`close` and `onChainChangeAfter`/`onChainChanged`.

**Returns**: Object with `recentChains`, `chains`, `selectChainId`, `onChainClick`, `selectedTab`, `onTabChange`, `showTestnet` for use by `ChainSelector` UI.

## Internal helpers

- **useChainTab** – Manages `selectedTab` (Mainnet/Testnet) and syncs with `currentChainId` and `wrongNetwork`.
- **useRecentChains** – Loads/saves recent chain IDs from local storage (`orderly_selected_chains`), only mainnet; max 6 items.

## Usage example

```typescript
import { useChainSelectorScript, UseChainSelectorScriptOptions } from "./chainSelector.script";

const options: UseChainSelectorScriptOptions = {
  bridgeLessOnly: true,
  close: () => {},
  onChainChangeAfter: (chainId, { isTestnet, isWalletConnected }) => {
    console.log("Switched to", chainId, isTestnet, isWalletConnected);
  },
};

const state = useChainSelectorScript(options);
// state.recentChains, state.chains, state.onChainClick, state.selectedTab, state.onTabChange, state.showTestnet
```
