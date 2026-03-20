# helper.ts

## helper.ts Responsibility

Provides signer factories (getMockSigner, getDefaultSigner) and EIP-712 message builders for Orderly: generateRegisterAccountMessage, generateAddOrderlyKeyMessage, generateSettleMessage, generateDexRequestMessage. Uses keyStore, signer, utils (getTimestamp, SignatureDomain) and types from @orderly.network/types (definedTypes, DEFAUL_ORDERLY_KEY_SCOPE).

## helper.ts Exports

| Name | Type | Role | Description |
|------|------|------|-------------|
| getMockSigner | function | Factory | Returns BaseSigner with MockKeyStore(secretKey) |
| getDefaultSigner | function | Factory | Returns BaseSigner with LocalStorageStore("") (browser only) |
| getVerifyingContract | function | Util | Returns fixed verify contract address |
| getDomain | function | Util | Returns SignatureDomain for chainId (optionally on-chain verifyingContract) |
| generateRegisterAccountMessage | function | Message | Registration EIP-712 message and toSignatureMessage |
| generateAddOrderlyKeyMessage | function | Message | AddOrderlyKey EIP-712 message and toSignatureMessage |
| generateSettleMessage | function | Message | SettlePnl EIP-712 message and toSignatureMessage |
| generateDexRequestMessage | function | Message | DexRequest EIP-712 message and toSignatureMessage |

## generateRegisterAccountMessage Input and Output

- **Input**: { chainId, registrationNonce, brokerId, timestamp? }
- **Output**: [message, toSignatureMessage] as const (message: brokerId, chainId, timestamp, registrationNonce; toSignatureMessage: domain, message, primaryType "Registration", types).

## generateAddOrderlyKeyMessage Input and Output

- **Input**: { publicKey, chainId, brokerId, primaryType, expiration?, timestamp?, scope?, tag?, subAccountId? }
- **Output**: [message, toSignatureMessage] (primaryType from inputs; message includes orderlyKey, scope, expiration, optional tag/subAccountId).

## generateSettleMessage Input and Output

- **Input**: { chainId, brokerId, settlePnlNonce, domain }
- **Output**: [message, toSignatureMessage] (primaryType "SettlePnl").

## generateDexRequestMessage Input and Output

- **Input**: { chainId, payloadType, nonce, receiver, amount, vaultId, token, dexBrokerId, domain, timestamp? }
- **Output**: [message, toSignatureMessage] (primaryType "DexRequest").

## helper.ts Dependencies and Call Relationships

- **Upstream**: keyStore (MockKeyStore, LocalStorageStore), signer (BaseSigner), utils (getTimestamp, SignatureDomain), @orderly.network/types (definedTypes, DEFAUL_ORDERLY_KEY_SCOPE).
- **Downstream**: Account and wallet adapters use these for signing flows; getMockSigner/getDefaultSigner for tests or default signer.

## helper.ts Errors and Boundaries

| Scenario | Condition | Behavior | Handling |
|----------|-----------|----------|----------|
| getDefaultSigner in non-browser | typeof window === "undefined" | throw "the default signer only supports browsers." | Use only in browser or provide keyStore |

## helper.ts Example

```typescript
import {
  getMockSigner,
  getDefaultSigner,
  getDomain,
  generateRegisterAccountMessage,
  generateAddOrderlyKeyMessage,
  generateSettleMessage,
  generateDexRequestMessage,
} from "@orderly.network/core";

const signer = getMockSigner(); // or getDefaultSigner()
const [regMsg, regToSign] = generateRegisterAccountMessage({
  chainId: 421614,
  registrationNonce: 1,
  brokerId: "orderly",
});
// Sign regToSign with wallet, then send to /v1/register_account

const [addKeyMsg, addKeyToSign] = generateAddOrderlyKeyMessage({
  publicKey: "ed25519:...",
  chainId: 421614,
  brokerId: "orderly",
  primaryType: "AddOrderlyKey",
  expiration: 365,
});
```
