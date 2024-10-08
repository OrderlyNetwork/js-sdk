import { OrderCellState } from "../orderCell.script";
import { useEditSheetScript } from "./editSheet.script";
import { EditSheet } from "./editSheet.ui";

export const EditSheetWidget = (props: { state: OrderCellState }) => {
    const state = useEditSheetScript(props);
    return (<EditSheet {...state} />);
};
