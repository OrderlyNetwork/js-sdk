import { OrderType } from "@orderly.network/types";

/** Explicit types win; price-only SDK calls retain their legacy inference. */
export function resolveTPSLOrderType(
  type?: string,
  price?: string | number | null,
  fullPosition = false,
): OrderType {
  const limit =
    type != null ? type === OrderType.LIMIT : price != null && price !== "";
  return limit
    ? OrderType.LIMIT
    : fullPosition
      ? OrderType.CLOSE_POSITION
      : OrderType.MARKET;
}

export type TPSLOrderState = {
  algo_order_id?: number;
  parent_algo_order_id?: number;
  root_algo_order_id?: number;
  symbol?: string;
  side?: string;
  margin_mode?: string;
  algo_type?: string;
  parent_algo_type?: string;
  root_algo_order_algo_type?: string;
  type?: string | number;
  is_activated?: boolean;
  is_triggered?: boolean;
  triggered?: boolean;
  trigger_time?: number;
  trigger_status?: string;
  algo_status?: string;
  root_algo_status?: string;
  status?: string;
  quantity?: number;
  total_executed_quantity?: number;
  executed?: number;
  price?: number | null;
  trigger_price?: number;
  child_orders?: TPSLOrderState[];
};

/**
 * A TP/SL leg counts as active only when it was activated on the server and
 * still carries a usable positive trigger price; cancelled or placeholder
 * legs (e.g. blanked inactive legs while editing) are not active.
 */
export function isActiveTPSLLeg(
  order?: Pick<TPSLOrderState, "is_activated" | "trigger_price">,
): boolean {
  return (
    !!order &&
    order.is_activated !== false &&
    Number.isFinite(Number(order.trigger_price)) &&
    Number(order.trigger_price) > 0
  );
}

/** Provenance is independent of the execution type and execution stage. */
export function isPositionalTPSL(order: TPSLOrderState): boolean {
  return (
    order.algo_type === "POSITIONAL_TP_SL" ||
    order.parent_algo_type === "POSITIONAL_TP_SL" ||
    order.root_algo_order_algo_type === "POSITIONAL_TP_SL" ||
    order.type === "CLOSE_POSITION"
  );
}

export function isTPSLTriggered(order: TPSLOrderState): boolean {
  return (
    order.is_triggered === true ||
    order.triggered === true ||
    (order.trigger_time ?? 0) > 0 ||
    ["TRIGGERING", "SUCCESS", "FAILED"].includes(order.trigger_status ?? "") ||
    ["PARTIAL_FILLED", "FILLED"].includes(
      order.algo_status ?? order.status ?? "",
    ) ||
    (order.total_executed_quantity ?? order.executed ?? 0) > 0 ||
    (order.child_orders?.some(isTPSLTriggered) ?? false)
  );
}

const hasTPSLParent = (
  parent: TPSLOrderState,
  ancestor?: TPSLOrderState,
): boolean =>
  ancestor != null ||
  !!parent.parent_algo_type ||
  parent.root_algo_order_algo_type === "BRACKET" ||
  (Number(parent.parent_algo_order_id) > 0 &&
    parent.parent_algo_order_id !== parent.algo_order_id) ||
  (Number(parent.root_algo_order_id) > 0 &&
    parent.root_algo_order_id !== parent.algo_order_id);

const isFinishedTPSLLeg = (child: TPSLOrderState): boolean =>
  ["CANCELLED", "CANCELED", "FILLED", "REJECTED", "EXPIRED"].includes(
    child.algo_status ?? child.status ?? "",
  );

/** Match the backend activation policy, including parents nested in Brackets. */
export function isTPSLActivationAllowed(
  parent: TPSLOrderState,
  ancestor?: TPSLOrderState,
): boolean {
  if (!["TP_SL", "POSITIONAL_TP_SL"].includes(parent.algo_type ?? "")) {
    return false;
  }
  return (
    !hasTPSLParent(parent, ancestor) ||
    (parent.algo_type === "TP_SL" && parent.is_activated === true)
  );
}

