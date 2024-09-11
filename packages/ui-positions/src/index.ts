import { registerSimpleDialog } from "@orderly.network/ui";
import { MarketCloseConfirm } from "./components/closeButton";

export { PositionsWidget } from "./components/positions.widget";
export { TPSLWidget } from "./components/tpsl/tpsl.widget";
export { TPSLEditorWidget } from "./components/tpsl/dialog/tpslDialog.widget";
export { PositionTPSLConfirm } from "./components/tpsl/tpsl.ui";
export type { PositionsProps } from "./types/types";

export const MarketCloseConfirmID = "MarketCloseConfirmID";
registerSimpleDialog(MarketCloseConfirmID, MarketCloseConfirm, {
  size: "md",
  closable: false,
});
