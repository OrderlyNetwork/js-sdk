export interface OrderPayload {
  symbol: string;
  order_type: string;
  order_price?: number;
  order_quantity?: number;
  order_amount?: number;
  visible_quantity?: number;
  reduce_only: boolean;
  side: string;
  broker_id?: string;
}

export enum OrderType {
  LIMIT = "LIMIT",
  MARKET = "MARKET",
  IOC = "IOC",
  FOK = "FOK",
  POST_ONLY = "POST_ONLY",
  ASK = "ASK",
  BID = "BID",
}

export interface OrderCreator {
  create: (values: OrderPayload) => OrderPayload;
}

export abstract class BaseOrderCreator implements OrderCreator {
  abstract create(values: OrderPayload): OrderPayload;

  baseOrder(data: OrderPayload): OrderPayload {
    return {
      symbol: data.symbol,
      order_type: data.order_type,
      side: data.side,
      reduce_only: data.reduce_only,
    };
  }
}

export class LimitOrderCreator extends BaseOrderCreator {
  create(values: OrderPayload): OrderPayload {
    return {
      ...this.baseOrder(values),
    };
  }
}

export class MarketOrderCreator extends BaseOrderCreator {
  create(values: OrderPayload): OrderPayload {
    return {
      ...this.baseOrder(values),
    };
  }
}
export class GeneralOrderCreator extends BaseOrderCreator {
  create(data: OrderPayload): OrderPayload {
    return {
      ...this.baseOrder(data),
      order_price: data.order_price,
      order_quantity: data.order_quantity,
    };
  }
}

export class OrderFactory {
  static createOrder(type: OrderType): OrderCreator | null {
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
