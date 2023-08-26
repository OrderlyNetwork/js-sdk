import { OrderEntity, OrderType } from "@orderly/types";
import { Decimal } from "@orderly/utils";

export type OrderEntityKey = keyof OrderEntity & string;

// index 3: markPrice
type orderEntryInputs = [
  OrderEntity,
  OrderEntityKey,
  any,
  number,
  {
    baseDP: number;
    quoteDP: number;
  }
];

type orderEntryInputHandle = (inputs: orderEntryInputs) => orderEntryInputs;

export function baseInputHandle(inputs: orderEntryInputs): orderEntryInputs {
  const [values, input, value, markPrice, config] = inputs;

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
 * 数字精度处理
 * @param inputs
 * @returns
 */
export function orderEntityFormatHandle(baseTick: number, quoteTick: number) {
  return function (inputs: orderEntryInputs): orderEntryInputs {
    const [values, input, value, markPrice, config] = inputs;

    //TODO:格式化只处理千分位等等问题

    // if (!!values.order_quantity) {
    //   console.log("baseTick //////", baseTick);
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
 * 价格输入处理
 * @param inputs
 * @returns
 */
function priceInputHandle(inputs: orderEntryInputs): orderEntryInputs {
  const [values, input, value, markPrice, config] = inputs;

  if (value === "") {
    return [{ ...values, total: "" }, input, value, markPrice, config];
  }

  // 输入价格的时候， total也需要联动
  const price = new Decimal(value);
  const priceDP = price.dp();
  price.toDecimalPlaces(Math.min(priceDP, config.quoteDP));

  if (!values.order_quantity) {
    return [
      { ...values, order_price: price.toNumber() },
      input,
      value,
      markPrice,
      config,
    ];
  }

  const total = price.mul(values.order_quantity);

  const quantityDP = total.dp();
  total.toDecimalPlaces(Math.min(quantityDP, config.baseDP));

  return [
    { ...values, order_price: price.toNumber(), total: total.toNumber() },
    input,
    value,
    markPrice,
    config,
  ];
}

/**
 * 数量输入处理
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

  //// 检查长度进行精度处理，用处理后的值重新计算

  if (quantityDP > config.baseDP) {
    quantity = quantity.toDecimalPlaces(config.baseDP);
    values.order_quantity = quantity.toNumber();
  }

  let price = markPrice;

  if (values.order_type === OrderType.LIMIT && !!values.order_price) {
    price = Number(values.order_price);
  }

  const total = quantity.mul(price);
  const totalDP = total.dp();
  total.todp(Math.min(config.quoteDP, totalDP));

  return [
    {
      ...values,
      total: total.toNumber(),
    },
    input,
    value,
    markPrice,
    config,
  ];
}

/**
 * 总价输入处理
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
  quantity.toDecimalPlaces(Math.min(config.baseDP, quantity.dp()));

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
 * 其他输入处理
 * @param inputs
 * @returns
 */
function otherInputHandle(inputs: orderEntryInputs): orderEntryInputs {
  return inputs;
}

export const getCalculateHandler = (
  fieldName: OrderEntityKey
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
