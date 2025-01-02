import { API } from "@orderly.network/types";
import { useSymbolContext } from "../symbolProvider";
import { TabType } from "../../orders.widget";
import { SharePnLConfig, SharePnLParams } from "@orderly.network/ui-share";

export const useOrderCellScript = (props: {
  item: API.AlgoOrderExt;
  index: number;
  type: TabType;
  sharePnLConfig?: SharePnLConfig &
    Partial<Omit<SharePnLParams, "position" | "refCode" | "leverage">>;
  onSymbolChange?: (symbol: API.Symbol) => void;
}) => {
  const symbolInfo = useSymbolContext();
  return {
    ...props,
    ...symbolInfo,
  };
};

export type OrderCellState = ReturnType<typeof useOrderCellScript>;
