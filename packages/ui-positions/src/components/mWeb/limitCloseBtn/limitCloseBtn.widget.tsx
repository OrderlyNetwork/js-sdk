import { PositionCellState } from "../positionCell/positionCell.script";
import { useLimitCloseBtnScript } from "./limitCloseBtn.script";
import { LimitCloseBtn } from "./limitCloseBtn.ui";

export const LimitCloseBtnWidget = (props: {
    state: PositionCellState;
}) => {
    const state = useLimitCloseBtnScript(props);
    return (<LimitCloseBtn {...state} />);
};
