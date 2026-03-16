# solana.util

## Overview

Utility functions for Solana and LayerZero v2: PDAs (vault authority, broker, token, OApp config, peer, send lib, endpoint, nonce, executor, price feed, DVN, etc.) and lookup table / destination EID resolution per environment (dev, QA, staging, mainnet). Uses `@layerzerolabs/lz-solana-sdk-v2` seeds and `packages/default-solana-adapter` constants.

## Exports

### Token & vault PDAs

| Function | Parameters | Returns | Description |
| -------- | ---------- | ------- | ----------- |
| `getTokenAccounts` | `(token: PublicKey, owner: PublicKey)` | `PublicKey` | Associated token account for token + owner |
| `getVaultAuthorityPda` | `(VAULT_PROGRAM_ID: PublicKey)` | `PublicKey` | Vault authority PDA |
| `getSolVaultPda` | `(VAULT_PROGRAM_ID: PublicKey)` | `PublicKey` | SOL vault PDA |
| `getBrokerPDA` | `(programId, brokerHash: string)` | `PublicKey` | Allowed broker PDA (brokerHash as hex) |
| `getTokenPDA` | `(programId, tokenHash: string)` | `PublicKey` | Allowed token PDA (tokenHash as hex) |

### OApp / LayerZero PDAs

| Function | Parameters | Returns | Description |
| -------- | ---------- | ------- | ----------- |
| `getOAppConfigPda` | `(programId)` | `PublicKey` | OApp config PDA |
| `getLzReceiveTypesPda` | `(programId, oappConfigPda)` | `PublicKey` | LZ receive types PDA |
| `getPeerPda` | `(OAPP_PROGRAM_ID, oappConfigPda, dstEid)` | `PublicKey` | Peer PDA for destination EID |
| `getEndorcedOptionsPda` | `(OAPP_PROGRAM_ID, oappConfigPda, dstEid)` | `PublicKey` | Enforced options PDA |
| `getSendLibPda` | `()` | `PublicKey` | Send library PDA (default program) |
| `getSendLibConfigPda` | `(oappConfigPda, dstEid)` | `PublicKey` | Send library config PDA |
| `getDefaultSendLibConfigPda` | `(dstEid)` | `PublicKey` | Default send lib config PDA |
| `getSendLibInfoPda` | `(sendLibPda)` | `PublicKey` | Send library info PDA |
| `getEndpointSettingPda` | `()` | `PublicKey` | Endpoint settings PDA |
| `getNoncePda` | `(OAPP_PROGRAM_ID, oappConfigPda, dstEid)` | `PublicKey` | Nonce PDA (includes peer address) |
| `getEventAuthorityPda` | `()` | `PublicKey` | Event authority PDA |
| `getUlnSettingPda` | `()` | `PublicKey` | ULN setting PDA |
| `getSendConfigPda` | `(oappConfigPda, dstEid)` | `PublicKey` | Send config PDA |
| `getDefaultSendConfigPda` | `(dstEid)` | `PublicKey` | Default send config PDA |
| `getUlnEventAuthorityPda` | `()` | `PublicKey` | ULN event authority PDA |
| `getExecutorConfigPda` | `()` | `PublicKey` | Executor config PDA |
| `getPriceFeedPda` | `()` | `PublicKey` | Price feed PDA |
| `getDvnConfigPda` | `()` | `PublicKey` | DVN config PDA |
| `getMessageLibPda` | `(programId?)` | `PublicKey` | Message lib PDA (optional program) |
| `getMessageLibInfoPda` | `(msgLibPda, programId?)` | `PublicKey` | Message lib info PDA |

### Environment helpers

| Function | Parameters | Returns | Description |
| -------- | ---------- | ------- | ----------- |
| `getPeerAddress` | `(OAPP_PROGRAM_ID: PublicKey)` | `Uint8Array` | Peer bytes32 for dev/QA/staging/mainnet OApp |
| `getDstEID` | `(OAPP_PROGRAM_ID: PublicKey)` | `number` | Destination EID (mainnet vs dev) |
| `getLookupTableAddress` | `(OAPP_PROGRAM_ID: PublicKey)` | `PublicKey` | Lookup table for the environment |
| `getLookupTableAccount` | `(connection, lookupTableAddress)` | `Promise<AddressLookupTableAccount \| null>` | Fetches lookup table account |

## Usage Example

```ts
import {
  getVaultAuthorityPda,
  getBrokerPDA,
  getOAppConfigPda,
  getLookupTableAddress,
  getLookupTableAccount,
} from "./solana.util";

const vaultId = new PublicKey("...");
const vaultAuthority = getVaultAuthorityPda(vaultId);
const brokerPda = getBrokerPDA(vaultId, "0x...");
const lookupTable = await getLookupTableAccount(connection, getLookupTableAddress(vaultId));
```
