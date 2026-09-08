import { AlgoOrderRootType, API, OrderType } from "@orderly.network/types";
import { getTPSLLeg } from "@orderly.network/utils";

export type TPSLEditableOrderValues = {
  quantity: number | string;
  tp_trigger_price: number | string;
  tp_order_type: OrderType;
  tp_order_price: number | string;
  sl_trigger_price: number | string;
  sl_order_type: OrderType;
  sl_order_price: number | string;
};

const editableKeys = [
  "quantity",
  "tp_trigger_price",
  "tp_order_type",
  "tp_order_price",
  "sl_trigger_price",
  "sl_order_type",
  "sl_order_price",
] as const satisfies readonly (keyof TPSLEditableOrderValues)[];

export function getTPSLEditableOrderValues(
  order: API.AlgoOrder,
): TPSLEditableOrderValues {
  const tpOrder = getTPSLLeg(order, "tp");
  const slOrder = getTPSLLeg(order, "sl");

  return {
    quantity:
      order.algo_type === AlgoOrderRootType.POSITIONAL_TP_SL
        ? 0
        : (order.quantity ?? ""),
    tp_trigger_price: tpOrder?.trigger_price?.toString() ?? "",
    tp_order_type:
      tpOrder?.type === OrderType.LIMIT ? OrderType.LIMIT : OrderType.MARKET,
    tp_order_price:
      tpOrder?.type === OrderType.LIMIT
        ? (tpOrder.price?.toString() ?? "")
        : "",
    sl_trigger_price: slOrder?.trigger_price?.toString() ?? "",
    sl_order_type:
      slOrder?.type === OrderType.LIMIT ? OrderType.LIMIT : OrderType.MARKET,
    sl_order_price:
      slOrder?.type === OrderType.LIMIT
        ? (slOrder.price?.toString() ?? "")
        : "",
  };
}

export function getChangedTPSLEditableOrderValues(
  previous: TPSLEditableOrderValues,
  next: TPSLEditableOrderValues,
): Partial<TPSLEditableOrderValues> {
  return editableKeys.reduce<Partial<TPSLEditableOrderValues>>(
    (changes, key) => {
      if (!Object.is(previous[key], next[key])) {
        Object.assign(changes, { [key]: next[key] });
      }
      return changes;
    },
    {},
  );
}
