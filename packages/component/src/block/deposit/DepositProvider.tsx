import { PropsWithChildren, createContext, useMemo } from "react";

export interface DepositContextState {
  // approve: (amount?: string) => Promise<any>;
  // deposit: () => Promise<any>;
  needSwap: boolean;
  needCrossSwap: boolean;
}

export const DepositContext = createContext<DepositContextState>(
  {} as DepositContextState
);

export const DepositProvider: React.FC<
  PropsWithChildren<DepositContextState>
> = (props) => {
  const { needSwap, needCrossSwap } = props;

  const value = useMemo(
    () => ({
      needSwap,
      needCrossSwap,
    }),
    [needSwap, needCrossSwap]
  );

  return (
    <DepositContext.Provider value={value}>
      {props.children}
    </DepositContext.Provider>
  );
};
