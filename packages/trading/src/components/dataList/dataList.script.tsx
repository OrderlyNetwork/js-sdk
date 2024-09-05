import { useLocalStorage } from "@orderly.network/hooks";
import { PositionsProps } from "@orderly.network/ui-positions";
import { useEffect, useState } from "react";

export enum DataListTabType {
    positions = "Positions",
    pending = "Pending",
    tp_sl = "TP/SL",
    filled = "Filled",
    orderHistory = "Order history",
}

export const useDataListScript = (props: {
    current?: DataListTabType;
    config: PositionsProps & {
        symbol?: string;
      };
  }) => {
    const { current, config } = props;
    const [unPnlPriceBasis, setUnPnlPriceBasic] = useLocalStorage('unPnlPriceBasis', 'markPrice');
    const [pnlNotionalDecimalPrecision, setPnlNotionalDecimalPrecision] = useLocalStorage('pnlNotionalDecimalPrecision', 2);
    const [showAllSymbol, setShowAllSymbol] = useLocalStorage('showAllSymbol', true);
    
    return {
        current,
        config,
        unPnlPriceBasis,
        setUnPnlPriceBasic,
        pnlNotionalDecimalPrecision,
        setPnlNotionalDecimalPrecision,
        showAllSymbol,
        setShowAllSymbol,
    };
};

export type DataListState = ReturnType<typeof useDataListScript>;
