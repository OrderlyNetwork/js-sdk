import { modal } from "@orderly.network/ui";
import { OrderCellState } from "../orderCell.script";
import { EditSheetWidget } from "../editSheet";
import { useCallback } from "react";

export const useEditBtnScript = (props: { state: OrderCellState }) => {
  const { state } = props;
  const onShowEditSheet = useCallback(() => {
    modal.sheet({
      title: "Edit order",
      content: <EditSheetWidget state={state} />,
    });
  }, [state]);

  return {
    ...state,
    onShowEditSheet,
  };
};

export type EditBtnState = ReturnType<typeof useEditBtnScript>;
