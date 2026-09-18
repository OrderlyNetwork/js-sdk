import type { PositionsProps } from "@orderly.network/ui-positions";
import {
  usePendingOrderCount,
  usePositionsCount,
  useTradingLocalStorage,
} from "../../../hooks";
import { useTradingPageContext } from "../../../provider/tradingPageContext";
import type { TradingPageProps } from "../../../types/types";

export enum DataListTabType {
  positions = "Positions",
  pending = "Pending",
  tp_sl = "TP/SL",
  filled = "Filled",
  positionHistory = "Position history",
  orderHistory = "Order history",
  liquidation = "Liquidation",
  assets = "Assets",
}

export const useDataListScript = (
  inputs: { current?: DataListTabType } & PositionsProps &
    Pick<TradingPageProps, "dataListProductContent">,
) => {
  const {
    current,
    pnlNotionalDecimalPrecision,
    sharePnLConfig,
    symbol,
    includedPendingOrder,
    dataListProductContent,
  } = inputs;

  const localStorage = useTradingLocalStorage({ pnlNotionalDecimalPrecision });

  const { onSymbolChange } = useTradingPageContext();

  const { positionCount } = usePositionsCount(symbol);

  const { pendingOrderCount, tpSlOrderCount } = usePendingOrderCount(symbol);

  return {
    current,
    sharePnLConfig,
    symbol,
    calcMode: localStorage.unPnlPriceBasis,
    includedPendingOrder,
    dataListProductContent,
    ...localStorage,
    positionCount,
    pendingOrderCount,
    tpSlOrderCount,
    onSymbolChange,
  };
};

export type DataListState = ReturnType<typeof useDataListScript>;
