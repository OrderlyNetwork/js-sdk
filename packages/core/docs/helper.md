# helper

> Location: `packages/core/src/helper.ts`

## Overview

Helper functions for signers and EIP-712 message generation: mock/default signer factories and typed data builders for register account, add orderly key, settle PnL, and dex request.

## Exports

### getMockSigner(secretKey?)

Returns a `BaseSigner` using `MockKeyStore` with optional secret key (default fixed key). For testing.

### getDefaultSigner()

Returns a `BaseSigner` using `LocalStorageStore`. Browser only; throws if not in browser.

### getVerifyingContract()

Returns default verify contract address string.

### getDomain(chainId, onChainDomain?)

Returns EIP-712 domain: `{ name, version, chainId, verifyingContract }`.

### generateRegisterAccountMessage(inputs)

Builds register-account message and typed data for signing.

| Input | Type | Description |
| ----- | ---- | ----------- |
| chainId | number | Chain ID. |
| registrationNonce | number | Nonce from API. |
| brokerId | string | Broker ID. |
| timestamp? | number | Defaults to getTimestamp(). |

Returns `[message, toSignatureMessage]` (tuple).

### generateAddOrderlyKeyMessage(inputs)

Builds add-orderly-key message and typed data.

| Input | Type | Description |
| ----- | ---- | ----------- |
| publicKey | string | Orderly public key. |
| chainId | number | Chain ID. |
| primaryType | keyof typeof definedTypes | EIP-712 primary type. |
| brokerId | string | Broker ID. |
| expiration? | number | Default 365. |
| timestamp? | number | Default getTimestamp(). |
| scope?, tag?, subAccountId? | optional | Key scope/tag/sub-account. |

Returns `[message, toSignatureMessage]` (tuple).

### generateSettleMessage(inputs)

Builds settle PnL message and typed data. Inputs: `chainId`, `brokerId`, `settlePnlNonce`, `domain`.

### generateDexRequestMessage(inputs)

Builds dex request message and typed data. Inputs: `chainId`, `payloadType`, `nonce`, `receiver`, `amount`, `vaultId`, `token`, `dexBrokerId`, `domain`, `timestamp?`.

## Usage Example

```ts
import {
  getMockSigner,
  generateRegisterAccountMessage,
  generateAddOrderlyKeyMessage,
} from "@orderly.network/core";
const signer = getMockSigner();
const [msg, toSign] = generateRegisterAccountMessage({
  chainId: 421614,
  registrationNonce: 1,
  brokerId: "orderly",
});
```
