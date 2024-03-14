import { useState } from "react";

import { API, AlgoOrderEntry, SDKError } from "@orderly.network/types";
import { calculateHelper } from "./utils";

export type ValidateError = {
  tp_tigger_price?: string | null;
  sl_tigger_price?: string | null;
  qty?: string | null;
};

export type UpdateOrderKey =
  | "tp_trigger_price"
  | "sl_trigger_price"
  | "quantity"
  | "tp_offset"
  | "sl_offset"
  | "tp_offset_percentage"
  | "sl_offset_percentage";

export type ComputedAlgoOrder = Partial<
  AlgoOrderEntry & {
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
  markPrice: number,
  options?: {}
): [
  ComputedAlgoOrder,
  {
    /**
     * Update the take profit and stop loss order, this will merge the new data with the old one
     */
    updateOrder: (key: UpdateOrderKey, value: number | string) => void;
    /**
     * Submit the take profit and stop loss order
     */
    submit: () => Promise<void>;
    error: ValidateError | null;
  }
] => {
  const [order, setOrder] = useState<ComputedAlgoOrder>({
    symbol: position.symbol,
  });

  // const [orderComputed, setOrderComputed] = useState<Partial<API.PositionTPSLExt>>(position);

  const [error, setError] = useState<ValidateError | null>(null);

  const updateOrder = (key: UpdateOrderKey, value: number | string) => {
    const newValue = calculateHelper({
      key,
      value: Number(value),
      markPrice,
    });

    return setOrder((prev) => ({ ...prev, ...newValue }));
  };

  const validate = () => {
    const newError: ValidateError = {};

    return true;
  };

  const submit = async () => {};

  return [
    order,
    {
      submit,
      updateOrder,

      error,
    },
  ];
};
