import { useEffect, useMemo } from "react";
import {
  ERROR_MSG_CODES,
  createTPSLOrderUpdates,
  useMaxQty,
  useMutation,
  useOrderEntry,
  useSymbolsInfo,
  useTpslPriceChecker,
} from "@orderly.network/hooks";
import {
  AlgoOrderRootType,
  AlgoOrderType,
  API,
  MarginMode,
  OrderlyOrder,
  OrderSide,
  OrderType,
  PositionType,
  SDKError,
} from "@orderly.network/types";
import { Decimal, resolveTPSLOrderType } from "@orderly.network/utils";

function getInitialOrder(order: API.AlgoOrderExt) {
  const childOrder = order.child_orders[0];
  const positionType =
    childOrder.algo_type === AlgoOrderRootType.TP_SL
      ? PositionType.PARTIAL
      : PositionType.FULL;
  const tpOrder = childOrder.child_orders.find(
    (item) => item.algo_type === AlgoOrderType.TAKE_PROFIT,
  );
  const slOrder = childOrder.child_orders.find(
    (item) => item.algo_type === AlgoOrderType.STOP_LOSS,
  );
  const tpslPriceInfo: {
    tp_trigger_price?: string | undefined;
    tp_order_type?: OrderType;
    tp_order_price?: string | undefined;
    sl_trigger_price?: string | undefined;
    sl_order_type?: OrderType;
    sl_order_price?: string | undefined;
  } = {};
  if (tpOrder) {
    tpslPriceInfo.tp_trigger_price = tpOrder.trigger_price?.toString();
    tpslPriceInfo.tp_order_type =
      tpOrder.type === OrderType.LIMIT ? OrderType.LIMIT : OrderType.MARKET;
    if (tpslPriceInfo.tp_order_type === OrderType.LIMIT) {
      tpslPriceInfo.tp_order_price = tpOrder.price?.toString();
    }
  }
  if (slOrder) {
    tpslPriceInfo.sl_trigger_price = slOrder.trigger_price?.toString();
    tpslPriceInfo.sl_order_type =
      slOrder.type === OrderType.LIMIT ? OrderType.LIMIT : OrderType.MARKET;
    if (tpslPriceInfo.sl_order_type === OrderType.LIMIT) {
      tpslPriceInfo.sl_order_price = slOrder.price?.toString();
    }
  }

  return {
    baseInfo: {
      symbol: order.symbol,
      margin_mode: order.margin_mode ?? MarginMode.CROSS,
      order_type: order.type,
      side: order.side,
      order_price: order.price,
      order_quantity: order.quantity,
      position_type: positionType,
      // tp_enable: !!tpOrder?.trigger_price,
      // sl_enable: !!slOrder?.trigger_price,
    },
    tpslPriceInfo,
    tpInfo: {
      orderId: tpOrder?.algo_order_id,
    },
    slInfo: {
      orderId: slOrder?.algo_order_id,
    },
  };
}

function isTPSLPriceChanged(
  originPrice: string | number,
  newPrice: string | number,
) {
  if (newPrice === undefined || newPrice === null) {
    return true;
  }
  if (isNaN(Number(newPrice))) {
    return false;
  }
  const originDeci = new Decimal(Number(originPrice));
  const newDeci = new Decimal(Number(newPrice));
  return !newDeci.eq(originDeci);
}

