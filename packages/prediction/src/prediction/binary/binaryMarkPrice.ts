import type { PredictionOutcome } from "../prediction.types";
import { complementPrice } from "./binaryOrderRules";

type MarkPriceMessage = {
  data?: { symbol?: string; price?: number };
};

type MarkPriceStream = {
  subscribe: (
    topic: string,
    handlers: {
      formatter: (message: MarkPriceMessage) => MarkPriceMessage;
      onMessage: (message: MarkPriceMessage) => void;
    },
  ) => (() => void) | undefined;
};

const validMarkPrice = (price: unknown): price is number =>
  typeof price === "number" &&
  Number.isFinite(price) &&
  price >= 0 &&
  price <= 1;

export const binaryOutcomeMarkPrice = (
  price: number | undefined,
  outcome: PredictionOutcome,
): number | undefined =>
  !validMarkPrice(price)
    ? undefined
    : outcome === "up"
      ? price
      : complementPrice(price);

/** Observe the selected round's mark price, including final zero settlements. */
export const subscribeBinaryMarkPrice = (
  stream: MarkPriceStream,
  symbol: string,
  onPrice: (price: number) => void,
) => {
  let stopped = false;
  const unsubscribe = stream.subscribe(`${symbol}@markprice`, {
    formatter: (message) => message,
    onMessage: ({ data }) => {
      if (
        stopped ||
        !data ||
        (data.symbol != null && data.symbol !== symbol) ||
        !validMarkPrice(data.price)
      )
        return;
      onPrice(data.price);
    },
  });
  return () => {
    stopped = true;
    unsubscribe?.();
  };
};
