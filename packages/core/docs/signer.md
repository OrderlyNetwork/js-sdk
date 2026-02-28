# signer

> Location: `packages/core/src/signer.ts`

## Overview

Signing of API requests using orderly key: `MessageFactor` and `SignedMessagePayload` types, `Signer` interface, and `BaseSigner` implementation that uses keyStore and produces orderly-key headers.

## Exports

### MessageFactor (type)

| Field | Type | Description |
| ----- | ---- | ----------- |
| url | string | Request URL. |
| method | "GET" \| "POST" \| "PUT" \| "DELETE" | HTTP method. |
| data? | any | Optional body for POST etc. |

### SignedMessagePayload (type)

| Field | Type | Description |
| ----- | ---- | ----------- |
| "orderly-key" | string | Public key. |
| "orderly-timestamp" | string | Timestamp string. |
| "orderly-signature" | string | Base64url signature. |
| "orderly-account-id"? | string | Optional account ID header. |

### Signer (interface)

- **sign(data: MessageFactor, timestamp?): Promise\<SignedMessagePayload\>**
- **signText(text: string): Promise\<{ signature, publicKey }\>**

### BaseSigner (class)

Implements `Signer`. Constructor: `(keyStore: OrderlyKeyStore)`.

- **sign(message, timestamp)** – Builds message string from timestamp + method + url + optional JSON data; signs with orderly key; returns headers object.
- **signText(text)** – Signs raw text; returns base64url signature and public key.

## Usage Example

```ts
import { BaseSigner } from "@orderly.network/core";
const signer = new BaseSigner(keyStore);
const headers = await signer.sign({
  url: "https://api.orderly.org/v1/client/sub_account",
  method: "GET",
});
// Use headers["orderly-key"], headers["orderly-timestamp"], headers["orderly-signature"]
```
