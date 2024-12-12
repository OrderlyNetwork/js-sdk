import { API } from "@orderly.network/types";
import { PositionHistoryExt } from "../positionHistory.script";
import { usePositionHistoryCellScript } from "./positionHistoryCell.script";
import { PositionHistoryCell } from "./positionHistoryCell.ui";

export const PositionHistoryCellWidget = (props: {
  item: PositionHistoryExt;
  onSymbolChange?: (symbol: API.Symbol) => void;
  index: number;
  classNames?: {
    root?: string;
  };
}) => {
  const state = usePositionHistoryCellScript(props);
  return <PositionHistoryCell {...state} />;
};
