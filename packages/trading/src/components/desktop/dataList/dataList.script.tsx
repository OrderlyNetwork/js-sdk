import { PositionsProps } from "@orderly.network/ui-positions";
import { useTradingLocalStorage } from "../../../provider/useTradingLocalStorage";
import { usePositionsCount } from "../../../provider/usePositionsCount";
import { usePendingOrderCount } from "../../../provider/usePendingOrderCount";

export enum DataListTabType {
  positions = "Positions",
  pending = "Pending",
  tp_sl = "TP/SL",
  filled = "Filled",
  orderHistory = "Order history",
}

export const useDataListScript = (
  props: {
    current?: DataListTabType;
    tabletMediaQuery: string;
  } & PositionsProps
) => {
  const {
    current,
    tabletMediaQuery,
    pnlNotionalDecimalPrecision,
    sharePnLConfig,
    symbol,
    calcMode,
    includedPendingOrder,
  } = props;
  const loalStorage = useTradingLocalStorage({
    pnlNotionalDecimalPrecision,
  });

  const { positionCount } = usePositionsCount(props.symbol);
  const { pendingOrderCount, tpSlOrderCount } = usePendingOrderCount(
    props.symbol
  );

  return {
    current,
    tabletMediaQuery,

    sharePnLConfig,
    symbol,
    calcMode,
    includedPendingOrder,
    ...loalStorage,
    positionCount,
    pendingOrderCount,
    tpSlOrderCount,
  };
};

export type DataListState = ReturnType<typeof useDataListScript>;
