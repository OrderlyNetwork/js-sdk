import { i18n } from "@kodiak-finance/orderly-i18n";
import { OrderlyOrder } from "@kodiak-finance/orderly-types";
import { registerSimpleDialog, registerSimpleSheet } from "@kodiak-finance/orderly-ui";
import { TPSLAdvancedUI } from "./tpslAdvanced.ui";
import { useTPSLAdvanced } from "./useTPSLAdvanced.script";

type Props = {
  order: OrderlyOrder;
  setOrderValue: (key: string, value: any) => void;
  onSubmit: (formattedOrder: OrderlyOrder) => void;
  onClose: () => void;
  symbolLeverage?: number;
};

export const TPSLAdvancedWidget = (props: Props) => {
  const state = useTPSLAdvanced({
    order: props.order,
    setOrderValue: props.setOrderValue,
    onSubmit: props.onSubmit,
    onClose: props.onClose,
    symbolLeverage: props.symbolLeverage,
  });
  return <TPSLAdvancedUI {...state} />;
};

export const TPSLAdvancedSheetId = "TPSLAdvancedSheetId";
export const TPSLAdvancedDialogId = "TPSLAdvancedDialogId";

registerSimpleSheet(TPSLAdvancedSheetId, TPSLAdvancedWidget, {
  title: () => i18n.t("common.settings"),
});

registerSimpleDialog(TPSLAdvancedDialogId, TPSLAdvancedWidget, {
  title: () => i18n.t("common.settings"),
});
