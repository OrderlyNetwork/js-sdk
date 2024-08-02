import { FC, PropsWithChildren, createContext, useContext } from "react";

export interface DepositContextState {}

export const CrossDepositContext = createContext<DepositContextState>(
  {} as DepositContextState
);

export const CrossDepositProvider: FC<
  PropsWithChildren<DepositContextState>
> = (props) => {
  return (
    <CrossDepositContext.Provider value={{}}>
      {props.children}
    </CrossDepositContext.Provider>
  );
};

export function useCrossDepositContext() {
  return useContext(CrossDepositContext);
}
