import { utils } from "@orderly.network/hooks";
import { AlgoOrderRootType, AlgoOrderType, API, OrderStatus } from "@orderly.network/types";

export const upperCaseFirstLetter = (str: string) => {
  if (str === undefined) return str;
  if (str.length === 0) return str;
  if (str.length === 1) return str.charAt(0).toUpperCase();
  return str.charAt(0).toUpperCase() + str.toLowerCase().slice(1);
};



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




function findBracketTPSLOrder(order: API.AlgoOrderExt) {
  if (order.algo_type !== AlgoOrderRootType.BRACKET) {
    return {
      tpOrder: undefined,
      slOrder: undefined,
    };
  }

  const innerOrder = order.child_orders?.[0];
  if (!innerOrder)
    return {
      tpOrder: undefined,
      slOrder: undefined,
    };

  const tpOrder = innerOrder?.child_orders?.find(
    (item) => item.algo_type === AlgoOrderType.TAKE_PROFIT
  );

  const slOrder = innerOrder?.child_orders?.find(
    (item) => item.algo_type === AlgoOrderType.STOP_LOSS
  );

  return {
    tpOrder,
    slOrder,
  };
}

export function calcBracketRoiAndPnL(order: API.AlgoOrderExt) {
  const defaultCallback = {
    pnl: {
      tpPnL: undefined,
      slPnL: undefined,
    },
    roi: {
      tpRoi: undefined,
      slRoi: undefined,
    },
  };
  const { tpOrder, slOrder } = findBracketTPSLOrder(order);
  if (!tpOrder && !slOrder) return defaultCallback;

  if (typeof order.price === undefined || !order.price) return defaultCallback;

  const tpPnL =
    tpOrder?.trigger_price &&
    utils.priceToPnl({
      qty: order.quantity,
      price: tpOrder?.trigger_price,
      entryPrice: order.price,
      // @ts-ignore
      orderSide: order.side,
      // @ts-ignore
      orderType: order.algo_type,
    });
  const slPnL =
    slOrder?.trigger_price &&
    utils.priceToPnl({
      qty: order.quantity,
      // trigger price
      price: slOrder?.trigger_price,
      //
      entryPrice: order.price,
      // @ts-ignore
      orderSide: order.side,
      // @ts-ignore
      orderType: order.algo_type,
    });

  const tpRoi = tpPnL
    ? utils.calcTPSL_ROI({
        pnl: tpPnL,
        qty: order.quantity,
        price: order.price,
      })
    : undefined;
  const slRoi = slPnL
    ? utils.calcTPSL_ROI({
        pnl: slPnL,
        qty: order.quantity,
        price: order.price,
      })
    : undefined;

  return {
    pnl: {
      tpPnL,
      slPnL,
    },
    roi: {
      tpRoi,
      slRoi,
    },
  };
}
