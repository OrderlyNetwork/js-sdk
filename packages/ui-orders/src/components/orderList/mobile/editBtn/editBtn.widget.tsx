import { TPSLEditModal } from "@orderly.network/ui-tpsl";
import { TabType } from "../../../orders.widget";
import { OrderCellState } from "../orderCell.script";
import { useEditBtnScript } from "./editBtn.script";
import { EditBtn } from "./editBtn.ui";

export const EditBtnWidget = (props: { state: OrderCellState }) => {
  const state = useEditBtnScript(props);
  return (
    <>
      <EditBtn {...state} />
      {state.type === TabType.tp_sl && state.tpslSheetMounted && (
        <TPSLEditModal
          mode="sheet"
          open={state.tpslSheetOpen}
          onOpenChange={state.setTPSLSheetOpen}
          order={props.state.item}
          position={state.position}
        />
      )}
    </>
  );
};
