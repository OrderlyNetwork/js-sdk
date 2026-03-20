# keyPair.ts

## keyPair.ts Responsibility

Defines the Orderly Ed25519 key pair interface (`OrderlyKeyPair`) and implementation `BaseOrderlyKeyPair`: sign data, get public key (ed25519:base58), and static `generateKey()` for creating a new key pair. Uses @noble/ed25519 and bs58.

## keyPair.ts Exports

| Name | Type | Role | Description |
|------|------|------|-------------|
| OrderlyKeyPair | interface | Contract | getPublicKey(), secretKey, sign(data) |
| BaseOrderlyKeyPair | class | Impl | Ed25519 key pair with bs58 secretKey |

## OrderlyKeyPair Responsibility

Represents an Orderly key pair used for API request signing (orderly-key header). Public key format is `ed25519:${base58PubKey}`; secret key is stored as base58 string.

## OrderlyKeyPair Interface

| Member | Type | Description |
|--------|------|-------------|
| getPublicKey() | () => Promise<string> | Returns "ed25519:" + base58 public key |
| secretKey | string | Base58-encoded private key |
| sign(data: Uint8Array) | (data) => Promise<Uint8Array> | Signs message, returns signature bytes |

## BaseOrderlyKeyPair Responsibility

Implements OrderlyKeyPair: constructor(secretKey) decodes base58 to private key; sign uses ed.signAsync; getPublicKey returns ed25519:base58(publicKey). Static generateKey() creates random key via ed.utils.randomPrivateKey() and bs58encode until length 44.

## keyPair.ts Dependencies and Call Relationships

- **Upstream**: @noble/ed25519, bs58, buffer.
- **Downstream**: keyStore (stores/returns OrderlyKeyPair), BaseSigner (signText uses keyPair.sign and getPublicKey).

## keyPair.ts Extension and Modification Points

- **Key format**: Changing secretKey or public key format requires alignment in keyStore and Signer.
- **Algorithm**: Replacing Ed25519 would require a new interface and impl; Orderly API expects current format.

## keyPair.ts Example

```typescript
import { BaseOrderlyKeyPair, OrderlyKeyPair } from "@orderly.network/core";

const keyPair = BaseOrderlyKeyPair.generateKey();
const pub = await keyPair.getPublicKey(); // "ed25519:..."
const msg = new TextEncoder().encode("hello");
const sig = await keyPair.sign(msg);

const fromSecret = new BaseOrderlyKeyPair("base58SecretKey...");
```
