import { modal } from "@orderly.network/ui";
import { OrderCellState } from "../orderCell.script";
import { EditSheetWidget } from "../editSheet";
import { useCallback } from "react";
import { useOrderListContext } from "../../orderListContext";

export const useEditBtnScript = (props: { state: OrderCellState }) => {
  const { state } = props;
  const { editAlgoOrder, editOrder } = useOrderListContext();
  const onShowEditSheet = useCallback(() => {
    modal.sheet({
      title: "Edit order",
      content: (
        <EditSheetWidget
          state={state}
          editAlgoOrder={editAlgoOrder}
          editOrder={editOrder}
        />
      ),
    });
  }, [state]);

  return {
    ...state,
    onShowEditSheet,
  };
};

export type EditBtnState = ReturnType<typeof useEditBtnScript>;
