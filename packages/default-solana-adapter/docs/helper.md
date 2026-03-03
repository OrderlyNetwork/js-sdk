# helper

## Overview

Provides message-building helpers for Orderly operations (add orderly key, register account, internal transfer, withdraw, settle, DEX request) and vault deposit/quote fee logic. Uses `@orderly.network/core` input types, ethers/solidity hashing, and Anchor Program for the Solana vault IDL.

## Exports

### Message builders (return `[message, msgToSignTextEncoded]`)

| Function | Inputs | Description |
| -------- | ------ | ----------- |
| `addOrderlyKeyMessage` | `AddOrderlyKeyInputs & { chainId: number }` | Builds message and keccak256-encoded bytes for orderly key registration |
| `registerAccountMessage` | `RegisterAccountInputs & { chainId: number }` | Registration nonce message for account creation |
| `internalTransferMessage` | `InternalTransferInputs & { chainId: number }` | Internal transfer message (receiver, token, amount, nonce) |
| `dexRequestMessage` | `DexRequestInputs & { domain, chainId }` | DEX request payload; receiver is Base58-decoded to bytes32 |
| `withdrawMessage` | `WithdrawInputs & { chainId: number }` | Withdraw message with broker/token hashes and timestamp |
| `settleMessage` | `SettleInputs & { chainId: number }` | Settle PnL message (brokerId, chainId, settleNonce, timestamp) |

### LZ message encoding

| Name | Type / signature | Description |
| ---- | ----------------- | ----------- |
| `MsgType` | `enum { Deposit = 0 }` | LayerZero message type |
| `LzMessage` | `{ msgType: MsgType; payload: Buffer }` | Message envelope |
| `encodeLzMessage(message: LzMessage): Buffer` | Function | Encodes msgType (1 byte) + payload |

### Vault deposit & fee

| Function | Description |
| -------- | ----------- |
| `getDepositQuoteFee({ vaultAddress, userAddress, connection, depositData })` | Returns native fee (bigint) for deposit via vault `oappQuote` + simulation |
| `deposit({ vaultAddress, userAddress, connection, sendTransaction, depositData })` | Builds and sends deposit or depositSol instruction with LayerZero send accounts |

### Utility

| Function | Description |
| -------- | ----------- |
| `checkIsLedgerWallet(userAddress: string): boolean` | Returns whether the address is in `localStorage` under `LedgerWalletKey` |

## Usage Example

```ts
import {
  addOrderlyKeyMessage,
  registerAccountMessage,
  getDepositQuoteFee,
  deposit,
} from "./helper";

const [msg, toSign] = addOrderlyKeyMessage({
  publicKey: "...",
  brokerId: "broker",
  chainId: 101,
});

const fee = await getDepositQuoteFee({
  vaultAddress: "...",
  userAddress: "...",
  connection,
  depositData: { tokenHash, brokerHash, accountId, tokenAddress, tokenAmount },
});
```
