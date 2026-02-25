# account

> Location: `packages/core/src/account.ts`

## Overview

`Account` manages wallet connection, validation, orderly key lifecycle, sub-accounts, and event emission. It uses `ConfigStore`, `OrderlyKeyStore`, wallet adapters, contract manager, and `Assets`. State is exposed via `stateValue` and events (`EVENT_NAMES`).

## Exports

### AccountState

| Field | Type | Description |
| ----- | ---- | ----------- |
| status | AccountStatusEnum | Connection/signing state. |
| validating | boolean | Whether account is being validated. |
| accountId | string \| undefined | Active account ID (root or sub). |
| mainAccountId | string \| undefined | Root account ID. |
| subAccountId | string \| undefined | Sub-account ID when active. |
| userId | string \| undefined | User ID from backend. |
| address | string \| undefined | Wallet address. |
| chainNamespace | ChainNamespace \| undefined | EVM vs Solana. |
| isNew | boolean \| undefined | Newly registered account. |
| connectWallet | { name, chainId } \| undefined | Connected wallet info. |
| subAccounts | SubAccount[] \| undefined | List of sub-accounts. |

### Account (class)

Main account manager. Constructor: `(configStore, keyStore, walletAdapters, options?)` where `options.contracts` is optional `IContract`.

#### Main methods

- **setAddress(address, wallet, options?)** – Set wallet address and wallet context; validates account and orderly key; returns `AccountStatusEnum`.
- **createAccount()** – Register new account (EIP-712 register message).
- **createOrderlyKey(expiration?, options?)** – Create and store orderly key; enables trading.
- **createSubAccount(description?)** – Create sub-account.
- **updateSubAccount({ subAccountId, description? })** – Update sub-account description.
- **switchAccount(accountId)** – Switch active account (main or sub).
- **getSubAccounts()** – Fetch sub-accounts with holdings.
- **refreshSubAccountBalances()** – Refresh sub-account balances and emit state.
- **createApiKey(expiration, options?)** / **createSubAccountApiKey(expiration, options)** – Create API key (main or sub).
- **importOrderlyKey(options)** – Import orderly key by secret/address/chainNamespace.
- **checkOrderlyKey(address, orderlyKey, accountId)** – Verify and set key for EnableTradingWithoutConnected.
- **settle(options?)** – Settle main account PnL (on-chain message).
- **settleSubAccount(options?)** – Settle sub-account PnL.
- **destroyOrderlyKey()** – Remove orderly key; status → DisabledTrading.
- **disconnect()** – Clear address and keys; status → NotConnected.
- **switchChainId(chainId)** – Update chain id in state and adapter.
- **generateDexRequest(inputs)** – Build DexRequest message for DEX operations.
- **getAdditionalInfo()** – Wallet additional info from repository.
- **restoreSubAccount()** – Restore sub-account list and active sub from storage; emit state.

#### Getters

- **stateValue** – Current `AccountState`.
- **accountId**, **mainAccountId**, **subAccountId**, **isSubAccount**, **accountIdHashStr**, **address**, **chainId**, **apiBaseUrl**
- **signer** – `Signer` (uses keyStore).
- **walletAdapter** – Current wallet adapter from manager.
- **on**, **once**, **off** – EventEmitter-style API for `EVENT_NAMES`.

## Usage Example

```ts
const account = new Account(
  configStore,
  keyStore,
  [evmWalletAdapter, solanaWalletAdapter],
  { contracts: customContract }
);
account.on(EVENT_NAMES.statusChanged, (state: AccountState) => { /* ... */ });
await account.setAddress(address, wallet);
await account.createAccount();
await account.createOrderlyKey(365);
```
