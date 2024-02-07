import { OrderType, type API, OrderEntity } from "@orderly.network/types";
import { Decimal } from "@orderly.network/utils";
import { order } from "@orderly.network/perp";
import { OrderSide } from "@orderly.network/types";

export type VerifyResult = {
  [P in keyof OrderEntity]?: { type: string; message: string };
};
export type OrderFormEntity = Pick<
  OrderEntity,
  "order_price" | "order_quantity" | "total"
>;

type ValuesDepConfig = {
  // token: API.TokenInfo;
  symbol: API.SymbolExt;
  maxQty: number;
  markPrice: number;
};

export interface OrderCreator {
  create: (values: OrderEntity, configs: ValuesDepConfig) => OrderEntity;
  validate: (
    values: OrderFormEntity,
    configs: ValuesDepConfig
  ) => Promise<VerifyResult>;
}

const { maxPrice, minPrice, scropePrice } = order;

export abstract class BaseOrderCreator implements OrderCreator {
  abstract create(values: OrderEntity, config: ValuesDepConfig): OrderEntity;
  abstract validate(
    values: OrderFormEntity,
    config: ValuesDepConfig
  ): Promise<VerifyResult>;

  baseOrder(data: OrderEntity): OrderEntity {
    const order: Partial<OrderEntity> = {
      // symbol: data.symbol,
      order_type:
        data.order_type === OrderType.LIMIT
          ? !!data.order_type_ext
            ? data.order_type_ext
            : data.order_type
          : data.order_type,
      side: data.side,
      reduce_only: data.reduce_only,
      order_quantity: data.order_quantity,
      total: data.total,
    };

    if (data.visible_quantity === 0) {
      order.visible_quantity = data.visible_quantity;
    }

    return order as OrderEntity;
  }

  baseValidate(
    values: OrderFormEntity,
    configs: ValuesDepConfig
  ): Promise<VerifyResult> {
    const errors: {
      [P in keyof OrderEntity]?: { type: string; message: string };
    } = {};

    const { maxQty } = configs;

    let { order_quantity, total, order_price } = values;

    if (!order_quantity) {
      // calculate order_quantity from total
      if (total && order_price) {
        const { quote_dp } = configs.symbol;
        const totalNumber = new Decimal(total);
        const qty = totalNumber.dividedBy(order_price).toFixed(quote_dp);
        order_quantity = qty;
      }
    }

    if (!order_quantity) {
      errors.order_quantity = {
        type: "required",
        message: "quantity is required",
      };
    } else {
      // need to use MaxQty+base_max, base_min to compare
      const { base_min, quote_dp, base_dp } = configs.symbol;
      const qty = new Decimal(order_quantity);
      if (qty.lt(base_min)) {
        errors.order_quantity = {
          type: "min",
          message: `quantity must be greater than ${new Decimal(base_min).todp(
            base_dp
          )}`,
        };
        // errors.order_quantity = `quantity must be greater than ${base_min}`;
      } else if (qty.gt(maxQty)) {
        errors.order_quantity = {
          type: "max",
          message: `quantity must be less than ${new Decimal(maxQty).todp(
            base_dp
          )}`,
        };
      }
    }

    if (!!total) {
      const { quote_max, quote_min, quote_dp } = configs.symbol;
      const totalNumber = new Decimal(total);
      if (totalNumber.lt(quote_min)) {
        errors.total = {
          type: "min",
          message: `Quantity must be at least ${new Decimal(quote_min).todp(
            quote_dp
          )}`,
        };
      } else if (totalNumber.gt(quote_max)) {
        errors.total = {
          type: "max",
          message: `Quantity should be less or equal than ${new Decimal(
            quote_max
          ).todp(quote_dp)}`,
        };
      }
    }

    return Promise.resolve(errors);
  }

