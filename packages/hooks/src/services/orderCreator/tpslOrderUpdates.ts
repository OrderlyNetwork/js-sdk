import { API, OrderType } from "@orderly.network/types";
import {
  canChangeTPSLOrderType,
  isConfiguredPendingTPSLLeg,
  isPositionalTPSL,
} from "@orderly.network/utils";
import { AlgoOrderUpdateEntity } from "./baseAlgoCreator";

type TPSLChildInput = {
  algo_type: string;
  type: OrderType;
  is_activated?: boolean;
  trigger_price?: number | string;
  price?: number | string;
};

const isLimit = (type?: OrderType) => type === OrderType.LIMIT;

const isTPSLExecutionType = (type?: OrderType) =>
  type === OrderType.LIMIT ||
  type === OrderType.MARKET ||
  type === OrderType.CLOSE_POSITION;

export const normalizeTPSLChildType = (
  type: OrderType | undefined,
  fullPosition: boolean,
): OrderType | undefined => {
  if (!isTPSLExecutionType(type)) return undefined;
  if (type === OrderType.LIMIT) return OrderType.LIMIT;
  return fullPosition ? OrderType.CLOSE_POSITION : OrderType.MARKET;
};

const hasOrderTypeChanged = (oldType?: OrderType, nextType?: OrderType) =>
  isLimit(oldType) !== isLimit(nextType);

const assertLimitPrice = (price?: number | string) => {
  if (!Number.isFinite(Number(price)) || Number(price) <= 0) {
    throw new Error("A TP/SL limit price must be positive and finite");
  }
};

const assertTypeChange = (
  parent: API.AlgoOrder,
  child: API.AlgoOrder,
  triggerPrice?: number | string,
  ancestor?: API.AlgoOrder,
) => {
  if (!canChangeTPSLOrderType(parent, child, ancestor)) {
    throw new Error("Changing an existing TP/SL order type is not supported");
  }
  const nextTriggerPrice = Number(triggerPrice);
  if (
    triggerPrice == null ||
    !Number.isFinite(nextTriggerPrice) ||
    nextTriggerPrice <= 0 ||
    nextTriggerPrice === Number(child.trigger_price)
  ) {
    throw new Error(
      "Changing a TP/SL order type requires a different positive finite trigger price",
    );
  }
};

/** Build minimal updates, allowing an inactive leg to change execution type. */
export function createTPSLOrderUpdates(
  children: TPSLChildInput[],
  oldValue: API.AlgoOrder,
  quantity?: number | string,
  explicitlyDeactivatedTypes: readonly string[] = [],
  ancestor?: API.AlgoOrder,
): AlgoOrderUpdateEntity[] {
  const oldChildren = oldValue.child_orders ?? [];
  const quantityChanged =
    !isPositionalTPSL(oldValue) &&
    quantity != null &&
    Number(quantity) !== Number(oldValue.quantity);

  const missingActiveChild = children.find(
    (next) =>
      next.is_activated !== false &&
      !oldChildren.some((oldOrder) => oldOrder.algo_type === next.algo_type),
  );
  if (missingActiveChild) {
    throw new Error("Cannot add a missing TP/SL child while editing");
  }

  return oldChildren.flatMap<AlgoOrderUpdateEntity>((oldOrder) => {
    const configuredPendingLeg = isConfiguredPendingTPSLLeg(
      oldValue,
      oldOrder,
      ancestor,
    );
    const wasConfigured =
      oldOrder.is_activated !== false || configuredPendingLeg;
    const next = children.find(
      (child) => child.algo_type === oldOrder.algo_type,
    );
    if (!next) {
      if (
        explicitlyDeactivatedTypes.includes(oldOrder.algo_type) &&
        wasConfigured
      ) {
        return [
          {
            order_id: Number(oldOrder.algo_order_id),
            is_activated: false,
          },
        ];
      }
      return quantityChanged && wasConfigured
        ? [
            {
              order_id: Number(oldOrder.algo_order_id),
              quantity: Number(quantity),
            },
          ]
        : [];
    }

    const nextIsActive = next.is_activated !== false;
    if (nextIsActive) {
      const triggerPrice = Number(next.trigger_price);
      if (!Number.isFinite(triggerPrice) || triggerPrice <= 0) {
        throw new Error("A TP/SL trigger price must be positive and finite");
      }
    } else {
      return wasConfigured
        ? [{ order_id: Number(oldOrder.algo_order_id), is_activated: false }]
        : [];
    }

    const orderId = Number(oldOrder.algo_order_id);
    if (!Number.isFinite(orderId)) {
      throw new Error("An existing TP/SL child requires an order id");
    }
    const nextType = normalizeTPSLChildType(
      next.type,
      isPositionalTPSL(oldValue),
    );
    if (!nextType) {
      throw new Error("A TP/SL order type must be LIMIT or MARKET");
    }
    const typeChanged = hasOrderTypeChanged(oldOrder.type, nextType);
    if (typeChanged) {
      assertTypeChange(oldValue, oldOrder, next.trigger_price, ancestor);
    }

    const update: AlgoOrderUpdateEntity = { order_id: orderId };
    if (typeChanged) update.order_type = nextType;
    const nextTriggerPrice = Number(next.trigger_price);
    if (
      (oldOrder.is_activated === false && !configuredPendingLeg) ||
      Number(oldOrder.trigger_price) !== nextTriggerPrice
    ) {
      update.trigger_price = nextTriggerPrice;
    }
    if (
      isLimit(nextType) &&
      (typeChanged || Number(oldOrder.price) !== Number(next.price))
    ) {
      assertLimitPrice(next.price);
      update.price = Number(next.price);
    }
    if (quantityChanged) update.quantity = Number(quantity);
    return Object.keys(update).length > 1 ? [update] : [];
  });
}

