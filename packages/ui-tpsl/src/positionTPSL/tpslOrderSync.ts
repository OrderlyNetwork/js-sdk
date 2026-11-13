import { AlgoOrderRootType, API, OrderType } from "@orderly.network/types";
import {
  canChangeTPSLOrderType,
  getTPSLLeg,
  isActiveTPSLLeg,
} from "@orderly.network/utils";

export type TPSLEditableOrderValues = {
  quantity: number | string;
  tp_trigger_price: string;
  tp_order_type: OrderType;
  tp_order_price: string;
  sl_trigger_price: string;
  sl_order_type: OrderType;
  sl_order_price: string;
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

/** Use the execution type configured on this server-owned child. */
export function getTPSLEditOrderType(
  order: API.AlgoOrder | undefined,
  leg: TPSLLeg,
): OrderType {
  const child = order && getTPSLLeg(order, leg);
  return child?.type === OrderType.LIMIT ? OrderType.LIMIT : OrderType.MARKET;
}

/** Keep the UI consistent with the SDK's parent and child activation policy. */
export function isTPSLOrderTypeLocked(
  order: API.AlgoOrder | undefined,
  leg: TPSLLeg,
  ancestor?: API.AlgoOrder,
): boolean {
  if (!order) return false;
  const child = getTPSLLeg(order, leg);
  return !canChangeTPSLOrderType(order, child, ancestor);
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
    tp_trigger_price: isActiveTPSLLeg(tpOrder)
      ? tpOrder!.trigger_price!.toString()
      : "",
    tp_order_type: tpOrderType,
    tp_order_price:
      tpOrderType === OrderType.LIMIT && isActiveTPSLLeg(tpOrder)
        ? (tpOrder?.price?.toString() ?? "")
        : "",
    sl_trigger_price: isActiveTPSLLeg(slOrder)
      ? slOrder!.trigger_price!.toString()
      : "",
    sl_order_type: slOrderType,
    sl_order_price:
      slOrderType === OrderType.LIMIT && isActiveTPSLLeg(slOrder)
        ? (slOrder?.price?.toString() ?? "")
        : "",
  };
}

/** Keep a local price draft when the same field changes in the order stream. */
export function getTPSLPriceSyncChanges<
  T extends Partial<TPSLEditableOrderValues>,
>(
  previous: T,
  next: T,
  draft: Partial<
    Record<keyof TPSLEditableOrderValues, string | number>
  > = previous,
  lockedTriggers: Partial<Record<TPSLLeg, string | number>> = {},
): Partial<T> {
  const changes: Partial<T> = {};
  for (const key of editableKeys) {
    if (!(key in next)) continue;
    const previousValue = previous[key];
    const nextValue = next[key];
    const leg = key.startsWith("tp_") ? "tp" : "sl";
    const lockTrigger =
      key.endsWith("_trigger_price") && lockedTriggers[leg] !== undefined;
    const executionTypeChanged =
      key.endsWith("_order_price") &&
      previous[`${leg}_order_type`] !== next[`${leg}_order_type`];
    const hasPriceDraft =
      key.endsWith("_price") &&
      String(draft[key] ?? "") !== String(previousValue ?? "");
    const shouldSync =
      lockTrigger ||
      executionTypeChanged ||
      (!hasPriceDraft && previousValue !== nextValue);
    if (shouldSync && String(draft[key] ?? "") !== String(nextValue ?? "")) {
      Object.assign(changes, { [key]: nextValue });
    }
  }
  return changes;
}
