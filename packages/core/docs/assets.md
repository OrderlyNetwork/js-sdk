# assets

> Location: `packages/core/src/assets.ts`

## Overview

`Assets` handles deposit, withdraw, approve, balance, internal transfer, and manual convert. It depends on `ConfigStore`, `IContract`, and `Account` (for signer and wallet adapter).

## Exports

### Assets (class)

Constructor: `(configStore, contractManager, account)`.

#### Methods

| Method | Description |
| ------ | ----------- |
| convert(inputs) | Convert non-USDC asset to USDC (slippage, amount, converted_asset). |
| withdraw(inputs) | Withdraw with chainId, token, amount, allowCrossChainWithdraw, decimals, optional receiver. |
| getNativeBalance(options?) | Native token balance via wallet adapter. |
| getBalance(address, options) | Token balance (address, decimals). |
| getBalanceByAddress(address, options?) | **Deprecated.** Use getBalance. |
| getAllowance(inputs) | Allowance for token/vault (address, vaultAddress?, decimals?). |
| approve(inputs) | Approve token for vault (address, vaultAddress?, amount?, isSetMaxValue?, decimals). |
| approveByAddress(inputs) | **Deprecated.** Use approve. |
| getDepositFee(inputs) | Get deposit fee from vault (amount, chain, decimals, token?, address?). |
| depositNativeToken(inputs) | Deposit native token (amount, fee, decimals, token?). |
| deposit(inputs) | Deposit (amount, fee, decimals, token?, address?, vaultAddress?). |
| internalTransfer(inputs) | Internal transfer (token, amount, receiver, decimals). |

#### Getter

- **usdcAddress** – USDC address from contract info.

## Usage Example

```ts
const assets = new Assets(configStore, contractManager, account);
await assets.approve({ address: usdcAddress, decimals: 6, isSetMaxValue: true });
const bal = await assets.getBalance(tokenAddress, { decimals: 6 });
await assets.deposit({ amount: "100", fee: 0n, decimals: 6 });
```
