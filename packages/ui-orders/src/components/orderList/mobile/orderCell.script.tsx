import { API } from "@orderly.network/types";
import { useSymbolContext } from "../symbolProvider";
import { TabType } from "../../orders.widget";

export const useOrderCellScript = (props: {
  item: API.AlgoOrderExt;
  index: number;
  type: TabType;
  onSymbolChange?: (symbol: API.Symbol) => void;
}) => {
  const symbolInfo = useSymbolContext();
  return {
    ...props,
    ...symbolInfo,
  };
};

export type OrderCellState = ReturnType<typeof useOrderCellScript>;
