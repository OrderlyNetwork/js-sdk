import { FC } from "react";
import { OrderCellState } from "../orderCell.script";

export const useCancelBtnScript = (props: {
    state : OrderCellState;
}) => {
    const { state } = props;
    return {
        ...state,
    };
};

export type CancelBtnState = ReturnType<typeof useCancelBtnScript>;
