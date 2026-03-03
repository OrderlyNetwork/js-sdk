# transfer

## Overview

Copy for deposit, withdraw, internal transfer, cross-chain flows, swap/bridge deposit, slippage, LTV, convert, and gas/vault warnings. Includes placeholders like `{{brokerName}}`, `{{token}}`, `{{networkName}}`, `{{minAmount}}`, `{{amount}}`, `{{apy}}`, etc.

## Exports

### `transfer`

Object of keys under `transfer.*`: e.g. `transfer.network`, `transfer.deposit.approve`, `transfer.withdraw.crossChain.confirmWithdraw`, `transfer.internalTransfer.success`, `transfer.LTV.description`, `transfer.deposit.yieldReminder.earnAPY`.

### `Transfer` (type)

`typeof transfer`.
