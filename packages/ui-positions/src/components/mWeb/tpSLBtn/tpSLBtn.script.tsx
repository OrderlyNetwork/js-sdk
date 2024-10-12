import { useSymbolContext } from "../../../providers/symbolProvider";
import { PositionCellState } from "../positionCell/positionCell.script";

export const useTpSLBtnScript = (props: { state: PositionCellState }) => {
    const symbolInfo = useSymbolContext();
    return {
        ...props,
        ...symbolInfo,
    };
};

export type TpSLBtnState = ReturnType<typeof useTpSLBtnScript>;
