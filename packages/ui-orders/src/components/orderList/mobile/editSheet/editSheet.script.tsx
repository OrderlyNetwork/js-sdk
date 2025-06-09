import { useCallback, useMemo, useState } from "react";
import {
  useLocalStorage,
  useMaxQty,
  useOrderEntity,
  useThrottledCallback,
  utils,
} from "@orderly.network/hooks";
import { API, OrderEntity } from "@orderly.network/types";
import { AlgoOrderRootType } from "@orderly.network/types";
import { toast, useModal } from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";
import { OrderCellState } from "../orderCell.script";

export const useEditSheetScript = (props: {
  state: OrderCellState;
  editAlgoOrder: (id: string, order: OrderEntity) => Promise<any>;
  editOrder: (id: string, order: OrderEntity) => Promise<any>;
  autoCheckInput?: boolean;
  position?: API.PositionTPSLExt;
}) => {
  const {
    state,
    editAlgoOrder,
    editOrder,
    autoCheckInput = true,
    position,
  } = props;
  const { item: order } = state;
  const { hide } = useModal();
  const [dialogOpen, setDialogOpen] = useState(false);

  const isAlgoOrder =
    order?.algo_order_id !== undefined &&
    order.algo_type !== AlgoOrderRootType.BRACKET;
  const isStopMarket = order?.type === "MARKET" && isAlgoOrder;
  const isMarketOrder = isStopMarket || order?.type === "MARKET";
  const [submitting, setSubmitting] = useState(false);

  const orderType = useMemo(() => {
    if (isAlgoOrder && order.algo_type !== AlgoOrderRootType.BRACKET) {
      return `STOP_${order.type}`;
    }

    return order.type;
  }, [order, isAlgoOrder]);

  const [orderConfirm, setOrderConfirm] = useLocalStorage(
    "orderly_order_confirm",
    true,
  );

  const { base_dp, base_tick } = props.state;

  const {
    formattedOrder,
    setValue,
    symbolInfo,
    markPrice,
    errors,
    validate,
    maxQty,
  } = useOrderEntry({
    order: order,
    orderType,
    position,
  });

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

  const onCloseDialog = useCallback(() => {
    setDialogOpen(false);
  }, []);

  const onDialogConfirm = () => {
    if (formattedOrder) {
      // @ts-ignore
      return onSubmit(formattedOrder);
    }
    return Promise.reject();
  };

  const onClose = useCallback(() => {
    hide();
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

  const sliderValue = useMemo(() => {
    const qty = formattedOrder.order_quantity;
    if (qty && Number(qty) !== 0 && maxQty !== 0) {
      const value = new Decimal(qty)
        .div(maxQty)
        .mul(100)
        .toDecimalPlaces(2, Decimal.ROUND_DOWN)
        .toNumber();
      return value;
    }
    return 0;
  }, [formattedOrder.order_quantity, maxQty]);

  const isChanged =
    order.price != formattedOrder.order_price ||
    order.quantity != formattedOrder.order_quantity ||
    order.trigger_price != formattedOrder.trigger_price;

  const setSliderValue = useThrottledCallback(
    (value: number) => {
      const quantity = new Decimal(value)
        .div(100)
        .mul(maxQty)
        .toDecimalPlaces(base_dp, Decimal.ROUND_DOWN)
        .toNumber();
      setValue("order_quantity", utils.formatNumber(quantity, base_tick));
    },
    50,
    {},
  );

  const setOrderValue = (key: any, value: string | number) => {
    setValue(key, value);
  };

  return {
    ...state,
    curMarkPrice: markPrice,
    isAlgoOrder,
    isStopMarket,
    price: formattedOrder.order_price,
    setPrice: (value: string) => setOrderValue("order_price", value),
    priceEdit: !isStopMarket,
    triggerPrice: formattedOrder.trigger_price,
    setTriggerPrice: (value: string) => setOrderValue("trigger_price", value),
    quantity: formattedOrder.order_quantity,
    setQuantity: (value: string) => {
      console.trace("set quantity");
      setOrderValue("order_quantity", value);
    },
    maxQty,
    sliderValue,
    setSliderValue,
    onClose: onClose,
    onSheetConfirm: onSheetConfirm,
    errors,
    orderType,
    isChanged,
    baseTick: base_tick,

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

const useOrderEntry = (props: {
  order: API.AlgoOrderExt;
  orderType: string;
  position?: API.PositionTPSLExt;
}) => {
  const { order, orderType, position } = props;

  const [formattedOrder, setFormattedOrder] = useState({
    side: order.side,
    order_type: orderType,
    order_price: order.price,
    order_quantity: order.quantity,
    trigger_price: order.trigger_price,
    reduce_only: order.reduce_only,
    symbol: order.symbol,
  });

  const { reduce_only } = order;

  const positionQty = position?.position_qty;

  const _maxQty = useMaxQty(order.symbol, order.side as any, order.reduce_only);

  const maxQty = useMemo(() => {
    if (reduce_only) {
      return Math.abs(positionQty ?? 0);
    }
    return order.quantity + Math.abs(_maxQty);
  }, [order.quantity, _maxQty, reduce_only, positionQty]);

  const { symbolInfo, markPrice, errors, validate } = useOrderEntity(
    // @ts-ignore
    {
      ...formattedOrder,
      symbol: order.symbol,
    },
    {
      maxQty,
    },
  );

  const setValue = (key: any, value: any) => {
    setFormattedOrder((oldValue) => ({
      ...oldValue,
      [key]: value,
    }));
  };

  return {
    symbolInfo,
    markPrice,
    errors,
    validate,
    setValue,
    formattedOrder,
    maxQty,
  };
};
