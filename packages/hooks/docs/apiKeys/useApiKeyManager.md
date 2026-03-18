# useApiKeyManager.ts — useApiKeyManager Hook

## useApiKeyManager Responsibility

Hook for managing Orderly API keys: list keys (with optional key_info query params), set IP restriction, remove key, generate new key (main or sub-account), reset IP restriction. Uses `useAccount`, `usePrivateQuery` for key list, and `useMutation` for mutations. Used by settings or API key management UI.

## useApiKeyManager Input and Output

- **Input**: Optional `queryParams.keyInfo` with `page`, `size`, `key_status` for listing keys.
- **Output**: Object with key list data, mutate, loading/error, and methods: `setIPRestriction`, `removeOrderlyKey`, `generateOrderlyKey`, `resetOrderlyKeyIPRestriction`.

## useApiKeyManager Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| queryParams | object | No | Optional. |
| queryParams.keyInfo | { page?, size?, key_status? } | No | Query params for GET /v1/client/key_info. |

## useApiKeyManager Return Shape (main)

| Property | Type | Description |
|----------|------|-------------|
| data | APIKeyItem[] | List of API keys from key_info. |
| mutate | KeyedMutator | SWR mutate for key list. |
| error | Error | Query error. |
| isLoading | boolean | Query loading. |
| setIPRestriction | (orderly_key, ip_restriction_list) => Promise | Set IP restriction (comma-separated list). |
| removeOrderlyKey | (orderly_key) => Promise | Remove key. |
| generateOrderlyKey | (scope?: ScopeType) => Promise<{ key, secretKey }> | Create new key (main or sub-account). |
| resetOrderlyKeyIPRestriction | (orderlyKey, mode) => Promise | Reset IP restriction (ALLOW_ALL_IPS / DISALLOW_ALL_IPS). |

## APIKeyItem and ScopeType

| APIKeyItem field | Type | Description |
|------------------|------|-------------|
| orderly_key | string | Key id. |
| key_status | string | Status. |
| ip_restriction_list | string[] | Allowed IPs. |
| ip_restricion_status | string | IP restriction status. |
| expiration | number | Expiration timestamp. |
| tag | any | Optional tag. |
| scope | string | Optional scope. |

ScopeType: `trade` | `trading` | `tradeAndTrading` (`"trade,trading"`).

## useApiKeyManager Dependencies

- **Upstream**: `useAccount`, `usePrivateQuery`, `useMutation`.
- **Downstream**: API key management UI.

## useApiKeyManager Example

```tsx
import { useApiKeyManager, ScopeType } from "@orderly.network/hooks";

function ApiKeySettings() {
  const {
    data: keys,
    isLoading,
    setIPRestriction,
    removeOrderlyKey,
    generateOrderlyKey,
  } = useApiKeyManager({ keyInfo: { page: 1, size: 10 } });

  const handleCreate = async () => {
    const { key, secretKey } = await generateOrderlyKey(ScopeType.tradeAndTrading);
    // show secretKey once to user
  };

  return (
    <div>
      {keys?.map((k) => (
        <div key={k.orderly_key}>
          {k.orderly_key}
          <button onClick={() => removeOrderlyKey(k.orderly_key)}>Remove</button>
        </div>
      ))}
      <button onClick={handleCreate}>Create key</button>
    </div>
  );
}
```
