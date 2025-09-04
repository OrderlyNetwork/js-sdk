import { PositionsProps } from "@orderly.network/ui-positions";
import {
  usePendingOrderCount,
  usePositionsCount,
  useTradingLocalStorage,
} from "../../../hooks";
import { useTradingPageContext } from "../../../provider/tradingPageContext";

export enum DataListTabType {
  positions = "Positions",
  pending = "Pending",
  tp_sl = "TP/SL",
  filled = "Filled",
  positionHistory = "Position history",
  orderHistory = "Order history",
  liquidation = "Liquidation",
}

export const useDataListScript = (
  props: { current?: DataListTabType } & PositionsProps,
) => {
  const {
    current,
    pnlNotionalDecimalPrecision,
    sharePnLConfig,
    symbol,
    includedPendingOrder,
  } = props;
  const localStorage = useTradingLocalStorage({
    pnlNotionalDecimalPrecision,
  });
  const { onSymbolChange } = useTradingPageContext();

  const { positionCount } = usePositionsCount(props.symbol);
  const { pendingOrderCount, tpSlOrderCount } = usePendingOrderCount(
    props.symbol,
  );

  return {
    current,
    sharePnLConfig,
    symbol,
    calcMode: localStorage.unPnlPriceBasis,
    includedPendingOrder,
    ...localStorage,
    positionCount,
    pendingOrderCount,
    tpSlOrderCount,
    onSymbolChange,
  };
};

export type DataListState = ReturnType<typeof useDataListScript>;
