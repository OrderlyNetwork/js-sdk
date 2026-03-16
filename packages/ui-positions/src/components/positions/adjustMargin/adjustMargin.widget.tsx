import { API } from "@orderly.network/types";
import {
  useScreen,
  modal,
  registerSimpleDialog,
  registerSimpleSheet,
} from "@orderly.network/ui";
import { useAdjustMarginScript } from "./adjustMargin.script";
import { AdjustMargin } from "./adjustMargin.ui";

export const AdjustMarginDialogId = "AdjustMarginDialog";
export const AdjustMarginSheetId = "AdjustMarginSheet";

export type AdjustMarginWidgetProps = {
  position: API.PositionTPSLExt;
  symbol: string;
};

export const AdjustMarginWidget = (props: AdjustMarginWidgetProps) => {
  const { isMobile } = useScreen();
  const state = useAdjustMarginScript({
    position: props.position,
    symbol: props.symbol,
    close: () =>
      modal.hide(isMobile ? AdjustMarginSheetId : AdjustMarginDialogId),
  });

  return <AdjustMargin {...state} />;
};

registerSimpleDialog(AdjustMarginDialogId, AdjustMarginWidget, {
  title: undefined,
  closable: false,
  size: "sm",
});

registerSimpleSheet(AdjustMarginSheetId, AdjustMarginWidget, {
  title: undefined,
  closable: false,
});
