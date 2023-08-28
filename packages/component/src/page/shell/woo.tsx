import { useOrderbook } from "@orderly.network/hooks";
import { useState } from "react";

import { TradingPage } from "../trading";

export const WooPage = () => {
  const [pair, setPair] = useState("PERP_BTC_USDC"); // ["BTC/USD","ETH/USD"
  const orderbook = useOrderbook(pair);

  return (
    <>
      <TradingPage />
    </>
  );
};
