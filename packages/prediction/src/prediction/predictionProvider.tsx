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
  retainLive: () => void;
  releaseLive: () => void;
};

const PredictionContext = createContext<PredictionContextValue | null>(null);

// Mounted consumers keep the simulation alive; with none mounted (unrelated
// routes) the rounds polling and market streams stay suspended.
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

// Live consumers (the prediction page itself) additionally keep the per-tick
// market streams (orderbook/index WS) alive. Base consumers such as the perps
// dropdown and the portfolio panels only need the rounds polling, so they do
// not call this and stay off the WS-driven context updates.
export const useSharedPredictionLive = (active = true) => {
  const context = useContext(PredictionContext);
  const { retainLive, releaseLive } = context ?? {};
  useEffect(() => {
    if (!retainLive || !releaseLive || !active) return;
    retainLive();
    return () => releaseLive();
  }, [retainLive, releaseLive, active]);
};

/** Keeps prototype orders and positions alive across trading and portfolio routes. */
export const PredictionProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const { disabledConnect } = useAppContext();
  const [activeConsumers, setActiveConsumers] = useState(0);
  const [liveConsumers, setLiveConsumers] = useState(0);
  const retain = useCallback(
    () => setActiveConsumers((count) => count + 1),
    [],
  );
  const release = useCallback(
    () => setActiveConsumers((count) => Math.max(0, count - 1)),
    [],
  );
  const retainLive = useCallback(
    () => setLiveConsumers((count) => count + 1),
    [],
  );
  const releaseLive = useCallback(
    () => setLiveConsumers((count) => Math.max(0, count - 1)),
    [],
  );
  const state = usePredictionScript(
    disabledConnect,
    activeConsumers > 0,
    liveConsumers > 0,
  );
  const value = useMemo(
    () => ({ state, retain, release, retainLive, releaseLive }),
    [state, retain, release, retainLive, releaseLive],
  );
  return (
    <PredictionContext.Provider value={value}>
      {children}
    </PredictionContext.Provider>
  );
};
