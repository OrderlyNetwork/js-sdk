import { compose, head } from "ramda";
import {
  API,
  OrderlyOrder,
  OrderSide,
  OrderType,
} from "@orderly.network/types";
import { Decimal } from "@orderly.network/utils";
import { FullOrderState } from "../next/useOrderEntry/useOrderStore";
import { tpslCalculateHelper } from "../orderly/useTakeProfitAndStopLoss/tp_slUtils";

// index 3: markPrice
type orderEntryInputs = [
  Partial<OrderlyOrder>,
  // to update field
  keyof OrderlyOrder,
  any,
  number,
  API.SymbolExt,
];

type orderEntryInputHandle = (inputs: orderEntryInputs) => orderEntryInputs;

const needNumberOnlyFields: (keyof OrderlyOrder)[] = [
  "order_quantity",
  "order_price",
  "trigger_price",
  "total",
];

/// only save number
export const cleanStringStyle = (str: string | number): string => {
  if (typeof str !== "string") {
    str = `${str}`;
  }
  str = str.replace(/,/g, "");
  // clear extra character expect number and .
  str = str
    .replace(/[^\d.]/g, "")
    .replace(".", "$#$")
    .replace(/\./g, "")
    .replace("$#$", ".");

  return str;
};

export function baseInputHandle(inputs: orderEntryInputs): orderEntryInputs {
  let [values, input, value, markPrice, config] = inputs;

  needNumberOnlyFields.forEach((field) => {
    if (typeof values[field] !== "undefined") {
      // @ts-ignore
      values[field] = cleanStringStyle(values[field] as string);
    }
  });

  if (needNumberOnlyFields.includes(input)) {
    value = cleanStringStyle(value);
  }

  return [
    {
      ...values,
      [input]: value,
    },
    input,
    value,
    markPrice,
    config,
  ];

  //   return [values, input, value, markPrice];
}

export function orderTypeHandle(inputs: orderEntryInputs): orderEntryInputs {
  const [values, input, value, markPrice, config] = inputs;

  if (value === OrderType.LIMIT || value === OrderType.STOP_LIMIT) {
    if (values.order_price === "") {
      values.total = "";
    }
  }

  if (value === OrderType.MARKET || value === OrderType.LIMIT) {
    values.trigger_price = undefined;
  }

  if (value === OrderType.MARKET || value === OrderType.STOP_MARKET) {
    // if the type is market, price use markPrice
  }

  // if (value === OrderType.STOP_MARKET || value === OrderType.STOP_LIMIT) {
  //   values.algo_type = AlgoOrderRootType.STOP;
  //   // values.type = OrderType.S
  // }

  return [values, input, value, markPrice, config];
}

/**
 * digital precision processing
 * @param inputs
 * @returns
 */
export function orderEntityFormatHandle(baseTick: number, quoteTick: number) {
  return function (inputs: orderEntryInputs): orderEntryInputs {
    const [values, input, value, markPrice, config] = inputs;

    // TODO: formatting only deals with the thousandths and so on
    // if (!!values.quantity) {
    //
    //   const d = new Decimal(values.quantity);
    //   const dp = d.dp();
    //   if (dp > quoteTick) {
    //     values.quantity = d.toDecimalPlaces(baseTick).toNumber();
    //   }
    // }

    // if (!!values.price && values.type === OrderType.LIMIT) {
    //   const sd = new Decimal(values.price).sd(false);
    //   if (sd > quoteTick) {
    //     values.price = new Decimal(values.price).toFixed(quoteTick);
    //   }
    // }

    // if (!!values.total) {
    //   const sd = new Decimal(values.total).sd(false);
    //   if (sd > quoteTick) {
    //     values.total = new Decimal(values.total).toFixed(quoteTick);
    //   }
    // }

    return [values, input, value, markPrice, config];
  };
}

/**
 * price input handle
 * @param inputs
 * @returns
 */
