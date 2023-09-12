import { createContext, FC, PropsWithChildren, useState } from "react";
import { QtyMode } from "./types";

export interface OrderBookContextValue {
  cellHeight: number;
  mode: QtyMode;
  depth: number;
  onModeChange?: (mode: QtyMode) => void;
  onItemClick?: (item: number[]) => void;
}

export const OrderBookContext = createContext({
  cellHeight: 22,
} as OrderBookContextValue);

interface OrderBookProviderProps {
  cellHeight: number;
  depth: number;
  onItemClick?: (item: number[]) => void;
}

export const OrderBookProvider: FC<
  PropsWithChildren<OrderBookProviderProps>
> = (props) => {
  const [mode, setMode] = useState<QtyMode>("quantity");
  return (
    <OrderBookContext.Provider
      value={{
        cellHeight: props.cellHeight,
        onItemClick: props.onItemClick,
        mode,
        depth: props.depth,
        onModeChange: setMode,
      }}
    >
      {props.children}
    </OrderBookContext.Provider>
  );
};
