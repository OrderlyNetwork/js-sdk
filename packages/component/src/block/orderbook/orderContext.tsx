import { createContext, FC, PropsWithChildren } from "react";

export interface OrderBookContextValue {
  cellHeight: number;
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
  return (
    <OrderBookContext.Provider
      value={{ cellHeight: props.cellHeight, onItemClick: props.onItemClick }}
    >
      {props.children}
    </OrderBookContext.Provider>
  );
};
