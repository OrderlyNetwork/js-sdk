# getBlockTime.ts

> Location: `packages/ui-transfer/src/contract/getBlockTime.ts`

## Overview

Returns the average block time for a chain. Dispatches to EVM or Solana implementation based on `isSolana(chainId)`.

## Exports

### getBlockTime(inputs): Promise<number>

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| inputs.chainId | number | Chain ID |
| inputs.chain | API.Chain | Chain config |
| inputs.wallet | WalletState \| null | Wallet (required for Solana) |

**Returns:** Average block time in seconds (or 0 if unavailable).

## Usage example

```ts
import { getBlockTime } from "@orderly.network/ui-transfer";

const time = await getBlockTime({ chainId: 1, chain, wallet });
```
