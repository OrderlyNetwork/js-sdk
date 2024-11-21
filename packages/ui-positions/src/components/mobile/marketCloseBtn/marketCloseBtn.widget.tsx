import { PositionCellState } from "../positionCell/positionCell.script";
import { useMarketCloseBtnScript } from "./marketCloseBtn.script";
import { MarketCloseBtn } from "./marketCloseBtn.ui";

export const MarketCloseBtnWidget = (props: { state: PositionCellState }) => {
  const state = useMarketCloseBtnScript(props);
  return <MarketCloseBtn {...state} />;
};
