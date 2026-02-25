# getSolanaBlockTime.ts

> Location: `packages/ui-transfer/src/contract/getSolanaBlockTime.ts`

## Overview

Computes Solana average block time from recent performance samples (e.g. 60 samples) via the wallet's connection.

## Exports

### getSolanaBlockTime(chain, wallet): Promise<number>

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| chain | API.Chain | Solana chain config |
| wallet | WalletState \| null | Wallet (required for provider); returns 0 if null |

**Returns:** Average block time in seconds.
