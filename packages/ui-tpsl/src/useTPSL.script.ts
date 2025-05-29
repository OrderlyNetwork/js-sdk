import { useEffect, useMemo, useRef } from "react";
import {
  type ComputedAlgoOrder,
  useLocalStorage,
  useSymbolsInfo,
  useTPSLOrder,
  utils,
} from "@orderly.network/hooks";
import { SDKError } from "@orderly.network/types";
import { AlgoOrderRootType, AlgoOrderType, API } from "@orderly.network/types";
import { toast } from "@orderly.network/ui";

export type TPSLBuilderOptions = {
  position: API.Position;
  order?: API.AlgoOrder;
  onTPSLTypeChange?: (type: AlgoOrderRootType) => void;
  isEditing?: boolean;
  /**
   * either show the confirm dialog or not,
   * if the Promise reject or return false, cancel the submit action
   */
  onConfirm?: (
    order: ComputedAlgoOrder,
    options: {
      position: API.Position;
      submit: (params?: { accountId?: string }) => Promise<any>;
      cancel: () => Promise<any>;
    },
  ) => Promise<boolean>;
};

export const useTPSLBuilder = (options: TPSLBuilderOptions) => {
  const { position, order, isEditing } = options;
  // const isEditing = !!order;
  if (isEditing && !order) {
    throw new SDKError("order is required when isEditing is true");
  }
  const symbol = isEditing ? order!.symbol : position.symbol;
  const symbolInfo = useSymbolsInfo();
  const prevTPSLType = useRef<AlgoOrderRootType>(AlgoOrderRootType.TP_SL);
  const [needConfirm] = useLocalStorage("orderly_order_confirm", true);

  const [
    tpslOrder,
    {
      submit,
      deleteOrder,
      setValue,
      validate,
      errors,
      isCreateMutating,
      isUpdateMutating,
    },
  ] = useTPSLOrder(
    {
      symbol,
      position_qty: position.position_qty,
      average_open_price: position.average_open_price,
    },
    {
      defaultOrder: order,
      isEditing,
    },
  );

  const setQuantity = (value: number | string) => {
    setValue("quantity", value);
  };

  const setOrderPrice = (
    name: "tp_trigger_price" | "sl_trigger_price",
    value: number | string,
  ) => {
    setValue(name, value);
  };

  const setPnL = (type: string, value: number | string) => {
    setValue(type, value);
  };

  const maxQty = useMemo(
    () => Math.abs(Number(position.position_qty)),
    [position.position_qty],
  );

  const dirty = useMemo(() => {
    const quantity =
      order?.algo_type === AlgoOrderRootType.POSITIONAL_TP_SL
        ? maxQty
        : order?.quantity;

    let diff: number = 0;

    if (Number(tpslOrder.quantity) !== quantity) {
      diff = 1;
    } else if (!isEditing && !!tpslOrder.quantity) {
      diff = 1;
    }

    if (order && isEditing) {
      const tp = order.child_orders.find(
        (o) => o.algo_type === AlgoOrderType.TAKE_PROFIT,
      );
      const sl = order.child_orders.find(
        (o) => o.algo_type === AlgoOrderType.STOP_LOSS,
      );

      if (
        tp?.trigger_price !== Number(tpslOrder.tp_trigger_price) &&
        typeof typeof tpslOrder.tp_trigger_price !== "undefined"
      ) {
        // return true;
        diff = 2;
      }

      if (
        sl?.trigger_price !== Number(tpslOrder.sl_trigger_price) &&
        typeof tpslOrder.sl_trigger_price !== "undefined"
      ) {
        diff = 3;
      }
    }

    if (
      diff === 1 &&
      !tpslOrder.tp_trigger_price &&
      !tpslOrder.sl_trigger_price
    ) {
      diff = -1;
    }

    return diff;
  }, [
    tpslOrder.tp_trigger_price,
    tpslOrder.sl_trigger_price,
    tpslOrder.quantity,
    order,
    isEditing,
  ]);

  const valid = useMemo(() => {
    /**
     * if the order is a POSITIONAL_TP_SL and the quantity is less than the maxQty,
     * and the tp/sl trigger price is not set, then the order is not valid
     */
    if (
      order?.algo_type === AlgoOrderRootType.POSITIONAL_TP_SL &&
      Number(tpslOrder.quantity) < maxQty &&
      !tpslOrder.tp_trigger_price &&
      !tpslOrder.sl_trigger_price
    ) {
      return false;
    }

    return dirty > 0 && !!tpslOrder.quantity && !errors;
  }, [tpslOrder.quantity, maxQty, dirty, errors]);

  const isPositionTPSL = useMemo(() => {
    if (!isEditing) return Number(tpslOrder.quantity) >= maxQty;
    /**
     * if current order is not a POSITIONAL_TP_SL, then it's always a general TP/SL
     */
    if (!!order && order.algo_type !== AlgoOrderRootType.POSITIONAL_TP_SL) {
      return false;
    }
    if (tpslOrder.algo_order_id && tpslOrder.quantity == 0) return true;
    return Number(tpslOrder.quantity) >= maxQty;
  }, [tpslOrder.quantity, maxQty, order?.algo_type, isEditing]);

  useEffect(() => {
    if (!isEditing && isPositionTPSL) {
      const trigger_prices = utils.findTPSLFromOrder(order!);
      if (!tpslOrder.tp_trigger_price && trigger_prices.tp_trigger_price) {
        setOrderPrice("tp_trigger_price", trigger_prices.tp_trigger_price);
      }
      if (!tpslOrder.sl_trigger_price && trigger_prices.sl_trigger_price) {
        setOrderPrice("sl_trigger_price", trigger_prices.sl_trigger_price);
      }
    }
  }, [isEditing, isPositionTPSL, tpslOrder]);

  useEffect(() => {
    const type =
      Number(tpslOrder.quantity) < maxQty
        ? AlgoOrderRootType.TP_SL
        : AlgoOrderRootType.POSITIONAL_TP_SL;
    if (
      typeof options.onTPSLTypeChange === "function" &&
      prevTPSLType.current !== type
    ) {
      options.onTPSLTypeChange(type);
    }

    prevTPSLType.current = type;
  }, [tpslOrder.quantity, maxQty]);

  const cancel = (): Promise<void> => {
    if (order?.algo_order_id && order?.symbol) {
      return deleteOrder(order?.algo_order_id, order?.symbol);
    }
    return Promise.reject("order id or symbol is invalid");
  };

  const onSubmit = async () => {
    if (typeof options.onConfirm !== "function" || !needConfirm) {
      return submit({ accountId: position.account_id })
        .then(() => true)
        .catch((err) => {
          if (err?.message) {
            toast.error(err.message);
          }
          throw false;
        });
    }

    return options.onConfirm(tpslOrder, {
      position,
      submit,
      cancel,
    });
  };

  return {
    isEditing,
    symbolInfo: symbolInfo[symbol],
    maxQty,
    setQuantity,
    orderQuantity: tpslOrder.quantity,
    isPosition: isPositionTPSL,

    TPSL_OrderEntity: tpslOrder,
    setOrderValue: setValue,
    setPnL,
    setOrderPrice,
    // needConfirm,
    onSubmit,
    valid,
    errors,
    status: {
      isCreateMutating,
      isUpdateMutating,
    },
  } as const;
};

export type TPSLBuilderState = ReturnType<typeof useTPSLBuilder>;
