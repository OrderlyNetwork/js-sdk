import { registerSimpleDialog } from "@orderly.network/ui";
import { MarketCloseConfirm } from "./components/desktop/closeButton";

export {
  PositionsWidget,
  MobilePositionsWidget,
} from "./components/positions.widget";

export type { PositionsProps } from "./types/types";

export const MarketCloseConfirmID = "MarketCloseConfirmID";
registerSimpleDialog(MarketCloseConfirmID, MarketCloseConfirm, {
  size: "md",
  closable: false,
});
