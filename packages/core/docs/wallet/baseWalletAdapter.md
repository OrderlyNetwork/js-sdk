# baseWalletAdapter

> Location: `packages/core/src/wallet/baseWalletAdapter.ts`

## Overview

Abstract base class for `WalletAdapter`: declares abstract methods for all message generation, call, sendTransaction, callOnChain, getBalance, pollTransactionReceiptWithBackoff, and lifecycle; implements generateSecretKey (Ed25519 bs58), parseUnits/formatUnits (ethers), and signMessageByOrderlyKey (via SimpleDI Account). Other getters/methods throw or return stub.

## Exports

### BaseWalletAdapter (class)

Extends abstract class implementing `WalletAdapter<Config>`.

- **Abstract**: generateRegisterAccountMessage, generateWithdrawMessage, generateInternalTransferMessage, generateSettleMessage, generateAddOrderlyKeyMessage, generateDexRequestMessage, getBalance, call, sendTransaction, callOnChain, deactivate, pollTransactionReceiptWithBackoff; property chainNamespace.
- **Implemented**: generateSecretKey (random bs58), parseUnits/formatUnits (ethers), signMessageByOrderlyKey (uses SimpleDI.get("account").signer).
- **Stub/throw**: address, chainId, active, update, on, off.

## Usage Example

```ts
// Extend in EVM/Solana adapter packages.
class MyChainAdapter extends BaseWalletAdapter<MyConfig> {
  chainNamespace = ChainNamespace.evm;
  // ... implement abstract methods
}
```
