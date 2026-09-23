import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CHART_WINDOW_MS,
  INITIAL_BTC_PRICE,
  clamp,
  type PredictionChartPoint,
  type PredictionRoundPhase,
} from "../prediction.types";
import { ROUND_INTERVAL_SECONDS } from "../predictionShared";

const createInitialHistory = (price: number): PredictionChartPoint[] => {
  const now = Date.now();
  return Array.from({ length: 48 }, (_, index) => ({
    price:
      price +
      Math.sin(index / 4) * 42 +
      Math.cos(index / 7) * 19 +
      (index - 24) * 0.8,
    timestamp: now - (47 - index) * 1_000,
  }));
};

export type UsePredictionMarketSimulationArgs = {
  active: boolean;
  roundPhase: PredictionRoundPhase;
  openingPrice: number;
  countdown: number;
  /** Called once per second while the round is trading / closing soon. */
  onTradingSecond?: () => void;
};

export const usePredictionMarketSimulation = ({
  active,
  roundPhase,
  openingPrice,
  countdown,
  onTradingSecond,
}: UsePredictionMarketSimulationArgs) => {
  const [currentPrice, setCurrentPrice] = useState(INITIAL_BTC_PRICE + 76.2);
  const [priceHistory, setPriceHistory] = useState<PredictionChartPoint[]>(() =>
    createInitialHistory(INITIAL_BTC_PRICE),
  );
  const tickRef = useRef(0);
  const currentPriceRef = useRef(currentPrice);
  currentPriceRef.current = currentPrice;
  const onTradingSecondRef = useRef(onTradingSecond);
  onTradingSecondRef.current = onTradingSecond;

  useEffect(() => {
    if (!active) return;
    const timer = window.setInterval(() => {
      tickRef.current += 1;
      const tick = tickRef.current;
      const delta = Math.sin(tick / 12) * 0.35 + Math.cos(tick / 23) * 0.18;
      const timestamp = Date.now();

      if (
        roundPhase === "trading" ||
        roundPhase === "closingSoon" ||
        roundPhase === "closed"
      ) {
        const next = currentPriceRef.current + delta;
        currentPriceRef.current = next;
        setCurrentPrice(next);
        setPriceHistory((points) => [
          ...points.filter(
            (point) => point.timestamp >= timestamp - CHART_WINDOW_MS,
          ),
          { price: next, timestamp },
        ]);
      }

      if (roundPhase === "trading" || roundPhase === "closingSoon") {
        onTradingSecondRef.current?.();
      }
    }, 1_000);

    return () => window.clearInterval(timer);
  }, [active, roundPhase]);

  const upChance = useMemo(() => {
    const relativeMove = (currentPrice - openingPrice) / openingPrice;
    const timePressure = 1 + (1 - countdown / ROUND_INTERVAL_SECONDS) * 0.35;
    return clamp(50 + relativeMove * 4_000 * timePressure, 8, 92);
  }, [countdown, currentPrice, openingPrice]);

  const outcomePrices = useMemo(
    () => ({
      up: upChance / 100,
      down: 1 - upChance / 100,
    }),
    [upChance],
  );

  const resetPriceHistory = useCallback((price: number) => {
    setPriceHistory(createInitialHistory(price));
  }, []);

  return {
    currentPrice,
    setCurrentPrice,
    priceHistory,
    setPriceHistory,
    resetPriceHistory,
    upChance,
    outcomePrices,
    currentPriceRef,
  };
};
