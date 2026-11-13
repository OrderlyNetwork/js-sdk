import { useEffect, useMemo, useRef } from "react";
import {
  ERROR_MSG_CODES,
  createTPSLOrderUpdates,
  revalidateTPSLOrderUpdates,
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
  PositionType,
  SDKError,
} from "@orderly.network/types";
import {
  Decimal,
  getTPSLLeg,
  isTPSLTriggerLocked,
  resolveTPSLOrderType,
} from "@orderly.network/utils";
import {
  getTPSLPriceSyncChanges,
  isTPSLOrderTypeLocked,
} from "../positionTPSL/tpslOrderSync";
import {
  getBracketTPSLPriceInfo,
  hasBracketTPSLPriceChanged,
} from "./editBracketOrder.helpers";

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
  const tpslPriceInfo = getBracketTPSLPriceInfo(childOrder, order);
  const lockedTPSLTriggers: Partial<Record<"tp" | "sl", string | number>> = {};
  for (const leg of ["tp", "sl"] as const) {
    const child = getTPSLLeg(childOrder, leg);
    if (isTPSLTriggerLocked(childOrder, child)) {
      lockedTPSLTriggers[leg] = tpslPriceInfo[`${leg}_trigger_price`];
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
    lockedTPSLTriggers,
    disableTPOrderTypeSelector: isTPSLOrderTypeLocked(childOrder, "tp", order),
    disableSLOrderTypeSelector: isTPSLOrderTypeLocked(childOrder, "sl", order),
    tpInfo: {
      orderId: tpOrder?.algo_order_id,
    },
    slInfo: {
      orderId: slOrder?.algo_order_id,
    },
  };
}

export const useEditBracketOrder = (props: { order: API.AlgoOrderExt }) => {
  if (!props.order) {
    throw new SDKError("order is required for editBracketOrder");
  }
  const {
    baseInfo,
    tpslPriceInfo,
    lockedTPSLTriggers,
    disableTPOrderTypeSelector,
    disableSLOrderTypeSelector,
  } = getInitialOrder(props.order);

  const [doUpdateOrder, { isMutating }] = useMutation("/v1/algo/order", "PUT");

  const maxQty = useEditOrderMaxQty(props.order, props.order.quantity);

  const {
    formattedOrder,
    setValue,
    setValues,
    setValuesRaw,
    estLiqPrice,
    metaState,
    symbolInfo,
    helper,
    ...state
  } = useOrderEntry(props.order.symbol, {
    initialOrder: baseInfo,
    maxQty,
    lockedTPSLTriggers,
    unroundedTPSLPnl: true,
  });
  const symbol = props.order.symbol;

  const isPriceChanged = useMemo(() => {
    return hasBracketTPSLPriceChanged(tpslPriceInfo, formattedOrder);
  }, [
    tpslPriceInfo,
    formattedOrder.tp_order_price,
    formattedOrder.sl_order_price,
    formattedOrder.tp_trigger_price,
    formattedOrder.sl_trigger_price,
  ]);
  const orderID = props.order.algo_order_id;
  const latestOrder = useRef({ order: props.order, lockedTPSLTriggers });
  latestOrder.current = { order: props.order, lockedTPSLTriggers };
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const previousOrder = useRef<{
    id: typeof orderID;
    values: typeof tpslPriceInfo;
    price: typeof baseInfo.order_price;
    quantity: typeof baseInfo.order_quantity;
  }>();
  useEffect(() => {
    const previous = previousOrder.current;
    previousOrder.current = {
      id: orderID,
      values: tpslPriceInfo,
      price: baseInfo.order_price,
      quantity: baseInfo.order_quantity,
    };
    const changes =
      previous?.id === orderID && previous
        ? getTPSLPriceSyncChanges(
            previous.values,
            tpslPriceInfo,
            formattedOrder,
            lockedTPSLTriggers,
          )
        : tpslPriceInfo;
    const sameOrder = previous?.id === orderID;
    const mainOrderChanges = {
      ...(!sameOrder || previous?.price !== baseInfo.order_price
        ? {
            order_price:
              baseInfo.order_price == null ? "" : String(baseInfo.order_price),
          }
        : {}),
      ...(!sameOrder || previous?.quantity !== baseInfo.order_quantity
        ? {
            order_quantity:
              baseInfo.order_quantity == null
                ? ""
                : String(baseInfo.order_quantity),
          }
        : {}),
    };
    const fields = { ...changes, ...mainOrderChanges };
    if (Object.keys(fields).length > 0) setValuesRaw(fields, true);
  }, [
    orderID,
    baseInfo.order_price,
    baseInfo.order_quantity,
    tpslPriceInfo,
    formattedOrder,
    lockedTPSLTriggers,
    setValuesRaw,
  ]);

  const slPriceError = useTpslPriceChecker({
    slPrice: formattedOrder.sl_trigger_price,
    liqPrice: estLiqPrice,
    side: formattedOrder.side,
  });

  const isSlPriceError =
    slPriceError?.sl_trigger_price?.type === ERROR_MSG_CODES.SL_PRICE_ERROR;

  const onSubmit = async () => {
    const lockErrors = { ...(isSlPriceError ? slPriceError : undefined) };
    for (const leg of ["tp", "sl"] as const) {
      const trigger = lockedTPSLTriggers[leg];
      const key = `${leg}_trigger_price` as const;
      if (
        trigger !== undefined &&
        Number(formattedOrder[key] || 0) !== Number(trigger || 0)
      ) {
        lockErrors[key] = {
          type: -1,
          message: "Trigger price cannot be changed after TP/SL is triggered",
        };
      }
    }
    return helper
      .validate(Object.keys(lockErrors).length ? lockErrors : undefined)
      .then(() => {
        const { order, lockedTPSLTriggers: latestTriggers } =
          latestOrder.current;
        if (!mounted.current || order.algo_order_id !== orderID) return;
        for (const leg of ["tp", "sl"] as const) {
          const trigger = latestTriggers[leg];
          if (
            trigger !== undefined &&
            Number(formattedOrder[`${leg}_trigger_price`] || 0) !==
              Number(trigger || 0)
          ) {
            throw new SDKError(
              "Trigger price cannot be changed after TP/SL is triggered",
            );
          }
        }
        const parent = order.child_orders[0];
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
        // Diff against the same snapshot as the validated form.
        const changes = createTPSLOrderUpdates(
          legs,
          props.order.child_orders[0],
          undefined,
          [],
          props.order,
        );
        const childOrders =
          props.order === order
            ? changes
            : revalidateTPSLOrderUpdates(changes, parent, order);
        if (!childOrders.length) return;
        return doUpdateOrder({
          order_id: order.algo_order_id,
          child_orders: [
            {
              order_id: parent.algo_order_id,
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
    disableTPOrderTypeSelector,
    disableSLOrderTypeSelector,
    disableTPTriggerEditing: lockedTPSLTriggers.tp !== undefined,
    disableSLTriggerEditing: lockedTPSLTriggers.sl !== undefined,
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
