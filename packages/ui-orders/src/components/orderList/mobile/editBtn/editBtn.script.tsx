import { modal } from "@orderly.network/ui";
import { OrderCellState } from "../orderCell.script";
import { EditSheetWidget } from "../editSheet";
import { useCallback } from "react";
import { useOrderListContext } from "../../orderListContext";
import { TabType } from "../../../orders.widget";
import { PositionTPSLSheet } from "@orderly.network/ui-tpsl";
import { useTPSLOrderRowContext } from "../../tpslOrderRowContext";
import { useTranslation } from "@orderly.network/i18n";

export const useEditBtnScript = (props: { state: OrderCellState }) => {
  const { state } = props;
  const { t } = useTranslation();

  const { editAlgoOrder, editOrder } = useOrderListContext();
  const { order, position } = useTPSLOrderRowContext();

  const onShowEditSheet = useCallback(() => {
    if (props.state.type === TabType.tp_sl) {
      modal
        .sheet({
          title: t("tpsl.title"),
          content: (
            <PositionTPSLSheet
              isEditing
              order={props.state.item}
              position={position!}
              symbolInfo={props.state.origin}
            />
          ),
        })
        .catch((error) => {
          console.log(error);
        });
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
              position={position}
              state={state}
              editAlgoOrder={editAlgoOrder}
              editOrder={editOrder}
            />
          ),
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }, [state]);

  return {
    ...state,
    onShowEditSheet,
  };
};

export type EditBtnState = ReturnType<typeof useEditBtnScript>;
