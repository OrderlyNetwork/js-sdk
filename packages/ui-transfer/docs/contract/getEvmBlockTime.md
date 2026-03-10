# getEvmBlockTime.ts

> Location: `packages/ui-transfer/src/contract/getEvmBlockTime.ts`

## Overview

Computes average EVM block time from the last 5 blocks using the chain's public RPC.

## Exports

### getEvmBlockTime(chain: API.Chain): Promise<number>

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| chain | API.Chain | Chain with `network_infos.public_rpc_url` |

**Returns:** Average block time in seconds.
