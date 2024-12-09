import { registerSimpleDialog } from "@orderly.network/ui";
import { MarketCloseConfirm } from "./components/positions/desktop/closeButton";

export {
  PositionsWidget,
  MobilePositionsWidget,
} from "./components/positions/positions.widget";

export type { PositionsProps } from "./types/types";

export const MarketCloseConfirmID = "MarketCloseConfirmID";
registerSimpleDialog(MarketCloseConfirmID, MarketCloseConfirm, {
  size: "md",
  closable: false,
});


export * from "./components/positionHistory";