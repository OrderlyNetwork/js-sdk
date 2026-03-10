# types

## Overview

Defines the configuration and wallet provider interfaces used by the default Solana adapter. Depends on `@solana/wallet-adapter-base` and `@solana/web3.js`.

## Exports

### Interfaces

#### SolanaAdapterOption

Options passed when activating or updating the Solana adapter.

| Field | Type | Description |
| ----- | ---- | ----------- |
| `provider` | `SolanaWalletProvider` | Wallet provider with connection and signing methods |
| `address` | `string` | User's Solana address (base58) |
| `chain` | `{ id: number }` | Chain descriptor (e.g. chain id) |

#### SolanaWalletProvider

Interface for the underlying Solana wallet (e.g. Phantom, Ledger). Used to obtain connection, public key, and signing methods.

| Field | Type | Description |
| ----- | ---- | ----------- |
| `connection?` | `Connection` | Optional Solana RPC connection |
| `rpcUrl?` | `string` | Optional RPC URL to create a connection |
| `publicKey?` | `PublicKey` | Optional current wallet public key |
| `network` | `WalletAdapterNetwork` | Devnet / Mainnet etc. |
| `signMessage` | `(message: Uint8Array) => Promise<Uint8Array>` | Sign raw bytes (e.g. for off-chain auth) |
| `signTransaction` | `SignerWalletAdapterProps["signTransaction"]` | Sign a Solana transaction |
| `sendTransaction` | `WalletAdapterProps["sendTransaction"]` | Send a signed transaction |

## Usage Example

```ts
import type { SolanaAdapterOption, SolanaWalletProvider } from "@orderly.network/default-solana-adapter";

const provider: SolanaWalletProvider = {
  network: WalletAdapterNetwork.Devnet,
  signMessage: async (msg) => wallet.signMessage(msg),
  signTransaction: wallet.signTransaction.bind(wallet),
  sendTransaction: wallet.sendTransaction.bind(wallet),
};

const option: SolanaAdapterOption = {
  provider,
  address: "Base58Address...",
  chain: { id: 101 },
};
```
