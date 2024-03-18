import { API, AlgoOrderEntry, OrderEntity } from "@orderly.network/types";

export type VerifyResult = {
  [P in keyof OrderEntity]?: { type: string; message: string };
};
export type OrderFormEntity = Pick<
  OrderEntity,
  "order_price" | "order_quantity" | "total"
>;

export type ValuesDepConfig = {
  // token: API.TokenInfo;
  symbol: API.SymbolExt;
  maxQty: number;
  markPrice: number;
};

export interface OrderCreator<T> {
  create: (values: T, configs?: ValuesDepConfig) => T;
  validate: (
    values: OrderFormEntity,
    configs: ValuesDepConfig
  ) => Promise<VerifyResult>;
}
