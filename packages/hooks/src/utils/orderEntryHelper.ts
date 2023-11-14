import { OrderEntity, OrderType } from "@orderly.network/types";
import { Decimal } from "@orderly.network/utils";

export type OrderEntityKey = keyof OrderEntity & string;

// index 3: markPrice
type orderEntryInputs = [
  OrderEntity,
  // to update field
  string,
  any,
  number,
  {
    baseDP: number;
    quoteDP: number;
  }
];

type orderEntryInputHandle = (inputs: orderEntryInputs) => orderEntryInputs;

const needNumberOnlyFields = ["order_quantity", "order_price", "total"];

export function baseInputHandle(inputs: orderEntryInputs): orderEntryInputs {
  let [values, input, value, markPrice, config] = inputs;

  if (needNumberOnlyFields.includes(input)) {
    // clean the thousandths
    value = value.toString();
    value = value.replace(/,/g, "");
    // clear extra character expect number and .
    value = value.replace(/[^\d.]/g, ""); //清除“数字”和“.”以外的字符
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

  if (!values.order_quantity) {
    return [values, input, value, markPrice, config];
  }

  const total = price.mul(values.order_quantity);

  // const quantityDP = total.dp();
  return [
    {
      ...values,
      total: total.todp(2).toString(),
    },
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

  if (values.order_type === OrderType.MARKET) {
    const price = markPrice;
    values.total = quantity.mul(price).todp(2).toNumber();
  }

  if (values.order_type === OrderType.LIMIT) {
    if (values.order_price) {
      const price = Number(values.order_price);
      const total = quantity.mul(price);
      values.total = total.todp(2).toNumber();
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

  if (values.order_type === OrderType.LIMIT && !!values.order_price) {
    price = Number(values.order_price);
  }
  let total = new Decimal(value);
  const totalDP = total.dp();

  if (totalDP > config.quoteDP) {
    total = total.toDecimalPlaces(config.quoteDP);
    values.total = total.toNumber();
  }

  const quantity = total.div(price);

  return [
    {
      ...values,
      order_quantity: quantity
        .toDecimalPlaces(Math.min(config.baseDP, quantity.dp()))
        .toNumber(),
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