/** Configured Pending Bracket protection is not an empty activation placeholder. */
export function isConfiguredPendingTPSLLeg(
  parent: TPSLOrderState,
  child: TPSLOrderState | undefined,
  ancestor?: TPSLOrderState,
): boolean {
  return (
    ["TP_SL", "POSITIONAL_TP_SL"].includes(parent.algo_type ?? "") &&
    hasTPSLParent(parent, ancestor) &&
    parent.is_activated === false &&
    !isTPSLTriggered(parent) &&
    !!child &&
    ["TAKE_PROFIT", "STOP_LOSS"].includes(child.algo_type ?? "") &&
    child.is_activated === false &&
    !isTPSLTriggered(child) &&
    !isFinishedTPSLLeg(child) &&
    Number.isFinite(Number(child.trigger_price)) &&
    Number(child.trigger_price) > 0
  );
}

/** An inactive placeholder may select its first type only under an allowed parent. */
export function canChangeTPSLOrderType(
  parent: TPSLOrderState,
  child: TPSLOrderState | undefined,
  ancestor?: TPSLOrderState,
): boolean {
  return (
    isTPSLActivationAllowed(parent, ancestor) &&
    !!child &&
    ["TAKE_PROFIT", "STOP_LOSS"].includes(child.algo_type ?? "") &&
    child.is_activated === false &&
    !isTPSLTriggered(child) &&
    !isFinishedTPSLLeg(child)
  );
}

/** Untriggered cancelled orders still mean entire position, including in history. */
export function isEntirePositionTPSL(order: TPSLOrderState): boolean {
  return isPositionalTPSL(order) && !isTPSLTriggered(order);
}

export function matchesTPSLPosition(
  order: Pick<TPSLOrderState, "symbol" | "margin_mode">,
  position: { symbol?: string; margin_mode?: string; marginMode?: string },
): boolean {
  return (
    order.symbol === position.symbol &&
    (order.margin_mode || "CROSS") ===
      (position.margin_mode || position.marginMode || "CROSS")
  );
}

/** Never infer historical quantities from the current position. */
export function getTPSLQuantity(
  order: TPSLOrderState,
  positionQuantity?: number,
  history = false,
): number | undefined {
  const terminal = [
    "CANCELLED",
    "CANCELED",
    "FILLED",
    "REJECTED",
    "EXPIRED",
  ].includes(order.algo_status ?? order.status ?? order.root_algo_status ?? "");
  const quantity = isEntirePositionTPSL(order)
    ? history || terminal
      ? undefined
      : positionQuantity
    : order.quantity;
  return quantity != null && Number.isFinite(quantity) && quantity !== 0
    ? Math.abs(quantity)
    : undefined;
}

export function getTPSLEstimatePrice(
  order: TPSLOrderState,
): number | undefined {
  return (
    (order.type === "LIMIT" ? order.price : order.trigger_price) ?? undefined
  );
}

export function getTPSLLeg(
  order: TPSLOrderState,
  leg: "tp" | "sl",
): TPSLOrderState | undefined {
  const child = order.child_orders?.find(
    (item) => item.algo_type === (leg === "tp" ? "TAKE_PROFIT" : "STOP_LOSS"),
  );
  return child
    ? {
        ...child,
        symbol: child.symbol ?? order.symbol,
        margin_mode: child.margin_mode ?? order.margin_mode,
        parent_algo_type: order.algo_type,
        quantity:
          child.quantity ||
          (isPositionalTPSL(order) ? undefined : order.quantity),
        root_algo_status: order.root_algo_status,
      }
    : undefined;
}

/** Preserve the direct virtual parent, especially below BRACKET roots. */
export function withTPSLProvenance<T extends TPSLOrderState>(order: T): T {
  return {
    ...order,
    is_triggered: order.is_triggered ?? order.triggered,
    child_orders: order.child_orders?.map((child) =>
      withTPSLProvenance({
        ...child,
        symbol: child.symbol ?? order.symbol,
        parent_algo_type: order.algo_type,
        margin_mode: child.margin_mode || order.margin_mode || "CROSS",
      }),
    ),
  };
}
