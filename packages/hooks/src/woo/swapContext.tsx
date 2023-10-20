import { createContext } from "react";

export interface SwapContextState {}

export const SwapContext = createContext<SwapContextState>(
  {} as SwapContextState
);
