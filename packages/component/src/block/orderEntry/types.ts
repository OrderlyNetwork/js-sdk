export enum OrderType {
  Limit = "limit",
  Market = "market",
}

export enum OrderSide {
  Buy = "buy",
  Sell = "sell",
}

export type OrderValue = {
  price: string;
  qty: string;
  type: OrderType;
  side: OrderSide;
};
