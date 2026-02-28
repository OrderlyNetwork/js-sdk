# solana_vault

## Overview

TypeScript definition of the **Solana Vault** Anchor program IDL. Exports the `SolanaVault` type and the `IDL` object used with `@coral-xyz/anchor` `Program` for deposit, depositSol, oappQuote, and other vault/OApp instructions. Includes LayerZero OApp config, peer, enforced options, and receive/send types.

## Exports

### SolanaVault (type)

Full IDL shape: `version`, `name`, `instructions`, `accounts`, `types`, `events`, `errors`.

### IDL (constant)

The concrete IDL object of type `SolanaVault` (version `"0.1.0"`, name `"solana_vault"`).

### Instructions (summary)

| Name | Purpose |
| ---- | ------- |
| `setVault` | Admin sets vault params (owner, depositNonce, orderDelivery, inboundNonce, dstEid, solChainId) |
| `deposit` | User deposits SPL token; uses DepositParams + OAppSendParams |
| `depositSol` | User deposits SOL; uses solVault, DepositParams, OAppSendParams |
| `initOapp` | Initialize OApp config and account list |
| `setAccountList` | Admin sets account list params |
| `setManagerRole` | Owner sets manager role |
| `setBroker` | Broker manager sets allowed broker |
| `setWithdrawBroker` | Broker manager sets withdraw broker |
| `setToken` | Token manager sets allowed token |
| `setWithdrawToken` | Token manager sets withdraw token |
| `setOrderDelivery` | Owner sets order delivery and nonce |
| `oappQuote` | Quote deposit fee (returns MessagingFee: nativeFee, lzTokenFee) |
| `lzReceive` | Process incoming LayerZero message (withdraw path) |
| `lzReceiveTypes` | Resolve receive types (accounts) |
| `setRateLimit` | Admin sets peer rate limit |
| `setDelegate` | Admin sets delegate |
| `transferAdmin` | Transfer OApp admin |
| `setPeer` | Admin sets peer for dstEid |
| `setEnforcedOptions` | Admin sets enforced options for dstEid |

### Accounts (IDL account types)

- `enforcedOptions`, `oAppConfig`, `oAppLzReceiveTypesAccounts`, `accountList`, `peer`, `allowedBroker`, `allowedToken`, `managerRole`, `vaultAuthority`, `withdrawBroker`, `withdrawToken`

### Types (IDL types)

Include `DepositParams`, `OAppSendParams`, `MessagingFee`, `VaultDepositParams`, `VaultWithdrawParams`, `OAppLzReceiveParams`, `SetVaultParams`, `SetBrokerParams`, `SetTokenParams`, and others for each instruction’s args and state.

### Errors (program errors)

| Code | Name | Message |
| ---- | ---- | ------- |
| 6000 | InsufficientFunds | Deposited funds are insufficient for withdrawal |
| 6001 | UserInfoBelongsToAnotherUser | User info pda belongs to another user |
| 6002 | BrokerNotAllowed | Broker is not allowed |
| 6003 | TokenNotAllowed | Token is not allowed |
| 6004 | InvalidAccountId | AccountId is invalid |
| 6005 | InvalidVaultOwner | Vault owner is not the same as the payer |
| 6006 | ManagerRoleNotAllowed | Manager role is not allowed |

## Usage Example

```ts
import { Program } from "@coral-xyz/anchor";
import { IDL as VaultIDL, type SolanaVault } from "./idl/solana_vault";

const program = new Program<SolanaVault>(VaultIDL, vaultProgramId, { connection });
const fee = await program.methods.oappQuote(depositParams).accounts({ ... }).remainingAccounts([...]).instruction();
```
