import { OrderType, type API, OrderEntity } from "@orderly/types";

export type VerifyResult =
  | { [P in keyof OrderEntity]?: string }
  | null
  | undefined;

type ValuesDepConfig = {
  token: API.TokenInfo;
  symbol: API.SymbolExt;
  maxQty: number;
};

export interface OrderCreator {
  create: (values: OrderEntity) => OrderEntity;
  validate: (
    values: OrderEntity,
    configs: ValuesDepConfig,
    verifyAll?: boolean
  ) => VerifyResult;
}

export abstract class BaseOrderCreator implements OrderCreator {
  abstract create(values: OrderEntity): OrderEntity;
  abstract validate(
    values: OrderEntity,
    config: ValuesDepConfig,
    verifyAll?: boolean
  ): VerifyResult;

  baseOrder(data: OrderEntity): OrderEntity {
    const order: any = {
      // symbol: data.symbol,
      order_type: data.order_type,
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
    values: OrderEntity,
    configs: ValuesDepConfig,
    verifyAll?: boolean
  ): VerifyResult {
    const errors: { [P in keyof OrderEntity]?: string } = {};
    const baseTick = configs.symbol.base_tick;

    console.log("baseValidate", values, configs, verifyAll, baseTick);
    const { order_quantity } = values;

    if (verifyAll) {
      if (!order_quantity) {
        errors.order_quantity = "quantity is required";
      }
    }

    return errors;
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
    values: OrderEntity,
    config: ValuesDepConfig,
    verifyAll?: boolean
  ): VerifyResult {
    const errors = this.baseValidate(values, config, verifyAll);
    return null;
  }
}

export class MarketOrderCreator extends BaseOrderCreator {
  create(values: OrderEntity): OrderEntity {
    return {
      ...this.baseOrder(values),
    };
  }
  validate(
    values: OrderEntity,
    configs: ValuesDepConfig,
    verifyAll?: boolean
  ): VerifyResult {
    return super.baseValidate(values, configs, verifyAll);
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
    values: OrderEntity,
    configs: ValuesDepConfig,
    verifyAll?: boolean
  ): VerifyResult {
    return super.baseValidate(values, configs, verifyAll);
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
      //   case OrderType.IOC:
      //     return new IOCOrderCreator();
      //   case OrderType.FOK:
      //     return new FOKOrderCreator();
      //   case OrderType.POST_ONLY:
      //     return new PostOnlyOrderCreator();

      default:
        return new GeneralOrderCreator();
    }
  }
}
