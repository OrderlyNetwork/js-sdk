import { order as orderPerp } from "@orderly.network/perp";
import { API, OrderlyOrder, OrderSide } from "@orderly.network/types";
import { OrderType } from "@orderly.network/types";
import { AlgoOrderType } from "@orderly.network/types";
import {
  Decimal,
  resolveTPSLOrderType,
  todpIfNeed,
  zero,
} from "@orderly.network/utils";

export type UpdateOrderKey =
  | "tp_trigger_price"
  | "tp_offset_percentage"
  | "tp_offset_percentage_from_mark"
  | "tp_pnl"
  | "tp_offset"
  | "tp_offset_from_mark"
  | "quantity"
  | "sl_trigger_price"
  | "sl_offset_percentage"
  | "sl_offset_percentage_from_mark"
  | "sl_pnl"
  | "sl_offset"
  | "sl_offset_from_mark";

function getOffsetDirection(orderSide: OrderSide, orderType: AlgoOrderType) {
  return (orderSide === OrderSide.BUY) ===
    (orderType === AlgoOrderType.TAKE_PROFIT)
    ? 1
    : -1;
}

export function offsetToPrice(inputs: {
  qty: number;
  offset: number;
  entryPrice: number;
  orderSide: OrderSide;
  orderType: AlgoOrderType;
}) {
  const { offset, entryPrice, orderType, orderSide } = inputs;

  if (!Number.isFinite(offset)) return;

  return new Decimal(offset)
    .mul(getOffsetDirection(orderSide, orderType))
    .add(entryPrice)
    .toNumber();
}

export function priceToOffset(
  inputs: {
    qty: number;
    price: number;
    entryPrice: number;
    orderSide: OrderSide;
    orderType: AlgoOrderType;
  },
  options: { symbol?: Pick<API.SymbolExt, "quote_dp"> } = {},
) {
  const { price, entryPrice, orderType, orderSide } = inputs;
  const difference = new Decimal(price).minus(entryPrice);
  // Round the price difference up before applying direction. Adding it back
  // to the reference and truncating the positive price then restores the trigger.
  const roundedDifference = options.symbol
    ? difference.todp(options.symbol.quote_dp, Decimal.ROUND_CEIL)
    : difference;
  return roundedDifference
    .mul(getOffsetDirection(orderSide, orderType))
    .toNumber();
}

