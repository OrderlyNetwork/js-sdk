# sign

## Overview

EIP-712 type definitions used for signing registration, withdraw, add orderly key, settle PnL, DEX request, and internal transfer. Exported as `definedTypes` for use with signers (e.g. ethers `_TypedDataEncoder` or equivalent).

## Exports

### definedTypes

Constant object of EIP-712 type arrays:

| Type | Fields |
|------|--------|
| EIP712Domain | name, version, chainId, verifyingContract |
| Registration | brokerId, chainId, timestamp, registrationNonce |
| Withdraw | brokerId, chainId, receiver, token, amount, withdrawNonce, timestamp |
| AddOrderlyKey | brokerId, chainId, orderlyKey, scope, timestamp, expiration |
| SettlePnl | brokerId, chainId, settleNonce, timestamp |
| DexRequest | payloadType, nonce, receiver, amount, vaultId, token, dexBrokerId |
| InternalTransfer | receiver, token, amount, transferNonce |

## Usage example

```typescript
import { definedTypes } from "@orderly.network/types";
// Use with signTypedData(domain, types, value)
const types = { ...definedTypes, Withdraw: definedTypes.Withdraw };
```
