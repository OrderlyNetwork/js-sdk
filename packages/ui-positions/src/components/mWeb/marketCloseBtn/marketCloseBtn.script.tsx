import { useSymbolContext } from "../../../providers/symbolProvider";
import { PositionCellState } from "../positionCell/positionCell.script";

export const useMarketCloseBtnScript = (props: { state: PositionCellState }) => {
    const symbolInfo = useSymbolContext();
    return {
        ...props,
        ...symbolInfo,
    };
};

export type MarketCloseBtnState = ReturnType<typeof useMarketCloseBtnScript>;