  fixOrderQuantity(
    order: Partial<OrderEntity>,
    config: ValuesDepConfig
  ): OrderEntity {
    // if order_quantity is not set but total is set, calculate order_quantity from total
    if (!order.order_quantity && order.total && order.order_price) {
      const { base_dp } = config.symbol;
      const totalNumber = new Decimal(order.total);
      const qty = totalNumber.div(order.order_price).toDecimalPlaces(base_dp);
      order.order_quantity = qty.toNumber();

      delete order.total;
    }

    return order as OrderEntity;
  }
}

export class LimitOrderCreator extends BaseOrderCreator {
  create(values: OrderEntity, config: ValuesDepConfig): OrderEntity {
    const order = {
      ...this.baseOrder(values),
      order_price: values.order_price,
    };

    this.fixOrderQuantity(order, config);

    return order;
  }
  validate(
    values: OrderFormEntity,
    config: ValuesDepConfig
  ): Promise<VerifyResult> {
    return this.baseValidate(values, config).then((errors) => {
      // const errors = this.baseValidate(values, config);
      // @ts-ignore
      const { order_price, side } = values;

      if (!order_price) {
        errors.order_price = {
          type: "required",
          message: "price is required",
        };
      } else {
        const price = new Decimal(order_price);
        const { symbol } = config;
        const { price_range, price_scope } = symbol;
        const maxPriceNumber = maxPrice(config.markPrice, price_range);
        const minPriceNumber = minPrice(config.markPrice, price_range);
        const scropePriceNumbere = scropePrice(
          config.markPrice,
          price_scope,
          side
        );

        const priceRange = side === "BUY" ? {
          min: scropePriceNumbere,
          max: maxPriceNumber,
        } : {
          min: minPriceNumber,
          max: scropePriceNumbere
        };

        /// if side is 'buy', only check max price,
        /// if side is 'sell', only check min price,
        if (price.gt(priceRange.max)) {
          errors.order_price = {
            type: "max",
            message: `Price must be less than ${new Decimal(
              priceRange.max
            ).todp(symbol.quote_dp)}`,
          };
        }
        if (price.lt(priceRange.min)) {
          errors.order_price = {
            type: "min",
            message: `Price must be greater than ${new Decimal(
              priceRange.min
            ).todp(symbol.quote_dp)}`,
          };
        }

      }

      return errors;
    });
  }
}

export class MarketOrderCreator extends BaseOrderCreator {
  create(values: OrderEntity): OrderEntity {
    const data = this.baseOrder(values);

    delete data["order_price"];

    return {
      ...data,
    };
  }
  validate(
    values: OrderFormEntity,
    configs: ValuesDepConfig
  ): Promise<VerifyResult> {
    return this.baseValidate(values, configs);
  }
}

export class PostOnlyOrderCreator extends LimitOrderCreator { }

export class FOKOrderCreator extends LimitOrderCreator { }
export class IOCOrderCreator extends LimitOrderCreator { }

