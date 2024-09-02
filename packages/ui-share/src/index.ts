import { registerSimpleDialog } from "@orderly.network/ui";
import { SharePnLWidget } from "./sharePnL";

const SharePnLWidgetId = "leverageEditor";

export { SharePnLWidget } from "./sharePnL";

registerSimpleDialog(SharePnLWidgetId, SharePnLWidget, {
//   title: "Max account leverage",
  size: "md",
});

export { SharePnLWidgetId };
