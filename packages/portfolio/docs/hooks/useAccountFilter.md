# useAccountFilter.ts

## Overview

Provides generic account-based filtering for list data and a dedicated filter for transfer history (by `from_account_id` / `to_account_id`). Uses `useAccount` from `@orderly.network/hooks` and `AccountType` from assets UI.

## Exports

### Types

- **`AccountFilterFunction<T>`**  
  `(data: T[], selectedAccount: string, accountState: ReturnType<typeof useAccount>) => T[]`  
  Function type for filtering by selected account.

### Functions / Hooks

| Name | Description |
|------|-------------|
| `createAccountFilter<T>(getAccountId?)` | Returns an `AccountFilterFunction<T>`. Optional `getAccountId(item)`; default uses `item.account_id`. |
| `useAccountFilter<T>(data, selectedAccount, getAccountId?)` | Hook: filters `data` by current account state and `selectedAccount`. |
| `useTransferHistoryAccountFilter<T>(data, selectedAccount)` | Hook: filters by `from_account_id` / `to_account_id` (for transfer history). |
| `AccountFilters.standard` | Factory for standard account filter. |
| `AccountFilters.transferHistory` | Factory for transfer-history filter. |
| `AccountFilters.customAccountId(key)` | Factory for filter using a custom account ID field. |

## Usage example

```ts
const filtered = useAccountFilter(list, selectedAccount);
const transferFiltered = useTransferHistoryAccountFilter(transfers, selectedAccount);
```
