# wallet

## Overview

Wallet abstraction for EVM and Solana: adapter interfaces for address, chainId, signing (register, withdraw, settle, addOrderlyKey, dexRequest), contract calls, and transaction sending. Includes EtherAdapter (ethers.js) and base adapter.

## Files

| File | Language | Summary |
| ---- | -------- | ------- |
| [adapter.ts](./adapter.md) | TypeScript | `IWalletAdapter`, `WalletAdapterOptions`, `getWalletAdapterFunc` (legacy adapter shape). |
| [walletAdapter.ts](./walletAdapter.md) | TypeScript | `WalletAdapter` interface, message input types (`RegisterAccountInputs`, `WithdrawInputs`, etc.). |
| [baseWalletAdapter.ts](./baseWalletAdapter.md) | TypeScript | `BaseWalletAdapter` abstract class implementing common logic. |
| [etherAdapter.ts](./etherAdapter.md) | TypeScript | `EtherAdapter`: ethers.js-based EVM wallet adapter. |
| [web3Adapter.ts](./web3Adapter.md) | TypeScript | `Web3WalletAdapter`: Web3-based adapter (minimal impl). |
| [index.ts](./wallet-index.md) | TypeScript | Re-exports adapter types and `EtherAdapter`. |
