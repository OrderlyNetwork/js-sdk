import { OrderEntity, OrderType } from "@orderly.network/types";
import { Decimal } from "@orderly.network/utils";

export type OrderEntityKey = keyof OrderEntity & string;

// index 3: markPrice
type orderEntryInputs = [
  Partial<OrderEntity>,
  // to update field
  keyof OrderEntity,
  any,
  number,
  {
    baseDP: number;
    quoteDP: number;
  }
];

type orderEntryInputHandle = (inputs: orderEntryInputs) => orderEntryInputs;

const needNumberOnlyFields: (keyof OrderEntity)[] = [
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
    // if (!!values.order_quantity) {
    //
    //   const d = new Decimal(values.order_quantity);
    //   const dp = d.dp();
    //   if (dp > quoteTick) {
    //     values.order_quantity = d.toDecimalPlaces(baseTick).toNumber();
    //   }
    // }

    // if (!!values.order_price && values.order_type === OrderType.LIMIT) {
    //   const sd = new Decimal(values.order_price).sd(false);
    //   if (sd > quoteTick) {
    //     values.order_price = new Decimal(values.order_price).toFixed(quoteTick);
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

  if (priceDP > config.quoteDP) {
    values.order_price = price.toDecimalPlaces(config.quoteDP).toString();
  }

  price.toDecimalPlaces(Math.min(priceDP, config.quoteDP));

  if (!values.order_quantity && !values.total) {
    return [values, input, value, markPrice, config];
  }

  const newValue = {
    ...values,
  };

  if (values.order_quantity) {
    // total = price.mul(values.order_quantity);
    newValue.total = price.mul(values.order_quantity).todp(2).toString();
  } else if (values.total) {
    // total = new Decimal(values.total);
    newValue.order_quantity = new Decimal(values.total)
      .div(price)
      .todp(config.baseDP)
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
  if (quantityDP > config.baseDP) {
    quantity = quantity.toDecimalPlaces(config.baseDP);
    values.order_quantity = quantity.toNumber();
  }

  // if(values.order_type === OrderType.MARKET) {

  // }

  if (
    values.order_type === OrderType.MARKET ||
    values.order_type === OrderType.STOP_MARKET
  ) {
    const price = markPrice;
    values.total = quantity.mul(price).todp(2).toString();
  }

  if (
    values.order_type === OrderType.LIMIT ||
    values.order_type === OrderType.STOP_LIMIT
  ) {
    if (values.order_price) {
      const price = Number(values.order_price);
      const total = quantity.mul(price);
      values.total = total.todp(2).toString();
    } else {
      values.total = "";
    }
  }

  // const totalDP = total.dp();
  // total.todp(Math.min(config.quoteDP, totalDP));

  return [
    {
      ...values,
      // total: total.todp(2).toNumber(),
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

  if (totalDP > config.quoteDP) {
    total = total.toDecimalPlaces(config.quoteDP);
    values.total = total.toString();
  }

  const quantity = total.div(price);

  return [
    {
      ...values,
      order_quantity: quantity
        .toDecimalPlaces(Math.min(config.baseDP, quantity.dp()))
        .toString(),
    },
    input,
    value,
    markPrice,
    config,
  ];
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
  fieldName: string
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
    default:
      return otherInputHandle;
  }
};

//** format number */
export function formatNumber(
  qty?: string | number,
  dp?: number | string
): string | undefined {
  if (typeof qty === "undefined") return qty;
  if (typeof dp === "undefined") return `${qty}`;

  try {
    const _dp = new Decimal(dp);

    if (_dp.lessThan(1)) {
      const numStr = dp.toString();
      const decimalIndex = numStr.indexOf(".");
      const digitsAfterDecimal =
        decimalIndex === -1 ? 0 : numStr.length - decimalIndex - 1;

      const result = new Decimal(qty)
        .toDecimalPlaces(digitsAfterDecimal, Decimal.ROUND_DOWN)
        .toString();

      return result;
    }

    return new Decimal(qty)
      .dividedBy(_dp)
      .toDecimalPlaces(0, Decimal.ROUND_DOWN)
      .mul(dp)
      .toString();
  } catch (e) {    
    return undefined;
  }
}
