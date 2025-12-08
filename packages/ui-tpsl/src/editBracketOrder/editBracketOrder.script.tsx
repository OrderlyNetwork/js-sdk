import { useEffect, useMemo } from "react";
import {
  ERROR_MSG_CODES,
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
  OrderlyOrder,
  OrderSide,
  OrderType,
  PositionType,
  SDKError,
} from "@orderly.network/types";
import { Decimal } from "@orderly.network/utils";

function getInitialOrder(order: API.AlgoOrderExt) {
  const childOrder = order.child_orders[0];
  const positionType =
    childOrder.algo_type === AlgoOrderRootType.TP_SL
      ? PositionType.PARTIAL
      : PositionType.FULL;
  const tpOrder = childOrder.child_orders.find(
    (item) =>
      item.algo_type === AlgoOrderType.TAKE_PROFIT && item.trigger_price,
  );
  const slOrder = childOrder.child_orders.find(
    (item) => item.algo_type === AlgoOrderType.STOP_LOSS && item.trigger_price,
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
      typeof tpOrder.type === "string"
        ? (tpOrder.type.replace("_ORDER", "") as OrderType)
        : undefined;
    if (tpslPriceInfo.tp_order_type === OrderType.LIMIT) {
      tpslPriceInfo.tp_order_price = tpOrder.price?.toString();
    }
  }
  if (slOrder) {
    tpslPriceInfo.sl_trigger_price = slOrder.trigger_price?.toString();
    tpslPriceInfo.sl_order_type =
      typeof slOrder.type === "string"
        ? (slOrder.type.replace("_ORDER", "") as OrderType)
        : undefined;
    if (tpslPriceInfo.sl_order_type === OrderType.LIMIT) {
      tpslPriceInfo.sl_order_price = slOrder.price?.toString();
    }
  }

  return {
    baseInfo: {
      symbol: order.symbol,
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
        const tpOrder: {
          order_id?: number;
          trigger_price?: string;
          algo_type: AlgoOrderType;
          price?: string;
          reduce_only?: boolean;
          is_activated?: boolean;
        } = {
          order_id: tpInfo.orderId,
          algo_type: AlgoOrderType.TAKE_PROFIT,
          trigger_price: formattedOrder.tp_trigger_price,
          reduce_only: true,
        };
        if (formattedOrder.tp_order_type === OrderType.LIMIT) {
          tpOrder.price = formattedOrder.tp_order_price;
        }

        const slOrder: {
          order_id?: number;
          trigger_price?: string;
          algo_type: AlgoOrderType;
          price?: string;
          reduce_only?: boolean;
          is_activated?: boolean;
        } = {
          order_id: slInfo.orderId,
          algo_type: AlgoOrderType.STOP_LOSS,
          trigger_price: formattedOrder.sl_trigger_price,
          reduce_only: true,
        };
        if (formattedOrder.sl_order_type === OrderType.LIMIT) {
          slOrder.price = formattedOrder.sl_order_price;
        }

        const childOrders = [];
        if (tpInfo.orderId) {
          childOrders.push(tpOrder);
        }
        if (slInfo.orderId) {
          childOrders.push(slOrder);
        }
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

  const maxQty = useMaxQty(order.symbol, order.side as OrderSide, reduce_only);

  return useMemo(() => {
    if (reduce_only) {
      return Math.abs(positionQty ?? 0);
    }
    return order.quantity + Math.abs(maxQty);
  }, [order.quantity, maxQty, reduce_only, positionQty]);
}