function priceInputHandle(inputs: orderEntryInputs): orderEntryInputs {
  const [values, input, value, markPrice, config] = inputs;

  if (value === "") {
    return [{ ...values, total: "" }, input, value, markPrice, config];
  }

  // when entering the price, total also needs to be linked
  const price = new Decimal(value);
  const priceDP = price.dp();

  if (priceDP > config.quote_dp) {
    values.order_price = price.toDecimalPlaces(config.quote_dp).toString();
  }

  price.toDecimalPlaces(Math.min(priceDP, config.quote_dp));

  if (!values.order_quantity && !values.total) {
    return [values, input, value, markPrice, config];
  }

  const newValue = {
    ...values,
  };

  if (values.order_quantity) {
    // total = price.mul(values.quantity);
    newValue.total = price.mul(values.order_quantity).todp(2).toString();
  } else if (values.total) {
    // total = new Decimal(values.total);
    newValue.order_quantity = new Decimal(values.total)
      .div(price)
      .todp(config.base_dp)
      .toString();
  }

  // const quantityDP = total.dp();
  return [
    // {
    //   ...values,
    //   total: total.todp(2).toString(),
    // },
    newValue,
    input,
    value,
    markPrice,
    config,
  ];
}

/**
 * quantity input handle
 * @param inputs
 * @returns
 */
function quantityInputHandle(inputs: orderEntryInputs): orderEntryInputs {
  const [values, input, value, markPrice, config] = inputs;

  if (value === "") {
    return [{ ...values, total: "" }, input, value, markPrice, config];
  }

  let quantity = new Decimal(value);
  const quantityDP = quantity.dp();

  // check the length for precision and recalculate
  if (quantityDP > config.base_dp) {
    quantity = quantity.toDecimalPlaces(config.base_dp);
    values.order_quantity = quantity.toString();
  }

  // if(values.type === OrderType.MARKET) {

  // }

  if (
    values.order_type === OrderType.MARKET ||
    values.order_type === OrderType.STOP_MARKET
  ) {
    if (!markPrice) {
      console.warn("[ORDERLY]markPrice is required for market order");
      return [values, input, value, markPrice, config];
    }
    const price = markPrice;
    values.order_price = "";
    values.total = quantity.mul(price).todp(2).toString();
  }

  if (
    values.order_type === OrderType.LIMIT ||
    values.order_type === OrderType.STOP_LIMIT
  ) {
    if (values.order_price) {
      const price = Number(values.order_price);
      const total = quantity.mul(price);
      values.total = total.todp(config.quote_dp).toString();
    } else {
      values.total = "";
    }
  }

  // const totalDP = total.dp();
  // total.todp(Math.min(config.quoteDP, totalDP));

  return [
    {
      ...values,
    },
    input,
    value,
    markPrice,
    config,
  ];
}

/**
 * total input handle
 * @param inputs
 * @returns
 */
function totalInputHandle(inputs: orderEntryInputs): orderEntryInputs {
  const [values, input, value, markPrice, config] = inputs;
  if (value === "") {
    return [{ ...values, order_quantity: "" }, input, value, markPrice, config];
  }

  let price = markPrice;

  if (
    (values.order_type === OrderType.LIMIT ||
      values.order_type === OrderType.STOP_LIMIT) &&
    !!values.order_price
  ) {
    price = Number(values.order_price);
  }
  let total = new Decimal(value);
  const totalDP = total.dp();

  if (totalDP > config.quote_dp) {
    total = total.toDecimalPlaces(config.quote_dp);
    values.total = total.toString();
  }

  const quantity = total.div(price);
  let order_quantity = quantity
    .toDecimalPlaces(Math.min(config.base_dp, quantity.dp()))
    .toString();

  if (config.base_tick >= 1) {
    order_quantity = formatNumber(
      order_quantity,
      new Decimal(config?.base_tick || "0").toNumber(),
    )!;
  }

  return [
    {
      ...values,
      order_quantity,
    },
    input,
    value,
    markPrice,
    config,
  ];
}

