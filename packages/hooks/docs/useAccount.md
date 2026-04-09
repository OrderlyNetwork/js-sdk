# useAccount

## useAccount Responsibility

Hook that exposes account state and account actions (create orderly key, switch account, create account, create/update sub-account, refresh sub-account balances). Requires `OrderlyProvider` with `configStore` and `keyStore`. Used by components that need to show account status or trigger account/sub-account operations.

## useAccount Input and Output

- **Input**: None (reads `OrderlyContext` and uses `useAccountInstance`, `useTrack`, `useWS` internally).
- **Output**: Object with `account`, `state`, `isSubAccount`, `isMainAccount`, `subAccount`, `switchAccount`, `createOrderlyKey`, `createAccount`.

## useAccount Return Shape

| Property | Type | Description |
|----------|------|-------------|
| account | Account instance | Raw account from core (from useAccountInstance). |
| state | AccountState | Current account state (from core). |
| isSubAccount | boolean | True when current account is a sub-account. |
| isMainAccount | boolean | True when current account is main account. |
| subAccount.refresh | () => void | Refreshes sub-account balances. |
| subAccount.create | (description?: string) => Promise | Creates a sub-account. |
| subAccount.update | (value) => Promise | Updates sub-account (subAccountId, description). |
| switchAccount | (accountId: string) => Promise | Switches to another account; closes private WS. |
| createOrderlyKey | (remember: boolean) => Promise | Creates orderly key (remember: 365 vs 30 days), restores sub-accounts, tracks signin. |
| createAccount | () => Promise | Creates account. |

## useAccount Dependencies and Callers

- **Upstream**: `OrderlyContext` (configStore, keyStore), `useAccountInstance`, `useEventEmitter`, `useTrack`, `useWS`.
- **Downstream**: Any component that needs account state or account actions (e.g. header, account modal, API key manager).

## useAccount Execution Flow

1. Read `configStore` and `keyStore` from `OrderlyContext`; throw if missing.
2. Get `account` from `useAccountInstance()` and `state` from `account.stateValue`.
3. Subscribe to `account.on("change:status")` to keep `state` in sync.
4. Build callbacks for `createOrderlyKey` (with track + restoreSubAccount), `switchAccount` (close private WS then switch), `createAccount`, `createSubAccount`, `updateSubAccount`, `refreshSubAccountBalances`.
5. Compute `isSubAccount` from `state.accountId !== state.mainAccountId`.
6. Return the object above.

## useAccount Errors and Boundaries

| Scenario | Condition | Behavior | Handling |
|----------|-----------|----------|----------|
| Missing config | configStore undefined | Throws SDKError: "configStore is not defined, please use OrderlyProvider" | Wrap app with OrderlyProvider. |
| Missing keyStore | keyStore undefined | Throws SDKError: "keyStore is not defined, please use OrderlyProvider and provide keyStore" | Provide keyStore to OrderlyProvider. |

## useAccount Example

```tsx
import { useAccount } from "@orderly.network/hooks";

function AccountHeader() {
  const { state, createOrderlyKey, switchAccount, subAccount } = useAccount();

  if (state.status !== AccountStatusEnum.Connected) {
    return (
      <button onClick={() => createOrderlyKey(true)}>Connect / Create Key</button>
    );
  }

  return (
    <div>
      <span>Account: {state.accountId}</span>
      <button onClick={() => subAccount.refresh()}>Refresh balances</button>
      <button onClick={() => switchAccount("other-account-id")}>Switch</button>
    </div>
  );
}
```
