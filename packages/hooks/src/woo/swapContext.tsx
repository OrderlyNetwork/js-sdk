import { createContext } from "react";

export interface SwapContextState {}

/** @hidden */
export const SwapContext = createContext<SwapContextState>(
  {} as SwapContextState
);
