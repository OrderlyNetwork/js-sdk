# keyPair

> Location: `packages/core/src/keyPair.ts`

## Overview

Ed25519 key pair for Orderly: interface `OrderlyKeyPair` and implementation `BaseOrderlyKeyPair` using `@noble/ed25519` and bs58. Used for API key signing and storage in keyStore.

## Exports

### OrderlyKeyPair (interface)

| Member | Type | Description |
| ------ | ---- | ----------- |
| getPublicKey() | () => Promise\<string\> | Public key as "ed25519:" + bs58. |
| secretKey | string | bs58-encoded secret. |
| sign(data) | (data: Uint8Array) => Promise\<Uint8Array\> | Sign bytes. |

### BaseOrderlyKeyPair (class)

Implements `OrderlyKeyPair`.

- **static generateKey(): OrderlyKeyPair** – New random key pair (44-char bs58 secret).
- **constructor(secretKey: string)** – From existing secret (bs58).
- **sign(message: Uint8Array): Promise\<Uint8Array\>**
- **getPublicKey(): Promise\<string\>** – Returns `ed25519:` + bs58 public key.
- **toString()** – Private key hex (internal).

## Usage Example

```ts
import { BaseOrderlyKeyPair } from "@orderly.network/core";
const keyPair = BaseOrderlyKeyPair.generateKey();
const pub = await keyPair.getPublicKey();
const sig = await keyPair.sign(new TextEncoder().encode("message"));
```
