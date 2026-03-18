# index.ts

## index.ts responsibility

Re-exports the public API of the default-solana-adapter package: package version, the Solana wallet adapter class, and the Solana wallet provider type.

## index.ts exports

| Name | Type | Role | Description |
|------|------|------|--------------|
| version | string (default export from ./version) | Version | Package version string |
| DefaultSolanaWalletAdapter | class | Adapter | Solana wallet adapter for Orderly |
| SolanaWalletProvider | type | Type | Provider interface for Solana wallet |

## index.ts dependency and usage

- **Upstream**: Consumed by apps or packages that use `@orderly.network/default-solana-adapter`.
- **Downstream**: `./version`, `./walletAdapter`, `./types`.

## index.ts Example

```typescript
import {
  version,
  DefaultSolanaWalletAdapter,
  type SolanaWalletProvider,
} from "@orderly.network/default-solana-adapter";

const adapter = new DefaultSolanaWalletAdapter();
// Use adapter with a SolanaWalletProvider and SolanaAdapterOption
```
