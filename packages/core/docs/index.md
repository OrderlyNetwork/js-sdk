# @orderly.network/core

> Location: `packages/core/src`

## Overview

Core package for Orderly Network: account management, key storage, signing, wallet adapters (EVM/Solana), config store, and contract addresses. Used by SDK and apps for connection, registration, orderly keys, sub-accounts, and asset operations.

## Subdirectories

| Directory | Description |
| --------- | ----------- |
| [configStore](./configStore/index.md) | Config key types and config store implementations (e.g. `DefaultConfigStore`). |
| [di](./di/index.md) | Simple dependency injection (`SimpleDI`, `Container`). |
| [wallet](./wallet/index.md) | Wallet adapter interfaces and implementations (EVM ethers adapter, base adapter). |

## Top-level files

| File | Language | Description |
| ---- | -------- | ----------- |
| [package (index.ts)](./package.md) | TypeScript | Main package exports (keyStore, signer, keyPair, helper, contract, Account, configStore, wallet, utils). |
| [account.ts](./account.md) | TypeScript | `Account` class and `AccountState`: connect/setAddress, createAccount, createOrderlyKey, sub-accounts, settle, events. |
| [assets.ts](./assets.md) | TypeScript | `Assets` class: deposit, withdraw, approve, getBalance, internalTransfer, convert. |
| [app.ts](./app.md) | TypeScript | `App` class (minimal state/prepare handling). |
| [constants.ts](./constants.md) | TypeScript | Contract addresses (USDC, vault, verify) and `EVENT_NAMES` for app events. |
| [contract.ts](./contract.md) | TypeScript | `IContract`, `BaseContract`, `OrderlyContracts`, `getContractInfoByChainId`. |
| [helper.ts](./helper.md) | TypeScript | `getMockSigner`, `getDefaultSigner`, `generateRegisterAccountMessage`, `generateAddOrderlyKeyMessage`, `generateSettleMessage`, `generateDexRequestMessage`. |
| [keyPair.ts](./keyPair.md) | TypeScript | `OrderlyKeyPair`, `BaseOrderlyKeyPair`: Ed25519 key pair, sign, getPublicKey. |
| [keyStore.ts](./keyStore.md) | TypeScript | `OrderlyKeyStore`, `BaseKeyStore`, `LocalStorageStore`, `MockKeyStore`. |
| [repository.ts](./repository.md) | TypeScript | `Repository` interface and `LocalStorageRepository`. |
| [signer.ts](./signer.md) | TypeScript | `Signer`, `BaseSigner`, `MessageFactor`, `SignedMessagePayload`. |
| [subAccount.ts](./subAccount.md) | TypeScript | `SubAccount` type (id, description, holding). |
| [types.ts](./types.md) | TypeScript | `Ed25519Keypair` interface. |
| [utils.ts](./utils.md) | TypeScript | `SignatureDomain`, `getTimestamp`, `parseAccountId`, `parseBrokerHash`, `base64url`, etc. |
| [version.ts](./version.md) | TypeScript | Package version and `__ORDERLY_VERSION__` on `window`. |
| [walletAdapterManager.ts](./walletAdapterManager.md) | TypeScript | `WalletAdapterManager`: switch wallet by chain namespace, expose current adapter. |
| [walletConnector.ts](./walletConnector.md) | TypeScript | `WalletConnector` interface and stub implementations. |
| [additionalInfoRepository.ts](./additionalInfoRepository.md) | TypeScript | `AdditionalInfoRepository`: save/get/clear wallet additional info by address. |
| [_wallet.ts](./_wallet.md) | TypeScript | `WalletClient`, `BaseWalletClient`, `SimpleWallet` (legacy wallet client). |
