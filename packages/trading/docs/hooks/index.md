# hooks

Trading-specific React hooks: local storage preferences, pending order count, positions count. Re-exported from package; `useShowRwaCountdown` is used internally.

## Files

| File | Language | Description |
|------|----------|-------------|
| [index.ts](index.md) | TypeScript | Re-exports `useTradingLocalStorage`, `usePositionsCount`, `usePendingOrderCount` |
| [useTradingLocalStorage.ts](useTradingLocalStorage.md) | TypeScript | Local storage for PnL basis, decimal precision, show-all-symbol, hide-assets |
| [usePendingOrderCount.ts](usePendingOrderCount.md) | TypeScript | Pending and TP/SL order counts by symbol or all |
| [usePositionsCount.ts](usePositionsCount.md) | TypeScript | Position count by symbol or all |
| [useShowRwaCountdown.ts](useShowRwaCountdown.md) | TypeScript | RWA symbol countdown visibility and close handler |
