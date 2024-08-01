import { FC, PropsWithChildren, createContext, useContext } from "react";

export interface DepositContextState {
  needSwap: boolean;
  needCrossSwap: boolean;
}

export const CrossDepositContext = createContext<DepositContextState>(
  {} as DepositContextState
);

export const CrossDepositProvider: FC<
  PropsWithChildren<DepositContextState>
> = (props) => {
  const { needSwap, needCrossSwap } = props;

  return (
    <CrossDepositContext.Provider
      value={{
        needSwap,
        needCrossSwap,
      }}
    >
      {props.children}
    </CrossDepositContext.Provider>
  );
};

export function useCrossDepositContext() {
  return useContext(CrossDepositContext);
}
