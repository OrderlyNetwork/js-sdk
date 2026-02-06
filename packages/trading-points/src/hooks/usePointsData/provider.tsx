import React, { createContext, useContext, FC, ReactNode } from "react";
import { usePointsData as usePointsDataHook } from "./usePointsData";
import type { UsePointsDataReturn } from "./usePointsData";

export type PointsContextValue = UsePointsDataReturn;

const PointsContext = createContext<PointsContextValue | undefined>(undefined);

export interface PointsProviderProps {
  children: ReactNode;
}

export const PointsProvider: FC<PointsProviderProps> = ({ children }) => {
  const value = usePointsDataHook();

  return (
    <PointsContext.Provider value={value}>{children}</PointsContext.Provider>
  );
};

export function usePoints(): PointsContextValue {
  const context = useContext(PointsContext);
  if (context === undefined) {
    throw new Error("usePoints must be used within a PointsProvider");
  }
  return context;
}
