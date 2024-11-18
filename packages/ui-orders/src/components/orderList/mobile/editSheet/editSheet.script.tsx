import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { OrderCellState } from "../orderCell.script";
import {
  useDebouncedCallback,
  useLocalStorage,
  useOrderEntry,
  useOrderEntry_deprecated,
  useThrottledCallback,
  utils,
} from "@orderly.network/hooks";
import { Decimal } from "@orderly.network/utils";
import { modal, toast, useModal } from "@orderly.network/ui";
import { OrderEntity } from "@orderly.network/types";
import { useOrderListContext } from "../../orderListContext";
import { OrderTypeView } from "../items";
import { AlgoOrderRootType } from "@orderly.network/types";

// export const useEditSheetScript = (props: {
//   state: OrderCellState;
//   editAlgoOrder: (id: string, order: OrderEntity) => Promise<any>;
//   editOrder: (id: string, order: OrderEntity) => Promise<any>;
//   autoCheckInput?: boolean;
// }) => {
//   const { state, editAlgoOrder, editOrder, autoCheckInput = true } = props;
//   const { item: order } = state;
//   const { hide } = useModal();
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [submitting, setSubmitting] = useState(false);

//   const isAlgoOrder =
//     order?.algo_order_id !== undefined &&
//     order.algo_type !== AlgoOrderRootType.BRACKET;
//   const isStopMarket = order?.type === "MARKET" && isAlgoOrder;
//   const isMarketOrder = isStopMarket || order?.type === "MARKET";

//   const [price, setPrice] = useState(order.price ?? "Market");
//   const [triggerPrice, setTriggerPrice] = useState(`${order.trigger_price}`);
//   const [quantity, setQuantity] = useState(`${order.quantity}`);

//   const [sliderValue, setSliderValue] = useState<undefined | number>(undefined);

//   /**
//    * {
//    *    order_price: {type: 'min/max', message: ''},
//    *    order_quantity: {type: 'min/max', message: ''},
//    *    total: {type: 'min/max', message: ''},
//    *    trigger_price: {type: 'required/min/max' , message: ''},
//    * }
//    */
//   const [errors, setErrors] = useState<{
//     order_price?: { message: string };
//     order_quantity?: { message: string };
//     total?: { message: string };
//     trigger_price?: { message: string };
//   }>({});

//   const { markPrice, maxQty, helper, metaState } = useOrderEntry_deprecated(
//     // @ts-ignore
//     order.symbol,
//     order.side
//   );

//   const orderType = useMemo(() => {
//     if (isAlgoOrder && order.algo_type !== AlgoOrderRootType.BRACKET) {
//       return `STOP_${order.type}`;
//     }

//     return order.type;
//   }, [order, isAlgoOrder]);

//   const [orderConfirm, setOrderConfirm] = useLocalStorage(
//     "orderly_order_confirm",
//     true
//   );

//   const tempOrderEntity = useRef<OrderEntity>();

//   const onClose = () => {
//     hide();
//   };
//   const onCloseDialog = () => {
//     setDialogOpen(false);
//   };

//   const validatorInput = async (): Promise<{
//     values: OrderEntity;
//     errors?: any;
//   }> => {
//     let values: OrderEntity = {
//       order_quantity: quantity,
//       trigger_price: `${triggerPrice}`,
//       symbol: order.symbol,
//       // @ts-ignore
//       order_type: orderType,
//       // @ts-ignore
//       side: order.side,
//       reduce_only: Boolean(order.reduce_only),
//     };
//     if (!isMarketOrder) {
//       values = {
//         ...values,
//         order_price: `${price}`,
//       }
//     }

//     console.log("validator", values, order);

//     const errors = await helper.validator(values);
//     if (errors.total?.message !== undefined) {
//       toast.error(errors.total?.message);
//     }
//     // console.log("errors is", values, errors);

//     setErrors(errors);
//     return {
//       errors,
//       values,
//     };
//   };

//   useEffect(() => {
//     if (autoCheckInput) {
//       validatorInput();
//     }
//   }, [price, triggerPrice, quantity, autoCheckInput]);

//   const onSheetConfirm = async () => {
//     setDialogOpen(false);
//     const { values: _data, errors } = await validatorInput();
//     let values = _data;

