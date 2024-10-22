import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { OrderCellState } from "../orderCell.script";
import {
  useLocalStorage,
  useOrderEntry_deprecated,
} from "@orderly.network/hooks";
import { Decimal } from "@orderly.network/utils";
import { modal, toast, useModal } from "@orderly.network/ui";
import { OrderEntity } from "@orderly.network/types";
import { useOrderListContext } from "../../orderListContext";
import { OrderTypeView } from "../items";
import { AlgoOrderRootType } from "@orderly.network/types";

export const useEditSheetScript = (props: {
  state: OrderCellState;
  editAlgoOrder: (id: string, order: OrderEntity) => Promise<any>;
  editOrder: (id: string, order: OrderEntity) => Promise<any>;
}) => {
  const { state, editAlgoOrder, editOrder } = props;
  const { item: order } = state;
  const { hide } = useModal();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isAlgoOrder =
    order?.algo_order_id !== undefined &&
    order.algo_type !== AlgoOrderRootType.BRACKET;
  const isStopMarket = order?.type === "MARKET" && isAlgoOrder;
  const isMarketOrder = isStopMarket || order?.type === "MARKET";

  const [price, setPrice] = useState(order.price ?? "Market");
  const [triggerPrice, setTriggerPrice] = useState(`${order.trigger_price}`);
  const [quantity, setQuantity] = useState(`${order.quantity}`);

  const [sliderValue, setSliderValue] = useState<undefined | number>(undefined);

  /**
   * {
   *    order_price: {type: 'min/max', message: ''},
   *    order_quantity: {type: 'min/max', message: ''},
   *    total: {type: 'min/max', message: ''},
   *    trigger_price: {type: 'required/min/max' , message: ''},
   * }
   */
  const [errors, setErrors] = useState<{
    order_price?: { message: string };
    order_quantity?: { message: string };
    total?: { message: string };
    trigger_price?: { message: string };
  }>({});

  const { markPrice, maxQty, helper, metaState } = useOrderEntry_deprecated(
    // @ts-ignore
    order.symbol,
    order.side
  );

  const orderType = useMemo(() => {
    if (isAlgoOrder && order.algo_type !== AlgoOrderRootType.BRACKET) {
      return `STOP_${order.type}`;
    }

    return order.type;
  }, [order, isAlgoOrder]);

  const [orderConfirm, setOrderConfirm] = useLocalStorage(
    "orderly_order_confirm",
    true
  );

  const tempOrderEntity = useRef<OrderEntity>();

  const onClose = () => {
    hide();
  };
  const onCloseDialog = () => {
    setDialogOpen(false);
  };

  const onComfirm = async () => {
    setDialogOpen(false);
    let values: OrderEntity = {
      order_price: `${price}`,
      order_quantity: quantity,
      trigger_price: `${triggerPrice}`,
      symbol: order.symbol,
      // @ts-ignore
      order_type: orderType,
      // @ts-ignore
      side: order.side,
      reduce_only: Boolean(order.reduce_only),
    };

    // console.log("validator", values, order);

    const errors = await helper.validator(values);
    if (errors.total?.message !== undefined) {
      toast.error(errors.total?.message);
      return;
    }
    // console.log("errors is", values, errors);

    setErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    if (typeof order.order_tag !== undefined && order.reduce_only !== true) {
      values = { ...values, order_tag: order.order_tag };
    }

    tempOrderEntity.current = values;
    if (orderConfirm) {
      setDialogOpen(true);
    } else {
      onSubmit(values);
    }
  };

  const onConfirm = () => {
    if (tempOrderEntity.current) {
      onSubmit(tempOrderEntity.current);
    }
  };

  const onSubmit = useCallback(
    async (values: OrderEntity) => {
      let future;
      let isHidden =
        order.visible_quantity !== undefined
          ? order.visible_quantity === 0
          : (order as any).visible !== undefined
          ? (order as any).visible === 0
          : false;
      if (order.algo_order_id !== undefined) {
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
    [editAlgoOrder, editOrder]
  );

  useEffect(() => {
    if (typeof sliderValue === "undefined" && maxQty) {
      const value = new Decimal(order.quantity).div(maxQty).toNumber();
      setSliderValue(value);
    }
  }, [maxQty, setSliderValue]);

  const percentages = useMemo(() => {
    return Math.min(Number(quantity) / maxQty, 1);
  }, [quantity]);

  return {
    ...state,
    curMarkPrice: markPrice,
    isAlgoOrder,
    isStopMarket,
    price,
    setPrice,
    priceEdit: !isStopMarket,
    triggerPrice,
    setTriggerPrice,
    quantity,
    setQuantity,
    maxQty,
    sliderValue,
    setSliderValue,
    percentages,
    onClose,
    onComfirm,
    errors,

    dialogOpen,
    setDialogOpen,
    onConfirm,
    onCloseDialog,
    submitting,

    orderConfirm,
    setOrderConfirm,
  };
};

export type EditSheetState = ReturnType<typeof useEditSheetScript>;
