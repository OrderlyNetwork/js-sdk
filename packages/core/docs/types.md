# types

> Location: `packages/core/src/types.ts`

## Overview

Shared type for Ed25519 key pair representation (e.g. for API key creation).

## Exports

### Ed25519Keypair (interface)

| Field | Type | Description |
| ----- | ---- | ----------- |
| secretKey | string | Secret key string. |
| publicKey | string | Public key string. |

## Usage Example

```ts
import type { Ed25519Keypair } from "@orderly.network/core";
```
