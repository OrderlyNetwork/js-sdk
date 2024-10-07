import { FC } from "react";
import { OrderCellState } from "../orderCell.script";

export const useEditBtnScript = (props: {
    state : OrderCellState;
}) => {
    const { state } = props;
    return {
        ...state,
    };
};

export type EditBtnState = ReturnType<typeof useEditBtnScript>;
