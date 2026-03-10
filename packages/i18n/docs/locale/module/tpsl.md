# tpsl

## Overview

Take profit / stop loss: TP/SL labels, mode (full/partial), prices and triggers, PnL/offset, add/cancel all, drag to set; order/trigger prices; position TP/SL, entire position, est. PnL, confirm texts; advanced (ROI template, submit, total est. TP/SL PnL, risk reward ratio); validation errors and warnings (e.g. close to liq. price, cross liq. price); agreement text.

## Exports

### `tpsl`

Object of keys under `tpsl.*`: e.g. `tpsl.tpPrice`, `tpsl.positionType.full.tips`, `tpsl.validate.tpTriggerPrice.error.required`, `tpsl.agreement`.

### `TPSL` (type)

`typeof tpsl`.
