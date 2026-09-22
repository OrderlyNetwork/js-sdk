import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAppContext } from "@orderly.network/react-app";
import { usePredictionScript, type PredictionState } from "./prediction.script";

type PredictionContextValue = {
  state: PredictionState;
  retain: () => void;
  release: () => void;
};

const PredictionContext = createContext<PredictionContextValue | null>(null);

// Mounted consumers keep the simulation alive; with none mounted (unrelated
// routes) the per-second price/countdown interval stays suspended.
export const useSharedPredictionState = (active = true) => {
  const context = useContext(PredictionContext);
  const { retain, release } = context ?? {};
  useEffect(() => {
    if (!retain || !release || !active) return;
    retain();
    return () => release();
  }, [retain, release, active]);
  return context?.state ?? null;
};

/** Keeps prototype orders and positions alive across trading and portfolio routes. */
export const PredictionProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const { disabledConnect } = useAppContext();
  const [activeConsumers, setActiveConsumers] = useState(0);
  const retain = useCallback(
    () => setActiveConsumers((count) => count + 1),
    [],
  );
  const release = useCallback(
    () => setActiveConsumers((count) => Math.max(0, count - 1)),
    [],
  );
  const state = usePredictionScript(disabledConnect, activeConsumers > 0);
  const value = useMemo(
    () => ({ state, retain, release }),
    [state, retain, release],
  );
  return (
    <PredictionContext.Provider value={value}>
      {children}
    </PredictionContext.Provider>
  );
};
