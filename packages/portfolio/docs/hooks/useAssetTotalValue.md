# useAssetTotalValue.ts

## Overview

Computes total portfolio value in USD: main account holdings plus sub-account holdings (or current sub-account only when not main). Uses index prices from `useIndexPricesStream` and `useAccountsData` for sub-account breakdown.

## Exports

### Functions

- **`calculateTotalHolding(data, getIndexPrice)`**  
  `data`: `SubAccount[]` or `SubAccount["holding"]`. Sums `holding * getIndexPrice(token)` (skips non-numeric holding). Returns `Decimal`.

### Hooks

- **`useAssetTotalValue()`**  
  Returns `number`: total value for main account (main + all sub-accounts) or for current sub-account only.

## Usage example

```ts
const totalValue = useAssetTotalValue();
```
