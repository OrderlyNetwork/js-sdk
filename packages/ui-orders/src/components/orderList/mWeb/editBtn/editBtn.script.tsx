import { modal } from "@orderly.network/ui";
import { OrderCellState } from "../orderCell.script";
import { EditSheetWidget } from "../editSheet";
import { useCallback } from "react";
import { useOrderListContext } from "../../orderListContext";
import { TabType } from "../../../orders.widget";

export const useEditBtnScript = (props: { state: OrderCellState }) => {
  const { state } = props;
  const { editAlgoOrder, editOrder } = useOrderListContext();
  const onShowEditSheet = useCallback(() => {
    if (props.state.type === TabType.tp_sl) {
      // TODO: show tp/sl edit
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
