# default-evm-adapter

## Overview

Default EVM wallet adapter package for Orderly Network. Provides a concrete implementation of `BaseWalletAdapter` for EVM chains: wallet connection, EIP-712 typed data signing (registration, add key, withdraw, internal transfer, settle, DEX request), balance and contract calls via a pluggable Web3 provider.

## Subdirectories

| Directory   | Description                                      |
| ----------- | ------------------------------------------------ |
| [provider](./provider/index.md) | Web3 provider interface and EIP-1193 types. |

## Top-level files

| File                 | Language   | Description |
| -------------------- | ---------- | ----------- |
| [types](./types.md)  | TypeScript | `EVMAdapterOptions` and `getWalletAdapterFunc` for adapter configuration. |
| [walletAdapter](./walletAdapter.md) | TypeScript | `DefaultEVMWalletAdapter` class implementing EVM signing and RPC. |
| [helper](./helper.md) | TypeScript | EIP-712 message builders for registration, add key, withdraw, internal transfer, settle, DEX request. |
| [version](./version.md) | TypeScript | Package version string and optional `window.__ORDERLY_VERSION__` registration. |
