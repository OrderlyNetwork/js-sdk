# contract

> Location: `packages/core/src/contract.ts`

## Overview

Contract configuration: type definitions and `BaseContract` that returns USDC/vault/verify addresses and ABI per network/env. Helper `getContractInfoByChainId` resolves vault and token by chain.

## Exports

### OrderlyContracts (type)

| Field | Type | Description |
| ----- | ---- | ----------- |
| usdcAddress | string | USDC contract address. |
| usdcAbi | any | USDC ABI. |
| erc20Abi | any | ERC20 ABI. |
| vaultAddress | string | Vault address. |
| vaultAbi | any | Vault ABI. |
| verifyContractAddress | string | Verify contract for EIP-712. |
| solanaUSDCAddress | string | Solana USDC. |
| solanaVaultAddress | string | Solana vault. |
| storyTestnetVaultAddress? | string | Story testnet vault. |
| monadTestnetVaultAddress? | string | Monad testnet vault. |
| monadTestnetUSDCAddress? | string | Monad testnet USDC. |
| abstractVaultAddress? | string | Abstract vault. |
| abstractUSDCAddress? | string | Abstract USDC. |
| bscVaultAddress? | string | BSC vault. |
| bscUSDCAddress? | string | BSC USDC. |

### IContract (interface)

- **getContractInfoByEnv(): OrderlyContracts**

### BaseContract (class)

Implements `IContract`. Constructor: `(configStore)`. Returns contract info based on `networkId` and `env` (mainnet vs testnet; prod/qa/dev).

### getContractInfoByChainId(chainId, contractInfo)

Returns `{ vaultAddress, tokenAddress }` for the given chain (Story, Monad, Abstract, BSC testnet, etc.).

## Usage Example

```ts
import { BaseContractManager, getContractInfoByChainId } from "@orderly.network/core";
const contract = new BaseContractManager(configStore);
const info = contract.getContractInfoByEnv();
const { vaultAddress, tokenAddress } = getContractInfoByChainId(chainId, info);
```
