import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useState,
} from "react";
import { QtyMode, TotalMode } from "./types";
import { BasicSymbolInfo } from "../../../types/types";

export interface OrderBookContextValue {
  cellHeight: number;
  mode: QtyMode;
  depth?: string;
  onModeChange?: (mode: QtyMode) => void;
  onItemClick?: (item: number[]) => void;
  showTotal: boolean;
  totalMode: TotalMode;
  pendingOrders: number[];
  onTotalModeChange?: (mode: TotalMode) => void;
  symbolInfo: BasicSymbolInfo;
}

export const OrderBookContext = createContext({
  cellHeight: 22,
} as OrderBookContextValue);

export const useOrderBookContext = () => useContext(OrderBookContext);

interface OrderBookProviderProps {
  cellHeight: number;
  depth?: string;
  showTotal: boolean;
  pendingOrders: number[];
  onItemClick?: (item: number[]) => void;
  symbolInfo: BasicSymbolInfo;
}

export const OrderBookProvider: FC<
  PropsWithChildren<OrderBookProviderProps>
> = (props) => {
  const [mode, setMode] = useState<QtyMode>("quantity");
  const [totalMode, setTotalMode] = useState<QtyMode>("quantity");
  return (
    <OrderBookContext.Provider
      value={{
        cellHeight: props.cellHeight,
        onItemClick: props.onItemClick,
        mode,
        totalMode: totalMode || "quantity",
        depth: props.depth,
        onModeChange: setMode,
        onTotalModeChange: setTotalMode,
        showTotal: props.showTotal || false,
        pendingOrders: props.pendingOrders,
        symbolInfo: props.symbolInfo,
      }}
    >
      {props.children}
    </OrderBookContext.Provider>
  );
};