export class StopLimitOrderCreator extends LimitOrderCreator {
  create(values: OrderEntity, config: ValuesDepConfig): OrderEntity {
    const order = {
      ...this.baseOrder(values),
      order_price: values.order_price,
      trigger_price: values.trigger_price,
      algo_type: "STOP",
      type: "LIMIT",
      quantity: values["order_quantity"],
      price: values["order_price"],
      trigger_price_type: "MARK_PRICE",
    };
    this.fixOrderQuantity(order, config);
    delete order["order_quantity"];
    delete order["order_price"];
    // @ts-ignore
    delete order["isStopOrder"];

    return order;
  }
  validate(
    values: OrderFormEntity,
    config: ValuesDepConfig
  ): Promise<VerifyResult> {
    return this.baseValidate(values, config).then((errors) => {
      // const errors = this.baseValidate(values, config);
      // @ts-ignore
      const { order_price, trigger_price, side } = values;

      if (!order_price) {
        errors.order_price = {
          type: "required",
          message: "price is required",
        };
      }
      
      if (!trigger_price) {
        errors.trigger_price = {
          type: "required",
          message: "Trigger price is required",
        };
      } 
      
      if (trigger_price && order_price) {
        const price = new Decimal(order_price);
        const { symbol } = config;
        const { price_range, price_scope } = symbol;
        const maxPriceNumber = maxPrice(trigger_price, price_range);
        const minPriceNumber = minPrice(trigger_price, price_range);
        const scropePriceNumbere = scropePrice(
          trigger_price,
          price_scope,
          side
        );

        const priceRange = side === "BUY" ? {
          min: scropePriceNumbere,
          max: maxPriceNumber,
        } : {
          min: minPriceNumber,
          max: scropePriceNumbere
        };

        /// if side is 'buy', only check max price,
        /// if side is 'sell', only check min price,
        if (price.gt(priceRange.max)) {
          errors.order_price = {
            type: "max",
            message: `Price must be less than ${new Decimal(
              priceRange.max
            ).todp(symbol.quote_dp)}`,
          };
        }
        if (price.lt(priceRange.min)) {
          errors.order_price = {
            type: "min",
            message: `Price must be greater than ${new Decimal(
              priceRange.min
            ).todp(symbol.quote_dp)}`,
          };
        }
      }

      return errors;
    });
  }
}
export class StopMarketOrderCreator extends LimitOrderCreator {
  create(values: OrderEntity, _: ValuesDepConfig): OrderEntity {
    const result = {
      ...this.baseOrder(values),
      order_price: values.order_price,
      trigger_price: values.trigger_price,
      algo_type: "STOP",
      type: "MARKET",
      quantity: values["order_quantity"],
      price: values["order_price"],
      trigger_price_type: "MARK_PRICE",
    };
    delete result["order_quantity"];
    delete result["order_price"];
    // @ts-ignore
    delete result["isStopOrder"];

    console.log("result is", result);
    return result;
  }
  validate(
    values: OrderFormEntity,
    config: ValuesDepConfig
  ): Promise<VerifyResult> {
    return this.baseValidate(values, config).then((errors) => {
      // const errors = this.baseValidate(values, config);
      // @ts-ignore
      const { order_price, trigger_price, side } = values;

      if (!trigger_price) {
        errors.trigger_price = {
          type: "required",
          message: "Trigger price is required",
        };
      }

      return errors;
    });
  }
}

export class GeneralOrderCreator extends BaseOrderCreator {
  create(data: OrderEntity): OrderEntity {
    return {
      ...this.baseOrder(data),
      order_price: data.order_price,
      order_quantity: data.order_quantity,
    };
  }
  validate(
    values: OrderFormEntity,
    configs: ValuesDepConfig
  ): Promise<VerifyResult> {
    return super.baseValidate(values, configs);
  }
}

export const availableOrderTypes = [
  OrderType.LIMIT,
  OrderType.MARKET,
  OrderType.IOC,
  OrderType.FOK,
  OrderType.POST_ONLY,
  OrderType.STOP_LIMIT,
  OrderType.STOP_MARKET,
];

export class OrderFactory {
  static create(type: OrderType): OrderCreator | null {
    switch (type) {
      case OrderType.LIMIT:
        return new LimitOrderCreator();
      case OrderType.MARKET:
        return new MarketOrderCreator();
      //   case OrderType.ASK:
      //     return new AskOrderCreator();
      //   case OrderType.BID:
      //     return new BidOrderCreator();
      case OrderType.IOC:
        return new IOCOrderCreator();
      case OrderType.FOK:
        return new FOKOrderCreator();
      case OrderType.POST_ONLY:
        return new PostOnlyOrderCreator();

      case OrderType.STOP_LIMIT:
        return new StopLimitOrderCreator();
      case OrderType.STOP_MARKET:
        return new StopMarketOrderCreator();

      default:
        return new GeneralOrderCreator();
    }
  }
}
