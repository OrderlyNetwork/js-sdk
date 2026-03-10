# getChainConfirmations.ts

> Location: `packages/ui-transfer/src/contract/getChainConfirmations.ts`

## Overview

Reads required confirmations for a chain from the LayerZero ULN config contract (Orderly mainnet/testnet RPC). Works for both EVM and Solana (no distinction).

## Exports

### getChainConfirmations(chain: API.Chain): Promise<number>

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| chain | API.Chain | Chain with `network_infos.chain_id` and `mainnet` |

**Returns:** Required confirmations count (from `getAppUlnConfig`).
