import { API, OrderEntity } from "@orderly.network/types";
import { OrderCellState } from "../orderCell.script";
import { useEditSheetScript } from "./editSheet.script";
import { EditSheet } from "./editSheet.ui";

export const EditSheetWidget = (props: {
  state: OrderCellState;
  editAlgoOrder: (id: string, order: OrderEntity) => Promise<any>;
  editOrder: (id: string, order: OrderEntity) => Promise<any>;
  autoCheckInput?: boolean;
  position?: API.PositionTPSLExt;
}) => {
  const state = useEditSheetScript(props);
  return <EditSheet {...state} />;
};