export type TPSLChildUpdate = {
  order_id: number;
  type?: OrderType;
  trigger_price?: number | string;
  price?: number | string;
  quantity?: number | string;
  is_activated?: boolean;
  child_orders?: TPSLChildUpdate[];
};

/** Guard the low-level SDK update entry point, including nested Bracket parents. */
export function sanitizeTPSLChildUpdates(
  updates: TPSLChildUpdate[],
  parent?: API.AlgoOrder,
  ancestor?: API.AlgoOrder,
): any[] {
  return updates.flatMap<any>((input) => {
    if (input.order_id == null) {
      throw new Error("A TP/SL child order id is required for editing");
    }
    if (!parent) {
      throw new Error("A parent TP/SL order is required for child updates");
    }

    const old = parent.child_orders?.find(
      (child) => Number(child.algo_order_id) === Number(input.order_id),
    );
    if (!old) {
      throw new Error("The TP/SL child order id is invalid");
    }
    const configuredPendingLeg = isConfiguredPendingTPSLLeg(
      parent,
      old,
      ancestor,
    );
    if (input.is_activated === false) {
      return old.is_activated === false && !configuredPendingLeg
        ? []
        : [{ order_id: input.order_id, is_activated: false }];
    }

    const update: AlgoOrderUpdateEntity = {
      order_id: input.order_id,
    };
    if (input.child_orders) {
      const children = sanitizeTPSLChildUpdates(
        input.child_orders,
        old,
        parent,
      );
      if (children.length) (update as any).child_orders = children;
    }
    const hasType = input.type != null;
    const nextType = hasType
      ? normalizeTPSLChildType(
          input.type,
          isPositionalTPSL(parent) || isPositionalTPSL(old),
        )
      : undefined;
    const typeChanged = hasType && hasOrderTypeChanged(old.type, nextType);
    if (hasType) {
      if (!nextType) {
        throw new Error("A TP/SL order type must be LIMIT or MARKET");
      }
      if (!["TAKE_PROFIT", "STOP_LOSS"].includes(old.algo_type)) {
        throw new Error(
          "Changing an existing TP/SL order type is not supported",
        );
      }
      if (typeChanged) {
        assertTypeChange(parent, old, input.trigger_price, ancestor);
        update.order_type = nextType;
      }
    }
    if (input.trigger_price != null) {
      const triggerPrice = Number(input.trigger_price);
      if (!Number.isFinite(triggerPrice) || triggerPrice <= 0) {
        throw new Error("A TP/SL trigger price must be positive and finite");
      }
      if (
        (old.is_activated === false && !configuredPendingLeg) ||
        Number(old.trigger_price) !== triggerPrice
      ) {
        update.trigger_price = triggerPrice;
      }
    }
    const effectiveType = hasType ? nextType : old.type;
    if (isLimit(effectiveType) && (input.price != null || typeChanged)) {
      assertLimitPrice(input.price);
      if (typeChanged || Number(old.price) !== Number(input.price)) {
        update.price = Number(input.price);
      }
    }
    if (
      input.quantity != null &&
      !isPositionalTPSL(parent) &&
      !isPositionalTPSL(old) &&
      Number(input.quantity) !== Number(old.quantity)
    ) {
      update.quantity = Number(input.quantity);
    }
    return Object.keys(update).length > 1 ? [update] : [];
  });
}
