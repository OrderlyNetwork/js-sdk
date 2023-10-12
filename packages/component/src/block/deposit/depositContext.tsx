import { createContext } from "react";

export interface DepositContextState {}

export const DepositContext = createContext<DepositContextState>(
  {} as DepositContextState
);
