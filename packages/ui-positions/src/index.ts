import { registerSimpleDialog } from "@orderly.network/ui";
import { MarketCloseConfirm } from "./components/positions/closePosition/components/confirmDialog";

export { usePositionsRowContext } from "./components/positions/positionsRowContext";

export { FundingFeeHistoryUI } from "./components/fundingFeeHistory/fundingFeeHistory.ui";
export { FundingFeeButton } from "./components/fundingFeeHistory/fundingFeeButton";

export {
  PositionsWidget,
  MobilePositionsWidget,
  CombinePositionsWidget,
} from "./components/positions/positions.widget";

export type { PositionsProps } from "./types/types";

export const MarketCloseConfirmID = "MarketCloseConfirmID";

registerSimpleDialog(MarketCloseConfirmID, MarketCloseConfirm, {
  size: "md",
  closable: false,
});

export * from "./components/positionHistory";
export * from "./components/liquidation";
export * from "./components/positions/leverage";
