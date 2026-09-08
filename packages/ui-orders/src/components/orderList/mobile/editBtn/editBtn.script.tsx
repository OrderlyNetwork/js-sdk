import { useCallback, useState } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { modal } from "@orderly.network/ui";
import { TabType } from "../../../orders.widget";
import { useOrderListContext } from "../../orderListContext";
import { useTPSLOrderRowContext } from "../../tpslOrderRowContext";
import { EditSheetWidget } from "../editSheet";
import { OrderCellState } from "../orderCell.script";

export const useEditBtnScript = (props: { state: OrderCellState }) => {
  const { state } = props;
  const { t } = useTranslation();
  const [tpslSheetMounted, setTPSLSheetMounted] = useState(false);
  const [tpslSheetOpen, setTPSLSheetOpen] = useState(false);

  const { editAlgoOrder, editOrder } = useOrderListContext();
  const { position } = useTPSLOrderRowContext();

  const onShowEditSheet = useCallback(() => {
    if (props.state.type === TabType.tp_sl) {
      setTPSLSheetMounted(true);
      setTPSLSheetOpen(true);
    } else {
      modal
        .sheet({
          title: t("orders.editOrder"),
          // size: "xs",
          classNames: {
            content: "oui-bg-base-8",
          },
          content: (
            <EditSheetWidget
              state={state}
              position={position}
              editAlgoOrder={editAlgoOrder}
              editOrder={editOrder}
            />
          ),
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }, [editAlgoOrder, editOrder, position, state, t]);

  return {
    ...state,
    onShowEditSheet,
    position,
    tpslSheetMounted,
    tpslSheetOpen,
    setTPSLSheetOpen,
  };
};

export type EditBtnState = ReturnType<typeof useEditBtnScript>;
