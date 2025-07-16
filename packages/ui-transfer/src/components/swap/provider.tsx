import { FC, PropsWithChildren, createContext, useContext } from "react";

export interface DepositContextState {}

export const SwapDepositContext = createContext<DepositContextState>(
  {} as DepositContextState,
);

export const SwapDepositProvider: FC<PropsWithChildren<DepositContextState>> = (
  props,
) => {
  return (
    <SwapDepositContext.Provider value={{}}>
      {props.children}
    </SwapDepositContext.Provider>
  );
};

export function useSwapDepositContext() {
  return useContext(SwapDepositContext);
}
