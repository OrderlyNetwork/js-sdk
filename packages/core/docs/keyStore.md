# keyStore.ts

## keyStore.ts Responsibility

Defines the Orderly key storage abstraction (`OrderlyKeyStore`) and implementations: `BaseKeyStore` (abstract), `LocalStorageStore` (browser localStorage keyed by networkId and address), and `MockKeyStore` (in-memory with fixed secret key for tests).

## keyStore.ts Exports

| Name | Type | Role | Description |
|------|------|------|-------------|
| OrderlyKeyStore | interface | Contract | getOrderlyKey, getAccountId, setAccountId, getAddress, setAddress, removeAddress, generateKey, cleanKey, cleanAllKey, setKey |
| BaseKeyStore | abstract class | Base | Implements OrderlyKeyStore with keyPrefix `orderly_${networkId}_` |
| LocalStorageStore | class | Impl | Persists orderlyKey, accountId, address in localStorage |
| MockKeyStore | class | Impl | Returns same BaseOrderlyKeyPair from fixed secretKey; no persistence |

## OrderlyKeyStore Responsibility

Stores and retrieves the current wallet address, account ID per address, and Orderly Key (as OrderlyKeyPair) per address. Used by Signer and Account.

## OrderlyKeyStore Methods

| Method | Description |
|--------|-------------|
| getOrderlyKey(address?) | Returns OrderlyKeyPair for address or default address; null if none |
| getAccountId(address) | Returns account ID for address |
| setAccountId(address, accountId) | Saves account ID for address |
| getAddress() | Returns current/default address |
| setAddress(address) | Sets current address |
| removeAddress() | Clears current address |
| generateKey() | Creates new OrderlyKeyPair |
| setKey(orderlyKey, secretKey) | Stores OrderlyKeyPair for address (second param is OrderlyKeyPair) |
| cleanKey(address, key) | Removes one key (e.g. "orderlyKey") for address |
| cleanAllKey(address) | Removes all data for address |

## LocalStorageStore Storage Shape

- Key prefix: `orderly_${networkId}_`.
- Address key: `${keyPrefix}address` (current address).
- Per-address data: `${keyPrefix}${address}` as JSON with keys: orderlyKey (secretKey string), accountId.

## keyStore.ts Dependencies and Call Relationships

- **Upstream**: keyPair (BaseOrderlyKeyPair, OrderlyKeyPair).
- **Downstream**: Account, BaseSigner; getDefaultSigner/getMockSigner in helper.

## keyStore.ts Extension and Modification Points

- **New backend**: Implement OrderlyKeyStore (e.g. secure storage, server-backed) and pass to Account/Signer.
- **Key schema**: Change keyPrefix or per-address JSON shape in LocalStorageStore; keep OrderlyKeyStore interface stable.

## keyStore.ts Example

```typescript
import { LocalStorageStore, MockKeyStore, BaseOrderlyKeyPair } from "@orderly.network/core";

const keyStore = new LocalStorageStore("testnet");
keyStore.setAddress("0x123...");
keyStore.setAccountId("0x123...", "account_id_1");
const kp = keyStore.generateKey();
keyStore.setKey("0x123...", kp);
const key = keyStore.getOrderlyKey();
const accountId = keyStore.getAccountId("0x123...");

// Test
const mockStore = new MockKeyStore("base58SecretKey...");
const signer = new BaseSigner(mockStore);
```
