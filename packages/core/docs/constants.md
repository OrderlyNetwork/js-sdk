# constants

> Location: `packages/core/src/constants.ts`

## Overview

Contract addresses for USDC, vault, and verify contracts across mainnet/testnet and chains (Arbitrum, Solana, Story, Monad, Abstract, BSC). Also defines `EVENT_NAMES` for app events.

## Exports

### Address constants (string)

- **nativeUSDCAddress**, **stagingUSDCAddressOnArbitrumTestnet**, **stagingVaultAddressOnArbitrumTestnet**, **stagingVerifyAddressOnArbitrumTestnet**
- **mainnetUSDCAddress**, **mainnetVaultAddress**, **mainnetVerifyAddress**
- **solanaMainnetVaultAddress**, **solanaStagingVualtAddress**, **solanaDevVaultAddress**, **solanaQaVaultAddress**, **solanaUSDCAddress**, **solanaMainnetUSDCAddress**
- **stagingStoryTestnetVaultAddress**, **stagingMonadTestnetVaultAddress**, **MonadTestnetUSDCAddress**, **qaMonadTestnetVaultAddress**, **qaArbitrumTestnetVaultAddress**
- **AbstractMainnetUSDCAddress**, **AbstractTestnetUSDCAddress**, **AbstractDevVaultAddress**, **AbstractQaVaultAddress**, **stagingAbstractTestnetVaultAddress**, **abstractMainnetVaultAddress**
- **bscTestnetDevVaultAddress**, **bscTestnetQaVaultAddress**, **bscTestnetStagingVaultAddress**, **bscTestnetUSDCAddress**, **bscMainnetVaultAddress**, **bscMainnetUSDCAddress**

### EVENT_NAMES (object)

| Key | Value |
| --- | ----- |
| statusChanged | "change:status" |
| validateStart | "validate:start" |
| validateEnd | "validate:end" |
| switchAccount | "switch:account" |
| subAccountCreated | "account:sub:created" |
| subAccountUpdated | "account:sub:updated" |

## Usage Example

```ts
import { mainnetVaultAddress, EVENT_NAMES } from "@orderly.network/core";
```
