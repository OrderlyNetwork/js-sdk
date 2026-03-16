# useAssetsAccountFilter.ts

## Overview

Hooks for filtering assets-like data by account and optionally by asset (token). Manage `selectedAccount` / `selectedAsset` state and expose filtered lists and filter callbacks.

## Exports

### Hooks

| Name | Description |
|------|-------------|
| `useAssetsAccountFilter<T>(data)` | Filters by account only. Returns `{ selectedAccount, filteredData, onAccountFilter, setSelectedAccount }`. |
| `useAssetsMultiFilter<T>(data)` | Filters by account and asset (`children[].token`). Returns `{ selectedAccount, selectedAsset, filteredData, onFilter, setSelectedAccount, setSelectedAsset }`. |

### Functions

- **`filterByAccount<T>(data, selectedAccount, accountState)`**  
  Standalone filter by account (same logic as hooks). Returns filtered `T[]`.

## Usage example

```ts
const { filteredData, onAccountFilter } = useAssetsAccountFilter(accounts);
const { filteredData, onFilter } = useAssetsMultiFilter(accounts);
```
