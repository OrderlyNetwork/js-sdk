import { API, OrderSide, PositionSide } from "@orderly.network/types";
import { OrderType } from "@orderly.network/types";
import { AlgoOrderType } from "@orderly.network/types";
import { Decimal, zero } from "@orderly.network/utils";

export type UpdateOrderKey =
  | "tp_trigger_price"
  | "tp_offset_percentage"
  | "tp_pnl"
  | "tp_offset"
  | "quantity"
  | "sl_trigger_price"
  | "sl_offset_percentage"
  | "sl_pnl"
  | "sl_offset";

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

  if (!offset) return;

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

export function priceToOffset(
  inputs: {
    qty: number;
    price: number;
    entryPrice: number;
    orderSide: OrderSide;
    orderType: AlgoOrderType;
  },
  options: { symbol?: API.SymbolExt } = {}
) {
  const { qty, price, entryPrice, orderType, orderSide } = inputs;
  const { symbol } = options;
  let decimal: Decimal;

  if (orderSide === OrderSide.BUY) {
    if (orderType === AlgoOrderType.TAKE_PROFIT) {
      decimal = new Decimal(price).minus(new Decimal(entryPrice));
    }

    decimal = new Decimal(price).minus(new Decimal(entryPrice));
  }

  if (orderSide === OrderSide.SELL) {
    if (orderType === AlgoOrderType.TAKE_PROFIT) {
      decimal = new Decimal(price).minus(new Decimal(entryPrice));
    }

    decimal = new Decimal(entryPrice).minus(new Decimal(price));
  }

  if (symbol) {
    return decimal!.abs().todp(symbol.quote_dp, 4).toNumber();
  }

  return decimal!.abs().toNumber();
}

export function offsetPercentageToPrice(inputs: {
  qty: number;
  percentage: number;
  entryPrice: number;
  orderSide: OrderSide;
  orderType: AlgoOrderType;
}) {
  const { qty, percentage, entryPrice, orderType, orderSide } = inputs;

  if (percentage) return;

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

  console.log("pnlToPrice", inputs);

  if (!pnl) {
    return;
  }

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
export function priceToPnl(
  inputs: {
    qty: number;
    price: number;
    entryPrice: number;
    orderSide: OrderSide;
    orderType: AlgoOrderType;
  },
  options: { symbol?: API.SymbolExt } = {}
): number {
  const { qty, price, entryPrice, orderType, orderSide } = inputs;
  const { symbol } = options;
  let decimal = zero;

  if (orderSide === OrderSide.BUY) {
    if (orderType === AlgoOrderType.TAKE_PROFIT) {
      decimal = new Decimal(qty).mul(
        new Decimal(price).minus(new Decimal(entryPrice))
      );
    }

    decimal = new Decimal(qty).mul(
      new Decimal(price).minus(new Decimal(entryPrice))
    );
  }

  if (orderSide === OrderSide.SELL) {
    if (orderType === AlgoOrderType.TAKE_PROFIT) {
      decimal = new Decimal(qty).mul(
        new Decimal(price).minus(new Decimal(entryPrice))
      );
    }

    decimal = new Decimal(qty).mul(
      new Decimal(price).minus(new Decimal(entryPrice))
    );
  }

  if (symbol) {
    return decimal.todp(symbol.quote_dp, 4).toNumber();
  }

  return decimal.toNumber();
}

export function calculateHelper(
  key: string,
  inputs: {
    key: string;
    value: string | number;
    entryPrice: number;
    qty: number;
    orderSide: OrderSide;
  },
  options: { symbol?: API.SymbolExt } = {}
) {
  const { symbol } = options;
  // if not need to be computed, return the value directly
  if (
    key !== "quantity" &&
    key !== "tp_trigger_price" &&
    key !== "sl_trigger_price" &&
    key !== "tp_pnl" &&
    key !== "sl_pnl" &&
    key !== "tp_offset" &&
    key !== "sl_offset" &&
    key !== "tp_offset_percentage" &&
    key !== "sl_offset_percentage"
  ) {
    return {
      [key]: inputs.value,
    };
  }

  const orderType = key.startsWith("tp_")
    ? AlgoOrderType.TAKE_PROFIT
    : AlgoOrderType.STOP_LOSS;
  const keyPrefix = key.slice(0, 3);

  let qty = Number(key === "quantity" ? inputs.value : inputs.qty);

  if (qty === 0)
    return {
      [`${keyPrefix}trigger_price`]: "",
      [`${keyPrefix}offset`]: "",
      [`${keyPrefix}offset_percentage`]: "",
      [`${keyPrefix}pnl`]: "",
      [key]: inputs.value,
    };

  let trigger_price, offset, offset_percentage, pnl;

  switch (key) {
    case "tp_trigger_price":
    case "sl_trigger_price": {
      trigger_price = inputs.value;
      // if trigger price is empty and the key is `*_trigger_price`, reset the offset and pnl
      if (inputs.value === "") {
        return {
          [`${keyPrefix}trigger_price`]: trigger_price,
          [`${keyPrefix}offset`]: "",
          [`${keyPrefix}offset_percentage`]: "",
          [`${keyPrefix}pnl`]: "",
        };
      }
      break;
    }

    case "tp_pnl":
    case "sl_pnl": {
      pnl = inputs.value;
      trigger_price = pnlToPrice({
        qty,
        pnl: Number(inputs.value),
        entryPrice: inputs.entryPrice,
        orderSide: inputs.orderSide,
        orderType,
      });
      break;
    }

    case "tp_offset":
    case "sl_offset": {
      offset = inputs.value;
      trigger_price = offsetToPrice({
        qty,
        offset: Number(inputs.value),
        entryPrice: inputs.entryPrice,
        orderSide: inputs.orderSide,
        orderType:
          key === "tp_offset"
            ? AlgoOrderType.TAKE_PROFIT
            : AlgoOrderType.STOP_LOSS,
      });
      break;
    }

    case "tp_offset_percentage":
    case "sl_offset_percentage": {
      offset_percentage = inputs.value;
      trigger_price = offsetPercentageToPrice({
        qty,
        percentage: Number(inputs.value),
        entryPrice: inputs.entryPrice,
        orderSide: inputs.orderSide,
        orderType,
      });
      break;
    }
  }

  if (!trigger_price)
    return {
      [`${keyPrefix}trigger_price`]: "",
      [`${keyPrefix}offset`]: "",
      [`${keyPrefix}offset_percentage`]: "",
      [`${keyPrefix}pnl`]: "",
      [key]: inputs.value,
    };

  return {
    [`${keyPrefix}trigger_price`]: symbol
      ? new Decimal(Number(trigger_price)).todp(symbol.quote_dp, 4).toNumber()
      : trigger_price,
    [`${keyPrefix}offset`]:
      offset ??
      priceToOffset(
        {
          qty,
          price: Number(trigger_price!),
          entryPrice: inputs.entryPrice,
          orderSide: inputs.orderSide,
          orderType,
        },
        options
      ),
    [`${keyPrefix}offset_percentage`]:
      offset_percentage ??
      priceToOffsetPercentage({
        qty,
        price: Number(trigger_price!),
        entryPrice: inputs.entryPrice,
        orderSide: inputs.orderSide,
        orderType,
      }),
    [`${keyPrefix}pnl`]:
      pnl ??
      priceToPnl(
        {
          qty,
          price: Number(trigger_price!),
          entryPrice: inputs.entryPrice,
          orderSide: inputs.orderSide,
          orderType,
        },
        options
      ),
  };
}
