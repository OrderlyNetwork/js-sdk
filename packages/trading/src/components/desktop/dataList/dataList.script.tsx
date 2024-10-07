import { useLocalStorage } from "@orderly.network/hooks";
import { PositionsProps } from "@orderly.network/ui-positions";
import { useEffect, useState } from "react";
import { useTradingLocalStorage } from "../../../provider/useTradingLocalStorage";

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
  tabletMediaQuery: string;
}) => {
  const { current, config, tabletMediaQuery } = props;
  const loalStorage = useTradingLocalStorage();

  return {
    current,
    config,
    ...loalStorage,
    tabletMediaQuery,
  };
};

export type DataListState = ReturnType<typeof useDataListScript>;
