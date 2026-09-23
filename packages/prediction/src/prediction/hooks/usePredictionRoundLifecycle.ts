import { useCallback, useEffect, useState } from "react";
import {
  INITIAL_BTC_PRICE,
  INITIAL_ROUND,
  type PredictionRoundPhase,
} from "../prediction.types";
import { ROUND_INTERVAL_SECONDS } from "../predictionShared";

export type UsePredictionRoundLifecycleArgs = {
  onClearNotification?: () => void;
};

export const usePredictionRoundLifecycle = ({
  onClearNotification,
}: UsePredictionRoundLifecycleArgs = {}) => {
  const [round, setRound] = useState(INITIAL_ROUND);
  const [selectedRound, setSelectedRound] = useState(INITIAL_ROUND);
  const [countdown, setCountdown] = useState(ROUND_INTERVAL_SECONDS - 43);
  const [roundPhase, setRoundPhase] = useState<PredictionRoundPhase>("trading");
  const [openingPrice, setOpeningPrice] = useState(INITIAL_BTC_PRICE);

  const tickCountdown = useCallback(() => {
    setCountdown((previous) => Math.max(previous - 1, 0));
  }, []);

  // Drive round phase transitions from countdown outside setState updaters so
  // StrictMode double-invocation cannot advance the round twice, and so
  // throttled ticks that skip exactly 30s still enter closingSoon via <= 30.
  useEffect(() => {
    if (roundPhase !== "trading" && roundPhase !== "closingSoon") return;

    if (countdown <= 0) {
      if (selectedRound > round) {
        setRound((previousRound) => previousRound + ROUND_INTERVAL_SECONDS);
        setCountdown(ROUND_INTERVAL_SECONDS);
        return;
      }
      setRoundPhase("closed");
      return;
    }

    if (
      countdown <= 30 &&
      roundPhase === "trading" &&
      selectedRound === round
    ) {
      setRoundPhase("closingSoon");
    }
  }, [countdown, roundPhase, selectedRound, round]);

  const goToLiveRound = useCallback(
    (currentPrice: number) => {
      setOpeningPrice(currentPrice);
      setRound((previous) => previous + ROUND_INTERVAL_SECONDS);
      setSelectedRound(round + ROUND_INTERVAL_SECONDS);
      setCountdown(ROUND_INTERVAL_SECONDS);
      setRoundPhase("trading");
      onClearNotification?.();
    },
    [onClearNotification, round],
  );

  const selectMarketRound = (nextRound: number) => {
    setSelectedRound(nextRound);
    setRoundPhase(nextRound < round ? "resolvedUp" : "trading");
    onClearNotification?.();
    setCountdown(ROUND_INTERVAL_SECONDS - 43);
  };

  const advanceAfterSettle = useCallback(
    (currentPrice: number) => {
      setOpeningPrice(currentPrice);
      setRound((previous) => previous + ROUND_INTERVAL_SECONDS);
      setSelectedRound(round + ROUND_INTERVAL_SECONDS);
      setCountdown(ROUND_INTERVAL_SECONDS);
      setRoundPhase("trading");
    },
    [round],
  );

  const isRoundTradable =
    selectedRound >= round &&
    (roundPhase === "trading" || roundPhase === "closingSoon");

  return {
    round,
    selectedRound,
    countdown,
    roundPhase,
    openingPrice,
    setOpeningPrice,
    tickCountdown,
    goToLiveRound,
    selectMarketRound,
    advanceAfterSettle,
    isRoundTradable,
  };
};
