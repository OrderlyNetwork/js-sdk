import { useEffect, useState } from "react";

import {
  API,
  AlgoOrderEntry,
  OrderSide,
  SDKError,
} from "@orderly.network/types";
import { UpdateOrderKey, calculateHelper } from "./utils";
import { useMutation } from "../../useMutation";
import { OrderFactory } from "../../services/orderCreator/factory";
import { AlogOrderRootType } from "@orderly.network/types";

export type ValidateError = {
  tp_tigger_price?: string | null;
  sl_tigger_price?: string | null;
  qty?: string | null;
};

export type ComputedAlgoOrder = Partial<
  AlgoOrderEntry<AlogOrderRootType.TP_SL> & {
    /**
     * Computed take profit
     */
    tp_pnl: number;
    tp_offset: number;
    tp_offset_percentage: number;

    /**
     * Computed stop loss
     */
    sl_pnl: number;
    sl_offset: number;
    sl_offset_percentage: number;
  }
>;

/**
 * @hidden
 */
export const useTaskProfitAndStopLossInternal = (
  position: Partial<API.PositionTPSLExt> & Pick<API.PositionTPSLExt, "symbol">,
  options?: {}
): [
  ComputedAlgoOrder,
  {
    /**
     * Update the take profit and stop loss order, this will merge the new data with the old one
     */
    setValue: (key: UpdateOrderKey, value: number | string) => void;
    setValues: (values: Partial<ComputedAlgoOrder>) => void;
    /**
     * Submit the take profit and stop loss order
     */
    submit: () => Promise<void>;
    error: ValidateError | null;
  }
] => {
  const [order, setOrder] = useState<ComputedAlgoOrder>({
    symbol: position.symbol,
    quantity: position.position_qty,
  });

  const [submitOrder] = useMutation("algoOrder");

  // const [orderComputed, setOrderComputed] = useState<Partial<API.PositionTPSLExt>>(position);

  const [error, setError] = useState<ValidateError | null>(null);

  const updateOrder = (key: UpdateOrderKey, value: number | string) => {
    const newValue = calculateHelper(key, {
      key,
      value: Number(value),
      entryPrice: position.average_open_price!,
      qty: position.position_qty!,
      orderSide: position.position_qty! > 0 ? OrderSide.BUY : OrderSide.SELL,
    });
    setOrder((prev) => ({ ...prev, ...newValue }));
  };

  const setValues = (values: Partial<ComputedAlgoOrder>) => {};

  const validate = (): ValidateError => {
    const errors: ValidateError = {};

    return errors;
  };

  useEffect(() => {
    setError(validate());
  }, [order]);

  const submit = async () => {
    const orderCreator = OrderFactory.create(
      AlogOrderRootType.POSITIONAL_TP_SL
    );
    return submitOrder(
      orderCreator.create(order as AlgoOrderEntry<AlogOrderRootType.TP_SL>, {})
    );
  };

  return [
    order,
    {
      submit,
      setValue: updateOrder,
      setValues,

      error,
    },
  ];
};
