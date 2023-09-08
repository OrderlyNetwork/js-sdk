import { OrderType, type API, OrderEntity } from "@orderly.network/types";
import { Decimal } from "@orderly.network/utils";
import { order } from "@orderly.network/futures";

export type VerifyResult = {
  [P in keyof OrderEntity]?: { type: string; message: string };
};
export type OrderFormEntity = Pick<
  OrderEntity,
  "order_price" | "order_quantity" | "total"
>;

type ValuesDepConfig = {
  token: API.TokenInfo;
  symbol: API.SymbolExt;
  maxQty: number;
  markPrice: number;
};

export interface OrderCreator {
  create: (values: OrderEntity) => OrderEntity;
  validate: (
    values: OrderFormEntity,
    configs: ValuesDepConfig
  ) => Promise<VerifyResult>;
}

const { maxPrice, minPrice } = order;

export abstract class BaseOrderCreator implements OrderCreator {
  abstract create(values: OrderEntity): OrderEntity;
  abstract validate(
    values: OrderFormEntity,
    config: ValuesDepConfig
  ): Promise<VerifyResult>;

  baseOrder(data: OrderEntity): OrderEntity {
    const order: any = {
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
    };

    if (data.visible_quantity === 0) {
      order.visible_quantity = data.visible_quantity;
    }

    return order;
  }

  baseValidate(
    values: OrderFormEntity,
    configs: ValuesDepConfig
  ): Promise<VerifyResult> {
    const errors: {
      [P in keyof OrderEntity]?: { type: string; message: string };
    } = {};

    const { maxQty } = configs;

    // console.log("=======>>>>> baseValidate", values, configs);
    const { order_quantity, total } = values;

    if (!order_quantity) {
      errors.order_quantity = {
        type: "required",
        message: "quantity is required",
      };
    } else {
      //// 需要用MaxQty+base_max, base_min来判断
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
          message: `Quantity should be greater or equal than ${new Decimal(
            quote_min
          ).todp(quote_dp)}`,
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
}

export class LimitOrderCreator extends BaseOrderCreator {
  create(values: OrderEntity): OrderEntity {
    return {
      ...this.baseOrder(values),
      order_price: values.order_price,
    };
  }
  validate(
    values: OrderFormEntity,
    config: ValuesDepConfig
  ): Promise<VerifyResult> {
    return this.baseValidate(values, config).then((errors) => {
      // const errors = this.baseValidate(values, config);

      const { order_price } = values;

      if (!order_price) {
        errors.order_price = {
          type: "required",
          message: "price is required",
        };
      } else {
        const price = new Decimal(order_price);
        const { symbol } = config;
        const { price_range } = symbol;
        const maxPriceNumber = maxPrice(config.markPrice, price_range);
        const minPriceNumber = minPrice(config.markPrice, price_range);

        if (price.lt(minPriceNumber)) {
          errors.order_price = {
            type: "min",
            message: `price must be greater than ${minPriceNumber}`,
          };
        } else if (price.gt(maxPriceNumber)) {
          errors.order_price = {
            type: "max",
            message: `price must be less than ${maxPriceNumber}`,
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

export class PostOnlyOrderCreator extends LimitOrderCreator {}

export class FOKOrderCreator extends LimitOrderCreator {}
export class IOCOrderCreator extends LimitOrderCreator {}

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

      default:
        return new GeneralOrderCreator();
    }
  }
}
