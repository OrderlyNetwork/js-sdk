export enum OrderType {
  LIMIT = "LIMIT",
  MARKET = "MARKET",
  IOC = "IOC",
  FOK = "FOK",
  POST_ONLY = "POST_ONLY",
  ASK = "ASK",
  BID = "BID",
  STOP_LIMIT="STOP_LIMIT",
  STOP_MARKET="STOP_MARKET",
}

export enum OrderSide {
  BUY = "BUY",
  SELL = "SELL",
}

export enum OrderStatus {
  OPEN = "OPEN",
  NEW = "NEW",
  FILLED = "FILLED",
  PARTIAL_FILLED = "PARTIAL_FILLED",
  CANCELLED = "CANCELLED",
  REPLACED = "REPLACED",
  // CANCELLED + FILLED
  COMPLETED = "COMPLETED",
  //  NEW + PARTIAL_FILLED
  INCOMPLETE = "INCOMPLETE",
  REJECTED = "REJECTED",
}

export interface OrderEntity {
  symbol?: string;
  order_type: OrderType;
  order_type_ext?: OrderType;
  order_price?: string | number;
  order_quantity?: string | number;
  order_amount?: number;
  // 是否显示在orderbook, 默认=order_quantity, =0时不显示,
  visible_quantity?: number;
  reduce_only?: boolean;
  side: OrderSide;
  broker_id?: string;

  // internal fields
  total?: string | number;
  // hideInOrderbook?: boolean;
  isStopOrder?: boolean;
  trigger_price?: string | number,
}
