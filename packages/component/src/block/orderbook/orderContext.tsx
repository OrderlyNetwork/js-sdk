import { createContext, FC, PropsWithChildren, useState } from "react";
import { QtyMode } from "./types";

export interface OrderBookContextValue {
  cellHeight: number;
  mode: QtyMode;
  onModeChange?: (mode: QtyMode) => void;
  onItemClick?: (item: number[]) => void;
}

export const OrderBookContext = createContext({
  cellHeight: 22,
} as OrderBookContextValue);

interface OrderBookProviderProps {
  cellHeight: number;
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
        onModeChange: setMode,
      }}
    >
      {props.children}
    </OrderBookContext.Provider>
  );
};
