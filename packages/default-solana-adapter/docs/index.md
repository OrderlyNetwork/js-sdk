# default-solana-adapter

> Location: `packages/default-solana-adapter/src`

## Overview

This package provides the **default Solana wallet adapter** for Orderly Network. It implements `BaseWalletAdapter` from `@orderly.network/core` for the Solana chain namespace, handling account registration, key management, message signing (including Ledger), deposits via LayerZero vault, and integration with the Solana vault IDL.

## Subdirectories

| Directory | Description |
| --------- | ----------- |
| [idl](./idl/index.md) | Solana vault Anchor IDL type definitions and program interface |

## Top-level files

| File | Language | Description | Link |
| ---- | -------- | ----------- | ---- |
| `index.ts` | TypeScript | Package entry; re-exports version, adapter, and types | See [Entry point](#entry-point-indexts) below |
| `types.ts` | TypeScript | Adapter option and wallet provider interfaces | [types.md](./types.md) |
| `constant.ts` | TypeScript | Program IDs, seeds, peer addresses, lookup tables | [constant.md](./constant.md) |
| `version.ts` | TypeScript | Package version and global `__ORDERLY_VERSION__` | [version.md](./version.md) |
| `helper.ts` | TypeScript | Message builders and deposit/quote fee helpers | [helper.md](./helper.md) |
| `solana.util.ts` | TypeScript | PDA and lookup table utilities for Solana/LayerZero | [solana.util.md](./solana.util.md) |
| `walletAdapter.ts` | TypeScript | `DefaultSolanaWalletAdapter` implementation | [walletAdapter.md](./walletAdapter.md) |

## Entry point (index.ts)

Public exports:

- `version` (default from `./version`) — package version string
- `DefaultSolanaWalletAdapter` — Solana wallet adapter class
- `SolanaWalletProvider` (type) — wallet provider interface
