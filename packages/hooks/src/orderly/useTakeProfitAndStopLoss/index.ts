import { API, SDKError } from "@orderly.network/types";
import { useTaskProfitAndStopLossInternal } from "./useTPSL";
import { useMarkPrice } from "../useMarkPrice";

export const useTaskProfitAndStopLoss = (
  /**
   * Position that needs to set take profit and stop loss
   */
  position: Partial<API.PositionTPSLExt> &
    Pick<API.PositionTPSLExt, "symbol" | "average_open_price">
): ReturnType<typeof useTaskProfitAndStopLossInternal> => {
  if (!position) {
    throw new SDKError("Position is required");
  }

  // const { data: markPrice } = useMarkPrice(position.symbol);

  const result = useTaskProfitAndStopLossInternal(position);

  return result;
};

export type { ComputedAlgoOrder } from "./useTPSL";
