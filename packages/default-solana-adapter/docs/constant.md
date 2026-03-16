# constant

## Overview

Centralizes Solana and LayerZero-related program IDs, PDA seeds, peer addresses (bytes32), destination EIDs, and lookup table / OApp program IDs for dev, QA, staging, and mainnet.

## Exports

### Program IDs (PublicKey)

| Name | Description |
| ---- | ----------- |
| `ENDPOINT_PROGRAM_ID` | LayerZero endpoint program |
| `SEND_LIB_PROGRAM_ID` | Send library program |
| `EXECUTOR_PROGRAM_ID` | Executor program |
| `PRICE_FEED_PROGRAM_ID` | Price feed program |
| `RECEIVE_LIB_PROGRAM_ID` | Alias of `SEND_LIB_PROGRAM_ID` |
| `TREASURY_PROGRAM_ID` | Alias of `SEND_LIB_PROGRAM_ID` |
| `DVN_PROGRAM_ID` | DVN program |

### PDA Seeds (string)

| Name | Description |
| ---- | ----------- |
| `VAULT_AUTHORITY_SEED` | "VaultAuthority" |
| `BROKER_SEED` | "Broker" |
| `TOKEN_SEED` | "Token" |
| `SOL_VAULT_SEED` | "SolVault" |

### Peer Addresses (bytes32, from `addressToBytes32`)

| Name | Environment |
| ---- | ----------- |
| `DEV_PEER_ADDRESS` | Dev |
| `QA_PEER_ADDRESS` | QA |
| `STAGING_PEER_ADDRESS` | Staging |
| `MAINNET_PEER_ADDRESS` | Mainnet |

### Destination EIDs (number)

| Name | Value / use |
| ---- | ----------- |
| `DEV_DST_EID` | 40200 |
| `MAIN_DST_EID` | 30213 |

### Lookup Table Addresses (PublicKey)

| Name | Environment |
| ---- | ----------- |
| `DEV_LOOKUP_TABLE_ADDRESS` | Dev |
| `QA_LOOKUP_TABLE_ADDRESS` | QA |
| `STAGING_LOOKUP_TABLE_ADDRESS` | Staging |
| `MAINNET_LOOKUP_TABLE_ADDRESS` | Mainnet |

### OApp Program IDs (PublicKey)

| Name | Environment |
| ---- | ----------- |
| `DEV_OAPP_PROGRAM_ID` | Dev |
| `QA_OAPP_PROGRAM_ID` | QA |
| `STAGING_OAPP_PROGRAM_ID` | Staging |
| `MAINNET_OAPP_PROGRAM_ID` | Mainnet |

## Usage Example

```ts
import {
  ENDPOINT_PROGRAM_ID,
  VAULT_AUTHORITY_SEED,
  MAINNET_PEER_ADDRESS,
  getVaultAuthorityPda,
} from "./constant";

const vaultProgramId = new PublicKey("...");
const vaultAuthority = getVaultAuthorityPda(vaultProgramId);
```
