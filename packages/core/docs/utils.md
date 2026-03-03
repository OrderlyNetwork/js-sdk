# utils

> Location: `packages/core/src/utils.ts`

## Overview

Utility functions and types: EIP-712 domain, hashing (broker, account id, token), base64url, timestamp, units formatting, and global object.

## Exports

### SignatureDomain (type)

`{ name: string; version: string; chainId: number; verifyingContract: string }`

### base64url(aStr: string): string

Replaces `+` with `-` and `/` with `_` for URL-safe base64.

### parseBrokerHash(brokerId: string)

Returns keccak256 hash of broker id (bytes32).

### parseAccountId(userAddress: string, brokerId: string)

Returns keccak256(abi.encode(address, parseBrokerHash(brokerId))).

### parseTokenHash(tokenSymbol: string)

Returns keccak256 hash of token symbol.

### calculateStringHash(input: string)

solidityPackedKeccak256(["string"], [input]).

### formatByUnits(amount, unit?)

Formats BigNumberish with ethers formatUnits (default unit "ether").

### isHex(value: string): boolean

True if string is hex characters only.

### isHexString(value: string): boolean

True if string starts with "0x" and is hex.

### getGlobalObject()

Returns globalThis, self, window, or global (throws if none).

### getTimestamp(): number

Returns Date.now() plus optional `__ORDERLY_timestamp_offset` from global (for testing).

### parseUnits

Re-exported from ethers.

## Usage Example

```ts
import * as utils from "@orderly.network/core";
const ts = utils.getTimestamp();
const accountIdHash = utils.parseAccountId(address, brokerId);
```
