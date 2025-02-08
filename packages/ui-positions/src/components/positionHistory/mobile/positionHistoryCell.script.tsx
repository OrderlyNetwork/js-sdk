import { API } from "@orderly.network/types";
import { PositionHistoryExt } from "../positionHistory.script";
import { SymbolInfo } from "../desktop/usePositionHistoryColumn";
import { useSymbolContext } from "../../../providers/symbolProvider";
import { SharePnLConfig } from "@orderly.network/ui-share";

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
