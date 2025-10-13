import { API } from "@kodiak-finance/orderly-types";
import { SharePnLConfig } from "@kodiak-finance/orderly-ui-share";
import { useSymbolContext } from "../../../provider/symbolContext";
import { PositionHistoryExt } from "../positionHistory.script";

export const usePositionHistoryCellScript = (props: {
  item: PositionHistoryExt;
  onSymbolChange?: (symbol: API.Symbol) => void;
  index: number;
  classNames?: {
    root?: string;
  };
  sharePnLConfig?: SharePnLConfig;
}) => {
  const symbolInfo = useSymbolContext();

  return {
    ...props,
    ...symbolInfo,
  };
};

export type PositionHistoryCellState = ReturnType<
  typeof usePositionHistoryCellScript
>;
