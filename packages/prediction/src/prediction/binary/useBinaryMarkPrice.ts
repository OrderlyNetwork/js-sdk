import { useEffect, useState } from "react";
import { useWS } from "@orderly.network/hooks";
import { subscribeBinaryMarkPrice } from "./binaryMarkPrice";

/** Round-specific public mark-price subscription, independent of the order form. */
export const useBinaryMarkPrice = (
  symbol: string | undefined,
  active: boolean,
): number | undefined => {
  const ws = useWS();
  const [quote, setQuote] = useState<{ symbol: string; price: number }>();

  useEffect(() => {
    setQuote(undefined);
    if (!symbol || !active) return;
    return subscribeBinaryMarkPrice(ws, symbol, (price) => {
      setQuote({ symbol, price });
    });
  }, [ws, symbol, active]);

  return active && quote?.symbol === symbol ? quote?.price : undefined;
};
