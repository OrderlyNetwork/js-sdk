import { modal } from "@orderly.network/ui";
import { OrderCellState } from "../orderCell.script";
import { EditSheetWidget } from "../editSheet";
import { useCallback } from "react";
import { useOrderListContext } from "../../orderListContext";
import { TabType } from "../../../orders.widget";
import { PositionTPSLSheet } from "@orderly.network/ui-tpsl";
import { useTPSLOrderRowContext } from "../../tpslOrderRowContext";

export const useEditBtnScript = (props: { state: OrderCellState }) => {
  const { state } = props;
  const { editAlgoOrder, editOrder } = useOrderListContext();
  const { order, position } = useTPSLOrderRowContext();
  const onShowEditSheet = useCallback(() => {
    if (props.state.type === TabType.tp_sl) {
      modal.sheet({
        title: "TP/SL",
        content: (
          <PositionTPSLSheet
            isEditing
            order={props.state.item}
            position={position!}
            symbolInfo={props.state.origin}
          />
        ),
      });
    } else {
      modal.sheet({
        title: "Edit order",
        // size: "xs",
        content: (
          <EditSheetWidget
            state={state}
            editAlgoOrder={editAlgoOrder}
            editOrder={editOrder}
          />
        ),
      });
    }
  }, [state]);

  return {
    ...state,
    onShowEditSheet,
  };
};

export type EditBtnState = ReturnType<typeof useEditBtnScript>;
