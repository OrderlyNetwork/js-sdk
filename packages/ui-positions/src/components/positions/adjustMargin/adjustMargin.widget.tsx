import { API } from "@orderly.network/types";
import {
  useScreen,
  modal,
  registerSimpleDialog,
  registerSimpleSheet,
} from "@orderly.network/ui";
import { AdjustMargin } from "./adjustMargin.ui";

export const AdjustMarginDialogId = "AdjustMarginDialog";
export const AdjustMarginSheetId = "AdjustMarginSheet";

export type AdjustMarginWidgetProps = {
  position: API.PositionTPSLExt;
  symbol: string;
};

export const AdjustMarginWidget = (props: AdjustMarginWidgetProps) => {
  const { isMobile } = useScreen();
  const close = () =>
    modal.hide(isMobile ? AdjustMarginSheetId : AdjustMarginDialogId);
  return <AdjustMargin {...props} close={close} />;
};

registerSimpleDialog(AdjustMarginDialogId, AdjustMarginWidget, {
  title: undefined,
  closable: false,
  classNames: {
    content: "oui-w-[420px] oui-bg-transparent oui-p-0",
    body: "oui-p-0",
  },
});

registerSimpleSheet(AdjustMarginSheetId, AdjustMarginWidget, {
  title: undefined,
  closable: false,
  classNames: {
    content: "oui-h-full",
    body: "oui-p-0",
  },
});