function tpslInputHandle(inputs: orderEntryInputs): orderEntryInputs {
  const [values, input, value, markPrice, config] = inputs;

  const price =
    values.order_type === OrderType.MARKET ||
    values.order_type === OrderType.STOP_MARKET
      ? markPrice
      : values.order_price;

  // if price or quantity is empty, return
  if (!price || !values.order_quantity) {
    return [values, input, value, markPrice, config];
  }

  const _tpslValue = tpslCalculateHelper(
    input,
    {
      key: input,
      value,
      entryPrice: price, // order price or mark price
      qty:
        values.side === OrderSide.BUY
          ? Number(values.order_quantity)
          : Number(values.order_quantity) * -1,
      orderSide: values.side!,
      // values: newValues,
    },
    {
      symbol: config,
    },
  );

  return [{ ...values, ..._tpslValue }, input, value, markPrice, config];
}

/**
 * other input handle
 * @param inputs
 * @returns
 */
function otherInputHandle(inputs: orderEntryInputs): orderEntryInputs {
  return inputs;
}

export const getCalculateHandler = (
  fieldName: keyof OrderlyOrder,
): orderEntryInputHandle => {
  switch (fieldName) {
    case "order_type":
      return orderTypeHandle;
    case "order_quantity": {
      return quantityInputHandle;
    }
    case "order_price": {
      return priceInputHandle;
    }
    case "total": {
      return totalInputHandle;
    }
    case "tp_pnl":
    case "sl_pnl":
    case "tp_trigger_price":
    case "sl_trigger_price":
    case "tp_offset":
    case "sl_offset":
    case "tp_offset_percentage":
    case "sl_offset_percentage":
      return tpslInputHandle;

    default:
      return otherInputHandle;
  }
};

//** format number */
export function formatNumber(
  qty?: string | number,
  dp?: number | string,
): string | undefined {
  if (typeof qty === "undefined") return qty;
  if (typeof dp === "undefined") return `${qty}`;

  // console.log("qty", qty, "dp", dp);

  const _qty = `${qty}`.replace(/,/g, "");

  try {
    const _dp = new Decimal(dp);
    const _qtyDecimal = new Decimal(_qty);

    if (_dp.lessThan(1)) {
      if (`${_qty}`.endsWith(".")) return `${_qty}`;

      const numStr = dp.toString();
      const decimalIndex = numStr.indexOf(".");
      const digitsAfterDecimal =
        decimalIndex === -1 ? 0 : numStr.length - decimalIndex - 1;

      const result = _qtyDecimal
        .toDecimalPlaces(digitsAfterDecimal, Decimal.ROUND_DOWN)
        .toString();

      return result;
    }

    if (_qtyDecimal.lessThan(_dp)) {
      return _qty;
    }

    return _qtyDecimal
      .dividedBy(_dp)
      .toDecimalPlaces(0, Decimal.ROUND_DOWN)
      .mul(dp)
      .toString();
  } catch (e) {
    return undefined;
  }
}

export function calculate(
  values: Partial<FullOrderState>,
  fieldName:
    | "symbol"
    | "order_type"
    | "order_type_ext"
    | "order_price"
    | "order_quantity"
    | "order_amount"
    | "visible_quantity"
    | "side"
    | "reduce_only"
    | "slippage"
    | "order_tag"
    | "level"
    | "post_only_adjust"
    | "total"
    | "algo_type"
    | "trigger_price_type"
    | "trigger_price"
    | "child_orders"
    | "tp_pnl"
    | "tp_offset"
    | "tp_offset_percentage"
    | "tp_ROI"
    | "tp_trigger_price"
    | "sl_pnl"
    | "sl_offset"
    | "sl_offset_percentage"
    | "sl_ROI"
    | "sl_trigger_price"
    | "quantity"
    | "price"
    | "type",
  value: any,
  markPrice: number,
  config: API.SymbolExt,
): Partial<FullOrderState> {
  // console.log("calculate", values, fieldName, value, options);
  const fieldHandler = getCalculateHandler(fieldName);

  const newValues = compose<any, any, any, Partial<FullOrderState>>(
    head,
    // orderEntityFormatHandle(baseDP, quoteDP),
    fieldHandler,
    baseInputHandle,
  )([values, fieldName, value, markPrice, config]);

  // if fieldName is quantity/price,recalculate the tp/sl

  return newValues as Partial<FullOrderState>;
}
