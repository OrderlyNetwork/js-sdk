import { OrderCellState } from "../orderCell.script";
import { useEditBtnScript } from "./editBtn.script";
import { EditBtn } from "./editBtn.ui";

export const EditBtnWidget = (props: { state: OrderCellState }) => {
  const state = useEditBtnScript(props);
  return <EditBtn {...state} />;
};
