import { API, OrderStatus } from "@orderly.network/types";

export const upperCaseFirstLetter = (str: string) => {
  if (str === undefined) return str;
  if (str.length === 0) return str;
  if (str.length === 1) return str.charAt(0).toUpperCase();
  return str.charAt(0).toUpperCase() + str.toLowerCase().slice(1);
};

export enum AlgoOrderType {
  TAKE_PROFIT = "TAKE_PROFIT",
  STOP_LOSS = "STOP_LOSS",
}

export enum AlgoOrderRootType {
  TP_SL = "TP_SL",
  POSITIONAL_TP_SL = "POSITIONAL_TP_SL",
  STOP = "STOP",
}

export function parseBadgesFor(record: any): undefined | string[] {
  if (typeof record.type !== "undefined") {
    return typeof record.type === "string"
      ? [record.type.replace("_ORDER", "").toLowerCase() as string]
      : [record.type as string];
  }

  if (typeof record.algo_type !== "undefined") {
    const list = new Array<string>();

    if (record.algo_type === AlgoOrderRootType.POSITIONAL_TP_SL) {
      list.push("Position");
    }

    const tpOrder = record.child_orders.find(
      (order: any) =>
        order.algo_type === AlgoOrderType.TAKE_PROFIT && !!order.trigger_price
    );

    const slOrder = record.child_orders.find(
      (order: any) =>
        order.algo_type === AlgoOrderType.STOP_LOSS && !!order.trigger_price
    );

    if (tpOrder || slOrder) {
      list.push(tpOrder && slOrder ? "TP/SL" : tpOrder ? "TP" : "SL");
    }
    return list;
  }

  return undefined;
}

export function grayCell(record: any): boolean {
  return (
    (record as API.Order).status === OrderStatus.CANCELLED ||
    (record as API.AlgoOrder).algo_status === OrderStatus.CANCELLED
  );
}
