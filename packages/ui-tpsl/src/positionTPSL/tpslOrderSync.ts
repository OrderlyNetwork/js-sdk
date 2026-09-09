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

type TPSLLeg = "tp" | "sl";

const getOrderType = (child?: API.AlgoOrder): OrderType | undefined => {
  if (!child) return undefined;
  return child.type === OrderType.LIMIT ? OrderType.LIMIT : OrderType.MARKET;
};

const isActiveLeg = (child?: API.AlgoOrder) =>
  !!child &&
  child.is_activated !== false &&
  Number.isFinite(Number(child.trigger_price)) &&
  Number(child.trigger_price) > 0;

/** Use the execution type configured on this server-owned child. */
export function getTPSLEditOrderType(
  order: API.AlgoOrder | undefined,
  leg: TPSLLeg,
): OrderType {
  if (!order) return OrderType.MARKET;
  return getOrderType(getTPSLLeg(order, leg)) ?? OrderType.MARKET;
}

/** Order types cannot be changed while editing an existing TP/SL order. */
export function isTPSLOrderTypeLocked(
  order: API.AlgoOrder | undefined,
  _leg: TPSLLeg,
): boolean {
  return !!order;
}

export function getTPSLEditableOrderValues(
  order: API.AlgoOrder,
): TPSLEditableOrderValues {
  const tpOrder = getTPSLLeg(order, "tp");
  const slOrder = getTPSLLeg(order, "sl");
  const tpOrderType = getTPSLEditOrderType(order, "tp");
  const slOrderType = getTPSLEditOrderType(order, "sl");

  return {
    quantity:
      order.algo_type === AlgoOrderRootType.POSITIONAL_TP_SL
        ? 0
        : (order.quantity ?? ""),
    tp_trigger_price: isActiveLeg(tpOrder)
      ? tpOrder!.trigger_price!.toString()
      : "",
    tp_order_type: tpOrderType,
    tp_order_price:
      tpOrderType === OrderType.LIMIT && isActiveLeg(tpOrder)
        ? (tpOrder?.price?.toString() ?? "")
        : "",
    sl_trigger_price: isActiveLeg(slOrder)
      ? slOrder!.trigger_price!.toString()
      : "",
    sl_order_type: slOrderType,
    sl_order_price:
      slOrderType === OrderType.LIMIT && isActiveLeg(slOrder)
        ? (slOrder?.price?.toString() ?? "")
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
