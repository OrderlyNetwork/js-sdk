import {
  type ComputedAlgoOrder,
  useLocalStorage,
  useSymbolsInfo,
  useTPSLOrder,
} from "@orderly.network/hooks";
import { AlgoOrderRootType, AlgoOrderType, API } from "@orderly.network/types";
import { useMemo } from "react";

export type TPSLBuilderOptions = {
  position: API.Position;
  order?: API.AlgoOrder;

  /**
   * either show the confirm dialog or not,
   * if the Promise reject or return false, cancel the sumbit action
   */
  onConfirm?: (
    order: ComputedAlgoOrder,
    options: {
      position: API.Position;
      submit: () => Promise<void>;
    }
  ) => Promise<boolean>;
};

export const useTPSLBuilder = (options: TPSLBuilderOptions) => {
  const { position, order } = options;
  const isEditing = !!order;
  const symbol = isEditing ? order.symbol : position.symbol;
  const symbolInfo = useSymbolsInfo();

  const [tpslOrder, { submit, setValue, validate, errors, isCreateMutating }] =
    useTPSLOrder(
      {
        symbol,
        position_qty: position.position_qty,
        average_open_price: position.average_open_price,
      },
      {
        defaultOrder: order,
      }
    );

  const setQuantity = (value: number | string) => {
    setValue("quantity", value);
  };

  const setOrderPrice = (
    name: "tp_trigger_price" | "sl_trigger_price",
    value: number | string
  ) => {
    setValue(name, value);
  };

  const setPnL = (type: string, value: number | string) => {
    setValue(type, value);
  };

  const maxQty = useMemo(() => position.position_qty, [position.position_qty]);

  const dirty = useMemo(() => {
    const quantity =
      order?.algo_type === AlgoOrderRootType.POSITIONAL_TP_SL
        ? maxQty
        : order?.quantity;

    let diff: number = 0;

    if (Number(tpslOrder.quantity) !== quantity) {
      diff = 1;
    }

    if (order) {
      const tp = order.child_orders.find(
        (o) => o.algo_type === AlgoOrderType.TAKE_PROFIT
      );
      const sl = order.child_orders.find(
        (o) => o.algo_type === AlgoOrderType.STOP_LOSS
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
  ]);

  const valid = useMemo(() => {
    if (
      order?.algo_type === AlgoOrderRootType.POSITIONAL_TP_SL &&
      Number(tpslOrder.quantity) < maxQty &&
      !tpslOrder.tp_trigger_price &&
      !tpslOrder.sl_trigger_price
    ) {
      return false;
    }

    return dirty > 0 && !!tpslOrder.quantity;
  }, [tpslOrder.quantity, maxQty, dirty]);

  const onSubmit = async () => {
    return Promise.resolve()
      .then(() => {
        if (typeof options.onConfirm !== "function") {
          return submit().then(() => true);
        }
        return options.onConfirm(tpslOrder, {
          position,
          submit,
        });
      })
      .then((isSuccess) => {
        console.log("result", isSuccess);
        // if (isConfirm) {
        //   return submit();
        // }
        // return;
      });
  };

  return {
    isEditing,
    symbolInfo: symbolInfo[symbol],
    maxQty,
    setQuantity,
    orderQuantity: tpslOrder.quantity,
    isPosition: tpslOrder.quantity === position.position_qty,

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
    },
  } as const;
};

export type TPSLBuilderState = ReturnType<typeof useTPSLBuilder>;
