import { useState } from "react";

import { API, AlgoOrderEntry } from "@orderly.network/types";

type ValidateError = {
  tp_tigger_price?: string | null;
  sl_tigger_price?: string | null;
  qty?: string | null;
};

export const useTaskProfitAndStopLoss = (
  /**
   * Position that needs to set take profit and stop loss
   */
  position: API.PositionTPSLExt,
  options?: {
    /**
     * How to compute the TP/SL price or PnL/Percentage/Offset
     */
    computeMode: "offsetPercentage" | "offset" | "pnl";
  }
): {
  /**
   * Submit the take profit and stop loss order
   */
  submit: () => Promise<void>;
  error: ValidateError | null;
} => {
  const [order, setOrder] = useState<Partial<AlgoOrderEntry>>({
    symbol: position.symbol,
  });

  const [error, setError] = useState<ValidateError | null>(null);

  const submit = async () => {};

  return {
    submit,

    error,
  };
};
