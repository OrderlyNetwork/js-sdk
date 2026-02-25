# useAccountsData.ts

## Overview

Transforms raw account and collateral data into a display structure: main account (when applicable) plus sub-accounts, each with `children` (holdings) and `account_id`. Uses `useAccount`, `useCollateral`, and i18n.

## Exports

### Types

- **`AccountWithChildren`**  
  - `account_id: string`  
  - `id?`, `description?`  
  - `children: Array<API.Holding & { account_id: string }>`

### Hooks

- **`useAccountsData()`**  
  Returns `AccountWithChildren[]` (main account first if main, then sub-accounts with normalized `children`).

## Usage example

```ts
const accounts = useAccountsData();
// accounts[0].children → holdings for main/sub account
```
