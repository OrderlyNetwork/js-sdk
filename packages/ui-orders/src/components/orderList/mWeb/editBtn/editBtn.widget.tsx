import { FC } from "react";
import { useEditBtnScript } from "./editBtn.script";
import { EditBtn } from "./editBtn.ui";
import { OrderCellState } from "../orderCell.script";

export const EditBtnWidget = (props: {
    state : OrderCellState;
}) => {
    const state = useEditBtnScript(props);
    return (<EditBtn {...state} />);
};
