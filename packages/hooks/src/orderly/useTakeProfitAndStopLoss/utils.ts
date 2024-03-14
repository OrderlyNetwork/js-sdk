import { OrderSide } from "@orderly.network/types";
import { OrderType } from "@orderly.network/types";
import { AlgoOrderType } from "@orderly.network/types";
import { Decimal } from "@orderly.network/utils";

export type UpdateOrderKey =
  | "tp_trigger_price"
  | "sl_trigger_price"
  | "quantity"
  | "tp_offset"
  | "sl_offset"
  | "tp_offset_percentage"
  | "sl_offset_percentage";

/**
 * offset -> TP/SL price
 */
export function offsetToPrice(inputs: {
  qty: number;
  offset: number;
  entryPrice: number;
  orderSide: OrderSide;
  orderType: AlgoOrderType;
}) {
  const { qty, offset, entryPrice, orderType, orderSide } = inputs;

  if (orderSide === OrderSide.BUY) {
    if (orderType === AlgoOrderType.TAKE_PROFIT) {
      return new Decimal(entryPrice).add(new Decimal(offset)).toNumber();
    }

    return new Decimal(entryPrice).minus(new Decimal(offset)).toNumber();
  }

  if (orderSide === OrderSide.SELL) {
    if (orderType === AlgoOrderType.TAKE_PROFIT) {
      return new Decimal(entryPrice).minus(new Decimal(offset)).toNumber();
    }

    return new Decimal(entryPrice).add(new Decimal(offset)).toNumber();
  }
}

export function priceToOffset(inputs: {
  qty: number;
  price: number;
  entryPrice: number;
  orderSide: OrderSide;
  orderType: AlgoOrderType;
}) {
  const { qty, price, entryPrice, orderType, orderSide } = inputs;

  if (orderSide === OrderSide.BUY) {
    if (orderType === AlgoOrderType.TAKE_PROFIT) {
      return new Decimal(price).minus(new Decimal(entryPrice)).abs().toNumber();
    }

    return new Decimal(price).minus(new Decimal(entryPrice)).abs().toNumber();
  }

  if (orderSide === OrderSide.SELL) {
    if (orderType === AlgoOrderType.TAKE_PROFIT) {
      return new Decimal(price).minus(new Decimal(entryPrice)).abs().toNumber();
    }

    return new Decimal(entryPrice).minus(new Decimal(price)).abs().toNumber();
  }
}

export function offsetPercentageToPrice(inputs: {
  qty: number;
  percentage: number;
  entryPrice: number;
  orderSide: OrderSide;
  orderType: AlgoOrderType;
}) {
  const { qty, percentage, entryPrice, orderType, orderSide } = inputs;

  if (orderSide === OrderSide.BUY) {
    if (orderType === AlgoOrderType.TAKE_PROFIT) {
      return new Decimal(1)
        .add(new Decimal(percentage))
        .mul(new Decimal(entryPrice))
        .toNumber();
    }

    return new Decimal(1)
      .minus(new Decimal(percentage))
      .mul(new Decimal(entryPrice))
      .toNumber();
  }

  if (orderSide === OrderSide.SELL) {
    if (orderType === AlgoOrderType.TAKE_PROFIT) {
      return new Decimal(1)
        .minus(new Decimal(percentage))
        .mul(new Decimal(entryPrice))
        .toNumber();
    }

    return new Decimal(1)
      .add(new Decimal(percentage))
      .mul(new Decimal(entryPrice))
      .toNumber();
  }
}

export function priceToOffsetPercentage(inputs: {
  qty: number;
  price: number;
  entryPrice: number;
  orderSide: OrderSide;
  orderType: AlgoOrderType;
}) {
  const { qty, price, entryPrice, orderType, orderSide } = inputs;

  if (orderSide === OrderSide.BUY) {
    if (orderType === AlgoOrderType.TAKE_PROFIT) {
      return new Decimal(price)
        .div(new Decimal(entryPrice))
        .minus(1)
        .toNumber();
    }

    return new Decimal(1)
      .minus(new Decimal(price).div(new Decimal(entryPrice)))
      .toNumber();
  }

  if (orderSide === OrderSide.SELL) {
    if (orderType === AlgoOrderType.TAKE_PROFIT) {
      return new Decimal(1)
        .minus(new Decimal(price).div(new Decimal(entryPrice)))
        .toNumber();
    }

    return new Decimal(price).div(new Decimal(entryPrice)).minus(1).toNumber();
  }
}

/**
 * pnl -> TP/SL price
 */
export function pnlToPrice(inputs: {
  qty: number;
  pnl: number;
  entryPrice: number;
  orderSide: OrderSide;
  orderType: AlgoOrderType;
}) {
  const { qty, pnl, entryPrice, orderType, orderSide } = inputs;

  if (orderSide === OrderSide.BUY) {
    if (orderType === AlgoOrderType.TAKE_PROFIT) {
      return new Decimal(entryPrice)
        .plus(new Decimal(pnl).div(new Decimal(qty)))
        .toNumber();
    }

    return new Decimal(entryPrice)
      .add(new Decimal(pnl).div(new Decimal(qty)))
      .toNumber();
  }
  if (orderSide === OrderSide.SELL) {
    if (orderType === AlgoOrderType.TAKE_PROFIT) {
      return new Decimal(entryPrice)
        .add(new Decimal(pnl).div(new Decimal(qty)))
        .toNumber();
    }

    return new Decimal(entryPrice)
      .add(new Decimal(pnl).div(new Decimal(qty)))
      .toNumber();
  }
}

/**
 * TP/SL price -> pnl
 */
export function priceToPnl(inputs: {
  qty: number;
  price: number;
  entryPrice: number;
  orderSide: OrderSide;
  orderType: AlgoOrderType;
}) {
  const { qty, price, entryPrice, orderType, orderSide } = inputs;

  if (orderSide === OrderSide.BUY) {
    if (orderType === AlgoOrderType.TAKE_PROFIT) {
      return new Decimal(qty)
        .mul(new Decimal(price).minus(new Decimal(entryPrice)))
        .toNumber();
    }

    return new Decimal(qty)
      .mul(new Decimal(price).minus(new Decimal(entryPrice)))
      .toNumber();
  }

  if (orderSide === OrderSide.SELL) {
    if (orderType === AlgoOrderType.TAKE_PROFIT) {
      return new Decimal(qty)
        .mul(new Decimal(price).minus(new Decimal(entryPrice)))
        .toNumber();
    }

    return new Decimal(qty)
      .mul(new Decimal(price).minus(new Decimal(entryPrice)))
      .toNumber();
  }
}

export function calculateHelper(
  key: UpdateOrderKey,
  inputs: Record<string, any>
) {
  switch (key) {
  }
}
