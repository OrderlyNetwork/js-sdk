# orderlyContext.ts — OrderlyProvider and OrderlyContext

## orderlyContext Responsibility

Provides `OrderlyProvider` and `OrderlyContext` that hold config store, key store, and related state (e.g. filtered chains, notification, data adapter). Consumed by hooks such as `useAccount`, `useConfig`, `useKeyStore`. Must be used inside (or as) the config provider tree.

## orderlyContext Exports

| Name | Type | Role |
|------|------|------|
| OrderlyProvider | FC | Provider component that supplies OrderlyContext value. |
| OrderlyContext | React.Context | Context with configStore, keyStore, and other config state. |
| FilteredChains, OrderlyConfigContextState | types | Context state and chain filter types. |

## OrderlyContext Value (typical)

- configStore, keyStore, and other fields from config context state.
- Used by: useAccount, useConfig, useKeyStore, useAccountInstance, etc.

## orderlyContext Example

```tsx
import { OrderlyProvider, OrderlyContext } from "@orderly.network/hooks";

// OrderlyProvider is usually used via OrderlyConfigProvider (configProvider.tsx).
// To read context:
const { configStore, keyStore } = useContext(OrderlyContext);
```