//     if (Object.keys(errors).length > 0) {
//       return;
//     }

//     if (typeof order.order_tag !== undefined && order.reduce_only !== true) {
//       values = { ...values, order_tag: order.order_tag };
//     }

//     tempOrderEntity.current = values;
//     if (orderConfirm) {
//       setDialogOpen(true);
//     } else {
//       onSubmit(values);
//     }
//   };

//   const onDialogConfirm = () => {
//     if (tempOrderEntity.current) {
//       onSubmit(tempOrderEntity.current);
//     }
//   };

//   const onSubmit = useCallback(
//     async (values: OrderEntity) => {
//       let future;
//       let isHidden =
//         order.visible_quantity !== undefined
//           ? order.visible_quantity === 0
//           : (order as any).visible !== undefined
//           ? (order as any).visible === 0
//           : false;
//       if (order.algo_order_id !== undefined) {
//         future = editAlgoOrder(order.algo_order_id.toString(), {
//           ...values,
//         });
//       } else {
//         future = editOrder((order as any).order_id.toString(), {
//           ...values,
//           ...(isHidden ? { visible_quantity: 0 } : {}),
//         });
//       }
//       try {
//         setSubmitting(true);

//         const res = await future;
//         onClose();
//       } catch (err: any) {
//         toast.error(err?.message ?? `${err}`);
//       } finally {
//         setSubmitting(false);
//       }
//     },
//     [editAlgoOrder, editOrder]
//   );

//   useEffect(() => {
//     if (typeof sliderValue === "undefined" && maxQty) {
//       const value = new Decimal(order.quantity).div(maxQty).toNumber();
//       setSliderValue(value);
//     }
//   }, [maxQty, setSliderValue]);

//   const percentages = useMemo(() => {
//     return Math.min(Number(quantity) / maxQty, 1);
//   }, [quantity]);

//   return {
//     ...state,
//     curMarkPrice: markPrice,
//     isAlgoOrder,
//     isStopMarket,
//     price,
//     setPrice,
//     priceEdit: !isStopMarket,
//     triggerPrice,
//     setTriggerPrice,
//     quantity,
//     setQuantity,
//     maxQty,
//     sliderValue,
//     setSliderValue,
//     percentages,
//     onClose,
//     onSheetConfirm,
//     errors,

//     dialogOpen,
//     setDialogOpen,
//     onDialogConfirm,
//     onCloseDialog,
//     submitting,

//     orderConfirm,
//     setOrderConfirm,
//   };
// };

export const useEditSheetScript = (props: {
  state: OrderCellState;
  editAlgoOrder: (id: string, order: OrderEntity) => Promise<any>;
  editOrder: (id: string, order: OrderEntity) => Promise<any>;
  autoCheckInput?: boolean;
}) => {
  const { state, editAlgoOrder, editOrder, autoCheckInput = true } = props;
  const { item: order } = state;
  const { hide } = useModal();
  const [dialogOpen, setDialogOpen] = useState(false);

  const isAlgoOrder =
    order?.algo_order_id !== undefined &&
    order.algo_type !== AlgoOrderRootType.BRACKET;
  const isStopMarket = order?.type === "MARKET" && isAlgoOrder;
  const isMarketOrder = isStopMarket || order?.type === "MARKET";
  const [submitting, setSubmitting] = useState(false);

  // const [sliderValue, setSliderValue] = useState(0);

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

  const {
    formattedOrder,
    setValue,
    setValues,
    symbolInfo,
    markPrice,
    maxQty,
    metaState: { errors },
    helper,
  } = useOrderEntry(order.symbol, {
    initialOrder: {
      side: order.side,
      order_type: orderType,
      order_price: order.price,
      order_quantity: order.quantity,
      trigger_price: order.trigger_price,
      reduce_only: order.reduce_only,
    },
  });

  const { base_dp, base_tick } = symbolInfo;

  const onSheetConfirm = () => {
    helper
      .validate()
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
        }
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
      let isHidden =
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
    [editAlgoOrder, editOrder]
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
    order.price !== formattedOrder.order_price ||
    `${order.quantity}` !== formattedOrder.order_quantity ||
    `${order.trigger_price}` !== formattedOrder.trigger_price;

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
    {}
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