export const useEditBracketOrder = (props: { order: API.AlgoOrderExt }) => {
  if (!props.order) {
    throw new SDKError("order is required for editBracketOrder");
  }
  const { baseInfo, tpslPriceInfo, tpInfo, slInfo } = getInitialOrder(
    props.order,
  );

  const [doUpdateOrder, { isMutating }] = useMutation("/v1/algo/order", "PUT");

  const maxQty = useEditOrderMaxQty(props.order, props.order.quantity);

  const {
    formattedOrder,
    setValue,
    setValues,
    estLiqPrice,
    metaState,
    symbolInfo,
    helper,
    ...state
  } = useOrderEntry(props.order.symbol, {
    initialOrder: baseInfo,
    maxQty,
  });
  const symbol = props.order.symbol;

  const isPriceChanged = useMemo(() => {
    let dirty = false;
    const {
      tp_order_price,
      sl_order_price,
      tp_trigger_price,
      sl_trigger_price,
    } = formattedOrder;
    if (tpslPriceInfo.tp_trigger_price) {
      dirty =
        dirty ||
        isTPSLPriceChanged(
          tpslPriceInfo.tp_trigger_price,
          tp_trigger_price ?? 0,
        );
    }
    if (tpslPriceInfo.tp_order_price) {
      dirty =
        dirty ||
        isTPSLPriceChanged(tpslPriceInfo.tp_order_price, tp_order_price ?? 0);
    }
    if (tpslPriceInfo.sl_trigger_price) {
      dirty =
        dirty ||
        isTPSLPriceChanged(
          tpslPriceInfo.sl_trigger_price,
          sl_trigger_price ?? 0,
        );
    }
    if (tpslPriceInfo.sl_order_price) {
      dirty =
        dirty ||
        isTPSLPriceChanged(tpslPriceInfo.sl_order_price, sl_order_price ?? 0);
    }
    return dirty;
  }, [
    tpslPriceInfo,
    formattedOrder.tp_order_price,
    formattedOrder.sl_order_price,
    formattedOrder.tp_trigger_price,
    formattedOrder.sl_trigger_price,
  ]);
  useEffect(() => {
    setValues({
      ...tpslPriceInfo,
    });
  }, [props.order, setValues]);

  const slPriceError = useTpslPriceChecker({
    slPrice: formattedOrder.sl_trigger_price,
    liqPrice: estLiqPrice,
    side: formattedOrder.side,
  });

  const isSlPriceError =
    slPriceError?.sl_trigger_price?.type === ERROR_MSG_CODES.SL_PRICE_ERROR;

  const onSubmit = async () => {
    return helper
      .validate(isSlPriceError ? slPriceError : undefined)
      .then(() => {
        const parent = props.order.child_orders[0];
        const legs = (["tp", "sl"] as const).map((leg) => ({
          algo_type:
            leg === "tp" ? AlgoOrderType.TAKE_PROFIT : AlgoOrderType.STOP_LOSS,
          type: resolveTPSLOrderType(
            formattedOrder[`${leg}_order_type`],
            formattedOrder[`${leg}_order_price`],
            baseInfo.position_type === PositionType.FULL,
          ),
          is_activated: !!formattedOrder[`${leg}_trigger_price`],
          trigger_price: formattedOrder[`${leg}_trigger_price`]
            ? new Decimal(formattedOrder[`${leg}_trigger_price`]!)
                .todp(symbolInfo.quote_dp)
                .toNumber()
            : undefined,
          price: formattedOrder[`${leg}_order_price`]
            ? new Decimal(formattedOrder[`${leg}_order_price`]!)
                .todp(symbolInfo.quote_dp)
                .toNumber()
            : undefined,
        }));
        const childOrders = createTPSLOrderUpdates(legs, parent);
        if (!childOrders.length) return;
        return doUpdateOrder({
          order_id: props.order.algo_order_id,
          child_orders: [
            {
              order_id: props.order.child_orders[0].algo_order_id,
              child_orders: childOrders,
            },
          ],
        });
      });
  };

  return {
    symbol,
    symbolInfo,
    slPriceError,
    estLiqPrice,
    side: formattedOrder.side,
    formattedOrder,
    setValue,
    setValues,
    metaState,
    onSubmit,
    isMutating,
    isPriceChanged,
  };
};

export function useEditOrderMaxQty(
  order: API.AlgoOrderExt,
  positionQty?: number,
) {
  const { reduce_only } = order;

  const maxQty = useMaxQty(order.symbol, order.side as OrderSide, {
    reduceOnly: reduce_only,
    marginMode: order.margin_mode ?? MarginMode.CROSS,
  });

  return useMemo(() => {
    if (reduce_only) {
      return Math.abs(positionQty ?? 0);
    }
    return order.quantity + Math.abs(maxQty);
  }, [order.quantity, maxQty, reduce_only, positionQty]);
}
