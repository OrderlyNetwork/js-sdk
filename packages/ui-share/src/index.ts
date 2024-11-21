import { registerSimpleDialog, registerSimpleSheet } from "@orderly.network/ui";
import {
  SharePnLDialogWidget,
  SharePnLBottomSheetWidget,
} from "./sharePnL/sharePnL.widget";

const SharePnLDialogId = "sharePnLDialog";
const SharePnLBottomSheetId = "sharePnLBottomSheet";

registerSimpleDialog(SharePnLDialogId, SharePnLDialogWidget, {
  //   title: "Max account leverage",
  // size: "2xl",
  contentClassName: "!oui-max-w-[624px] oui-p-0",
});

registerSimpleSheet(SharePnLBottomSheetId, SharePnLBottomSheetWidget, {
  title: "Share PnL",
  classNames: {
    body: "oui-pb-4 oui-pt-0"
  }
});

export * from "./sharePnL";
export { SharePnLDialogId, SharePnLBottomSheetId };
export type  { SharePnLConfig, SharePnLParams } from "./types/types";
