import React, { createContext, useContext } from "react";
import { useAppContext } from "@orderly.network/react-app";
import { usePredictionScript, PredictionState } from "./prediction.script";

const PredictionContext = createContext<PredictionState | null>(null);
export const useSharedPredictionState = () => useContext(PredictionContext);

/** Keeps prototype orders and positions alive across trading and portfolio routes. */
export const PredictionProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const { disabledConnect } = useAppContext();
  const state = usePredictionScript(disabledConnect);
  return (
    <PredictionContext.Provider value={state}>
      {children}
    </PredictionContext.Provider>
  );
};
