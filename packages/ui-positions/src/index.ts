import { registerSimpleDialog } from "@orderly.network/ui";
import { MarketCloseConfirm } from "./components/desktop/closeButton";

export { PositionsWidget, MobilePositionsWidget } from "./components/positions.widget";
export { TPSLWidget } from "./components/desktop/tpsl/tpsl.widget";
export { TPSLEditorWidget } from "./components/desktop/tpsl/dialog/tpslDialog.widget";
export { PositionTPSLConfirm } from "./components/desktop/tpsl/tpsl.ui";
export type { PositionsProps } from "./types/types";

export const MarketCloseConfirmID = "MarketCloseConfirmID";
registerSimpleDialog(MarketCloseConfirmID, MarketCloseConfirm, {
  size: "md",
  closable: false,
});
