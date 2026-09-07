import { API, OrderType } from "@orderly.network/types";
import { isPositionalTPSL } from "@orderly.network/utils";
import { AlgoOrderUpdateEntity } from "./baseAlgoCreator";

/** Build minimal updates; the server owns the execution type of existing legs. */
export function createTPSLOrderUpdates(
  children: Array<{
    algo_type: string;
    type: OrderType;
    is_activated?: boolean;
    trigger_price?: number;
    price?: number;
  }>,
  oldValue: API.AlgoOrder,
  quantity?: number | string,
  // Some creators omit inactive legs, so explicit clears must be carried separately.
  explicitlyDeactivatedTypes: readonly string[] = [],
): AlgoOrderUpdateEntity[] {
  return (oldValue.child_orders ?? []).flatMap((oldOrder) => {
    const next = children.find(
      (child) => child.algo_type === oldOrder.algo_type,
    );
    const quantityChanged =
      !isPositionalTPSL(oldValue) &&
      quantity != null &&
      Number(quantity) !== Number(oldValue.quantity);
    if (!next && !explicitlyDeactivatedTypes.includes(oldOrder.algo_type)) {
      return quantityChanged && oldOrder.is_activated !== false
        ? [
            {
              order_id: Number(oldOrder.algo_order_id),
              quantity: Number(quantity),
            },
          ]
        : [];
    }
    const update: AlgoOrderUpdateEntity = {
      order_id: Number(oldOrder.algo_order_id),
    };
    if (!next?.is_activated) {
      if (oldOrder.is_activated !== false) update.is_activated = false;
    } else {
      if (
        (oldOrder.type === OrderType.LIMIT) !==
        (next.type === OrderType.LIMIT)
      ) {
        throw new Error(
          "Changing an existing TP/SL order type is not supported",
        );
      }
      // The backend automatically activates an inactive child when its trigger price is updated.
      // Do not send is_activated: true here.
      if (Number(oldOrder.trigger_price) !== Number(next.trigger_price))
        update.trigger_price = next.trigger_price;
      if (
        next.type === OrderType.LIMIT &&
        Number(oldOrder.price) !== Number(next.price)
      )
        update.price = next.price;
      if (quantityChanged) update.quantity = Number(quantity);
    }
    return Object.keys(update).length > 1 ? [update] : [];
  });
}

export type TPSLChildUpdate = {
  order_id?: number;
  trigger_price?: number | string;
  price?: number | string;
  quantity?: number | string;
  is_activated?: boolean;
  type?: OrderType;
  child_orders?: TPSLChildUpdate[];
};

/** Guard the low-level SDK update entry point, including nested Bracket parents. */
export function sanitizeTPSLChildUpdates(
  updates: TPSLChildUpdate[],
  parent?: API.AlgoOrder,
): any[] {
  return updates.flatMap((input) => {
    const old = parent?.child_orders?.find(
      (child) => Number(child.algo_order_id) === Number(input.order_id),
    );
    if (input.is_activated === false) {
      return old?.is_activated === false
        ? []
        : [{ order_id: input.order_id, is_activated: false }];
    }
    if (input.type != null && (!old || input.type !== old.type)) {
      throw new Error("Changing an existing TP/SL order type is not supported");
    }
    const update: any = { order_id: input.order_id };
    if (input.child_orders) {
      const children = sanitizeTPSLChildUpdates(input.child_orders, old);
      if (children.length) update.child_orders = children;
    }
    for (const key of ["trigger_price", "price", "is_activated"] as const) {
      const value = input[key];
      if (
        value == null ||
        (old &&
          (key === "is_activated"
            ? value === old[key]
            : Number(value) === Number(old[key])))
      )
        continue;
      if (key === "price") {
        if (old && old.type !== OrderType.LIMIT) continue;
        if (!Number.isFinite(Number(value)) || Number(value) <= 0) {
          throw new Error("A TP/SL limit price must be positive and finite");
        }
      }
      update[key] = value;
    }
    if (
      input.quantity != null &&
      (!parent || !isPositionalTPSL(parent)) &&
      (!old || !isPositionalTPSL(old))
    ) {
      if (!old || Number(input.quantity) !== Number(old.quantity))
        update.quantity = input.quantity;
    }
    return Object.keys(update).length > 1 ? [update] : [];
  });
}