export function offsetPercentageToPrice(inputs: {
  qty: number;
  percentage: number;
  entryPrice: number;
  orderSide: OrderSide;
  orderType: AlgoOrderType;
}) {
  const { qty, percentage, entryPrice, orderType, orderSide } = inputs;

  if (!percentage) return;

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
  const { price, entryPrice, orderType, orderSide } = inputs;
  if (entryPrice === 0) return 0;

  // Match the direction used by offsetPercentageToPrice.
  const direction = getOffsetDirection(orderSide, orderType);
  // Round to nearest so a typed percentage survives the quote_dp price rounding.
  return new Decimal(price)
    .minus(entryPrice)
    .div(entryPrice)
    .mul(direction)
    .toDecimalPlaces(4, Decimal.ROUND_HALF_UP)
    .toNumber();
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

  if (!pnl) {
    return;
  }

  if (qty === 0) return;

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

type PriceToPnlOptions = {
  symbol?: Pick<API.SymbolExt, "quote_dp">;
  pnlRoundingMode?: number;
};

type PriceToPnlInputs = {
  qty: number;
  price: number;
  entryPrice: number;
  orderSide: OrderSide;
  orderType: AlgoOrderType;
};

function calculatePnl({ qty, price, entryPrice, orderSide }: PriceToPnlInputs) {
  return orderSide === OrderSide.BUY || orderSide === OrderSide.SELL
    ? new Decimal(qty).mul(new Decimal(price).minus(entryPrice))
    : zero;
}

/** Calculate PnL at the supplied TP/SL execution price. */
export function priceToPnl(
  inputs: PriceToPnlInputs,
  options: PriceToPnlOptions = {},
): number {
  const { symbol, pnlRoundingMode } = options;
  const decimal = calculatePnl(inputs);

  if (symbol || pnlRoundingMode !== undefined) {
    return decimal.todp(2, pnlRoundingMode ?? Decimal.ROUND_UP).toNumber();
  }

  return decimal.toNumber();
}

export function priceToROI(inputs: {
  values: Partial<OrderlyOrder>;
  markPrice?: number;
  symbolLeverage?: number;
}) {
  const { values, markPrice, symbolLeverage } = inputs;

  const orderPrice =
    values.order_type === OrderType.MARKET ||
    values.order_type === OrderType.STOP_MARKET
      ? markPrice
      : Number(values.order_price);

  if (symbolLeverage && orderPrice) {
    let tp_ROI: number | undefined;
    let sl_ROI: number | undefined;
    for (const leg of ["tp", "sl"] as const) {
      const closePrice = Number(getTPSLExecutionPrice(values, leg));
      if (!Number.isFinite(closePrice) || closePrice <= 0) continue;
      const roi = orderPerp.tpslROI({
        side: values.side!,
        type: leg,
        closePrice,
        orderPrice,
        leverage: symbolLeverage,
      });
      if (leg === "tp") tp_ROI = roi;
      else sl_ROI = roi;
    }

    return {
      tp_ROI: tp_ROI?.toString(),
      sl_ROI: sl_ROI?.toString(),
    };
  }

  return {
    tp_ROI: undefined,
    sl_ROI: undefined,
  };
}

/** @deprecated use priceToROI instead */
export function calcTPSL_ROI(inputs: {
  pnl: number | string;
  qty: number | string;
  price: number | string;
}) {
  const qtyNum = Number(inputs.qty);
  const priceNum = Number(inputs.price);
  if (qtyNum === 0 || priceNum === 0) return "0";
  // ROI = pnl / (abs(quantity) * price)
  return new Decimal(inputs.pnl)
    .div(new Decimal(qtyNum).abs().mul(new Decimal(priceNum)))
    .toString();
}

// function formatPrice(price: number | string, symbol?: API.SymbolExt) {
//   if (typeof price !== "string") {
//     price = `${price}`;
//   }

//   if (price.endsWith(".") || !symbol) {
//     return price;
//   }
//   return new Decimal(Number(price))
//     .todp(symbol.quote_dp, Decimal.ROUND_UP)
//     .toNumber();
// }

type TPSLLeg = "tp" | "sl";

export function getTPSLExecutionType(
  values: Partial<OrderlyOrder>,
  leg: TPSLLeg,
) {
  return resolveTPSLOrderType(
    values[`${leg}_order_type`],
    values[`${leg}_order_price`],
  );
}

function getTPSLExecutionPrice(values: Partial<OrderlyOrder>, leg: TPSLLeg) {
  return getTPSLExecutionType(values, leg) === OrderType.LIMIT
    ? values[`${leg}_order_price`]
    : values[`${leg}_trigger_price`];
}

const calculatedFields = [
  "pnl",
  "offset",
  "offset_percentage",
  "offset_from_mark",
  "offset_percentage_from_mark",
] as const;

export function isTPSLCalculationField(key: string) {
  return calculatedFields.some(
    (field) => key === `tp_${field}` || key === `sl_${field}`,
  );
}

type CalculationInputs = {
  entryPrice: number | string;
  qty: number | string;
  orderSide: OrderSide;
  markPrice: number | string;
  values: Partial<OrderlyOrder>;
};

type CalculationOptions = {
  symbol?: Pick<API.SymbolExt, "quote_dp">;
  lockTrigger?: boolean;
  unroundedTPSLPnl?: boolean;
};

/** Entry-based conversions use the same rounded entry in both directions. */
function roundEntryPrice(price: number, quoteDP: number) {
  return Number.isFinite(price) && price > 0
    ? new Decimal(price).todp(quoteDP, Decimal.ROUND_UP).toNumber()
    : price;
}

export function refreshTPSLValues(
  leg: TPSLLeg,
  inputs: CalculationInputs,
  options: CalculationOptions = {},
) {
  const { values, orderSide, qty } = inputs;
  const symbol = options.symbol ?? { quote_dp: 2 };
  const triggerPrice = Number(values[`${leg}_trigger_price`]);
  const executionPrice = Number(getTPSLExecutionPrice(values, leg));
  const entryPrice = roundEntryPrice(
    Number(inputs.entryPrice),
    symbol.quote_dp,
  );
  const markPrice = Number(inputs.markPrice ?? inputs.entryPrice);
  const orderType =
    leg === "tp" ? AlgoOrderType.TAKE_PROFIT : AlgoOrderType.STOP_LOSS;
  const base = { qty: Number(qty), orderSide, orderType, price: triggerPrice };
  const hasTrigger = Number.isFinite(triggerPrice) && triggerPrice > 0;
  const hasEntry = Number.isFinite(entryPrice) && entryPrice > 0;
  const hasMark = Number.isFinite(markPrice) && markPrice > 0;
  const fromEntry = { ...base, entryPrice };
  const fromMark = { ...base, entryPrice: markPrice };
  const pnlInputs = { ...fromEntry, price: executionPrice };
  return {
    [`${leg}_pnl`]:
      hasEntry &&
      Number.isFinite(executionPrice) &&
      executionPrice > 0 &&
      Number(qty)
        ? options.unroundedTPSLPnl
          ? calculatePnl(pnlInputs).toString()
          : priceToPnl(pnlInputs, options)
        : "",
    [`${leg}_offset`]:
      hasTrigger && hasEntry ? priceToOffset(fromEntry, { symbol }) : "",
    [`${leg}_offset_percentage`]:
      hasTrigger && hasEntry ? priceToOffsetPercentage(fromEntry) : "",
    [`${leg}_offset_from_mark`]:
      hasTrigger && hasMark ? priceToOffset(fromMark, { symbol }) : "",
    [`${leg}_offset_percentage_from_mark`]:
      hasTrigger && hasMark ? priceToOffsetPercentage(fromMark) : "",
  };
}

export function tpslCalculateHelper(
  key: string,
  inputs: CalculationInputs & { key: string; value: string | number | boolean },
  options: CalculationOptions = {},
) {
  if (!key.startsWith("tp_") && !key.startsWith("sl_")) {
    return { [key]: inputs.value };
  }

  const leg = key.startsWith("tp_") ? "tp" : "sl";
  const triggerKey = `${leg}_trigger_price` as const;
  const priceKey = `${leg}_order_price` as const;
  const typeKey = `${leg}_order_type` as const;
  const { values, value } = inputs;
  const isLimit = getTPSLExecutionType(values, leg) === OrderType.LIMIT;
  const quoteDP = options.symbol?.quote_dp ?? 2;
  let changes: Partial<OrderlyOrder>;

  if (key === triggerKey) {
    if (options.lockTrigger) return {};
    changes = {
      [triggerKey]: todpIfNeed((value ?? "") as string | number, quoteDP),
    };
  } else if (key === priceKey) {
    changes = {
      [priceKey]: todpIfNeed((value ?? "") as string | number, quoteDP),
    };
  } else if (key === typeKey) {
    changes = {
      [typeKey]: value,
      [priceKey]: value === OrderType.LIMIT ? (values[triggerKey] ?? "") : "",
    };
  } else if (isTPSLCalculationField(key)) {
    const isPnl = key === `${leg}_pnl`;
    if (
      options.lockTrigger &&
      (!isPnl || !isLimit || !Number(values[triggerKey]))
    )
      return {};

    let price: number | undefined;
    if (value !== "") {
      if (
        typeof value !== "number" &&
        (typeof value !== "string" || !value.trim())
      ) {
        return {};
      }
      const isPercentage = key.includes("_percentage");
      // The formatter appends a second decimal point to preserve typing suffixes.
      const amount = Number(
        isPercentage && typeof value === "string"
          ? value.replace(/(\.\d+)\.0{0,2}$/, "$1")
          : value,
      );
      const useMark = key.endsWith("_from_mark");
      const basePrice = Number(
        useMark ? (inputs.markPrice ?? inputs.entryPrice) : inputs.entryPrice,
      );
      if (
        !Number.isFinite(amount) ||
        !Number.isFinite(basePrice) ||
        basePrice <= 0
      ) {
        return {};
      }
      const calculation = {
        qty: Number(inputs.qty),
        entryPrice: useMark ? basePrice : roundEntryPrice(basePrice, quoteDP),
        orderSide: inputs.orderSide,
        orderType:
          leg === "tp" ? AlgoOrderType.TAKE_PROFIT : AlgoOrderType.STOP_LOSS,
      };

      if (isPnl) {
        if (!Number.isFinite(calculation.qty)) return {};
        price = pnlToPrice({ ...calculation, pnl: amount });
      } else if (isPercentage) {
        price = offsetPercentageToPrice({ ...calculation, percentage: amount });
      } else {
        price = offsetToPrice({ ...calculation, offset: amount });
      }

      if (price === undefined || !Number.isFinite(price)) {
        return {};
      }
    }

    const formattedPrice =
      price === undefined
        ? ""
        : todpIfNeed(new Decimal(price).toFixed(), quoteDP);
    changes = {
      ...(options.lockTrigger ? {} : { [triggerKey]: formattedPrice }),
      ...(isLimit ? { [priceKey]: formattedPrice } : {}),
    };
  } else {
    return { [key]: value };
  }

  return {
    ...refreshTPSLValues(
      leg,
      { ...inputs, values: { ...values, ...changes } },
      options,
    ),
    ...changes,
  };
}
