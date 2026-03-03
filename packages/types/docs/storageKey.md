# storageKey

## Overview

LocalStorage key constants used by the Orderly SDK for persisting wallet type (Ledger), connector, chain, link device state, TradingView fullscreen, and order entry sort keys.

## Exports

| Name | Value | Description |
|------|-------|-------------|
| LedgerWalletKey | `"orderly:ledger-wallet"` | Ledger wallet flag |
| ConnectorKey | `"orderly:connectorKey"` | Connector identifier |
| ChainKey | `"order:chain"` | Selected chain |
| LinkDeviceKey | `"orderly_link_device"` | Link device state |
| TradingviewFullscreenKey | `"orderly:tradingview-fullscreen"` | TradingView fullscreen state |
| OrderEntrySortKeys | `"orderly:order_entry_sort_keys"` | Order entry column sort keys |

## Usage example

```typescript
import { ConnectorKey, ChainKey } from "@orderly.network/types";
localStorage.setItem(ChainKey, String(chainId));
```
