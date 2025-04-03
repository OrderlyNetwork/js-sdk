import { Decimal } from "@orderly.network/utils";
import { AlgoType, OrderInterface, OrderType, SideType } from "../type";
import { i18n } from "@orderly.network/i18n";

export const EST_TPSL_PNL_DECIMAL = 2;

export const textDash = "--";

export const BracketAlgoType = [AlgoType.BRACKET, AlgoType.STOP_BRACKET];
export const TpslAlgoType = [AlgoType.POSITIONAL_TP_SL, AlgoType.TP_SL];
export const isTpOrder = (order: OrderInterface) =>
  order.root_algo_order_id !== order.algo_order_id &&
  order.algo_type === AlgoType.TAKE_PROFIT;

export const isSlOrder = (order: OrderInterface) =>
  order.root_algo_order_id !== order.algo_order_id &&
  order.algo_type === AlgoType.STOP_LOSS;

export const isTpslOrder = (order: OrderInterface) =>
  order.root_algo_order_id !== order.algo_order_id &&
  (order.algo_type === AlgoType.TAKE_PROFIT ||
    order.algo_type === AlgoType.STOP_LOSS);

export const isBracketAlgoType = (algoType: AlgoType | undefined | null) =>
  !!algoType && BracketAlgoType.includes(algoType);

export const formatOrderNo = (orderNo?: number) => {
  return orderNo ? String(orderNo).padStart(2, "0") : "";
};

export const isPositionTpsl = (order: OrderInterface) =>
  order.type === OrderType.CLOSE_POSITION;
export const isActivatedPositionTpsl = (order: OrderInterface) =>
  isPositionTpsl(order) && order.is_activated;

export const isActivatedTpslOrder = (order: OrderInterface) =>
  isTpslOrder(order) && order.is_activated;

export const isActivatedQuantityTpsl = (order: OrderInterface) =>
  order.root_algo_order_algo_type === AlgoType.TP_SL ||
  (isBracketAlgoType(order.root_algo_order_algo_type) && order.is_activated);

export const getTpslTag = (
  order: OrderInterface,
  quantityTpslNoMap: Map<number, number>
) => {
  const algoType = order.algo_type;
  // @ts-ignore
  const suffix = {
    [AlgoType.TAKE_PROFIT]: i18n.t("tpsl.takeProfit"),
    [AlgoType.STOP_LOSS]: i18n.t("tpsl.stopLoss"),
  }[algoType];

  if (!suffix) {
    return null;
  }

  return suffix;
};

export const buildQuantityTpslNoMap = (orders: OrderInterface[]) => {
  const quantityTpslNoMap = new Map<number, number>();

  let idx = 1;
  [...orders]
    .reverse()
    .filter(isActivatedQuantityTpsl)
    .forEach((order) => {
      if (
        order.root_algo_order_id &&
        !quantityTpslNoMap.has(order.root_algo_order_id)
      ) {
        quantityTpslNoMap.set(order.root_algo_order_id, idx++);
      }
    });

  return quantityTpslNoMap;
};

export const getTpslEstPnl = (tpslOrder: OrderInterface, position: any) => {
  const quantity = Math.abs(
    tpslOrder.type === OrderType.CLOSE_POSITION
      ? position.balance
      : tpslOrder.quantity
  );
  const sideFlag = tpslOrder.side === SideType.SELL ? 1 : -1;

  const openPrice = position.open.toString();
  const estPnl = new Decimal(tpslOrder.trigger_price)
    .minus(openPrice ?? 0)
    .times(quantity)
    .times(sideFlag)
    .toString();

  return { estPnl, quantity, openPrice };
};

export const formatPnl = (pnl: number | string | undefined) => {
  return pnl !== undefined && pnl !== ""
    ? new Decimal(pnl).todp(EST_TPSL_PNL_DECIMAL, Decimal.ROUND_FLOOR)
    : textDash;
};
