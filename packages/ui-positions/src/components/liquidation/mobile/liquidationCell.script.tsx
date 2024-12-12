import { API } from "@orderly.network/types";

export const useLiquidationCellScript = (props: {
    item: API.Liquidation;
    onSymbolChange?: (symbol: API.Symbol) => void;
    index: number;
}) => {

    return {
        ...props
    };
};

export type LiquidationCellState = ReturnType<typeof useLiquidationCellScript>;
