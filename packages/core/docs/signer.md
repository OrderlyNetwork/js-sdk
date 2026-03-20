# signer.ts

## signer.ts Responsibility

Defines the Orderly API request signer: `MessageFactor` (url, method, optional data), `SignedMessagePayload` (orderly-key, orderly-timestamp, orderly-signature, optional orderly-account-id), `Signer` interface, and `BaseSigner` implementation that builds a message string from timestamp + method + url + JSON(data) and signs it with OrderlyKeyPair from keyStore, returning base64url signature and public key.

## signer.ts Exports

| Name | Type | Role | Description |
|------|------|------|-------------|
| MessageFactor | type | Input | { url, method: "GET"\|"POST"\|"PUT"\|"DELETE", data? } |
| SignedMessagePayload | type | Output | { "orderly-key", "orderly-timestamp", "orderly-signature", "orderly-account-id"? } |
| Signer | interface | Contract | sign(messageFactor, timestamp?), signText(text) |
| BaseSigner | class | Impl | Uses OrderlyKeyStore to get OrderlyKeyPair and sign |

## Signer Responsibility

Produces Orderly API headers (orderly-key, orderly-timestamp, orderly-signature) for authenticated requests. Signing is over the canonical string: timestamp + method + url + (optional) JSON.stringify(data).

## MessageFactor Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| url | string | Yes | Request path/URL |
| method | "GET" \| "POST" \| "PUT" \| "DELETE" | Yes | HTTP method |
| data | any | No | Request body (object); included in message if present |

## SignedMessagePayload Fields

| Field | Type | Description |
|-------|------|-------------|
| orderly-key | string | Public key (ed25519:...) |
| orderly-timestamp | string | Timestamp used in message |
| orderly-signature | string | Base64url signature |
| orderly-account-id | string | Optional; set by Account for some calls |

## BaseSigner Execution Flow

1. sign(messageFactor, timestamp): Build msgStr = timestamp + method + url + (data ? JSON.stringify(data)); call signText(msgStr); return { "orderly-key": publicKey, "orderly-timestamp": timestamp, "orderly-signature": signature }.
2. signText(text): Get orderlyKeyPair from keyStore.getOrderlyKey(); Buffer.from(text) → sign with keyPair.sign; encode signature as base64url; return { signature, publicKey: await getPublicKey() }.

## signer.ts Dependencies and Call Relationships

- **Upstream**: keyStore (OrderlyKeyStore), utils (base64url, getTimestamp), buffer.
- **Downstream**: Account (signData, signGetMessageFactor), Assets (withdraw, internalTransfer use account.signer).

## signer.ts Errors and Boundaries

| Scenario | Condition | Behavior | Handling |
|----------|-----------|----------|----------|
| No orderly key | signText when getOrderlyKey() null | throw "orderlyKeyPair is not defined" | Ensure keyStore has key for current address |

## signer.ts Example

```typescript
import { BaseSigner, MessageFactor, SignedMessagePayload } from "@orderly.network/core";
import { LocalStorageStore } from "@orderly.network/core";

const keyStore = new LocalStorageStore("testnet");
// ... setAddress, setKey so getOrderlyKey() returns key
const signer = new BaseSigner(keyStore);

const payload: MessageFactor = { method: "GET", url: "/v1/client/sub_account" };
const headers: SignedMessagePayload = await signer.sign(payload);
// Use headers["orderly-key"], headers["orderly-timestamp"], headers["orderly-signature"] in request
```
