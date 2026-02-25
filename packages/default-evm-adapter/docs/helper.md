# helper

## Overview

Helper module that builds EIP-712 typed data structures for Orderly operations. Each function accepts inputs (including `chainId` and `domain`) and returns a tuple `[message, toSignatureMessage]` for use with `signTypedData`. Used by `DefaultEVMWalletAdapter` for registration, add key, withdraw, internal transfer, settle, and DEX request.

## Exports

### Functions

| Function                   | Input type (extended with `domain`, `chainId`) | Returns | Description |
| -------------------------- | ---------------------------------------------- | ------- | ----------- |
| `withdrawMessage`          | `WithdrawInputs`                               | `Promise<[message, toSignatureMessage]>` | Withdraw primary type and types. |
| `internalTransferMessage`  | `InternalTransferInputs`                      | Same    | InternalTransfer. |
| `addOrderlyKeyMessage`     | `AddOrderlyKeyInputs`                          | Same    | AddOrderlyKey (scope, expiration, optional tag/subAccountId). |
| `registerAccountMessage`   | `RegisterAccountInputs`                       | Same    | Registration (brokerId, chainId, timestamp, registrationNonce). |
| `settleMessage`            | `SettleInputs`                                 | Same    | SettlePnl. |
| `dexRequestMessage`        | `DexRequestInputs`                             | Same    | DexRequest. |

Each returned `toSignatureMessage` has shape: `{ domain, message, primaryType, types }` for EIP-712 signing.

## Dependencies

- `@orderly.network/core`: *Inputs, SignatureDomain
- `@orderly.network/types`: DEFAUL_ORDERLY_KEY_SCOPE, definedTypes (EIP712Domain and per primaryType)

## Usage Example

```ts
import {
  registerAccountMessage,
  addOrderlyKeyMessage,
  withdrawMessage,
} from "./helper";

const domain = { name: "Orderly", version: "1", chainId: 421614, verifyingContract: "0x..." };
const [msg, toSign] = await registerAccountMessage({
  brokerId,
  chainId: 421614,
  timestamp: Date.now(),
  registrationNonce,
  domain,
});
// Use toSign with provider.signTypedData(address, JSON.stringify(toSign))
```
