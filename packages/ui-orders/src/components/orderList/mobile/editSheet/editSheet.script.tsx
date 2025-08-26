import { useCallback, useMemo, useState } from "react";
import { useLocalStorage } from "@orderly.network/hooks";
import { API, OrderEntity, OrderType } from "@orderly.network/types";
import { AlgoOrderRootType } from "@orderly.network/types";
import { toast, useModal } from "@orderly.network/ui";
import { OrderCellState } from "../orderCell.script";
import { useEditOrderEntry } from "./hooks/useEditOrderEntry";
import { useEditOrderMaxQty } from "./hooks/useEditOrderMaxQty";

export const useEditSheetScript = (props: {
  state: OrderCellState;
  position?: API.PositionTPSLExt;
  editAlgoOrder: (id: string, order: OrderEntity) => Promise<any>;
  editOrder: (id: string, order: OrderEntity) => Promise<any>;
}) => {
  const { state, editAlgoOrder, editOrder, position } = props;
  const { item: order } = state;
  const { hide: onClose } = useModal();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isAlgoOrder =
    order.algo_order_id !== undefined &&
    order.algo_type !== AlgoOrderRootType.BRACKET;

  const isStopMarket = order?.type === "MARKET" && isAlgoOrder;
  const isTrailingStop = order.algo_type === OrderType.TRAILING_STOP;

  const showTriggerPrice = isAlgoOrder && !isTrailingStop;

  // order api type ==> order entry type
  const orderType = useMemo(() => {
    if (isTrailingStop) {
      return OrderType.TRAILING_STOP;
    }

    if (isAlgoOrder && order.algo_type !== AlgoOrderRootType.BRACKET) {
      return `STOP_${order.type}`;
    }

    return order.type;
  }, [order, isAlgoOrder, isTrailingStop]);

  const [orderConfirm, setOrderConfirm] = useLocalStorage(
    "orderly_order_confirm",
    true,
  );

  const maxQty = useEditOrderMaxQty(order, position?.position_qty);

  const {
    formattedOrder,
    setOrderValue,
    markPrice,
    errors,
    validate,
    isChanged,
  } = useEditOrderEntry({
    order,
    orderType,
    maxQty,
  });

  const onCloseDialog = useCallback(() => {
    setDialogOpen(false);
  }, []);

  const onSubmit = useCallback(
    async (values: OrderEntity) => {
      let future;
      const isHidden =
        order.visible_quantity !== undefined
          ? order.visible_quantity === 0
          : (order as any).visible !== undefined
            ? (order as any).visible === 0
            : false;

      if (order.algo_order_id !== undefined) {
        if (isStopMarket && "order_price" in values) {
          const { order_price, ...rest } = values;
          values = rest;
        }
        future = editAlgoOrder(order.algo_order_id.toString(), {
          ...values,
        });
      } else {
        future = editOrder((order as any).order_id.toString(), {
          ...values,
          ...(isHidden ? { visible_quantity: 0 } : {}),
        });
      }
      try {
        setSubmitting(true);

        const res = await future;
        onClose();
      } catch (err: any) {
        toast.error(err?.message ?? `${err}`);
      } finally {
        setSubmitting(false);
      }
    },
    [editAlgoOrder, editOrder],
  );

  const onDialogConfirm = () => {
    if (formattedOrder) {
      return onSubmit(formattedOrder as any);
    }
    return Promise.reject();
  };

  const onSheetConfirm = () => {
    validate()
      .then(
        (result) => {
          if (orderConfirm) {
            setDialogOpen(true);
          } else {
            // @ts-ignore
            onSubmit(formattedOrder);
          }
        },
        (error) => {
          // rejected
          if (error?.total?.message) {
            toast.error(error?.total.message);
          }
        },
      )
      .catch((err) => {});
  };

  return {
    ...state,
    markPrice,
    isStopMarket,
    isTrailingStop,
    showTriggerPrice,
    formattedOrder,
    setOrderValue,
    maxQty,
    onClose,
    onSheetConfirm,
    errors,
    isChanged,
    dialogOpen,
    setDialogOpen,
    onDialogConfirm,
    onCloseDialog,
    submitting,

    orderConfirm,
    setOrderConfirm,
  };
};

export type EditSheetState = ReturnType<typeof useEditSheetScript>;
