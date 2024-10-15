import {
  API,
  OrderEntity,
  OrderType,
  OrderlyOrder,
  AlgoOrderRootType,
} from "@orderly.network/types";

export type VerifyResult = {
  [P in keyof OrderlyOrder]?: { type: string; message: string };
};

export type OrderFormEntity = Pick<
  OrderlyOrder,
  "order_price" | "order_quantity" | "total" | "reduce_only"
>;

export type ValuesDepConfig = {
  // token: API.TokenInfo;
  symbol: API.SymbolExt;
  maxQty: number;
  markPrice: number;
};

export interface OrderCreator<T> {
  create: (values: T, configs: ValuesDepConfig) => T;
  validate: (
    values: T,
    configs: ValuesDepConfig
  ) => Promise<{
    [P in keyof T]?: { type: string; message: string };
  }>;

  get type(): OrderType;
}
