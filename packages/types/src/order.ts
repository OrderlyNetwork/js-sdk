export enum OrderType {
  LIMIT = "LIMIT",
  MARKET = "MARKET",
  IOC = "IOC",
  FOK = "FOK",
  POST_ONLY = "POST_ONLY",
  ASK = "ASK",
  BID = "BID",
}

export enum OrderSide {
  BUY = "BUY",
  SELL = "SELL",
}

export interface OrderEntity {
  symbol?: string;
  order_type: OrderType;
  order_price?: number;
  order_quantity?: number;
  order_amount?: number;
  // 是否显示在orderbook, 默认=order_quantity, =0时不显示,
  visible_quantity?: number;
  reduce_only?: boolean;
  side: OrderSide;
  broker_id?: string;

  // internal fields
  total?: number;
  // hideInOrderbook?: boolean;
}
