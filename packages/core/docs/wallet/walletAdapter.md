# walletAdapter

> Location: `packages/core/src/wallet/walletAdapter.ts`

## Overview

Main wallet adapter interface for core: chain namespace, address, chainId, lifecycle (active/update/deactivate), message generation for register, withdraw, internal transfer, settle, addOrderlyKey, dexRequest, and contract call/send/balance/parseUnits/formatUnits. Used by `Account` and `WalletAdapterManager`.

## Exports

### ChainType

`"EVM" | "SOL"`.

### Message (type)

`{ message: { chainType, ... }; signatured: string }`.

### Input types

- **RegisterAccountInputs** – registrationNonce, brokerId, timestamp.
- **WithdrawInputs** – brokerId, receiver, token, amount, nonce, timestamp, verifyContract?.
- **InternalTransferInputs** – receiver, token, amount, nonce, verifyContract?.
- **SettleInputs** – brokerId, settlePnlNonce, timestamp, verifyContract?.
- **AddOrderlyKeyInputs** – publicKey, brokerId, expiration, timestamp, scope?, tag?, subAccountId?.
- **DexRequestInputs** – payloadType, nonce, receiver, amount, vaultId, token, dexBrokerId, timestamp, domain.

### WalletAdapter\<Config\> (interface)

- **chainNamespace**, **chainId** (get/set), **address** (get/set).
- **active(config)**, **update(config)**, **deactivate()**.
- **generateSecretKey(): string**.
- **generateRegisterAccountMessage(inputs)**, **generateWithdrawMessage(inputs)**, **generateInternalTransferMessage(inputs)**, **generateSettleMessage(inputs)**, **generateAddOrderlyKeyMessage(inputs)**, **generateDexRequestMessage(inputs)**.
- **call**, **sendTransaction**, **callOnChain**, **getBalance**, **parseUnits**, **formatUnits**, **pollTransactionReceiptWithBackoff**, **on**, **off**.

## Usage Example

```ts
// Implemented by EVM/Solana adapters; used via WalletAdapterManager.
const msg = await walletAdapter.generateRegisterAccountMessage({
  registrationNonce,
  brokerId,
  timestamp,
});
```
