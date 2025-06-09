import { API, OrderType, OrderlyOrder } from "@orderly.network/types";

export type OrderValidationItem =
  | {
      type: "required";
      message: string;
      value?: never;
    }
  | {
      type: "max" | "min";
      message: string;
      value: number | string;
    };

export type OrderValidationResult = {
  [P in keyof OrderlyOrder]?: OrderValidationItem;
};

export type OrderFormEntity = Pick<
  OrderlyOrder,
  "order_price" | "order_quantity" | "total" | "reduce_only" | "slippage"
>;

export type ValuesDepConfig = {
  // token: API.TokenInfo;
  symbol: API.SymbolExt;
  maxQty: number;
  markPrice: number;
  estSlippage?: number | null;
};

export interface OrderCreator<T> {
  create: (values: T, configs: ValuesDepConfig) => T;
  validate: (
    values: T,
    configs: ValuesDepConfig,
  ) => Promise<{
    [P in keyof T]?: OrderValidationItem;
  }>;

  get type(): OrderType;
}
