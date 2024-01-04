import { createContext, FC, PropsWithChildren, useState } from "react";
import { QtyMode, TotalMode } from "./types";

export interface OrderBookContextValue {
  cellHeight: number;
  mode: QtyMode;
  depth: number;
  onModeChange?: (mode: QtyMode) => void;
  onItemClick?: (item: number[]) => void;
  showTotal: boolean;
  totalMode: TotalMode;
  onTotalModeChange?: (mode: TotalMode) => void;
}

export const OrderBookContext = createContext({
  cellHeight: 22,
} as OrderBookContextValue);

interface OrderBookProviderProps {
  cellHeight: number;
  depth: number;
  showTotal: boolean;
  onItemClick?: (item: number[]) => void;
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
      }}
    >
      {props.children}
    </OrderBookContext.Provider>
  );
};
