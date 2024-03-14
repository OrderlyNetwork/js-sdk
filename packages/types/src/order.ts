/**
 * Supported types for placing an order
 */
export enum OrderType {
  LIMIT = "LIMIT",
  MARKET = "MARKET",
  IOC = "IOC",
  FOK = "FOK",
  POST_ONLY = "POST_ONLY",
  ASK = "ASK",
  BID = "BID",
  STOP_LIMIT = "STOP_LIMIT",
  STOP_MARKET = "STOP_MARKET",
  /**
   * Only for POSITIONAL_TP_SL type algo order
   */
  CLOSE_POSITION = "CLOSE_POSITION",
}

export enum AlogRootOrderType {
  TP_SL = "TP_SL",
  POSITIONAL_TP_SL = "POSITIONAL_TP_SL",
  STOP = "STOP",
}

export enum TriggerPriceType {
  MARK_PRICE = "MARK_PRICE",
}

export enum AlgoOrderType {
  TAKE_PROFIT = "TAKE_PROFIT",
  STOP_LOSS = "STOP_LOSS",
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

// export interface OrderEntity {}

export interface OrderEntity {
  symbol: string;
  order_type: OrderType;
  algo_type?: AlogRootOrderType;
  order_type_ext?: OrderType;
  order_price?: string | number;
  order_quantity?: string | number;
  order_amount?: number;
  // Whether to display in the orderbook, default=order_quantity, not displayed when =0,
  visible_quantity?: number;
  reduce_only?: boolean;
  side: OrderSide;
  broker_id?: string;

  // internal fields
  total?: string | number;
  // hideInOrderbook?: boolean;
  isStopOrder?: boolean;
  trigger_price?: string | number;
}

export interface AlgoOrderEntry {
  algo_type: AlogRootOrderType;
  // child_orders?: (Partial<AlgoOrderEntry> & {
  //   order_type: AlgoOrderType;
  // })[];
  client_order_id?: string;
  order_tag?: string;
  price?: number | string;
  quantity: number | string;
  reduce_only?: boolean;
  side: OrderSide;
  symbol: string;
  trigger_price: number | string;
  trigger_price_type: TriggerPriceType;
  type: OrderType;
  visible_quantity?: number | string;
  tp_trigger_price?: string |number;
  sl_trigger_price?: string | number;
}

export type AlgoOrderEntryExt = AlgoOrderEntry & {
  // internal fields
};
