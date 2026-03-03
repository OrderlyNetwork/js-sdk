# web3Adapter

> Location: `packages/core/src/wallet/web3Adapter.ts`

## Overview

Minimal Web3-based wallet adapter implementing `IWalletAdapter`: uses Web3 instance from provider; chainId from options; getBalance and deposit/signTypedData implemented; sendTransaction, call, on, off throw "Method not implemented."

## Exports

### Web3WalletAdapter (class)

Constructor: `(options: WalletAdapterOptions)` – creates Web3 from provider, parses chain.id.

- **get chainId**, **get addresses** (throws).
- **getBalance(address)**, **deposit(from, to, amount)** – web3.eth.
- **signTypedData(address, data)** – web3.eth.signTypedData.
- **sendTransaction**, **call**, **on**, **off** – throw.

## Usage Example

```ts
// Alternative to EtherAdapter when using web3.js.
const adapter = new Web3WalletAdapter({ provider, address: "0x...", chain: { id: 421614 } });
```
