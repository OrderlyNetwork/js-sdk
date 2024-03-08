import { useState } from "react";

import { API, AlgoOrderEntry, SDKError } from "@orderly.network/types";

type ValidateError = {
  tp_tigger_price?: string | null;
  sl_tigger_price?: string | null;
  qty?: string | null;
};

type UpdateOrderKey =
  | "tp_trigger_price"
  | "sl_trigger_price"
  | "quantity"
  | "tp_offset"
  | "sl_offset"
  | "tp_offset_percentage"
  | "sl_offset_percentage";

export const useTaskProfitAndStopLoss = (
  /**
   * Position that needs to set take profit and stop loss
   */
  position: Partial<API.PositionTPSLExt> & Pick<API.PositionTPSLExt, "symbol">,
  options?: {}
): [
  Partial<AlgoOrderEntry>,
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
  if (!position) {
    throw new SDKError("Position is required");
  }

  const [order, setOrder] = useState<Partial<AlgoOrderEntry>>({
    symbol: position.symbol,
  });

  const [error, setError] = useState<ValidateError | null>(null);

  const updateOrder = (key: UpdateOrderKey, value: number | string) => {
    // return setOrder((prev) => ({ ...prev, ...newOrder }));
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
